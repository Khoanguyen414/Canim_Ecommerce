// File: src/main/java/com/example/canim_ecommerce/controller/SupplierController.java

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
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/suppliers")
@Validated
@Tag(name = "Supplier Management", description = "APIs for managing suppliers / API quản lý nhà cung cấp")
public class SupplierController {
    
    @Autowired
    private SupplierService supplierService;

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
        summary = "Create Supplier",
        description = "Create new supplier (Admin only / Chỉ ADMIN)"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "201",
            description = "Supplier created successfully / Nhà cung cấp tạo thành công"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Validation error / Lỗi xác thực"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "401",
            description = "Unauthorized / Không được phép"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Forbidden - Not ADMIN / Cấm - Không phải ADMIN"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "409",
            description = "Conflict - Code exists / Xung đột - Mã tồn tại"
        )
    })
    public ApiResponse<SupplierResponse> createSupplier(
            @RequestBody @Validated SupplierCreationRequest request
    ) {

        SupplierResponse response = supplierService.createSupplier(request);
        
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Supplier created successfully / Nhà cung cấp tạo thành công",
            response
        );
        
    }
    
   
    @GetMapping
    @Operation(
        summary = "Get All Suppliers",
        description = "Retrieve all active suppliers (Public / Lấy tất cả nhà cung cấp hoạt động)"
    )
    public ApiResponse<List<SupplierResponse>> getAllSuppliers() {
       
        List<SupplierResponse> responses = supplierService.getAllSuppliers();
       
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            responses
        );
       
    }
    
    @GetMapping("/{id}")
    @Operation(
        summary = "Get Supplier by ID",
        description = "Retrieve supplier by database ID"
    )
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
    
    
    @GetMapping("/code/{code}")
    @Operation(
        summary = "Get Supplier by Code",
        description = "Retrieve supplier by business code (SUP_001, etc)"
    )
    public ApiResponse<SupplierResponse> getSupplierByCode(
            @Parameter(description = "Supplier Code", example = "SUP_001")
            @PathVariable String code
    ) {
        
        SupplierResponse response = supplierService.getSupplierByCode(code);
       
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            response
        );
    }
    
    
    @GetMapping("/search")
    @Operation(
        summary = "Search Suppliers",
        description = "Search suppliers by name (case-insensitive partial match)"
    )
    public ApiResponse<List<SupplierResponse>> searchSuppliers(
            @Parameter(description = "Search name", example = "Cung Cấp")
            @RequestParam String name
    ) {
        
        List<SupplierResponse> responses = supplierService.searchSuppliers(name);
       
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            responses
        );
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN') or hasRole('ROLE_WAREHOUSE_MANAGERS')")
    @Operation(
        summary = "Update Supplier",
        description = "Update supplier (partial update, ADMIN or WAREHOUSE_MANAGERS)"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200",
            description = "Supplier updated successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400",
            description = "Validation error / Invalid role for field"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "403",
            description = "Forbidden - insufficient permissions"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "404",
            description = "Supplier not found"
        )
    })
    public ApiResponse<SupplierResponse> updateSupplier(
            @Parameter(description = "Supplier ID", example = "1")
            @PathVariable Long id,
            @RequestBody @Validated SupplierUpdateRequest request
    ) {
        
        SupplierResponse response = supplierService.updateSupplier(id, request);
        
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Supplier updated successfully / Nhà cung cấp cập nhật thành công",
            response
        );
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(
        summary = "Change Supplier Status",
        description = "Change supplier active/inactive status (ADMIN only)"
    )
    public ApiResponse<Void> changeSupplierStatus(
            @Parameter(description = "Supplier ID", example = "1")
            @PathVariable Long id,
            @RequestBody SupplierStatusRequest statusRequest
    ) {
        
        supplierService.changeSupplierStatus(id, statusRequest.getStatus());
        
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Supplier status changed successfully / Trạng thái nhà cung cấp thay đổi thành công",
            null
        );
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @Operation(
        summary = "Delete Supplier",
        description = "Soft delete supplier (set is_active=0, ADMIN only)"
    )
    public ApiResponse<Void> deleteSupplier(
            @Parameter(description = "Supplier ID", example = "1")
            @PathVariable Long id
    ) {
       
        supplierService.deleteSupplier(id);
       
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Supplier deleted successfully / Nhà cung cấp bị xóa thành công (mềm)",
            null
        );
    }
}