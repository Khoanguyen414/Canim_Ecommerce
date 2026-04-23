package com.example.canim_ecommerce.dto.request.product;

import java.util.List;

import com.example.canim_ecommerce.dto.request.productVariant.ProductVariantRequest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCreationRequest {
    @NotBlank(message = "Product name cannot be empty")
    String name;
    
    String shortDesc;
    String longDesc; 

    @NotEmpty(message = "At least one product variant is required")
    @Valid
    List<ProductVariantRequest> variants;

    @NotNull(message = "Category cannot be empty")
    Integer categoryId;
}
