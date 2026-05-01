package com.example.canim_ecommerce.dto.response;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemResponse {
    Long id; 
    Long variantId;
    String sku;
    String productName;
    String color;
    String size;
    Integer quantity;
    BigDecimal unitPrice; 
    BigDecimal subTotal; 
    Boolean isSelected;       
    Boolean isAvailable;       
    Integer availableStock;   
    String warningMessage;    
    String imageUrl; 
}