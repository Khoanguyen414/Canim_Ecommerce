package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.dto.request.inventory.OutboundRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.InboundResponse;
import com.example.canim_ecommerce.dto.response.InventoryReportResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.WarehouseService;
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
@RequestMapping("/warehouse")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WarehouseController {

    WarehouseService warehouseService;

    // 1. Nhập kho
    @PostMapping("/inbound")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<InboundResponse> createInbound(@RequestBody InboundRequest request) {
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Nhập kho thành công",
            warehouseService.createInboundReceipt(request)
        );
    }

    // 2. Xuất kho
    @PostMapping("/outbound")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<Void> createOutbound(@RequestBody OutboundRequest request) {
        warehouseService.createOutboundReceipt(request);
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Xuất kho thành công",
            null
        );
    }

    // 3. Xem tồn kho (API JSON)
    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<List<InventoryReportResponse>> getInventory() {
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Lấy dữ liệu tồn kho thành công",
            warehouseService.getInventoryReport()
        );
    }

    // 4. Xuất Báo Cáo Kiểm Kê (Excel 4 Sheet)
    @GetMapping("/inventory/export")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ResponseEntity<InputStreamResource> exportInventory() throws IOException {
        
        ByteArrayInputStream in = warehouseService.exportStocktakeReport();
        
        String filename = "KIEM_KE_KHO_" + System.currentTimeMillis() + ".xlsx";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}