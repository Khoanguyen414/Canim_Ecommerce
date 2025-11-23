package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.OrderRequest;
import com.example.canim_ecommerce.dto.response.OrderResponse;
import com.example.canim_ecommerce.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class OrderController {

    @Autowired
    private OrderService service;

    // Lấy danh sách đơn hàng có phân trang
    @GetMapping
    public Page<OrderResponse> getAll(Pageable pageable) {
        return service.getAll(pageable);
    }

    // Lọc đơn hàng theo trạng thái
    @GetMapping("/status/{status}")
    public Page<OrderResponse> getByStatus(
            @PathVariable String status,
            Pageable pageable) {
        return service.getByStatus(status, pageable);
    }

    // Tạo đơn hàng mới (admin tạo hộ khách)
    @PostMapping
    public OrderResponse create(@Valid @RequestBody OrderRequest request) {
        return service.create(request);
    }

    // Cập nhật trạng thái đơn hàng
    @PutMapping("/{id}/status")
    public OrderResponse updateStatus(
            @PathVariable Long id,
            @RequestBody String newStatus) {  // ví dụ: "SHIPPED", "CANCELLED"
        return service.updateStatus(id, newStatus);
    }
}