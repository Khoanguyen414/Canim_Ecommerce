package com.example.canim_ecommerce.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.canim_ecommerce.dto.request.warehouse.WarehouseRequest;
import com.example.canim_ecommerce.entity.Warehouse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.WarehouseMapper;
import com.example.canim_ecommerce.repository.WarehouseRepository;
import com.example.canim_ecommerce.service.WarehouseService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WarehouseServiceImpl implements WarehouseService {

    WarehouseRepository warehouseRepository;
    WarehouseMapper warehouseMapper;

    @Override
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findByIsDeletedFalseOrderByIdDesc();
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
                    // .sku(product.getSku()) // Snapshot SKU
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

    @Override
    public Warehouse getWarehouseById(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Warehouse not found"));
    }

    @Override
    @Transactional
    public Warehouse createWarehouse(WarehouseRequest request) {
        Warehouse warehouse = warehouseMapper.toWarehouse(request);
        warehouse.setIsActive(true);
        warehouse.setIsDeleted(false);
        return warehouseRepository.save(warehouse);
    }

    @Override
    @Transactional
    public Warehouse updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse warehouse = getWarehouseById(id);
        warehouseMapper.updateWarehouse(warehouse, request);
        return warehouseRepository.save(warehouse);
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
            // createCell(row, col++, item.getProduct().getSku(), dataStyle);
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
            // createCell(row, col++, item.getProduct().getSku(), dataStyle);
            createCell(row, col++, item.getProduct().getName(), dataStyle);
            createCell(row, col++, item.getReceipt().getReason().toString(), dataStyle);
            createCell(row, col++, item.getQuantity(), dataStyle);
            createCell(row, col++, item.getReceipt().getNote(), dataStyle);
        }
        autoSizeColumns(sheet, headers.length);
    }

    @Override
    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = getWarehouseById(id);
        warehouse.setIsDeleted(true);
        warehouse.setIsActive(false);
        warehouseRepository.save(warehouse);
    }
}