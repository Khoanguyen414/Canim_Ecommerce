package com.example.canim_ecommerce.service;

<<<<<<< HEAD
import com.example.canim_ecommerce.dto.request.Supplier.SupplierRequest;
import com.example.canim_ecommerce.entity.Supplier;

import java.util.List;

public interface SupplierService {
    
    Supplier createSupplier(SupplierRequest request);

    List<Supplier> getAllSuppliers();

    Supplier getSupplierById(Long id);
    
    Supplier updateSupplier(Long id, SupplierRequest request);

    void deleteSupplier(Long id);
=======
import com.example.canim_ecommerce.dto.request.suppliers.SupplierRequest;
import com.example.canim_ecommerce.entity.Supplier;
import java.util.List;

public interface SupplierService {
    Supplier createSupplier(SupplierRequest request);
    List<Supplier> getAllSuppliers();
    Supplier getSupplierById(Long id);
    Supplier updateSupplier(Long id, SupplierRequest request);
    void deleteSupplier(Long id);
    void activateSupplier(Long id);
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
}