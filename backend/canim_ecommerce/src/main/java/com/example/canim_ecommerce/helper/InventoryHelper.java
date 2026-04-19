package com.example.canim_ecommerce.helper;

import org.springframework.stereotype.Component;

import com.example.canim_ecommerce.entity.Inventory;
import com.example.canim_ecommerce.entity.InventoryBatch;
import com.example.canim_ecommerce.entity.InventoryTransaction;
import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.enums.TransactionType;
import com.example.canim_ecommerce.repository.InventoryRepository;
import com.example.canim_ecommerce.repository.InventoryTransactionRepository;
import com.example.canim_ecommerce.utils.SecurityUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InventoryHelper {
    InventoryRepository inventoryRepository;
    InventoryTransactionRepository transactionRepository;

    public void syncInventory(ProductVariant variant, Long warehouseId, int quantity, boolean isAdd) {
        Inventory inventory = inventoryRepository.findByVariantIdAndWarehouseId(variant.getId(), warehouseId)
                .orElse(Inventory.builder()
                        .variant(variant)
                        .warehouseId(warehouseId)
                        .quantity(0)
                        .reserved(0)
                        .build());

        inventory.setQuantity(isAdd ? inventory.getQuantity() + quantity : inventory.getQuantity() - quantity);
        inventoryRepository.save(inventory);
    }
    
    public void logTransaction(ProductVariant variant, Long warehouseId, InventoryBatch batch, TransactionType type,
            int quantity, Long referenceId, String referenceType) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        transactionRepository.save(InventoryTransaction.builder()
                .warehouseId(warehouseId)
                .variant(variant)
                .batch(batch)
                .type(type)
                .quantity(quantity)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .createdBy(currentUserId)
                .build());
    }
}
