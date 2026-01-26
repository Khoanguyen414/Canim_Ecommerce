package com.example.canim_ecommerce.service.impl;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.response.InboundResponse;
import com.example.canim_ecommerce.entity.*;
import com.example.canim_ecommerce.enums.ReceiptStatus;
import com.example.canim_ecommerce.enums.ReceiptType;
import com.example.canim_ecommerce.mapper.WarehouseMapper;
import com.example.canim_ecommerce.repository.*;
import com.example.canim_ecommerce.repository.inventory.*;
import com.example.canim_ecommerce.service.WarehouseService; 
import com.example.canim_ecommerce.utils.CodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

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
                .status(ReceiptStatus.COMPLETED)
                .supplier(supplier)
                .note(request.getNote())
                .build();
        receipt = receiptRepo.save(receipt);

        List<InventoryReceiptDetail> details = new ArrayList<>();


        for (InboundRequest.InboundItem item : request.getItems()) {
            Product product = productRepo.findById(item.getProductId())
                    .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại ID: " + item.getProductId()));

            
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
}