package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.Entity.Order;
import com.example.canim_ecommerce.Entity.OrderItem;
import com.example.canim_ecommerce.dto.request.OrderRequest;
import com.example.canim_ecommerce.dto.request.OrderItemRequest;
import com.example.canim_ecommerce.dto.response.OrderResponse;
import com.example.canim_ecommerce.dto.response.OrderItemResponse;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    // Map OrderRequest → Order entity (chỉ map userId, discountAmount)
    @Mapping(target = "userId", source = "userId")
    @Mapping(target = "discountAmount", source = "discountAmount")
    @Mapping(target = "items", ignore = true) // items sẽ được thêm thủ công trong service
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "orderNo", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    Order toEntity(OrderRequest request);

    // Map Order entity → OrderResponse
    OrderResponse toResponse(Order entity);

    // Map OrderItem entity → OrderItemResponse
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    OrderItemResponse toItemResponse(OrderItem entity);

    // Map OrderItemRequest → OrderItem entity (dùng trong service)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "order", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "sku", ignore = true)
    OrderItem toOrderItemEntity(OrderItemRequest request);
}