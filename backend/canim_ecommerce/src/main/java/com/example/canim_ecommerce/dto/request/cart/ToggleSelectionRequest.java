package com.example.canim_ecommerce.dto.request.cart;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ToggleSelectionRequest {
    
    @NotNull(message = "Danh sách sản phẩm không được để trống")
    List<Long> variantIds; 

    @NotNull(message = "Trạng thái chọn không được để trống")
    Boolean isSelected; 
}