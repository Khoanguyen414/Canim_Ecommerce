package com.example.canim_ecommerce.service.impl;

import com.example.canim_ecommerce.dto.request.Supplier.SupplierRequest;
import com.example.canim_ecommerce.entity.Supplier;
import com.example.canim_ecommerce.mapper.SupplierMapper;
import com.example.canim_ecommerce.repository.SupplierRepository;
import com.example.canim_ecommerce.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @Override
    public Supplier createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã nhà cung cấp đã tồn tại: " + request.getCode());
        }
        if (supplierRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email nhà cung cấp đã tồn tại: " + request.getEmail());
        }

        Supplier supplier = supplierMapper.toEntity(request);
        
        supplier.setIsActive(true); 

        return supplierRepository.save(supplier);
    }

    @Override
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @Override
    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id));
    }

    @Override
    public Supplier updateSupplier(Long id, SupplierRequest request) {
        Supplier existingSupplier = getSupplierById(id);

        if (!existingSupplier.getCode().equals(request.getCode()) //so sánh mã cũ và mới
                && supplierRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã nhà cung cấp mới bị trùng lặp: " + request.getCode());
        }

        
        if (!existingSupplier.getEmail().equals(request.getEmail()) 
                && supplierRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email mới bị trùng lặp: " + request.getEmail());
        }

        
        supplierMapper.updateEntity(existingSupplier, request);
        return supplierRepository.save(existingSupplier);
    }

    @Override
    public void deleteSupplier(Long id) {
        Supplier supplier = getSupplierById(id);
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
        
    }
}