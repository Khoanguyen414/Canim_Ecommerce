package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.suppliers.SupplierCreationRequest;
import com.example.canim_ecommerce.dto.request.suppliers.SupplierUpdateRequest;
import com.example.canim_ecommerce.dto.response.SupplierResponse;
import com.example.canim_ecommerce.entity.Supplier;
import com.example.canim_ecommerce.mapper.SupplierMapper;
import com.example.canim_ecommerce.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SupplierService {
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    @Autowired
    private SupplierMapper supplierMapper;
    
    @Transactional
    public SupplierResponse createSupplier(SupplierCreationRequest request) {
        if (supplierRepository.existsBySupplierCode(request.getSupplierCode())) {
            throw new RuntimeException("Supplier code already exists: " + request.getSupplierCode());
        }
        
        Supplier supplier = supplierMapper.toEntity(request);
        Supplier savedSupplier = supplierRepository.save(supplier);
        return supplierMapper.toResponse(savedSupplier);
    }
    
    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierUpdateRequest request) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        
        if (!supplier.getIsActive()) {
            throw new RuntimeException("Cannot update inactive supplier. Id: " + id);
        }
        
        Supplier updatedSupplier = supplierMapper.updateEntity(request, supplier);
        Supplier savedSupplier = supplierRepository.save(updatedSupplier);
        return supplierMapper.toResponse(savedSupplier);
    }
    
    @Transactional(readOnly = true)
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        
        return supplierMapper.toResponse(supplier);
    }
    
    @Transactional
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
    }
    
    @Transactional
    public void changeSupplierStatus(Long id, String status) {
        Supplier supplier = supplierRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        
        boolean isActive = "ACTIVE".equalsIgnoreCase(status);
        supplier.setIsActive(isActive);
        supplierRepository.save(supplier);
    }
}