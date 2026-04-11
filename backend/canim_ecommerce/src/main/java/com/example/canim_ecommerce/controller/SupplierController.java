package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.supplier.SupplierRequest; 
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.SupplierResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.SupplierService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/suppliers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SupplierController {

    SupplierService supplierService;
    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<List<SupplierResponse>> getAllSuppliers() { 
        return ApiResponse.success(ApiStatus.SUCCESS, supplierService.getAllSuppliers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<SupplierResponse> getSupplierById(@PathVariable Long id) { 
        return ApiResponse.success(ApiStatus.SUCCESS, supplierService.getSupplierById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<SupplierResponse> createSupplier(@RequestBody @Valid SupplierRequest request) { 
        return ApiResponse.success(ApiStatus.SUCCESS, supplierService.createSupplier(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<SupplierResponse> updateSupplier(@PathVariable Long id, @RequestBody @Valid SupplierRequest request) { 
        return ApiResponse.success(ApiStatus.SUCCESS, supplierService.updateSupplier(id, request));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Void> deleteSupplier(@PathVariable Long id) {
        supplierService.deleteSupplier(id);
        return ApiResponse.success(ApiStatus.SUCCESS, null);
    }
}