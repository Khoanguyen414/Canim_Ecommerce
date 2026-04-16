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
        Long warehouseId = (request.getWarehouseId() != null) ? request.getWarehouseId() : DEFAULT_WAREHOUSE_ID;

        StockCheck check = StockCheck.builder()
                .warehouseId(warehouseId)
                .code(CodeGenerator.generateReceiptCode("CHK"))
                .staffId(CURRENT_USER_ID)
                .status(StockCheckStatus.DRAFT)
                .note(request.getNote())
                .createdBy(CURRENT_USER_ID)
                .build();
        check = stockCheckRepo.save(check);

        for (StockCheckRequest.StockCheckItem item : request.getItems()) {
            ProductVariant variant = variantRepo.findById(item.getVariantId())
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Không tìm thấy biến thể sản phẩm ID: " + item.getVariantId()));

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
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Không tìm thấy phiếu kiểm kê"));

        if (check.getStatus() != StockCheckStatus.DRAFT) {
            throw new ApiException(ApiStatus.INVALID_INPUT, "Chỉ có thể hoàn tất phiếu ở trạng thái DRAFT");
        }

        Long whId = check.getWarehouseId();
        List<StockCheckDetail> details = check.getDetails();

        for (StockCheckDetail detail : details) {
            int difference = detail.getActualQuantity() - detail.getSystemQuantity();
            if (difference == 0) continue; 

            ProductVariant variant = detail.getVariant();

            if (difference > 0) {
                InventoryBatch adjustBatch = InventoryBatch.builder()
                        .warehouseId(whId)
                        .variant(variant)
                        .batchCode(CodeGenerator.generateAdjustBatchCode()) 
                        .skuSnapshot(variant.getSku())
                        .quantityRemaining(difference)
                        .importPrice(BigDecimal.ZERO) 
                        .build();
                adjustBatch = batchRepo.save(adjustBatch);
                logTransaction(variant, whId, adjustBatch, TransactionType.ADJUST, difference, check.getId(), "STOCK_CHECK");
                syncInventory(variant, whId, difference, true);

            } else {
                int missingQty = Math.abs(difference);
                List<InventoryBatch> batches = batchRepo.findAvailableBatchesForFIFO(whId, variant.getId());

                for (InventoryBatch batch : batches) {
                    if (missingQty <= 0) break;
                    int take = Math.min(batch.getQuantityRemaining(), missingQty);
                    
                    batch.setQuantityRemaining(batch.getQuantityRemaining() - take);
                    missingQty -= take;
                    batchRepo.save(batch);
                    logTransaction(variant, whId, batch, TransactionType.ADJUST, take, check.getId(), "STOCK_CHECK");
                }
                syncInventory(variant, whId, Math.abs(difference), false);
            }
        }
        check.setStatus(StockCheckStatus.COMPLETED);
        check.setUpdatedBy(CURRENT_USER_ID);
        stockCheckRepo.save(check);
    }
    private void logTransaction(ProductVariant v, Long whId, InventoryBatch b, TransactionType type, int qty, Long refId, String refType) {
        transactionRepo.save(InventoryTransaction.builder()
                .warehouseId(whId)
                .variant(v)
                .batch(b)
                .type(type)
                .quantity(qty)
                .referenceId(refId)
                .referenceType(refType)
                .createdBy(CURRENT_USER_ID)
                .build());
    }

    private void syncInventory(ProductVariant v, Long whId, int qty, boolean isAdd) {
        Inventory inv = inventoryRepo.findByVariantIdAndWarehouseId(v.getId(), whId)
                .orElse(Inventory.builder()
                        .variant(v)
                        .warehouseId(whId)
                        .quantity(0)
                        .reserved(0)
                        .build());
        
        inv.setQuantity(isAdd ? inv.getQuantity() + qty : inv.getQuantity() - qty);
        inventoryRepo.save(inv);
    }
}