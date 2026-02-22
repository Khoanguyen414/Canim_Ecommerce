package com.example.canim_ecommerce.service.impl;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.request.inventory.OutboundRequest;
import com.example.canim_ecommerce.dto.response.InboundResponse;
import com.example.canim_ecommerce.dto.response.InventoryReportResponse;
import com.example.canim_ecommerce.entity.*;
import com.example.canim_ecommerce.enums.ReceiptReason;
import com.example.canim_ecommerce.enums.ReceiptStatus;
import com.example.canim_ecommerce.enums.ReceiptType;
import com.example.canim_ecommerce.mapper.WarehouseMapper;
import com.example.canim_ecommerce.repository.*;
import com.example.canim_ecommerce.repository.inventory.*;
import com.example.canim_ecommerce.service.WarehouseService;
import com.example.canim_ecommerce.utils.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl implements WarehouseService {

    private final InventoryReceiptRepository receiptRepo;
    private final InventoryReceiptDetailRepository detailRepo;
    private final InventoryBatchRepository batchRepo;
    private final SupplierRepository supplierRepo;
    private final ProductRepository productRepo;
    private final WarehouseMapper warehouseMapper;

    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public InboundResponse createInboundReceipt(InboundRequest request) {
        Supplier supplier = supplierRepo.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Nhà cung cấp không tồn tại"));

        InventoryReceipt receipt = InventoryReceipt.builder()
                .receiptCode(CodeGenerator.generateReceiptCode())
                .type(ReceiptType.INBOUND)
                .reason(ReceiptReason.PURCHASE)
                .status(ReceiptStatus.COMPLETED)
                .supplier(supplier)
                .note(request.getNote())
                .build();
        receipt = receiptRepo.save(receipt);

        List<InventoryReceiptDetail> details = new ArrayList<>();

        for (InboundRequest.InboundItem item : request.getItems()) {
            Product product = productRepo.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found ID: " + item.getProductId()));

            // Tạo Lô hàng mới (Batch)
            InventoryBatch batch = InventoryBatch.builder()
                    .product(product)
                    .sku(product.getSku()) // Snapshot SKU
                    .batchCode(CodeGenerator.generateBatchCode(product.getId()))
                    .quantityRemaining(item.getQuantity())
                    .importPrice(item.getPrice())
                    .build();
            batch = batchRepo.save(batch);

            InventoryReceiptDetail detail = InventoryReceiptDetail.builder()
                    .receipt(receipt)
                    .product(product)
                    .batch(batch)
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .build();
            details.add(detail);
        }
        List<InventoryReceiptDetail> savedDetails = detailRepo.saveAll(details);
        receipt.setDetails(savedDetails);
        return warehouseMapper.toResponse(receipt);
    }

    // --- 2. XUẤT KHO (FIFO Strategy) ---
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createOutboundReceipt(OutboundRequest request) {
        InventoryReceipt receipt = InventoryReceipt.builder()
                .receiptCode(CodeGenerator.generateReceiptCode())
                .type(ReceiptType.OUTBOUND)
                .reason(request.getReason())
                .status(ReceiptStatus.COMPLETED)
                .note(request.getNote())
                .build();
        receipt = receiptRepo.save(receipt);

        List<InventoryReceiptDetail> details = new ArrayList<>();

        for (OutboundRequest.OutboundItem item : request.getItems()) {
            Product product = productRepo.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found ID: " + item.getProductId()));

            int quantityNeeded = item.getQuantity();

            // Tìm lô còn hàng, sắp xếp cũ nhất lên đầu (FIFO)
            List<InventoryBatch> batches = batchRepo.findByProductIdAndQuantityRemainingGreaterThanOrderByCreatedAtAsc(
                    item.getProductId(), 0
            );

            for (InventoryBatch batch : batches) {
                if (quantityNeeded <= 0) break;

                int takeQty = Math.min(batch.getQuantityRemaining(), quantityNeeded);
                
                // Trừ kho
                batch.setQuantityRemaining(batch.getQuantityRemaining() - takeQty);
                quantityNeeded -= takeQty;
                batchRepo.save(batch);

                InventoryReceiptDetail detail = InventoryReceiptDetail.builder()
                        .receipt(receipt)
                        .product(product)
                        .batch(batch)
                        .quantity(takeQty)
                        .price(batch.getImportPrice())
                        .build();
                details.add(detail);
            }

            if (quantityNeeded > 0) {
                throw new RuntimeException("Không đủ tồn kho cho sản phẩm: " + product.getName());
            }
        }
        detailRepo.saveAll(details);
    }

    // --- 3. XEM TỒN KHO ---
    @Override
    public List<InventoryReportResponse> getInventoryReport() {
        List<Object[]> results = batchRepo.getInventoryReport();
        return results.stream().map(row -> InventoryReportResponse.builder()
                .productId((Long) row[0])
                .productName((String) row[1])
                .sku((String) row[2])
                .totalQuantity((Long) row[3])
                .build()
        ).collect(Collectors.toList());
    }

    // --- 4. XUẤT EXCEL KIỂM KÊ (4 SHEET) ---
    @Override
    public ByteArrayInputStream exportStocktakeReport() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);

            // Sheet 1: Tổng quan tồn kho (Để điền số thực tế)
            createSheet1_Overview(workbook, headerStyle, dataStyle);

            // Sheet 2: Lịch sử nhập (Để truy vết NCC)
            createSheet2_InboundHistory(workbook, headerStyle, dataStyle);

            // Sheet 3: Lịch sử xuất (Để truy vết bán hàng/thất thoát)
            createSheet3_OutboundHistory(workbook, headerStyle, dataStyle);

            // Sheet 4: Thông tin NCC (Để liên hệ khiếu nại)
            createSheet4_SupplierInfo(workbook, headerStyle, dataStyle);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
    
    
    // ================= HELPER METHODS (Tách nhỏ logic Excel) =================

    // 🟢 SHEET 1: KIỂM KÊ TỒN
    private void createSheet1_Overview(Workbook workbook, CellStyle headerStyle, CellStyle dataStyle) {
        Sheet sheet = workbook.createSheet("1. KIEM_KE_TON");
        String[] headers = {"STT", "SKU", "Tên Sản Phẩm", "Tồn Hệ Thống", "Tồn Thực Tế", "Chênh Lệch", "Ghi Chú"};
        createHeaderRow(sheet, headers, headerStyle);

        List<Object[]> inventoryData = batchRepo.getInventoryReport();
        int rowIdx = 1;
        for (Object[] item : inventoryData) {
            Row row = sheet.createRow(rowIdx++);
            int col = 0;
            createCell(row, col++, rowIdx - 1, dataStyle); // STT
            createCell(row, col++, (String) item[2], dataStyle); // SKU
            createCell(row, col++, (String) item[1], dataStyle); // Tên SP
            createCell(row, col++, (Long) item[3], dataStyle);   // Tồn Hệ Thống
            createCell(row, col++, "", dataStyle); // Tồn thực tế (Để trống)
            createCell(row, col++, "", dataStyle); // Chênh lệch (Để trống)
            createCell(row, col++, "", dataStyle); // Ghi chú (Để trống)
        }
        autoSizeColumns(sheet, headers.length);
    }

    // 🟢 SHEET 2: LỊCH SỬ NHẬP
    private void createSheet2_InboundHistory(Workbook workbook, CellStyle headerStyle, CellStyle dataStyle) {
        Sheet sheet = workbook.createSheet("2. LICH_SU_NHAP");
        String[] headers = {"Ngày Nhập", "Mã Phiếu", "SKU", "Tên SP", "Nhà Cung Cấp", "SL Nhập", "Đơn Giá", "Ghi Chú"};
        createHeaderRow(sheet, headers, headerStyle);

        List<InventoryReceiptDetail> details = detailRepo.findByReceipt_TypeOrderByReceipt_CreatedAtDesc(ReceiptType.INBOUND);
        
        int rowIdx = 1;
        for (InventoryReceiptDetail item : details) {
            Row row = sheet.createRow(rowIdx++);
            int col = 0;
            createCell(row, col++, item.getReceipt().getCreatedAt().toString(), dataStyle);
            createCell(row, col++, item.getReceipt().getReceiptCode(), dataStyle);
            createCell(row, col++, item.getProduct().getSku(), dataStyle);
            createCell(row, col++, item.getProduct().getName(), dataStyle);
            createCell(row, col++, item.getReceipt().getSupplier().getName(), dataStyle);
            createCell(row, col++, item.getQuantity(), dataStyle);
            createCell(row, col++, item.getPrice().toString(), dataStyle);
            createCell(row, col++, item.getReceipt().getNote(), dataStyle);
        }
        autoSizeColumns(sheet, headers.length);
    }

    // 🟢 SHEET 3: LỊCH SỬ XUẤT
    private void createSheet3_OutboundHistory(Workbook workbook, CellStyle headerStyle, CellStyle dataStyle) {
        Sheet sheet = workbook.createSheet("3. LICH_SU_XUAT");
        String[] headers = {"Ngày Xuất", "Mã Phiếu", "SKU", "Tên SP", "Lý Do", "SL Xuất", "Ghi Chú"};
        createHeaderRow(sheet, headers, headerStyle);

        List<InventoryReceiptDetail> details = detailRepo.findByReceipt_TypeOrderByReceipt_CreatedAtDesc(ReceiptType.OUTBOUND);

        int rowIdx = 1;
        for (InventoryReceiptDetail item : details) {
            Row row = sheet.createRow(rowIdx++);
            int col = 0;
            createCell(row, col++, item.getReceipt().getCreatedAt().toString(), dataStyle);
            createCell(row, col++, item.getReceipt().getReceiptCode(), dataStyle);
            createCell(row, col++, item.getProduct().getSku(), dataStyle);
            createCell(row, col++, item.getProduct().getName(), dataStyle);
            createCell(row, col++, item.getReceipt().getReason().toString(), dataStyle);
            createCell(row, col++, item.getQuantity(), dataStyle);
            createCell(row, col++, item.getReceipt().getNote(), dataStyle);
        }
        autoSizeColumns(sheet, headers.length);
    }

    // 🟢 SHEET 4: THÔNG TIN NCC
    private void createSheet4_SupplierInfo(Workbook workbook, CellStyle headerStyle, CellStyle dataStyle) {
        Sheet sheet = workbook.createSheet("4. NCC_INFO");
        String[] headers = {"Mã NCC", "Tên NCC", "Người Liên Hệ", "Email", "SĐT", "Địa Chỉ"};
        createHeaderRow(sheet, headers, headerStyle);

        List<Supplier> suppliers = supplierRepo.findAll();
        int rowIdx = 1;
        for (Supplier s : suppliers) {
            Row row = sheet.createRow(rowIdx++);
            int col = 0;
            createCell(row, col++, s.getCode(), dataStyle);
            createCell(row, col++, s.getName(), dataStyle);
            createCell(row, col++, s.getContactPerson(), dataStyle);
            createCell(row, col++, s.getEmail(), dataStyle);
            createCell(row, col++, s.getPhone(), dataStyle);
            createCell(row, col++, s.getAddress(), dataStyle);
        }
        autoSizeColumns(sheet, headers.length);
    }

    // Styles & Format Utilities
    private void createHeaderRow(Sheet sheet, String[] headers, CellStyle style) {
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    private void createCell(Row row, int col, Object value, CellStyle style) {
        Cell cell = row.createCell(col);
        if (value instanceof Number) cell.setCellValue(((Number) value).doubleValue());
        else cell.setCellValue(value != null ? value.toString() : "");
        cell.setCellStyle(style);
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.ROYAL_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        return style;
    }

    private void autoSizeColumns(Sheet sheet, int count) {
        for (int i = 0; i < count; i++) sheet.autoSizeColumn(i);
    }
}