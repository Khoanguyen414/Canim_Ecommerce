package com.example.canim_ecommerce.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.example.canim_ecommerce.dto.response.OrderDetailResponse;
import com.example.canim_ecommerce.dto.response.OrderItemResponse;
import com.example.canim_ecommerce.dto.response.OrderResponse;
import com.example.canim_ecommerce.dto.response.OrderStatusHistoryResponse;
import com.example.canim_ecommerce.entity.Order;
import com.example.canim_ecommerce.entity.OrderItem;
import com.example.canim_ecommerce.entity.OrderStatusHistory;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {
    @Mapping(target = "cancelledById", source = "cancelledBy.id")
    @Mapping(target = "cancelledByName", source = "cancelledBy.fullName")
    OrderResponse toOrderResponse(Order order);

    OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    @Mapping(target = "cancelledById", source = "cancelledBy.id")
    @Mapping(target = "cancelledByName", source = "cancelledBy.fullName")
    OrderDetailResponse toDetailResponse(Order order);

    OrderStatusHistoryResponse toOrderStatusHistoryResponse(OrderStatusHistory history);
}
