package com.example.canim_ecommerce.service.impl;

import com.example.canim_ecommerce.dto.request.suppliers.SupplierCreationRequest;
import com.example.canim_ecommerce.dto.request.suppliers.SupplierUpdateRequest;
import com.example.canim_ecommerce.dto.response.SupplierResponse;
import com.example.canim_ecommerce.entity.Supplier;
import com.example.canim_ecommerce.mapper.SupplierMapper;
import com.example.canim_ecommerce.repository.SupplierRepository;
import com.example.canim_ecommerce.service.SupplierService; // Import Interface
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
// IMPLEMENTS Interface (Đây là chỗ sửa lỗi superinterface)
public class SupplierServiceImpl implements SupplierService {

    SupplierRepository supplierRepository;
    SupplierMapper supplierMapper;

    @Override
    @Transactional
    public SupplierResponse createSupplier(SupplierCreationRequest request) {
        // Code cũ của bạn
        if (request.getEmail() != null && !request.getEmail().isEmpty() 
                && supplierRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email nhà cung cấp đã tồn tại");
        }
        Supplier supplier = supplierMapper.toSupplier(request);
        return supplierMapper.toSupplierResponse(supplierRepository.save(supplier));
    }

    // ... Các hàm khác giữ nguyên code logic, chỉ cần đảm bảo có @Override
    @Override
    @Transactional
    public SupplierResponse updateSupplier(Integer id, SupplierUpdateRequest request) {
         Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));
        supplierMapper.updateSupplier(supplier, request);
        return supplierMapper.toSupplierResponse(supplierRepository.save(supplier));
    }

    @Override
    public List<SupplierResponse> getAllSuppliers(boolean includeDeleted) {
        List<Supplier> suppliers;
        if (includeDeleted) {
            suppliers = supplierRepository.findAll();
        } else {
            suppliers = supplierRepository.findAllByIsActiveTrue();
        }
        return suppliers.stream()
                .map(supplierMapper::toSupplierResponse)
                .collect(Collectors.toList());
    }

    @Override
    public SupplierResponse getSupplierById(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));
        return supplierMapper.toSupplierResponse(supplier);
    }

    @Override
    @Transactional
    public void deleteSupplier(Integer id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp"));
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
    }
}