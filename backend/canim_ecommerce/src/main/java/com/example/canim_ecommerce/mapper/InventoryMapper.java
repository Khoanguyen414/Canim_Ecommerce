package com.example.canim_ecommerce.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.request.inventory.OutboundRequest;
import com.example.canim_ecommerce.entity.InventoryReceipt;


@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface InventoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "details", ignore = true)
    InventoryReceipt toReceiptFromInbound(InboundRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "details", ignore = true)
    InventoryReceipt toReceiptFromOutbound(OutboundRequest request);
}