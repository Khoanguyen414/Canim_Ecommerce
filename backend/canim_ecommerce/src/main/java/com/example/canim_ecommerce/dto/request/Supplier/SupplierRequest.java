package com.example.canim_ecommerce.dto.request.Supplier;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SupplierRequest {
    
    @NotBlank(message = "Mã nhà cung cấp không được để trống")
    private String code;

    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    private String name;

    @NotBlank(message = "Người liên hệ không được để trống")
    private String contactPerson;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    @NotBlank(message = "Địa chỉ không được để trống")
    private String address;
}