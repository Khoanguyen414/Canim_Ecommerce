package com.example.canim_ecommerce.dto.request.Supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierRequest {
    
    @NotBlank(message = "Supplier code must not be blank")
    private String code;

    @NotBlank(message = "Supplier name must not be blank")
    private String name;

    @NotBlank(message = "Contact person must not be blank")
    private String contactPerson;

    @NotBlank(message = "Email must not be blank")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "Phone number must not be blank")
    private String phone;

    @NotBlank(message = "Address must not be blank")
    private String address;
}