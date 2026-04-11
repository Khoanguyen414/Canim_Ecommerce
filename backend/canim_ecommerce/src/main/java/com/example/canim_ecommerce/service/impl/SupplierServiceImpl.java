package com.example.canim_ecommerce.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.canim_ecommerce.dto.request.supplier.SupplierRequest;
import com.example.canim_ecommerce.dto.response.SupplierResponse;
import com.example.canim_ecommerce.entity.Supplier;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.SupplierMapper;
import com.example.canim_ecommerce.repository.SupplierRepository;
import com.example.canim_ecommerce.service.SupplierService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SupplierServiceImpl implements SupplierService {

    SupplierRepository supplierRepository;
    SupplierMapper supplierMapper;

    @Override
    public List<SupplierResponse> getAllSuppliers() {
        List<Supplier> suppliers = supplierRepository.findByIsDeletedFalseOrderByIdDesc();
        return supplierMapper.toSupplierResponseList(suppliers);
    }

    @Override
    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Supplier not found or has been deleted"));
        return supplierMapper.toSupplierResponse(supplier);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new ApiException(ApiStatus.RESOURCE_EXIST, "Supplier code already exists.");
        }
        if (supplierRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(ApiStatus.RESOURCE_EXIST, "Supplier email already exists.");
        }

        Supplier supplier = supplierMapper.toSupplier(request);
        supplier.setCode(request.getCode().trim().toUpperCase());
        supplier.setEmail(request.getEmail().trim().toLowerCase());
        
        return supplierMapper.toSupplierResponse(supplierRepository.save(supplier));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Supplier not found"));

        if (!supplier.getCode().equalsIgnoreCase(request.getCode()) && supplierRepository.existsByCode(request.getCode())) {
            throw new ApiException(ApiStatus.RESOURCE_EXIST, "Supplier code already exists.");
        }

        supplierMapper.updateSupplier(supplier, request);
        supplier.setCode(request.getCode().trim().toUpperCase());
        
        return supplierMapper.toSupplierResponse(supplierRepository.save(supplier));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteSupplier(Long id) {
        Supplier supplier = supplierRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Supplier not found"));
        supplier.setIsDeleted(true);
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
    }
}