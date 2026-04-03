package com.example.canim_ecommerce.service.impl;

<<<<<<< HEAD
import com.example.canim_ecommerce.dto.request.Supplier.SupplierRequest;
=======
import com.example.canim_ecommerce.dto.request.suppliers.SupplierRequest;
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
import com.example.canim_ecommerce.entity.Supplier;
import com.example.canim_ecommerce.mapper.SupplierMapper;
import com.example.canim_ecommerce.repository.SupplierRepository;
import com.example.canim_ecommerce.service.SupplierService;
<<<<<<< HEAD
import lombok.RequiredArgsConstructor;
=======

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
<<<<<<< HEAD
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;
=======
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SupplierServiceImpl implements SupplierService {

    SupplierRepository supplierRepository;
    SupplierMapper supplierMapper;
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059

    @Override
    public Supplier createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã nhà cung cấp đã tồn tại: " + request.getCode());
        }
        if (supplierRepository.existsByEmail(request.getEmail())) {
<<<<<<< HEAD
            throw new RuntimeException("Email nhà cung cấp đã tồn tại: " + request.getEmail());
        }

        Supplier supplier = supplierMapper.toEntity(request);
        
        supplier.setIsActive(true); 

=======
            throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
        }

        Supplier supplier = supplierMapper.toEntity(request);
        supplier.setIsActive(true); 
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
        return supplierRepository.save(supplier);
    }

    @Override
    public List<Supplier> getAllSuppliers() {
        return supplierRepository.findAll();
    }

    @Override
    public Supplier getSupplierById(Long id) {
        return supplierRepository.findById(id)
<<<<<<< HEAD
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhà cung cấp với ID: " + id));
=======
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Supplier ID: " + id));
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
    }

    @Override
    public Supplier updateSupplier(Long id, SupplierRequest request) {
<<<<<<< HEAD
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
=======
        Supplier existing = getSupplierById(id);

        if (!existing.getCode().equals(request.getCode()) && supplierRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Mã mới bị trùng");
        }
        if (!existing.getEmail().equals(request.getEmail()) && supplierRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email mới bị trùng");
        }

        supplierMapper.updateEntity(existing, request);
        return supplierRepository.save(existing);
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
    }

    @Override
    public void deleteSupplier(Long id) {
<<<<<<< HEAD
        Supplier supplier = getSupplierById(id);
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
        
=======
        Supplier existing = getSupplierById(id);
        existing.setIsActive(false); // Soft delete
        supplierRepository.save(existing);
    }
    @Override
    
    public void activateSupplier(Long id) {
        Supplier existing = getSupplierById(id);
        existing.setIsActive(true); // Bật lại trạng thái hoạt động
        supplierRepository.save(existing);
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
    }
}