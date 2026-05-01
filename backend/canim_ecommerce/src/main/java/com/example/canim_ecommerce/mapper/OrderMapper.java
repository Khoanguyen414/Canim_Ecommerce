package com.example.canim_ecommerce.mapper;

import java.math.BigDecimal;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Autowired;

import com.example.canim_ecommerce.dto.response.OrderDetailResponse;
import com.example.canim_ecommerce.dto.response.OrderItemResponse;
import com.example.canim_ecommerce.dto.response.OrderResponse;
import com.example.canim_ecommerce.entity.Order;
import com.example.canim_ecommerce.entity.OrderItem;
import com.example.canim_ecommerce.repository.ProductImageRepository;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class OrderMapper {
    @Autowired
    protected ProductImageRepository productImageRepository;

    public abstract OrderResponse toOrderResponse(Order order);
    public abstract List<OrderResponse> toOrderResponseList(List<Order> orders);

    public abstract OrderDetailResponse toOrderDetailResponse(Order order);

    @Mapping(target = "subTotal", source = "orderItem", qualifiedByName = "calcItemSubTotal")
    @Mapping(target = "imageUrl", source = "orderItem", qualifiedByName = "fetchImageUrl")
    public abstract OrderItemResponse toOrderItemResponse(OrderItem orderItem);

    @Named("calcItemSubTotal")
    protected BigDecimal calcItemSubTotal(OrderItem item) {
        if (item == null || item.getPrice() == null || item.getQuantity() == null) {
            return BigDecimal.ZERO;
        }
        return item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
    }

    @Named("fetchImageUrl")
    protected String fetchImageUrl(OrderItem item) {
        if (item == null || item.getVariantId() == null) return null;
        
        return productImageRepository.findByProductIdAndIsMainTrue(item.getVariantId())
                .map(img -> img.getUrl())
                .orElse(null); 
    }
}
