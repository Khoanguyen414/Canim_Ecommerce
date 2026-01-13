package com.example.canim_ecommerce.dto.request.suppliers;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;  
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data  
@NoArgsConstructor
@AllArgsConstructor
public class SupplierUpdateRequest {
    
    private String name;
    private String contactName;
    
    @Email(message = "Email should be valid / Email phải hợp lệ")
    private String email;
    
    private String phone;
    private String address;
    private String taxId;
    private String paymentTerms;
    
    @DecimalMin(value = "1.0")
    @DecimalMax(value = "5.0")
    private BigDecimal rating;
  
}