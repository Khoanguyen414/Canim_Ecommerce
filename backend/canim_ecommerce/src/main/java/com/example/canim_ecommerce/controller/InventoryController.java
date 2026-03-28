package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.request.inventory.OutboundRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.InboundResponse;
import com.example.canim_ecommerce.dto.response.InventoryReportResponse;
import com.example.canim_ecommerce.dto.response.InventorySummaryResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.InventoryService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/inventory") 
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true) 
public class InventoryController {

    InventoryService inventoryService; 

    // 1. Nhập kho
    @PostMapping("/inbound")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<InboundResponse> createInbound(@Valid @RequestBody InboundRequest request) { 
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Inbound success", 
            inventoryService.createInboundReceipt(request)
        );
    }

    // 2. Xuất kho
    @PostMapping("/outbound")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<Void> createOutbound(@Valid @RequestBody OutboundRequest request) { // Thêm @Valid
        inventoryService.createOutboundReceipt(request);
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Outbound success", // Tiếng Anh
            null
        );
    }

    // 3. Xem tồn kho (API JSON)
    @GetMapping("/inventory-report")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<List<InventoryReportResponse>> getInventory() {
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Fetch inventory success", // Tiếng Anh
            inventoryService.getInventoryReport()
        );
    }

    // 4. Xuất Báo Cáo Kiểm Kê (Excel 4 Sheet)
    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ResponseEntity<InputStreamResource> exportInventory() throws IOException {
        
        ByteArrayInputStream in = inventoryService.exportStocktakeReport();
        
        String filename = "INVENTORY_REPORT_" + System.currentTimeMillis() + ".xlsx"; 

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<InventorySummaryResponse> getSummary() {
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Inventory summary fetched successfully",
            inventoryService.getInventorySummary()
        );
    }
}