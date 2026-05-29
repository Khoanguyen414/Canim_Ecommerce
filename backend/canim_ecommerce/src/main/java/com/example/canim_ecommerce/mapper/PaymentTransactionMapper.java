package com.example.canim_ecommerce.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.example.canim_ecommerce.dto.response.PaymentTransactionResponse;
import com.example.canim_ecommerce.entity.PaymentTransaction;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentTransactionMapper {
    @Mapping(target = "orderId", source = "order.id")
    PaymentTransactionResponse toResponse(PaymentTransaction transaction);
}
