package com.example.canim_ecommerce.service.impl;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.request.inventory.OutboundRequest;
import com.example.canim_ecommerce.entity.*;
import com.example.canim_ecommerce.enums.*;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.helper.InventoryHelper;
import com.example.canim_ecommerce.mapper.InventoryMapper;
import com.example.canim_ecommerce.repository.*;
import com.example.canim_ecommerce.service.InventoryService;
import com.example.canim_ecommerce.utils.CodeGenerator;
import com.example.canim_ecommerce.utils.SecurityUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryServiceImpl implements InventoryService {

    InventoryReceiptRepository inventoryReceiptRepository;
    InventoryReceiptDetailRepository inventoryReceiptDetailRepository;
    InventoryBatchRepository inventoryBatchRepository;
    InventoryTransactionRepository inventoryTransactionRepository;
    InventoryRepository inventoryRepository;
    ProductVariantRepository productVariantRepository;
    SupplierRepository supplierRepository;
    InventoryMapper inventoryMapper;
    InventoryHelper inventoryHelper;

    static DateTimeFormatter FULL_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    @Override
    public Integer getAvailableQuantityForVariant(Long variantId) {
        return getAvailableQuantityForVariant(InventoryService.DEFAULT_WAREHOUSE_ID, variantId);
    }

    @Override
    public Integer getAvailableQuantityForVariant(Long warehouseId, Long variantId) {
        return inventoryRepository.findByVariantIdAndWarehouseId(variantId, warehouseId)
                .map(inv -> Math.max(0, inv.getQuantity() - inv.getReserved()))
                .orElse(0);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createInboundReceipt(InboundRequest request) {
        Long warehouseId = request.getWarehouseId();
        Supplier supplier = supplierRepository.findById(request.getSupplierId())
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Supplier not found"));

        Long currentUserId = SecurityUtils.getCurrentUserId();

        InventoryReceipt receipt = inventoryMapper.toReceiptFromInbound(request);
        receipt.setWarehouseId(warehouseId);
        receipt.setReceiptCode(CodeGenerator.generateReceiptCode("IN"));
        receipt.setType(ReceiptType.INBOUND);

        receipt.setReasonCode("PURCHASE");

        receipt.setSupplier(supplier);
        receipt.setStatus(ReceiptStatus.COMPLETED);
        receipt.setCreatedBy(currentUserId);
        receipt = inventoryReceiptRepository.save(receipt);

        for (var item : request.getItems()) {
            ProductVariant variant = productVariantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND,
                            "Product variant not found with ID: " + item.getVariantId()));

            InventoryBatch batch = InventoryBatch.builder()
                    .warehouseId(warehouseId)
                    .variant(variant)
                    .supplier(supplier)
                    .batchCode(CodeGenerator.generateBatchCode(variant.getId()))
                    .skuSnapshot(variant.getSku())
                    .quantityRemaining(item.getQuantity())
                    .importPrice(item.getPrice())
                    .expiredAt(item.getExpiredAt())
                    .build();
            batch = inventoryBatchRepository.save(batch);

            inventoryReceiptDetailRepository.save(InventoryReceiptDetail.builder()
                    .receipt(receipt).variant(variant).batch(batch)
                    .quantity(item.getQuantity()).unitPrice(item.getPrice()).build());

            inventoryHelper.logTransaction(variant, warehouseId, batch, TransactionType.IN, item.getQuantity(),
                    receipt.getId(),
                    "PURCHASE");
            inventoryHelper.syncInventory(variant, warehouseId, item.getQuantity(), true);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createOutboundReceipt(OutboundRequest request) {
        Long warehouseId = request.getWarehouseId();
        InventoryReceipt receipt = inventoryMapper.toReceiptFromOutbound(request);
        receipt.setWarehouseId(warehouseId);
        receipt.setReceiptCode(CodeGenerator.generateReceiptCode("OUT"));
        receipt.setType(ReceiptType.OUTBOUND);

        receipt.setReasonCode("SALES_ORDER");

        receipt.setStatus(ReceiptStatus.COMPLETED);
        receipt = inventoryReceiptRepository.save(receipt);

        for (var item : request.getItems()) {
            int needed = item.getQuantity();
            ProductVariant variant = productVariantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND,
                            "Product variant not found with ID: " + item.getVariantId()));

            List<InventoryBatch> batches = inventoryBatchRepository.findAvailableBatchesForFIFO(warehouseId,
                    variant.getId());

            int actualExported = 0;

            for (InventoryBatch batch : batches) {
                if (needed <= 0)
                    break;
                int take = Math.min(batch.getQuantityRemaining(), needed);

                batch.setQuantityRemaining(batch.getQuantityRemaining() - take);
                needed -= take;
                actualExported += take;
                inventoryBatchRepository.save(batch);

                inventoryReceiptDetailRepository.save(InventoryReceiptDetail.builder()
                        .receipt(receipt).variant(variant).batch(batch)
                        .quantity(take).unitPrice(batch.getImportPrice()).build());

                inventoryHelper.logTransaction(variant, warehouseId, batch, TransactionType.OUT, take, receipt.getId(),
                        "SALES_ORDER");
            }

            if (needed > 0)
                throw new ApiException(ApiStatus.BAD_REQUEST, "Not enough stock for SKU: " + variant.getSku());

            inventoryHelper.syncInventory(variant, warehouseId, actualExported, false);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportInventoryReport() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            CellStyle headerStyle = createStyle(workbook, true, IndexedColors.GREY_25_PERCENT, false);
            CellStyle moneyStyle = workbook.createCellStyle();
            moneyStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0"));
            CellStyle alertStyle = createStyle(workbook, true, null, true);

            // --- SHEET 1: BÁO CÁO TỔNG HỢP ---
            Sheet s1 = workbook.createSheet("1. Tổng Hợp Tồn Kho");
            createRow(s1, 0, headerStyle, "Mã Kho", "SKU", "Sản Phẩm", "Danh Mục", "Phân loại", "Tồn", "Giá Vốn TB",
                    "Thành Tiền", "Cảnh Báo");

            List<Inventory> invs = inventoryRepository.findAllForExport();
            int rowIdx = 1;
            for (Inventory inv : invs) {
                ProductVariant v = inv.getVariant();
                if (v == null) {
                    continue;
                }

                Row r = s1.createRow(rowIdx++);
                var product = v.getProduct();
                String productName = product != null ? nullSafe(product.getName()) : "";
                String categoryName =
                        product != null && product.getCategory() != null
                                ? nullSafe(product.getCategory().getName())
                                : "";
                int quantity = inv.getQuantity() != null ? inv.getQuantity() : 0;
                int minStock = inv.getMinStock() != null ? inv.getMinStock() : 0;

                double wac = calculateWAC(v.getId(), inv.getWarehouseId());

                r.createCell(0).setCellValue("Kho " + inv.getWarehouseId());
                r.createCell(1).setCellValue(nullSafe(v.getSku()));
                r.createCell(2).setCellValue(productName);
                r.createCell(3).setCellValue(categoryName);
                r.createCell(4).setCellValue(formatVariant(v));
                r.createCell(5).setCellValue(quantity);

                Cell cWac = r.createCell(6);
                cWac.setCellValue(wac);
                cWac.setCellStyle(moneyStyle);

                Cell cTotal = r.createCell(7);
                cTotal.setCellValue(wac * quantity);
                cTotal.setCellStyle(moneyStyle);

                if (quantity <= minStock) {
                    Cell cAlert = r.createCell(8);
                    cAlert.setCellValue("SẮP HẾT HÀNG");
                    cAlert.setCellStyle(alertStyle);
                }
            }

            Sheet s2 = workbook.createSheet("2. Chi Tiết Lô Hàng");
            createRow(s2, 0, headerStyle, "Mã Kho", "Mã Lô", "SKU", "Sản Phẩm", "Nhà Cung Cấp", "SĐT NCC", "Tồn Lô",
                    "Giá Nhập", "Ngày Nhập");
            List<InventoryBatch> batches = inventoryBatchRepository.findAllActiveBatchesForExport();
            rowIdx = 1;
            for (InventoryBatch b : batches) {
                ProductVariant batchVariant = b.getVariant();
                if (batchVariant == null) {
                    continue;
                }

                Row r = s2.createRow(rowIdx++);
                Supplier sup = b.getSupplier();
                r.createCell(0).setCellValue("Kho " + b.getWarehouseId());
                r.createCell(1).setCellValue(nullSafe(b.getBatchCode()));
                r.createCell(2).setCellValue(nullSafe(batchVariant.getSku()));
                r.createCell(3).setCellValue(
                        batchVariant.getProduct() != null ? nullSafe(batchVariant.getProduct().getName()) : "");
                r.createCell(4).setCellValue(sup != null ? nullSafe(sup.getName()) : "N/A");
                r.createCell(5).setCellValue(sup != null ? nullSafe(sup.getPhone()) : "-");
                r.createCell(6).setCellValue(b.getQuantityRemaining() != null ? b.getQuantityRemaining() : 0);

                Cell cPrice = r.createCell(7);
                cPrice.setCellValue(b.getImportPrice() != null ? b.getImportPrice().doubleValue() : 0d);
                cPrice.setCellStyle(moneyStyle);

                r.createCell(8).setCellValue(
                        b.getCreatedAt() != null ? b.getCreatedAt().format(FULL_TIME_FORMAT) : "");
            }

            Sheet s3 = workbook.createSheet("3. Nhật Ký Giao Dịch");
            createRow(s3, 0, headerStyle, "Ngày Giờ", "Mã Kho", "Mã Chứng Từ", "Loại", "SKU", "Số Lượng", "Lý Do",
                    "Người Thực Hiện");
            List<InventoryTransaction> txs = inventoryTransactionRepository.findAllForExport();
            rowIdx = 1;
            for (InventoryTransaction tx : txs) {
                if (tx.getVariant() == null) {
                    continue;
                }

                Row r = s3.createRow(rowIdx++);
                r.createCell(0).setCellValue(
                        tx.getCreatedAt() != null ? tx.getCreatedAt().format(FULL_TIME_FORMAT) : "");
                r.createCell(1).setCellValue("Kho " + tx.getWarehouseId());
                r.createCell(2).setCellValue(nullSafe(tx.getReferenceType()) + "-" + tx.getReferenceId());
                r.createCell(3).setCellValue(tx.getType() != null ? tx.getType().toString() : "");
                r.createCell(4).setCellValue(nullSafe(tx.getVariant().getSku()));
                r.createCell(5).setCellValue(tx.getQuantity() != null ? tx.getQuantity() : 0);
                r.createCell(6).setCellValue(nullSafe(tx.getReferenceType()));
                r.createCell(7).setCellValue(
                        tx.getCreatedBy() != null ? "Nhân viên ID: " + tx.getCreatedBy() : "N/A");
            }

            autoSizeColumns(s1, 9);
            autoSizeColumns(s2, 9);
            autoSizeColumns(s3, 8);
            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "Excel Export Error: " + e.getMessage());
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void checkAndLockStock(Long warehouseId, Long variantId, int quantity) {
        validatePositiveQuantity(quantity);

        Inventory inventory = inventoryRepository
                .findByVariantIdAndWarehouseIdForUpdate(variantId, warehouseId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Inventory not found"));

        int available = inventory.getQuantity() - inventory.getReserved();

        if (available < quantity) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Not enough stock");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void reserveStock(Long warehouseId, Long variantId, int quantity) {
        validatePositiveQuantity(quantity);

        Inventory inventory = inventoryRepository
                .findByVariantIdAndWarehouseIdForUpdate(variantId, warehouseId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Inventory not found"));

        int available = inventory.getQuantity() - inventory.getReserved();

        if (available < quantity) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Not enough stock to reserve");
        }

        inventory.setReserved(inventory.getReserved() + quantity);
        inventoryRepository.save(inventory);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void unreserveStock(Long warehouseId, Long variantId, int quantity) {
        validatePositiveQuantity(quantity);

        Inventory inventory = inventoryRepository
                .findByVariantIdAndWarehouseIdForUpdate(variantId, warehouseId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Inventory not found"));

        if (inventory.getReserved() < quantity) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Reserved stock is not enough to release");
        }

        inventory.setReserved(inventory.getReserved() - quantity);
        inventoryRepository.save(inventory);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void releaseAndExportStock(Long warehouseId, Long variantId, int quantity, Long orderId) {
        validatePositiveQuantity(quantity);

        Inventory inventory = inventoryRepository
                .findByVariantIdAndWarehouseIdForUpdate(variantId, warehouseId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Inventory not found"));

        if (inventory.getReserved() < quantity) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Reserved stock is not enough to export");
        }

        if (inventory.getQuantity() < quantity) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Physical stock is not enough to export");
        }

        ProductVariant variant = productVariantRepository.findById(variantId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product variant not found"));

        Long currentUserId = SecurityUtils.getCurrentUserId();

        InventoryReceipt receipt = InventoryReceipt.builder()
                .warehouseId(warehouseId)
                .receiptCode(CodeGenerator.generateReceiptCode("OUT"))
                .type(ReceiptType.OUTBOUND)
                .reasonCode("SALES_ORDER")
                .orderId(orderId)
                .warehouseStaffId(currentUserId)
                .status(ReceiptStatus.COMPLETED)
                .createdBy(currentUserId)
                .build();

        receipt = inventoryReceiptRepository.save(receipt);

        int needed = quantity;
        int actualExported = 0;

        List<InventoryBatch> batches = inventoryBatchRepository.findAvailableBatchesForFIFO(
                warehouseId,
                variantId);

        for (InventoryBatch batch : batches) {
            if (needed <= 0) {
                break;
            }

            int take = Math.min(batch.getQuantityRemaining(), needed);

            batch.setQuantityRemaining(batch.getQuantityRemaining() - take);
            inventoryBatchRepository.save(batch);

            inventoryReceiptDetailRepository.save(
                    InventoryReceiptDetail.builder()
                            .receipt(receipt)
                            .variant(variant)
                            .batch(batch)
                            .quantity(take)
                            .unitPrice(batch.getImportPrice())
                            .build());

            inventoryHelper.logTransaction(
                    variant,
                    warehouseId,
                    batch,
                    TransactionType.OUT,
                    take,
                    receipt.getId(),
                    "SALES_ORDER");

            needed -= take;
            actualExported += take;
        }

        if (needed > 0) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Not enough batch stock for SKU: " + variant.getSku());
        }

        inventory.setQuantity(inventory.getQuantity() - actualExported);
        inventory.setReserved(inventory.getReserved() - actualExported);
        inventoryRepository.save(inventory);
    }

    private double calculateWAC(Long variantId, Long warehouseId) {
        List<InventoryBatch> batches = inventoryBatchRepository.findAllByVariantId(variantId);
        if (batches == null || batches.isEmpty()) {
            return 0;
        }

        double totalVal = 0;
        int totalQty = 0;
        for (InventoryBatch batch : batches) {
            if (batch.getWarehouseId() == null || !batch.getWarehouseId().equals(warehouseId)) {
                continue;
            }
            int qty = batch.getQuantityRemaining() != null ? batch.getQuantityRemaining() : 0;
            if (qty <= 0) {
                continue;
            }
            double price = batch.getImportPrice() != null ? batch.getImportPrice().doubleValue() : 0d;
            totalVal += price * qty;
            totalQty += qty;
        }

        return totalQty == 0 ? 0 : totalVal / totalQty;
    }

    private String nullSafe(String value) {
        return value != null ? value : "";
    }

    private String formatVariant(ProductVariant v) {
        return String.format("Màu: %s, Size: %s", v.getColor() != null ? v.getColor() : "-",
                v.getSize() != null ? v.getSize() : "-");
    }

    private void createRow(Sheet s, int idx, CellStyle st, String... vals) {
        Row r = s.createRow(idx);
        for (int i = 0; i < vals.length; i++) {
            Cell c = r.createCell(i);
            c.setCellValue(vals[i]);
            c.setCellStyle(st);
        }
    }

    private void autoSizeColumns(Sheet sheet, int count) {
        for (int i = 0; i < count; i++) {
            try {
                sheet.autoSizeColumn(i);
            } catch (Exception ignored) {
                sheet.setColumnWidth(i, 5000);
            }
        }
    }

    private CellStyle createStyle(Workbook wb, boolean bold, IndexedColors bg, boolean redText) {
        CellStyle s = wb.createCellStyle();
        Font f = wb.createFont();
        f.setBold(bold);
        if (redText)
            f.setColor(IndexedColors.RED.getIndex());
        s.setFont(f);
        if (bg != null) {
            s.setFillForegroundColor(bg.getIndex());
            s.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        }
        s.setBorderBottom(BorderStyle.THIN);
        s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN);
        s.setBorderRight(BorderStyle.THIN);
        return s;
    }

    private void validatePositiveQuantity(int quantity) {
        if (quantity <= 0) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Quantity must be greater than 0");
        }
    }
}