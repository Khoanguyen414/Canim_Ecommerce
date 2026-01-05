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
public class SupplierUpdateRequest {
    
    @Size(min = 3, max = 255, message = "Tên phải từ 3 đến 255 ký tự")
    String name;
    String contactName;
    @Email(message = "Email phải hợp lệ")
    String email;
    @Pattern(regexp = "^\\d{10,}$", message = "Số điện thoại phải ít nhất 10 chữ số")
    String phone;
    String address;
    @Pattern(regexp = "^\\d{10,}$", message = "Mã số thuế phải ít nhất 10 chữ số")
    String taxId;
    String paymentTerms;
    @NotNull(message = "Trạng thái hoạt động bắt buộc phải chỉ định (true/false)")
    Boolean isActive;
}