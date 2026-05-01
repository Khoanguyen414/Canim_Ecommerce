package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.dto.response.CartItemResponse;
import com.example.canim_ecommerce.dto.response.CartResponse;
import com.example.canim_ecommerce.entity.Cart;
import com.example.canim_ecommerce.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import java.math.BigDecimal;

@Mapper(componentModel = "spring") 
public interface CartMapper {
    @Mapping(target = "totalAmount", source = "cart", qualifiedByName = "calculateTotalAmount")
    CartResponse toCartResponse(Cart cart);

    @Mapping(target = "variantId", source = "variant.id")
    @Mapping(target = "sku", source = "variant.sku")
    @Mapping(target = "productName", source = "variant.product.name")
    @Mapping(target = "color", source = "variant.color")
    @Mapping(target = "size", source = "variant.size")
    @Mapping(target = "unitPrice", source = "variant.price")
    @Mapping(target = "isSelected", source = "item.isSelected") 
    @Mapping(target = "subTotal", source = "item", qualifiedByName = "calculateSubTotal")
    CartItemResponse toCartItemResponse(CartItem item);

    @Named("calculateSubTotal")
    default BigDecimal calculateSubTotal(CartItem item) {
        if (item == null || item.getVariant() == null) return BigDecimal.ZERO;
        return item.getVariant().getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
    }

    @Named("calculateTotalAmount")
    default BigDecimal calculateTotalAmount(Cart cart) {
        return BigDecimal.ZERO; 
    }
}