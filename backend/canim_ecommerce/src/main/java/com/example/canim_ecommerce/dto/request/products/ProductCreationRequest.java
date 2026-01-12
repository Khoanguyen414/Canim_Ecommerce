package com.example.canim_ecommerce.dto.request.products;

import java.math.BigDecimal;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
    
    @NotBlank(message = "SKU cannot be empty")
    @Size(min = 3, message = "SKU must have at least 3 charaters")
    String sku;
    
    String shortDesc;
    String longDesc;

    @NotNull(message = "Price cannot be empty")
    @Min(value = 0, message = "Price must be bigger or equal 0")
    BigDecimal price; 

    String brand;
    String color; 
    String size;

    @NotNull(message = "Category cannot be empty")
    Integer categoryId;
}
