package com.example.canim_ecommerce.dto.request.suppliers;

import jakarta.validation.constraints.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SupplierCreationRequest {
    
    @NotBlank(message = "Mã nhà cung cấp không được để trống")
    @Pattern(
        regexp = "^SUP_\\d{3,}$",
        message = "Mã phải có format: SUP_XXX (ví dụ: SUP_001, SUP_999)"
    )
    String supplierCode;
    @NotBlank(message = "Tên nhà cung cấp không được để trống")
    @Size(min = 3, max = 255, message = "Tên phải từ 3 đến 255 ký tự")
    String name;
    @NotBlank(message = "Tên người liên hệ không được để trống")
    String contactName;
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email phải hợp lệ (ví dụ: abc@example.com)")
    String email;
    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^\\d{10,}$", message = "Số điện thoại phải ít nhất 10 chữ số")
    String phone;
    @NotBlank(message = "Địa chỉ không được để trống")
    String address;
    @Pattern(regexp = "^\\d{10,}$", message = "Mã số thuế phải ít nhất 10 chữ số")
    String taxId;
    @NotBlank(message = "Điều khoản thanh toán không được để trống")
    String paymentTerms;
}