package com.example.canim_ecommerce.service.impl;

import com.example.canim_ecommerce.dto.request.inventory.StockCheckRequest;
import com.example.canim_ecommerce.entity.*;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.StockCheckStatus;
import com.example.canim_ecommerce.enums.TransactionType;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.helper.InventoryHelper;
import com.example.canim_ecommerce.repository.*;
import com.example.canim_ecommerce.service.StockCheckService;
import com.example.canim_ecommerce.utils.CodeGenerator;
import com.example.canim_ecommerce.utils.SecurityUtils;

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

    StockCheckRepository stockCheckRepository;
    StockCheckDetailRepository stockCheckDetailRepository;
    ProductVariantRepository variantRepository;
    InventoryBatchRepository batchRepository;
    InventoryHelper inventoryHelper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public StockCheck createDraftCheck(StockCheckRequest request) {
        Long warehouseId = request.getWarehouseId();
        Long currentUserId = SecurityUtils.getCurrentUserId();

        StockCheck check = StockCheck.builder()
                .warehouseId(warehouseId)
                .code(CodeGenerator.generateReceiptCode("CHK"))
                .staffId(currentUserId)
                .status(StockCheckStatus.DRAFT)
                .note(request.getNote())
                .createdBy(currentUserId)
                .build();
        check = stockCheckRepository.save(check);

        for (StockCheckRequest.StockCheckItem item : request.getItems()) {
            ProductVariant variant = variantRepository.findById(item.getVariantId())
                    .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND,
                            "Không tìm thấy biến thể sản phẩm ID: " + item.getVariantId()));

            stockCheckDetailRepository.save(StockCheckDetail.builder()
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
        StockCheck check = stockCheckRepository.findById(stockCheckId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Không tìm thấy phiếu kiểm kê"));

        if (check.getStatus() != StockCheckStatus.DRAFT) {
            throw new ApiException(ApiStatus.INVALID_INPUT, "Chỉ có thể hoàn tất phiếu ở trạng thái DRAFT");
        }

        Long currentUserId = SecurityUtils.getCurrentUserId();
        Long whId = check.getWarehouseId();
        List<StockCheckDetail> details = check.getDetails();

        for (StockCheckDetail detail : details) {
            int difference = detail.getActualQuantity() - detail.getSystemQuantity();
            if (difference == 0)
                continue;

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
                adjustBatch = batchRepository.save(adjustBatch);
                inventoryHelper.logTransaction(variant, whId, adjustBatch, TransactionType.ADJUST, difference, check.getId(),
                        "STOCK_CHECK");
                inventoryHelper.syncInventory(variant, whId, difference, true);

            } else {
                int missingQty = Math.abs(difference);
                List<InventoryBatch> batches = batchRepository.findAvailableBatchesForFIFO(whId, variant.getId());

                for (InventoryBatch batch : batches) {
                    if (missingQty <= 0)
                        break;
                    int take = Math.min(batch.getQuantityRemaining(), missingQty);

                    batch.setQuantityRemaining(batch.getQuantityRemaining() - take);
                    missingQty -= take;
                    batchRepository.save(batch);
                    inventoryHelper.logTransaction(variant, whId, batch, TransactionType.ADJUST, take, check.getId(), "STOCK_CHECK");
                }
                inventoryHelper.syncInventory(variant, whId, Math.abs(difference), false);
            }
        }
        check.setStatus(StockCheckStatus.COMPLETED);
        check.setUpdatedBy(currentUserId);
        stockCheckRepository.save(check);
    }
}