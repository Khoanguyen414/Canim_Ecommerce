package com.example.canim_ecommerce.dto.request.warehouse;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class WarehouseRequest {

    @NotBlank(message = "Warehouse name must not be blank")
    String name;

    String address;
}