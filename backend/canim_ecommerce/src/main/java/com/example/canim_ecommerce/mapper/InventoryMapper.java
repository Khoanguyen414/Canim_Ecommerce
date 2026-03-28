package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.dto.response.InboundResponse;
import com.example.canim_ecommerce.entity.InventoryReceipt;
import com.example.canim_ecommerce.entity.InventoryReceiptDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(target = "supplierName", source = "supplier.name")
    @Mapping(target = "details", source = "details")
    InboundResponse toInboundResponse(InventoryReceipt receipt);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "sku", source = "batch.sku") // Map SKU from batch
    @Mapping(target = "batchCode", source = "batch.batchCode")
    InboundResponse.DetailResponse toDetailResponse(InventoryReceiptDetail detail);
}