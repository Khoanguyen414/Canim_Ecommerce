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

    // 1. Tạo mới (Chỉ Admin)
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<SupplierResponse> createSupplier(@RequestBody @Valid SupplierCreationRequest request) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Tạo nhà cung cấp thành công",
                supplierService.createSupplier(request)
        );
    }

    // 2. Cập nhật (Chỉ Admin)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<SupplierResponse> updateSupplier(
            @PathVariable Integer id,
            @RequestBody @Valid SupplierUpdateRequest request) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Cập nhật thông tin thành công",
                supplierService.updateSupplier(id, request)
        );
    }

    // 3. Lấy danh sách (Admin/Staff đều xem được)
    // Thêm param ?all=true nếu muốn xem cả người đã xóa
    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')") 
    public ApiResponse<List<SupplierResponse>> getAllSuppliers(
            @RequestParam(required = false, defaultValue = "false") boolean all) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Lấy danh sách thành công",
                supplierService.getAllSuppliers(all)
        );
    }

    // 4. Xem chi tiết
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_USER')")
    public ApiResponse<SupplierResponse> getSupplierById(@PathVariable Integer id) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Lấy chi tiết thành công",
                supplierService.getSupplierById(id)
        );
    }

    // 5. Xóa mềm (Chỉ Admin)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Void> deleteSupplier(@PathVariable Integer id) {
        supplierService.deleteSupplier(id);
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Đã ngừng hợp tác với nhà cung cấp (Soft Delete)",
                null
        );
    }
}