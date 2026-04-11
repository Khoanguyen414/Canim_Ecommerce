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
import com.example.canim_ecommerce.mapper.InventoryMapper;
import com.example.canim_ecommerce.repository.*;
import com.example.canim_ecommerce.service.InventoryService;
import com.example.canim_ecommerce.utils.CodeGenerator;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryServiceImpl implements InventoryService {

    InventoryReceiptRepository receiptRepo;
    InventoryReceiptDetailRepository detailRepo;
    InventoryBatchRepository batchRepo;
    InventoryTransactionRepository transactionRepo;
    InventoryRepository inventoryRepo;
    ProductVariantRepository variantRepo;
    SupplierRepository supplierRepo;
    InventoryMapper inventoryMapper;

    static Long DEFAULT_WAREHOUSE_ID = 1L; 
    static Long CURRENT_USER_ID = 1L;
    static DateTimeFormatter FULL_TIME_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss");

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createInboundReceipt(InboundRequest request) {
        Long warehouseId = (request.getWarehouseId() != null) ? request.getWarehouseId() : DEFAULT_WAREHOUSE_ID;
        Supplier supplier = supplierRepo.findById(request.getSupplierId())
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Nhà cung cấp không tồn tại"));

        InventoryReceipt receipt = inventoryMapper.toReceiptFromInbound(request);
        receipt.setWarehouseId(warehouseId);
        receipt.setReceiptCode(CodeGenerator.generateReceiptCode("IN"));
        receipt.setType(ReceiptType.INBOUND);
        receipt.setSupplier(supplier);
        receipt.setWarehouseStaffId(CURRENT_USER_ID);
        receipt.setStatus(ReceiptStatus.COMPLETED);
        receipt.setCreatedBy(CURRENT_USER_ID);
        receipt = receiptRepo.save(receipt);

        for (var item : request.getItems()) {
            ProductVariant variant = variantRepo.findById(item.getVariantId())
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Biến thể không tồn tại"));

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
            batch = batchRepo.save(batch);

            detailRepo.save(InventoryReceiptDetail.builder()
                    .receipt(receipt).variant(variant).batch(batch)
                    .quantity(item.getQuantity()).unitPrice(item.getPrice()).build());

            logTransaction(variant, warehouseId, batch, TransactionType.IN, item.getQuantity(), receipt.getId(), "RECEIPT");
            syncInventory(variant, warehouseId, item.getQuantity(), true);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createOutboundReceipt(OutboundRequest request) {
        Long warehouseId = (request.getWarehouseId() != null) ? request.getWarehouseId() : DEFAULT_WAREHOUSE_ID;
        InventoryReceipt receipt = inventoryMapper.toReceiptFromOutbound(request);
        receipt.setWarehouseId(warehouseId);
        receipt.setReceiptCode(CodeGenerator.generateReceiptCode("OUT"));
        receipt.setType(ReceiptType.OUTBOUND);
        receipt.setWarehouseStaffId(CURRENT_USER_ID);
        receipt.setStatus(ReceiptStatus.COMPLETED);
        receipt = receiptRepo.save(receipt);

        for (var item : request.getItems()) {
            int needed = item.getQuantity();
            ProductVariant variant = variantRepo.findById(item.getVariantId()).orElseThrow();
            
            // Dùng hàm FIFO đã định nghĩa trong Repository
            List<InventoryBatch> batches = batchRepo.findAvailableBatchesForFIFO(warehouseId, variant.getId());

            for (InventoryBatch batch : batches) {
                if (needed <= 0) break;
                int take = Math.min(batch.getQuantityRemaining(), needed);
                batch.setQuantityRemaining(batch.getQuantityRemaining() - take);
                needed -= take;
                batchRepo.save(batch);

                detailRepo.save(InventoryReceiptDetail.builder()
                        .receipt(receipt).variant(variant).batch(batch)
                        .quantity(take).unitPrice(batch.getImportPrice()).build());

                logTransaction(variant, warehouseId, batch, TransactionType.OUT, take, receipt.getId(), "RECEIPT");
            }
            if (needed > 0) throw new ApiException(ApiStatus.INVALID_INPUT, "Kho không đủ hàng xuất SKU: " + variant.getSku());
            syncInventory(variant, warehouseId, item.getQuantity(), false);
        }
    }

    @Override
    public byte[] exportInventoryReport() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            CellStyle headerStyle = createStyle(workbook, true, IndexedColors.GREY_25_PERCENT, false);
            CellStyle numberStyle = workbook.createCellStyle();
            numberStyle.setDataFormat(workbook.createDataFormat().getFormat("#,##0"));
            CellStyle alertStyle = createStyle(workbook, true, null, true);

            // SHEET 1: TỔNG HỢP
            Sheet s1 = workbook.createSheet("1. Tổng Hợp Tồn Kho");
            createRow(s1, 0, headerStyle, "SKU", "Sản Phẩm", "Danh Mục", "Phân loại", "Tồn", "Giá Vốn TB", "Thành Tiền", "Cảnh Báo");
            
            List<Inventory> invs = inventoryRepo.findAll();
            int rowIdx = 1;
            for (Inventory inv : invs) {
                Row r = s1.createRow(rowIdx++);
                ProductVariant v = inv.getVariant();
                double wac = calculateWAC(v.getId());
                r.createCell(0).setCellValue(v.getSku());
                r.createCell(1).setCellValue(v.getProduct().getName());
                r.createCell(2).setCellValue(v.getProduct().getCategory() != null ? v.getProduct().getCategory().getName() : "-");
                r.createCell(3).setCellValue(formatVariant(v));
                r.createCell(4).setCellValue(inv.getQuantity());
                Cell cWac = r.createCell(5); cWac.setCellValue(wac); cWac.setCellStyle(numberStyle);
                Cell cTotal = r.createCell(6); cTotal.setCellValue(wac * inv.getQuantity()); cTotal.setCellStyle(numberStyle);
                if (inv.getQuantity() <= inv.getMinStock()) {
                    Cell cAlert = r.createCell(7); cAlert.setCellValue("SẮP HẾT HÀNG"); cAlert.setCellStyle(alertStyle);
                }
            }

            // SHEET 2: LÔ HÀNG (SỬA LỖI findAllByQuantityRemainingGreaterThan)
            Sheet s2 = workbook.createSheet("2. Chi Tiết Lô Hàng");
            createRow(s2, 0, headerStyle, "Mã Lô", "SKU", "Sản Phẩm", "Nhà Cung Cấp", "SĐT NCC", "Email NCC", "Tồn Lô", "Giá Nhập", "Ngày Nhập");
            List<InventoryBatch> batches = batchRepo.findAllByQuantityRemainingGreaterThan(0);
            rowIdx = 1;
            for (InventoryBatch b : batches) {
                Row r = s2.createRow(rowIdx++);
                Supplier sup = b.getSupplier();
                r.createCell(0).setCellValue(b.getBatchCode());
                r.createCell(1).setCellValue(b.getVariant().getSku());
                r.createCell(2).setCellValue(b.getVariant().getProduct().getName());
                r.createCell(3).setCellValue(sup != null ? sup.getName() : "N/A");
                r.createCell(4).setCellValue(sup != null ? sup.getPhone() : "-");
                r.createCell(5).setCellValue(sup != null ? sup.getEmail() : "-");
                r.createCell(6).setCellValue(b.getQuantityRemaining());
                Cell cPrice = r.createCell(7); cPrice.setCellValue(b.getImportPrice().doubleValue()); cPrice.setCellStyle(numberStyle);
                r.createCell(8).setCellValue(b.getCreatedAt().format(FULL_TIME_FORMAT));
            }

            // SHEET 3: NHẬT KÝ (SỬA LỖI findAllByOrderByCreatedAtDesc)
            Sheet s3 = workbook.createSheet("3. Nhật Ký Giao Dịch");
            createRow(s3, 0, headerStyle, "Ngày Giờ", "Mã Chứng Từ", "Loại", "SKU", "Số Lượng", "Đối Tác", "Lý Do", "Người Thực Hiện");
            List<InventoryTransaction> txs = transactionRepo.findAllByOrderByCreatedAtDesc();
            rowIdx = 1;
            for (InventoryTransaction tx : txs) {
                Row r = s3.createRow(rowIdx++);
                r.createCell(0).setCellValue(tx.getCreatedAt().format(FULL_TIME_FORMAT));
                r.createCell(1).setCellValue(tx.getReferenceType() + "-" + tx.getReferenceId());
                r.createCell(2).setCellValue(tx.getType().toString());
                r.createCell(3).setCellValue(tx.getVariant().getSku());
                r.createCell(4).setCellValue(tx.getQuantity());
                String partner = (tx.getBatch() != null && tx.getBatch().getSupplier() != null) ? tx.getBatch().getSupplier().getName() : "-";
                r.createCell(5).setCellValue(partner);
                r.createCell(6).setCellValue(tx.getReferenceType());
                r.createCell(7).setCellValue("Staff ID: " + tx.getCreatedBy());
            }

            for (int i = 0; i < 9; i++) { s1.autoSizeColumn(i); s2.autoSizeColumn(i); s3.autoSizeColumn(i); }
            workbook.write(out); return out.toByteArray();
        } catch (Exception e) { throw new RuntimeException("Excel Error: " + e.getMessage()); }
    }

    private void syncInventory(ProductVariant v, Long warehouseId, int qty, boolean add) {
        Inventory inv = inventoryRepo.findByVariantIdAndWarehouseId(v.getId(), warehouseId)
                .orElse(Inventory.builder().variant(v).warehouseId(warehouseId).quantity(0).build());
        inv.setQuantity(add ? inv.getQuantity() + qty : inv.getQuantity() - qty);
        inventoryRepo.save(inv);
    }

    private void logTransaction(ProductVariant v, Long whId, InventoryBatch b, TransactionType t, int q, Long refId, String type) {
        transactionRepo.save(InventoryTransaction.builder()
                .warehouseId(whId).variant(v).batch(b).type(t).quantity(q)
                .referenceId(refId).referenceType(type).createdBy(CURRENT_USER_ID).build());
    }

    private double calculateWAC(Long variantId) {
        List<InventoryBatch> batches = batchRepo.findAllByVariantId(variantId);
        double totalVal = batches.stream().mapToDouble(b -> b.getImportPrice().doubleValue() * b.getQuantityRemaining()).sum();
        int totalQty = batches.stream().mapToInt(InventoryBatch::getQuantityRemaining).sum();
        return totalQty == 0 ? 0 : totalVal / totalQty;
    }

    private String formatVariant(ProductVariant v) {
        return String.format("Màu: %s, Size: %s", v.getColor() != null ? v.getColor() : "-", v.getSize() != null ? v.getSize() : "-");
    }

    private void createRow(Sheet s, int idx, CellStyle st, String... vals) {
        Row r = s.createRow(idx);
        for (int i = 0; i < vals.length; i++) { Cell c = r.createCell(i); c.setCellValue(vals[i]); c.setCellStyle(st); }
    }

    private CellStyle createStyle(Workbook wb, boolean bold, IndexedColors bg, boolean redText) {
        CellStyle s = wb.createCellStyle(); Font f = wb.createFont(); f.setBold(bold);
        if (redText) f.setColor(IndexedColors.RED.getIndex());
        s.setFont(f);
        if (bg != null) { s.setFillForegroundColor(bg.getIndex()); s.setFillPattern(FillPatternType.SOLID_FOREGROUND); }
        s.setBorderBottom(BorderStyle.THIN); s.setBorderTop(BorderStyle.THIN);
        s.setBorderLeft(BorderStyle.THIN); s.setBorderRight(BorderStyle.THIN);
        return s;
    }
}