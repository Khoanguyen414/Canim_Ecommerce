package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.inventory.StockCheckRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.entity.StockCheck;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.StockCheckService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stock-checks")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StockCheckController {

    StockCheckService stockCheckService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<StockCheck> createDraftCheck(@RequestBody @Valid StockCheckRequest request) {
        return ApiResponse.success(ApiStatus.SUCCESS, stockCheckService.createDraftCheck(request));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN', 'ROLE_WAREHOUSE')")
    public ApiResponse<Void> completeStockCheck(@PathVariable Long id) {
        stockCheckService.completeStockCheck(id);
        return ApiResponse.success(ApiStatus.SUCCESS, null);
    }
}