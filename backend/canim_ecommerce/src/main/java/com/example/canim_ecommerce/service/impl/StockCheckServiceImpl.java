package com.example.canim_ecommerce.service.impl;

import com.example.canim_ecommerce.dto.request.inventory.StockCheckRequest;
import com.example.canim_ecommerce.entity.*;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.StockCheckStatus;
import com.example.canim_ecommerce.enums.TransactionType;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.repository.*;
import com.example.canim_ecommerce.service.StockCheckService;
import com.example.canim_ecommerce.utils.CodeGenerator;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StockCheckServiceImpl implements StockCheckService {

    StockCheckRepository stockCheckRepo;
    StockCheckDetailRepository detailRepo;
    ProductVariantRepository variantRepo;
    InventoryBatchRepository batchRepo;
    InventoryTransactionRepository transactionRepo;
    InventoryRepository inventoryRepo;

    static Long DEFAULT_WAREHOUSE_ID = 1L;
    static Long CURRENT_USER_ID = 1L;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public StockCheck createDraftCheck(StockCheckRequest request) {
        StockCheck check = StockCheck.builder()
                .warehouseId(DEFAULT_WAREHOUSE_ID)
                .code(CodeGenerator.generateReceiptCode("CHK"))
                .staffId(CURRENT_USER_ID)
                .status(StockCheckStatus.DRAFT)
                .note(request.getNote())
                .createdBy(CURRENT_USER_ID)
                .build();
        check = stockCheckRepo.save(check);

        for (StockCheckRequest.StockCheckItem item : request.getItems()) {
            ProductVariant variant = variantRepo.findById(item.getVariantId())
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Variant not found"));

            detailRepo.save(StockCheckDetail.builder()
                    .stockCheck(check)
                    .variant(variant)
                    .systemQuantity(item.getSystemQuantity())
                    .actualQuantity(item.getActualQuantity())
                    .reason(item.getReason())
                    .build());
        }
        return check;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void completeStockCheck(Long stockCheckId) {
        StockCheck check = stockCheckRepo.findById(stockCheckId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Stock check not found"));

        if (check.getStatus() != StockCheckStatus.DRAFT) {
            throw new ApiException(ApiStatus.INVALID_INPUT, "Chỉ có thể hoàn tất phiếu ở trạng thái DRAFT");
        }

        List<StockCheckDetail> details = check.getDetails();

        for (StockCheckDetail detail : details) {
            int systemQty = detail.getSystemQuantity();
            int actualQty = detail.getActualQuantity();
            int difference = actualQty - systemQty;

            if (difference == 0) continue; 

            ProductVariant variant = detail.getVariant();

            if (difference > 0) {
                InventoryBatch adjustBatch = InventoryBatch.builder()
                        .warehouseId(DEFAULT_WAREHOUSE_ID)
                        .variant(variant)
                        .batchCode(CodeGenerator.generateAdjustBatchCode())
                        .skuSnapshot(variant.getSku())
                        .quantityRemaining(difference)
                        .importPrice(BigDecimal.ZERO) 
                        .build();
                adjustBatch = batchRepo.save(adjustBatch);

                logTransaction(variant, adjustBatch, TransactionType.ADJUST, difference, check.getId(), "STOCK_CHECK");
                syncTotalInventory(variant, difference, true);

            } else {
                int missingQty = Math.abs(difference);
                List<InventoryBatch> batches = batchRepo.findAvailableBatchesForFIFO(DEFAULT_WAREHOUSE_ID, variant.getId());

                for (InventoryBatch batch : batches) {
                    if (missingQty <= 0) break;

                    int takeQty = Math.min(batch.getQuantityRemaining(), missingQty);
                    batch.setQuantityRemaining(batch.getQuantityRemaining() - takeQty);
                    missingQty -= takeQty;
                    batchRepo.save(batch);

                    logTransaction(variant, batch, TransactionType.ADJUST, takeQty, check.getId(), "STOCK_CHECK");
                }
                syncTotalInventory(variant, Math.abs(difference), false);
            }
        }

        check.setStatus(StockCheckStatus.COMPLETED);
        check.setUpdatedBy(CURRENT_USER_ID);
        stockCheckRepo.save(check);
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
                .orElse(Inventory.builder().variant(variant).quantity(0).build());
        
        inventory.setQuantity(isAdd ? inventory.getQuantity() + qty : inventory.getQuantity() - qty);
        inventoryRepo.save(inventory);
    }
}