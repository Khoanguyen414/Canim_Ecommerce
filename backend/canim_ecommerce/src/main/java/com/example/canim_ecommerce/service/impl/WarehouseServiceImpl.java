package com.example.canim_ecommerce.service.impl;
import com.example.canim_ecommerce.entity.InventoryBatch;
import com.example.canim_ecommerce.entity.InventoryReceipt;
import com.example.canim_ecommerce.entity.InventoryReceiptDetail;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.Supplier;
import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.enums.ReceiptType;

import com.example.canim_ecommerce.repository.ProductRepository;
import com.example.canim_ecommerce.repository.SupplierRepository;
import com.example.canim_ecommerce.repository.inventory.InventoryBatchRepository;
import com.example.canim_ecommerce.repository.inventory.InventoryReceiptDetailRepository;
import com.example.canim_ecommerce.repository.inventory.InventoryReceiptRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List; 
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WarehouseServiceImpl {

    private final InventoryReceiptRepository receiptRepo;
    private final InventoryReceiptDetailRepository detailRepo;
    private final InventoryBatchRepository batchRepo;
    private final SupplierRepository supplierRepo;
    private final ProductRepository productRepo; 

    @Transactional(rollbackFor = Exception.class)
    public InventoryReceipt createInboundReceipt(InboundRequest request) {
        Supplier supplier = supplierRepo.findById(request.getSupplierId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));

        InventoryReceipt receipt = InventoryReceipt.builder()
                .receiptCode(generateReceiptCode())
                .type(ReceiptType.INBOUND)
                .supplier(supplier)
                .note(request.getNote())
                .build();
        
        receipt = receiptRepo.save(receipt); 

        List<InventoryReceiptDetail> details = new ArrayList<>();
        
        for (InboundRequest.InboundItem item : request.getItems()) {
            Product product = productRepo.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm"));

            InventoryBatch batch = InventoryBatch.builder()
                    .product(product)
                    .batchCode("BATCH-" + System.currentTimeMillis()) 
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

        detailRepo.saveAll(details);
        return receipt;
    }

    private String generateReceiptCode() {
        return "PN-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) 
               + "-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase();
    }
}