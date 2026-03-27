package com.example.canim_ecommerce.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;  
import lombok.Data;     
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Data 
@Builder  
@NoArgsConstructor  
@AllArgsConstructor  
public class SupplierResponse {
    
    private Long id;  
    
    private String supplierCode;  
    
    private String name;  
    
    private String contactName;  
    
    private String email; 
    
    private String phone;  
    
    private String address;  
    
    private String taxId;  
    
    private String paymentTerms;  // NET30, COD, ADVANCE
    
    private BigDecimal rating;  
    
    private Integer totalOrders;  
    
    private Boolean isActive;  
    
    private Long createdBy;  
    
    private LocalDateTime createdAt; 
    
    private Long updatedBy;  
    
    private LocalDateTime updatedAt;

}