package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.suppliers.SupplierCreationRequest;
import com.example.canim_ecommerce.dto.request.suppliers.SupplierUpdateRequest;
import com.example.canim_ecommerce.dto.response.SupplierResponse;
import com.example.canim_ecommerce.entity.Supplier;
import com.example.canim_ecommerce.exception.ResourceNotFoundException;  
import com.example.canim_ecommerce.mapper.SupplierMapper;
import com.example.canim_ecommerce.repository.SupplierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class SupplierService {
    
    @Autowired
    private SupplierRepository supplierRepository;
    
    @Autowired
    private SupplierMapper supplierMapper;
    
    public SupplierResponse createSupplier(SupplierCreationRequest request) {
        Supplier supplier = supplierMapper.toEntity(request);
        
        supplier.setIsActive(true);  
        supplier.setCreatedAt(LocalDateTime.now());
        supplier.setCreatedBy(getCurrentUserId());  
        supplier.setUpdatedAt(LocalDateTime.now());  
        supplier.setUpdatedBy(getCurrentUserId());  
        supplier.setTotalOrders(0);  
        
       
        Supplier savedSupplier = supplierRepository.save(supplier);
        
        SupplierResponse response = supplierMapper.toResponse(savedSupplier);
        return response;
    }
    
    public List<SupplierResponse> getAllSuppliers() {
       
        List<Supplier> suppliers = supplierRepository.findAllByIsActiveTrue();
      
        return supplierMapper.toResponseList(suppliers);
    }
    

    public SupplierResponse getSupplierById(Long id) {
        
        Supplier supplier = supplierRepository.findById(id)
                .filter(s -> s.getIsActive() != null && s.getIsActive())
                
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Supplier not found with id: " + id
                ));
               
        
       
        return supplierMapper.toResponse(supplier);
    }
  
    public SupplierResponse getSupplierByCode(String code) {
        Supplier supplier = supplierRepository.findBySupplierCodeAndIsActiveTrue(code)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Supplier not found with code: " + code
                ));
        
        return supplierMapper.toResponse(supplier);
    }
   
    public List<SupplierResponse> searchSuppliers(String name) {
      
        List<Supplier> suppliers = supplierRepository.findByNameContainingIgnoreCaseAndIsActiveTrue(name);
        return supplierMapper.toResponseList(suppliers);
    }
    
    public SupplierResponse updateSupplier(Long id, SupplierUpdateRequest request) {
      
        Supplier existingSupplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Supplier not found with id: " + id
                ));
     
        supplierMapper.updateEntityFromRequest(request, existingSupplier);
        
       
        existingSupplier.setUpdatedAt(LocalDateTime.now());
        existingSupplier.setUpdatedBy(getCurrentUserId());
        
        
        Supplier updatedSupplier = supplierRepository.save(existingSupplier);
        
      
        return supplierMapper.toResponse(updatedSupplier);
    }
   
    public void changeSupplierStatus(Long id, Boolean status) {
       
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Supplier not found with id: " + id
                ));
        
       
        supplier.setIsActive(status);
        
        supplier.setUpdatedAt(LocalDateTime.now());
        supplier.setUpdatedBy(getCurrentUserId());
        supplierRepository.save(supplier);
    }
    public void deleteSupplier(Long id) {
        
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                    "Supplier not found with id: " + id
                ));
   
        supplier.setIsActive(false);
        supplier.setUpdatedAt(LocalDateTime.now());
        supplier.setUpdatedBy(getCurrentUserId());
        supplierRepository.save(supplier);
    }

    private Long getCurrentUserId() {
        try {
           
            Authentication authentication = SecurityContextHolder
                    .getContext()
                    .getAuthentication();
            
            if (authentication != null && authentication.isAuthenticated()) {
            
                Object principal = authentication.getPrincipal();
                
                if (principal instanceof com.example.canim_ecommerce.entity.User) {
                    return ((com.example.canim_ecommerce.entity.User) principal).getId();
                }
                
            }
        } catch (Exception e) {
            
            System.err.println("Error getting current user: " + e.getMessage());
        }
        
        return 1L;
    }
}