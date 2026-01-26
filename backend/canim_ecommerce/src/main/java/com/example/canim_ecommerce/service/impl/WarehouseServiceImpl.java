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

    // --- 1. NHẬP KHO ---
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

            InventoryBatch batch = InventoryBatch.builder()
                    .product(product)
                    .sku(product.getSku())
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

    // --- 2. XUẤT KHO (FIFO) ---
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

            // FIX LỖI: Gọi đúng tên hàm "Remaining" (có chữ i)
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

    // --- 4. XUẤT EXCEL ---
    @Override
    public ByteArrayInputStream exportInventoryToExcel() throws IOException {
        List<InventoryReportResponse> report = getInventoryReport();

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Tồn Kho");

            // Header
            Row headerRow = sheet.createRow(0);
            String[] columns = {"ID", "Tên Sản Phẩm", "SKU", "Số Lượng Tồn"};
            CellStyle headerStyle = workbook.createCellStyle();
            Font font = workbook.createFont();
            font.setBold(true);
            headerStyle.setFont(font);

            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }

            // Data
            int rowIdx = 1;
            for (InventoryReportResponse item : report) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(item.getProductId());
                row.createCell(1).setCellValue(item.getProductName());
                row.createCell(2).setCellValue(item.getSku());
                row.createCell(3).setCellValue(item.getTotalQuantity());
            }

            // Auto size
            for(int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }
}