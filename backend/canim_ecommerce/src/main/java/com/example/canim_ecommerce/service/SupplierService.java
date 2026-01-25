package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.Supplier.SupplierRequest;
import com.example.canim_ecommerce.entity.Supplier;
import java.util.List;

public interface SupplierService {
    Supplier createSupplier(SupplierRequest request);
    List<Supplier> getAllSuppliers();
    Supplier getSupplierById(Long id);
    Supplier updateSupplier(Long id, SupplierRequest request);
    void deleteSupplier(Long id);
    void activateSupplier(Long id);
}