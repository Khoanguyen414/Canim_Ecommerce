package com.example.canim_ecommerce.dto.request.suppliers;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SupplierUpdateRequest {
    String name;
    String contactName;
    
    @Email(message = "Email không đúng định dạng")
    String email;
    
    @Pattern(regexp = "^\\d{10,11}$", message = "Số điện thoại phải từ 10-11 số")
    String phone;
    
    String address;
    Boolean isActive; // Cho phép Admin kích hoạt lại nếu đã xóa nhầm
}