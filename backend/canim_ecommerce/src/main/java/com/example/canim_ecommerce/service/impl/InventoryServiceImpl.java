package com.example.canim_ecommerce.service.impl;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.request.inventory.OutboundRequest;
import com.example.canim_ecommerce.entity.Inventory;
import com.example.canim_ecommerce.entity.InventoryBatch;
import com.example.canim_ecommerce.entity.InventoryReceipt;
import com.example.canim_ecommerce.entity.InventoryReceiptDetail;
import com.example.canim_ecommerce.entity.InventoryTransaction;
import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.entity.Supplier;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.ReceiptStatus;
import com.example.canim_ecommerce.enums.ReceiptType;
import com.example.canim_ecommerce.enums.TransactionType;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.InventoryMapper;
import com.example.canim_ecommerce.repository.InventoryBatchRepository;
import com.example.canim_ecommerce.repository.InventoryReceiptDetailRepository;
import com.example.canim_ecommerce.repository.InventoryReceiptRepository;
import com.example.canim_ecommerce.repository.InventoryRepository;
import com.example.canim_ecommerce.repository.InventoryTransactionRepository;
import com.example.canim_ecommerce.repository.ProductVariantRepository;
import com.example.canim_ecommerce.repository.SupplierRepository;
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

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createInboundReceipt(InboundRequest request) {
        Supplier supplier = supplierRepo.findByIdAndIsDeletedFalse(request.getSupplierId())
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Supplier not found with ID: " + request.getSupplierId()));

        InventoryReceipt receipt = inventoryMapper.toReceiptFromInbound(request);
        receipt.setWarehouseId(DEFAULT_WAREHOUSE_ID);
        receipt.setReceiptCode(CodeGenerator.generateReceiptCode("IN")); 
        receipt.setType(ReceiptType.INBOUND);
        receipt.setReasonCode(request.getReasonCode().toUpperCase());
        receipt.setSupplier(supplier);
        receipt.setStatus(ReceiptStatus.COMPLETED); 
        receipt.setCreatedBy(CURRENT_USER_ID);
        
        receipt = receiptRepo.save(receipt);

        for (InboundRequest.InboundItem item : request.getItems()) {
            ProductVariant variant = variantRepo.findById(item.getVariantId())
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product Variant not found with ID: " + item.getVariantId()));

            InventoryBatch batch = InventoryBatch.builder()
                    .warehouseId(DEFAULT_WAREHOUSE_ID)
                    .variant(variant)
                    .batchCode(CodeGenerator.generateBatchCode(variant.getId()))
                    .skuSnapshot(variant.getSku())
                    .quantityRemaining(item.getQuantity())
                    .importPrice(item.getPrice())
                    .expiredAt(item.getExpiredAt())
                    .build();
            batch = batchRepo.save(batch);

            detailRepo.save(InventoryReceiptDetail.builder()
                    .receipt(receipt)
                    .variant(variant)
                    .batch(batch)
                    .quantity(item.getQuantity())
                    .unitPrice(item.getPrice())
                    .build());

            logTransaction(variant, batch, TransactionType.IN, item.getQuantity(), receipt.getId(), "RECEIPT");
            syncTotalInventory(variant, item.getQuantity(), true);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createOutboundReceipt(OutboundRequest request) {
        InventoryReceipt receipt = inventoryMapper.toReceiptFromOutbound(request);
        receipt.setWarehouseId(DEFAULT_WAREHOUSE_ID);
        receipt.setReceiptCode(CodeGenerator.generateReceiptCode("OUT"));
        receipt.setType(ReceiptType.OUTBOUND);
        receipt.setReasonCode(request.getReasonCode().toUpperCase());
        receipt.setOrderId(request.getOrderId());
        receipt.setStatus(ReceiptStatus.COMPLETED);
        receipt.setCreatedBy(CURRENT_USER_ID);
        
        receipt = receiptRepo.save(receipt);

        for (OutboundRequest.OutboundItem item : request.getItems()) {
            int quantityNeeded = item.getQuantity();
            ProductVariant variant = variantRepo.findById(item.getVariantId())
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product Variant not found with ID: " + item.getVariantId()));

            List<InventoryBatch> batches = batchRepo.findAvailableBatchesForFIFO(DEFAULT_WAREHOUSE_ID, variant.getId());

            for (InventoryBatch batch : batches) {
                if (quantityNeeded <= 0) break; 

                int takeQty = Math.min(batch.getQuantityRemaining(), quantityNeeded);
                
                batch.setQuantityRemaining(batch.getQuantityRemaining() - takeQty);
                quantityNeeded -= takeQty;
                batchRepo.save(batch);

                detailRepo.save(InventoryReceiptDetail.builder()
                        .receipt(receipt)
                        .variant(variant)
                        .batch(batch)
                        .quantity(takeQty)
                        .unitPrice(batch.getImportPrice()) 
                        .build());

                logTransaction(variant, batch, TransactionType.OUT, takeQty, receipt.getId(), "RECEIPT");
            }

            if (quantityNeeded > 0) {
                throw new ApiException(ApiStatus.INVALID_INPUT, "Insufficient stock for Variant ID: " + variant.getId() + ". Missing: " + quantityNeeded);
            }

            syncTotalInventory(variant, item.getQuantity(), false);
        }
    }

    @Override
    public byte[] exportInventoryReport() {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            // SHEET 1: Tổng quan Tồn Kho
            Sheet sheet1 = workbook.createSheet("Tổng quan Tồn Kho");
            Row headerRow1 = sheet1.createRow(0);
            String[] columns1 = {"Mã Biến Thể", "Tên Sản Phẩm", "Tồn Tổng", "Đang Giữ", "Có Thể Bán", "Cảnh Báo"};
            for (int i = 0; i < columns1.length; i++) {
                Cell cell = headerRow1.createCell(i);
                cell.setCellValue(columns1[i]);
                cell.setCellStyle(headerStyle);
            }

            List<Inventory> inventories = inventoryRepo.findAll();
            int rowIdx1 = 1;
            for (Inventory inv : inventories) {
                Row row = sheet1.createRow(rowIdx1++);
                int available = inv.getQuantity() - inv.getReserved();
                String alert = available <= inv.getMinStock() ? "SẮP HẾT HÀNG" : "AN TOÀN";

                row.createCell(0).setCellValue(inv.getVariant().getSku());
                row.createCell(1).setCellValue(inv.getVariant().getProduct() != null ? inv.getVariant().getProduct().getName() : "N/A");
                row.createCell(2).setCellValue(inv.getQuantity());
                row.createCell(3).setCellValue(inv.getReserved());
                row.createCell(4).setCellValue(available);
                row.createCell(5).setCellValue(alert);
            }

            // SHEET 2: Chi tiết Lô Hàng
            Sheet sheet2 = workbook.createSheet("Chi Tiết Lô Hàng");
            Row headerRow2 = sheet2.createRow(0);
            String[] columns2 = {"Mã Lô", "Mã Biến Thể", "Số Lượng Tồn", "Giá Nhập", "Ngày Nhập", "Ngày Hết Hạn"};
            for (int i = 0; i < columns2.length; i++) {
                Cell cell = headerRow2.createCell(i);
                cell.setCellValue(columns2[i]);
                cell.setCellStyle(headerStyle);
            }

            List<InventoryBatch> batches = batchRepo.findAll();
            int rowIdx2 = 1;
            for (InventoryBatch batch : batches) {
                Row row = sheet2.createRow(rowIdx2++);
                row.createCell(0).setCellValue(batch.getBatchCode());
                row.createCell(1).setCellValue(batch.getVariant().getSku());
                row.createCell(2).setCellValue(batch.getQuantityRemaining());
                row.createCell(3).setCellValue(batch.getImportPrice() != null ? batch.getImportPrice().doubleValue() : 0);
                row.createCell(4).setCellValue(batch.getCreatedAt().format(dateFormatter));
                row.createCell(5).setCellValue(batch.getExpiredAt() != null ? batch.getExpiredAt().format(dateFormatter) : "Không có");
            }

            // SHEET 3: Sổ cái Giao Dịch
            Sheet sheet3 = workbook.createSheet("Lịch Sử Giao Dịch");
            Row headerRow3 = sheet3.createRow(0);
            String[] columns3 = {"Thời Gian", "Loại Giao Dịch", "Mã Biến Thể", "Mã Lô", "Số Lượng (+/-)", "Loại Chứng Từ"};
            for (int i = 0; i < columns3.length; i++) {
                Cell cell = headerRow3.createCell(i);
                cell.setCellValue(columns3[i]);
                cell.setCellStyle(headerStyle);
            }

            List<InventoryTransaction> transactions = transactionRepo.findAll();
            int rowIdx3 = 1;
            for (InventoryTransaction txn : transactions) {
                Row row = sheet3.createRow(rowIdx3++);
                String sign = txn.getType() == TransactionType.IN ? "+" : (txn.getType() == TransactionType.OUT ? "-" : "");
                
                row.createCell(0).setCellValue(txn.getCreatedAt().format(dateFormatter));
                row.createCell(1).setCellValue(txn.getType().name());
                row.createCell(2).setCellValue(txn.getVariant().getSku());
                row.createCell(3).setCellValue(txn.getBatch() != null ? txn.getBatch().getBatchCode() : "N/A");
                row.createCell(4).setCellValue(sign + txn.getQuantity());
                row.createCell(5).setCellValue(txn.getReferenceType());
            }

            for (int i = 0; i < columns1.length; i++) sheet1.autoSizeColumn(i);
            for (int i = 0; i < columns2.length; i++) sheet2.autoSizeColumn(i);
            for (int i = 0; i < columns3.length; i++) sheet3.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();

        } catch (Exception e) {
            throw new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "Error when producing Excel file: " + e.getMessage());
        }
    }

    private void logTransaction(ProductVariant variant, InventoryBatch batch, TransactionType type, int qty, Long refId, String refType) {
        transactionRepo.save(InventoryTransaction.builder()
                .warehouseId(DEFAULT_WAREHOUSE_ID)
                .variant(variant)
                .batch(batch)
                .type(type)
                .quantity(qty) 
                .referenceId(refId)
                .referenceType(refType)
                .createdBy(CURRENT_USER_ID)
                .build());
    }

    private void syncTotalInventory(ProductVariant variant, int qty, boolean isAdd) {
        Inventory inventory = inventoryRepo.findByVariantId(variant.getId())
                .orElse(Inventory.builder()
                        .variant(variant)
                        .quantity(0)
                        .reserved(0)
                        .minStock(0)
                        .build());
        
        if (isAdd) {
            inventory.setQuantity(inventory.getQuantity() + qty);
        } else {
            inventory.setQuantity(inventory.getQuantity() - qty);
        }
        
        inventoryRepo.save(inventory);
    }
}