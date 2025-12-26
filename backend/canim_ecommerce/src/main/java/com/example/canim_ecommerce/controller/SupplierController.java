package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.suppliers.SupplierCreationRequest;
import com.example.canim_ecommerce.dto.request.suppliers.SupplierUpdateRequest;
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

    // 1. Create (ADMIN Only)
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<SupplierResponse> createSupplier(@RequestBody @Valid SupplierCreationRequest request) {
        
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Create supplier successfully", 
                supplierService.createSupplier(request)
        );
    }

    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<SupplierResponse> updateSupplier(
            @PathVariable Integer id,
            @RequestBody @Valid SupplierUpdateRequest request) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Update supplier successfully", // English Message
                supplierService.updateSupplier(id, request)
        );
    }

    
    @GetMapping
    public ApiResponse<List<SupplierResponse>> getAllSuppliers(
            @RequestParam(required = false, defaultValue = "false") boolean all) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Get all suppliers successfully", // English Message
                supplierService.getAllSuppliers(all)
        );
    }

   
    @GetMapping("/{id}")
    public ApiResponse<SupplierResponse> getSupplierById(@PathVariable Integer id) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Get supplier detail successfully", /
                supplierService.getSupplierById(id)
        );
    }

    // 5. Soft Delete (ADMIN Only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Void> deleteSupplier(@PathVariable Integer id) {
        supplierService.deleteSupplier(id);
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Delete supplier successfully", 
                null
        );
    }
}