package com.example.canim_ecommerce.dto.request.supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SupplierRequest {

    @NotBlank(message = "Supplier code must not be blank")
    @Size(max = 50, message = "Supplier code must not exceed 50 characters")
    String code;

    @NotBlank(message = "Supplier name must not be blank")
    String name;

    String contactPerson;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Invalid email format")
    String email;

    @NotBlank(message = "Phone number must not be blank")
    String phone;

    String address;
}