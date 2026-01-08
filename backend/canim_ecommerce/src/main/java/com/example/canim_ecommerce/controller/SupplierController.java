package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.suppliers.SupplierCreationRequest;
import com.example.canim_ecommerce.dto.request.suppliers.SupplierUpdateRequest;
import com.example.canim_ecommerce.dto.request.suppliers.SupplierStatusRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.SupplierResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.SupplierService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/suppliers")
@Validated
@Tag(name = "Supplier Management", description = "Admin APIs for managing suppliers")
public class SupplierController {
    
    @Autowired
    private SupplierService supplierService;
    
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Create Supplier", description = "Create new supplier (Admin only)")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Supplier created successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Validation error"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Forbidden (not admin)"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Conflict (code exists)")
    })
    public ApiResponse<SupplierResponse> createSupplier(
            @RequestBody @Validated SupplierCreationRequest request
    ) {
        SupplierResponse response = supplierService.createSupplier(request);
        
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Supplier created successfully",
            response
        );
    }
    
    @PutMapping("/{id}")
@PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_WAREHOUSE_MANAGERS')") 
@Operation(summary = "Update Supplier", description = "Update supplier (partial update allowed, Admin or Warehouse MANAGERS)")
public ApiResponse<SupplierResponse> updateSupplier(
        @Parameter(description = "Supplier ID", example = "1")
        @PathVariable Long id,
        @RequestBody @Validated SupplierUpdateRequest request
) {
    SupplierResponse response = supplierService.updateSupplier(id, request);
    
    return ApiResponse.success(
        ApiStatus.SUCCESS,
        "Supplier updated successfully",
        response
    );
}
    
    @GetMapping("/{id}")
    @Operation(summary = "Get Supplier", description = "Retrieve supplier by ID (public)")
    public ApiResponse<SupplierResponse> getSupplierById(
            @Parameter(description = "Supplier ID", example = "1")
            @PathVariable Long id
    ) {
        SupplierResponse response = supplierService.getSupplierById(id);
        
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            response
        );
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Change Supplier Status", description = "Change supplier status (Admin only)")
    public ApiResponse<Void> changeSupplierStatus(
            @Parameter(description = "Supplier ID", example = "1")
            @PathVariable Long id,
            @RequestBody SupplierStatusRequest statusRequest
    ) {
        supplierService.changeSupplierStatus(id, statusRequest.getStatus());
        
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Supplier status changed successfully",
            null
        );
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(summary = "Delete Supplier", description = "Soft delete supplier (Admin only)")
    public ApiResponse<Void> deleteSupplier(
            @Parameter(description = "Supplier ID", example = "1")
            @PathVariable Long id
    ) {
        supplierService.deleteSupplier(id);
        
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Supplier deleted successfully",
            null
        );
    }
}