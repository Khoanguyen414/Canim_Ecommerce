package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.inventory.InboundRequest;
import com.example.canim_ecommerce.service.impl.WarehouseServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/warehouse")
@RequiredArgsConstructor
public class WarehouseController {

    private final WarehouseServiceImpl warehouseService;

    @PostMapping("/inbound")
    public ResponseEntity<?> inbound(@RequestBody InboundRequest request) {
        return ResponseEntity.ok(warehouseService.createInboundReceipt(request));
    }
}