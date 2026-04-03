package com.example.canim_ecommerce.controller;

<<<<<<< HEAD
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
=======
import com.example.canim_ecommerce.dto.request.suppliers.SupplierRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.entity.Supplier;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.SupplierService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SupplierController {

    SupplierService supplierService;

    
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Supplier> create(@Valid @RequestBody SupplierRequest request) {
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Tạo nhà cung cấp thành công",
            supplierService.createSupplier(request)
        );
    }

    
    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<List<Supplier>> getAll() {
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Lấy danh sách thành công",
            supplierService.getAllSuppliers()
        );
    }

    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<Supplier> getById(@PathVariable Long id) {
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Lấy chi tiết thành công",
            supplierService.getSupplierById(id)
        );
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
    }


    @PutMapping("/{id}")
<<<<<<< HEAD
    public ResponseEntity<Supplier> update(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        return ResponseEntity.ok(supplierService.updateSupplier(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ResponseEntity.ok("Đã khóa nhà cung cấp thành công.");
    }
=======
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Supplier> update(@PathVariable Long id, @Valid @RequestBody SupplierRequest request) {
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Cập nhật thành công",
            supplierService.updateSupplier(id, request)
        );
    }

    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Đã khóa nhà cung cấp",
            null
        );
    }
    

// API: Khôi phục lại nhà cung cấp đã xóa
@PutMapping("/{id}/restore")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public ApiResponse<Void> restore(@PathVariable Long id) {
    supplierService.activateSupplier(id);
    return ApiResponse.success(
        ApiStatus.SUCCESS,
        "Đã khôi phục nhà cung cấp thành công",
        null
    );
}
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
}