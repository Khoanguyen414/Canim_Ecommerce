package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.suppliers.SupplierCreationRequest;
import com.example.canim_ecommerce.dto.request.suppliers.SupplierUpdateRequest;
import com.example.canim_ecommerce.dto.response.SupplierResponse;

import java.util.List;

// QUAN TRỌNG: Phải là interface, không phải class
public interface SupplierService {
    SupplierResponse createSupplier(SupplierCreationRequest request);
    
    SupplierResponse updateSupplier(Integer id, SupplierUpdateRequest request);
    
    List<SupplierResponse> getAllSuppliers(boolean includeDeleted);
    
    SupplierResponse getSupplierById(Integer id);
    
    void deleteSupplier(Integer id);
}