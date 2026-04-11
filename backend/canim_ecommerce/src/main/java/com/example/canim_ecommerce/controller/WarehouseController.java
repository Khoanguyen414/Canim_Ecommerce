package com.example.canim_ecommerce.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.canim_ecommerce.dto.request.warehouse.WarehouseRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.entity.Warehouse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.WarehouseService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/warehouses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WarehouseController {

    WarehouseService warehouseService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<List<Warehouse>> getAllWarehouses() {
        return ApiResponse.success(ApiStatus.SUCCESS, warehouseService.getAllWarehouses());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<Warehouse> getWarehouseById(@PathVariable Long id) {
        return ApiResponse.success(ApiStatus.SUCCESS, warehouseService.getWarehouseById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Warehouse> createWarehouse(@RequestBody @Valid WarehouseRequest request) {
        return ApiResponse.success(ApiStatus.SUCCESS, warehouseService.createWarehouse(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Warehouse> updateWarehouse(@PathVariable Long id, @RequestBody @Valid WarehouseRequest request) {
        return ApiResponse.success(ApiStatus.SUCCESS, warehouseService.updateWarehouse(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Void> deleteWarehouse(@PathVariable Long id) {
        warehouseService.deleteWarehouse(id);
        return ApiResponse.success(ApiStatus.SUCCESS, null);
    }
}