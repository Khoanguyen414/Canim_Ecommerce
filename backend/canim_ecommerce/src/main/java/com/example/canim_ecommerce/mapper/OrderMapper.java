package com.example.canim_ecommerce.mapper;

import java.math.BigDecimal;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
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
    OrderResponse toOrderResponse(Order order);

    OrderDetailResponse toDetailResponse(Order order);

    @Mapping(target = "imageUrl", ignore = true)
    OrderItemResponse toItemResponse(OrderItem item);

    OrderStatusHistoryResponse toHistoryResponse(OrderStatusHistory history);

    List<OrderItemResponse> toItemResponses(List<OrderItem> items);

    List<OrderResponse> toResponses(List<Order> orders);
}