package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.Supplier.SupplierRequest;
import com.example.canim_ecommerce.entity.Supplier;
import com.example.canim_ecommerce.service.SupplierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers") 
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<Supplier> create(@Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(supplierService.createSupplier(request));
    }

    @GetMapping
    public ResponseEntity<List<Supplier>> getAll() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Supplier> getById(@PathVariable Long id) {
        return ResponseEntity.ok(supplierService.getSupplierById(id));
    }


    @PutMapping("/{id}")
    public ResponseEntity<Supplier> update(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok("Đã khóa nhà cung cấp thành công.");
    }
}