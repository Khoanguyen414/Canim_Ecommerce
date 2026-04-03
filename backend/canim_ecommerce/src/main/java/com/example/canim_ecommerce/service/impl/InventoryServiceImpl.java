package com.example.canim_ecommerce.service.impl;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.request.inventory.OutboundRequest;
import com.example.canim_ecommerce.dto.response.InboundResponse;
import com.example.canim_ecommerce.dto.response.InventoryReportResponse;
import com.example.canim_ecommerce.dto.response.InventorySummaryResponse;
import com.example.canim_ecommerce.entity.*;
import com.example.canim_ecommerce.enums.ReceiptReason;
import com.example.canim_ecommerce.enums.ReceiptStatus;
import com.example.canim_ecommerce.enums.ReceiptType;
import com.example.canim_ecommerce.mapper.InventoryMapper;
import com.example.canim_ecommerce.repository.*;

import com.example.canim_ecommerce.service.InventoryService;
import com.example.canim_ecommerce.utils.CodeGenerator;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryServiceImpl implements InventoryService {

    InventoryReceiptRepository receiptRepo;
    InventoryReceiptDetailRepository detailRepo;
    InventoryBatchRepository batchRepo;
    SupplierRepository supplierRepo;
    ProductRepository productRepo;
    InventoryMapper inventoryMapper;

    // --- 1. NHẬP KHO (Giữ nguyên logic ổn định của bạn) ---
    @Override
    @Transactional(rollbackFor = Exception.class)
    public InboundResponse createInboundReceipt(InboundRequest request) {
        Supplier supplier = supplierRepo.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Supplier not found"));

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

            InventoryBatch batch = InventoryBatch.builder()
                    .product(product)
                    .sku(product.getSku())
                    .batchCode(CodeGenerator.generateBatchCode(product.getId()))
                    .quantityRemaining(item.getQuantity())
                    .importPrice(item.getPrice())
                    .build();
            batch = batchRepo.save(batch);

            details.add(InventoryReceiptDetail.builder()
                    .receipt(receipt).product(product).batch(batch)
                    .quantity(item.getQuantity()).price(item.getPrice()).build());
        }
        detailRepo.saveAll(details);
        return inventoryMapper.toInboundResponse(receipt);
    }

    // --- 2. XUẤT KHO (Đảm bảo logic FIFO tách dòng Batch) ---
    @Override
    @Transactional(rollbackFor = Exception.class)
    public void createOutboundReceipt(OutboundRequest request) {
        InventoryReceipt receipt = InventoryReceipt.builder()
                .receiptCode(CodeGenerator.generateReceiptCode())
                .type(ReceiptType.OUTBOUND).reason(request.getReason())
                .status(ReceiptStatus.COMPLETED).note(request.getNote()).build();
        receipt = receiptRepo.save(receipt);

        for (OutboundRequest.OutboundItem item : request.getItems()) {
            int quantityNeeded = item.getQuantity();
            List<InventoryBatch> batches = batchRepo.findByProductIdAndQuantityRemainingGreaterThanOrderByCreatedAtAsc(item.getProductId(), 0);

            for (InventoryBatch batch : batches) {
                if (quantityNeeded <= 0) break;
                int takeQty = Math.min(batch.getQuantityRemaining(), quantityNeeded);
                batch.setQuantityRemaining(batch.getQuantityRemaining() - takeQty);
                quantityNeeded -= takeQty;
                batchRepo.save(batch);

                detailRepo.save(InventoryReceiptDetail.builder()
                        .receipt(receipt).product(batch.getProduct()).batch(batch)
                        .quantity(takeQty).price(batch.getImportPrice()).build());
            }
            if (quantityNeeded > 0) throw new RuntimeException("Không đủ hàng trong kho để xuất theo FIFO");
        }
    }

    // --- 3. XEM TỒN KHO & THỐNG KÊ ---
    @Override
    public List<InventoryReportResponse> getInventoryReport() {
        return batchRepo.getInventoryReport().stream().map(row -> InventoryReportResponse.builder()
                .productId((Long) row[0]).productName((String) row[1])
                .sku((String) row[2]).totalQuantity((Long) row[3]).build()
        ).collect(Collectors.toList());
    }

    @Override
    public InventorySummaryResponse getInventorySummary() {
        long totalTypes = productRepo.count();
        Long totalStock = batchRepo.getTotalStock();
        // Tính tổng giá trị tài sản kho
        BigDecimal totalValue = batchRepo.findAll().stream()
                .map(b -> b.getImportPrice().multiply(BigDecimal.valueOf(b.getQuantityRemaining())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return InventorySummaryResponse.builder()
                .totalProductTypes(totalTypes)
                .totalQuantityInStock(totalStock != null ? totalStock : 0L)
                .totalInventoryValue(totalValue)
                .build();
    }

    // --- 4. XUẤT EXCEL CHUẨN DOANH NGHIỆP (VIETNAMESE) ---
    @Override
    public ByteArrayInputStream exportStocktakeReport() throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            CellStyle headerStyle = createHeaderStyle(workbook);
            CellStyle dataStyle = createDataStyle(workbook);
            CellStyle warningStyle = createWarningStyle(workbook); // Màu vàng cho "Sắp hết"
            CellStyle errorStyle = createErrorStyle(workbook);     // Màu đỏ cho "Hết hàng"

            // Sheet 1: Bảng tổng hợp tài sản kho
            createSheet1_Summary(workbook, headerStyle, dataStyle, warningStyle, errorStyle);
            
            // Sheet 2: Chi tiết các Lô hàng (Chứng minh FIFO)
            createSheet2_BatchDetails(workbook, headerStyle, dataStyle);

            // Sheet 3: Lịch sử Nhập/Xuất tổng hợp
            createSheet3_ReceiptHistory(workbook, headerStyle, dataStyle);

            // Sheet 4: Danh mục Nhà cung cấp
            createSheet4_SupplierInfo(workbook, headerStyle, dataStyle);

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    private void createSheet1_Summary(Workbook workbook, CellStyle headerStyle, CellStyle dataStyle, CellStyle warningStyle, CellStyle errorStyle) {
        Sheet sheet = workbook.createSheet("1. KIỂM KÊ TỔNG QUAN");
        sheet.createFreezePane(0, 1); // Cố định tiêu đề
        
        String[] headers = {"STT", "Mã SKU", "Tên Sản Phẩm", "Danh Mục", "NCC Gần Nhất", "Tồn Hệ Thống", "Tồn Thực Tế", "Chênh Lệch", "Giá Vốn TB", "Giá Trị Tồn", "Trạng Thái"};
        createHeaderRow(sheet, headers, headerStyle);

        List<Product> products = productRepo.findAll();
        int rowIdx = 1;
        BigDecimal grandTotalValue = BigDecimal.ZERO;

        for (Product p : products) {
            // Lấy danh sách các lô hàng đang còn tồn của sản phẩm này
            List<InventoryBatch> activeBatches = batchRepo.findAll().stream()
                    .filter(b -> b.getProduct().getId().equals(p.getId()) && b.getQuantityRemaining() > 0)
                    .collect(Collectors.toList());

            long totalQty = activeBatches.stream().mapToLong(InventoryBatch::getQuantityRemaining).sum();
            
            // Tính Giá vốn trung bình (Weighted Average)
            BigDecimal avgCost = BigDecimal.ZERO;
            if (totalQty > 0) {
                BigDecimal sumValue = activeBatches.stream()
                        .map(b -> b.getImportPrice().multiply(BigDecimal.valueOf(b.getQuantityRemaining())))
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                avgCost = sumValue.divide(BigDecimal.valueOf(totalQty), 2, RoundingMode.HALF_UP);
            }
            BigDecimal stockValue = avgCost.multiply(BigDecimal.valueOf(totalQty));
            grandTotalValue = grandTotalValue.add(stockValue);

            // Xác định Trạng thái
            String status = totalQty == 0 ? "HẾT HÀNG" : (totalQty < 10 ? "SẮP HẾT" : "CÒN NHIỀU");

            Row row = sheet.createRow(rowIdx++);
            createCell(row, 0, rowIdx - 1, dataStyle);
            createCell(row, 1, p.getSku(), dataStyle);
            createCell(row, 2, p.getName(), dataStyle);
            createCell(row, 3, p.getCategory() != null ? p.getCategory().getName() : "N/A", dataStyle);
            
            // Tìm NCC nhập hàng gần nhất cho sản phẩm này
            String lastSupplier = detailRepo.findByReceipt_TypeOrderByReceipt_CreatedAtDesc(ReceiptType.INBOUND).stream()
                    .filter(d -> d.getProduct().getId().equals(p.getId()))
                    .findFirst()
                    .map(d -> d.getReceipt().getSupplier() != null ? d.getReceipt().getSupplier().getName() : "N/A")
                    .orElse("N/A");
            
            createCell(row, 4, lastSupplier, dataStyle);
            createCell(row, 5, totalQty, dataStyle);
            createCell(row, 6, "", dataStyle); // Tồn thực tế trống để điền tay
            createCell(row, 7, "", dataStyle); // Chênh lệch
            createCell(row, 8, avgCost, dataStyle);
            createCell(row, 9, stockValue, dataStyle);
            
            Cell statusCell = row.createCell(10);
            statusCell.setCellValue(status);
            if ("HẾT HÀNG".equals(status)) statusCell.setCellStyle(errorStyle);
            else if ("SẮP HẾT".equals(status)) statusCell.setCellStyle(warningStyle);
            else statusCell.setCellStyle(dataStyle);
        }

        // PHẦN TỔNG KẾT (Nằm cuối Sheet 1)
        rowIdx += 2;
        Row r1 = sheet.createRow(rowIdx++);
        r1.createCell(2).setCellValue("TỔNG SỐ LOẠI SẢN PHẨM:");
        r1.createCell(3).setCellValue(products.size());

        Row r2 = sheet.createRow(rowIdx++);
        r2.createCell(2).setCellValue("TỔNG TỒN KHO HỆ THỐNG:");
        r2.createCell(3).setCellValue(batchRepo.getTotalStock() != null ? batchRepo.getTotalStock() : 0);

        Row r3 = sheet.createRow(rowIdx++);
        r3.createCell(2).setCellValue("TỔNG GIÁ TRỊ TÀI SẢN (VND):");
        r3.createCell(3).setCellValue(grandTotalValue.doubleValue());

        autoSizeColumns(sheet, headers.length);
    }

    private void createSheet2_BatchDetails(Workbook workbook, CellStyle headerStyle, CellStyle dataStyle) {
        Sheet sheet = workbook.createSheet("2. CHI TIẾT LÔ (FIFO)");
        sheet.createFreezePane(0, 1);
        String[] headers = {"Mã SKU", "Mã Lô (Batch Code)", "Ngày Nhập", "Số Lượng Còn", "Giá Nhập", "Thành Tiền"};
        createHeaderRow(sheet, headers, headerStyle);

        List<InventoryBatch> batches = batchRepo.findAll().stream()
                .filter(b -> b.getQuantityRemaining() > 0)
                .sorted(Comparator.comparing(InventoryBatch::getCreatedAt))
                .collect(Collectors.toList());

        int rowIdx = 1;
        for (InventoryBatch b : batches) {
            Row row = sheet.createRow(rowIdx++);
            createCell(row, 0, b.getProduct().getSku(), dataStyle);
            createCell(row, 1, b.getBatchCode(), dataStyle);
            createCell(row, 2, b.getCreatedAt().toString(), dataStyle);
            createCell(row, 3, b.getQuantityRemaining(), dataStyle);
            createCell(row, 4, b.getImportPrice(), dataStyle);
            createCell(row, 5, b.getImportPrice().multiply(BigDecimal.valueOf(b.getQuantityRemaining())), dataStyle);
        }
        autoSizeColumns(sheet, headers.length);
    }

    private void createSheet3_ReceiptHistory(Workbook workbook, CellStyle headerStyle, CellStyle dataStyle) {
        Sheet sheet = workbook.createSheet("3. LỊCH SỬ CHỨNG TỪ");
        sheet.createFreezePane(0, 1);
        String[] headers = {"Ngày", "Mã Phiếu", "Loại", "Nhà Cung Cấp", "Mã SKU", "Số Lượng", "Đơn Giá", "Thành Tiền"};
        createHeaderRow(sheet, headers, headerStyle);

        List<InventoryReceiptDetail> details = detailRepo.findAll().stream()
                .sorted(Comparator.comparing((InventoryReceiptDetail d) -> d.getReceipt().getCreatedAt()).reversed())
                .collect(Collectors.toList());

        int rowIdx = 1;
        for (InventoryReceiptDetail d : details) {
            Row row = sheet.createRow(rowIdx++);
            createCell(row, 0, d.getReceipt().getCreatedAt().toString(), dataStyle);
            createCell(row, 1, d.getReceipt().getReceiptCode(), dataStyle);
            createCell(row, 2, d.getReceipt().getType().toString(), dataStyle);
            createCell(row, 3, d.getReceipt().getSupplier() != null ? d.getReceipt().getSupplier().getName() : "N/A", dataStyle);
            createCell(row, 4, d.getProduct().getSku(), dataStyle);
            createCell(row, 5, d.getQuantity(), dataStyle);
            createCell(row, 6, d.getPrice(), dataStyle);
            createCell(row, 7, d.getPrice().multiply(BigDecimal.valueOf(d.getQuantity())), dataStyle);
        }
        autoSizeColumns(sheet, headers.length);
    }

    private void createSheet4_SupplierInfo(Workbook workbook, CellStyle headerStyle, CellStyle dataStyle) {
        Sheet sheet = workbook.createSheet("4. THÔNG TIN NCC");
        sheet.createFreezePane(0, 1);
        String[] headers = {"Mã NCC", "Tên Công Ty", "Người Liên Hệ", "Email", "Số Điện Thoại", "Địa Chỉ"};
        createHeaderRow(sheet, headers, headerStyle);

        List<Supplier> suppliers = supplierRepo.findAll();
        int rowIdx = 1;
        for (Supplier s : suppliers) {
            Row row = sheet.createRow(rowIdx++);
            createCell(row, 0, s.getCode(), dataStyle);
            createCell(row, 1, s.getName(), dataStyle);
            createCell(row, 2, s.getContactPerson(), dataStyle);
            createCell(row, 3, s.getEmail(), dataStyle);
            createCell(row, 4, s.getPhone(), dataStyle);
            createCell(row, 5, s.getAddress(), dataStyle);
        }
        autoSizeColumns(sheet, headers.length);
    }

    // --- HELPER METHODS ---
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
        else if (value instanceof BigDecimal) cell.setCellValue(((BigDecimal) value).doubleValue());
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
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        return style;
    }

    private CellStyle createDataStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        return style;
    }

    private CellStyle createWarningStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        style.setFillForegroundColor(IndexedColors.YELLOW.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle createErrorStyle(Workbook workbook) {
        CellStyle style = createDataStyle(workbook);
        style.setFillForegroundColor(IndexedColors.RED.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        Font font = workbook.createFont();
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        return style;
    }

    private void autoSizeColumns(Sheet sheet, int count) {
        for (int i = 0; i < count; i++) sheet.autoSizeColumn(i);
    }
}