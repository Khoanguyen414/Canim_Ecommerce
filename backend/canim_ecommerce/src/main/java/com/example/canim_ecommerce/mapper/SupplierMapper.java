package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.dto.request.suppliers.SupplierCreationRequest;
import com.example.canim_ecommerce.dto.request.suppliers.SupplierUpdateRequest;
import com.example.canim_ecommerce.dto.response.SupplierResponse;
import com.example.canim_ecommerce.entity.Supplier;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class SupplierMapper {
    
    public Supplier toEntity(SupplierCreationRequest request) {
        if (request == null) {
            return null;
        }
        
        return Supplier.builder()
            // FROM REQUEST (8 fields)
            .supplierCode(request.getSupplierCode())
            .name(request.getName())
            .contactName(request.getContactName())
            .email(request.getEmail())
            .phone(request.getPhone())
            .address(request.getAddress())
            .taxId(request.getTaxId())
            .paymentTerms(request.getPaymentTerms())
            
            //DEFAULT VALUES (auto-set)
            .rating(BigDecimal.valueOf(5.0))  
            .totalOrders(0)                    
            .isActive(true)                    
            .build();
    }
    
    
    public SupplierResponse toResponse(Supplier supplier) {
        if (supplier == null) {
            return null;
        }
        
        return SupplierResponse.builder()
            // ⭐ TẤT CẢ 15 FIELDS FROM ENTITY
            .id(supplier.getId())
            .supplierCode(supplier.getSupplierCode())
            .name(supplier.getName())
            .contactName(supplier.getContactName())
            .email(supplier.getEmail())
            .phone(supplier.getPhone())
            .address(supplier.getAddress())
            .taxId(supplier.getTaxId())
            .paymentTerms(supplier.getPaymentTerms())
            .rating(supplier.getRating())
            .totalOrders(supplier.getTotalOrders())
            .isActive(supplier.getIsActive())
            
            // ⭐ AUDIT TRAIL
            .createdBy(supplier.getCreatedBy())
            .createdAt(supplier.getCreatedAt())
            .updatedBy(supplier.getUpdatedBy())
            .updatedAt(supplier.getUpdatedAt())
            
            .build();
    }
    
    public Supplier updateEntity(SupplierUpdateRequest request, Supplier existingSupplier) {
        if (request == null || existingSupplier == null) {
            return existingSupplier;
        }
        
        // ⭐ UPDATE FIELDS - Only if NOT NULL
        if (request.getName() != null) {
            existingSupplier.setName(request.getName());
        }
        
        if (request.getContactName() != null) {
            existingSupplier.setContactName(request.getContactName());
        }
        
        if (request.getEmail() != null) {
            existingSupplier.setEmail(request.getEmail());
        }
        
        if (request.getPhone() != null) {
            existingSupplier.setPhone(request.getPhone());
        }
        
        if (request.getAddress() != null) {
            existingSupplier.setAddress(request.getAddress());
        }
        
        if (request.getTaxId() != null) {
            existingSupplier.setTaxId(request.getTaxId());
        }
        
        if (request.getPaymentTerms() != null) {
            existingSupplier.setPaymentTerms(request.getPaymentTerms());
        }
        
        // 
        if (request.getIsActive() != null) {
            existingSupplier.setIsActive(request.getIsActive());
        }
        
        return existingSupplier;
    }
}