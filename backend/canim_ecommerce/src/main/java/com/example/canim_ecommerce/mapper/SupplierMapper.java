package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.dto.request.suppliers.SupplierCreationRequest;
import com.example.canim_ecommerce.dto.request.suppliers.SupplierUpdateRequest;
import com.example.canim_ecommerce.dto.response.SupplierResponse;
import com.example.canim_ecommerce.entity.Supplier;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;


@Component
public class SupplierMapper {
    
    public Supplier toEntity(SupplierCreationRequest request) {
        if (request == null) {
            return null;
        }
    
        Supplier supplier = new Supplier();
        
        supplier.setSupplierCode(request.getSupplierCode());
        supplier.setName(request.getName());
        supplier.setContactName(request.getContactName());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setTaxId(request.getTaxId());
        supplier.setPaymentTerms(request.getPaymentTerms());
        supplier.setRating(request.getRating());
        
        return supplier;
    }
    
    public SupplierResponse toResponse(Supplier entity) {
        if (entity == null) {
            return null;
        }
        
        SupplierResponse response = new SupplierResponse();
        
        
        response.setId(entity.getId());
        response.setSupplierCode(entity.getSupplierCode());
        response.setName(entity.getName());
        response.setContactName(entity.getContactName());
        response.setEmail(entity.getEmail());
        response.setPhone(entity.getPhone());
        response.setAddress(entity.getAddress());
        response.setTaxId(entity.getTaxId());
        response.setPaymentTerms(entity.getPaymentTerms());
        response.setRating(entity.getRating());
        response.setTotalOrders(entity.getTotalOrders());
        response.setIsActive(entity.getIsActive());
        response.setCreatedBy(entity.getCreatedBy());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedBy(entity.getUpdatedBy());
        response.setUpdatedAt(entity.getUpdatedAt());
        
        
        return response;
    }
    
    public List<SupplierResponse> toResponseList(List<Supplier> entities) {
        // Null safety
        if (entities == null) {
            return null;
        }
        
        return entities.stream()
                .map(this::toResponse)  
                .collect(Collectors.toList());  
    }
    
    public void updateEntityFromRequest(SupplierUpdateRequest request, Supplier entity) {

        if (request == null || entity == null) {
            return;
        }
        
        if (request.getName() != null) {
            entity.setName(request.getName());
        }
        
        if (request.getContactName() != null) {
            entity.setContactName(request.getContactName());
        }
        
        if (request.getEmail() != null) {
            entity.setEmail(request.getEmail());
        }
        
        if (request.getPhone() != null) {
            entity.setPhone(request.getPhone());
        }
        
        if (request.getAddress() != null) {
            entity.setAddress(request.getAddress());
        }
        
        if (request.getTaxId() != null) {
            entity.setTaxId(request.getTaxId());
        }
        
        if (request.getPaymentTerms() != null) {
            entity.setPaymentTerms(request.getPaymentTerms());
        }
        
        if (request.getRating() != null) {
            entity.setRating(request.getRating());
        }
        
    }
}