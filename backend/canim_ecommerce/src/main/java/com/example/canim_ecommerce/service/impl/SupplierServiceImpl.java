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
            throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Supplier ID: " + id));
    }

    @Override
    public Supplier updateSupplier(Long id, SupplierRequest request) {
        Supplier existing = getSupplierById(id);

        if (!existing.getCode().equals(request.getCode()) && supplierRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã mới bị trùng");
        }
        if (!existing.getEmail().equals(request.getEmail()) && supplierRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email mới bị trùng");
        }

        supplierMapper.updateEntity(existing, request);
        return supplierRepository.save(existing);
    }

    @Override
    public void deleteSupplier(Long id) {
        Supplier existing = getSupplierById(id);
        existing.setIsActive(false); // Soft delete
        supplierRepository.save(existing);
    }
    @Override
public void activateSupplier(Long id) {
    Supplier existing = getSupplierById(id);
    existing.setIsActive(true); // Bật lại trạng thái hoạt động
    supplierRepository.save(existing);
}
}