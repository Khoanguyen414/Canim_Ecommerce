package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.order.CheckoutRequest;
import com.example.canim_ecommerce.dto.request.order.OrderFilterRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderStatusRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.OrderDetailResponse;
import com.example.canim_ecommerce.dto.response.OrderResponse;
import com.example.canim_ecommerce.dto.response.PageResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.OrderService;
import com.example.canim_ecommerce.utils.SecurityUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderController {
    OrderService orderService;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<PageResponse<OrderResponse>> getOrders(
            @ModelAttribute OrderFilterRequest filterRequest,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int sizePage) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Get orders successfully",
                orderService.getOrders(
                        filterRequest,
                        null,
                        pageNum,
                        sizePage,
                        "createdAt",
                        "desc"));
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<OrderDetailResponse> getOrderDetail(
            @PathVariable Long orderId) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Get order detail successfully",
                orderService.getOrderById(orderId, null));
    }

    @PostMapping("/checkout")
    public ApiResponse<OrderDetailResponse> checkout(
            @RequestBody @Validated CheckoutRequest request) {
        return ApiResponse.success(
                ApiStatus.CREATED,
                "Checkout successfully",
                orderService.checkout(request));
    }

    @GetMapping("/my")
    public ApiResponse<PageResponse<OrderResponse>> getMyOrders(
            @ModelAttribute OrderFilterRequest filterRequest,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "20") int sizePage) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Get my orders successfully",
                orderService.getOrders(
                        filterRequest,
                        currentUserId,
                        pageNum,
                        sizePage,
                        "createdAt",
                        "desc"));
    }

    @GetMapping("/my/{orderId}")
    public ApiResponse<OrderDetailResponse> getMyOrderDetail(
            @PathVariable Long orderId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Get order detail successfully",
                orderService.getOrderById(orderId, currentUserId));
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<OrderDetailResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody @Validated UpdateOrderStatusRequest request) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Update order status successfully",
                orderService.updateOrderStatus(orderId, request));
    }

    @PatchMapping("/{orderId}/cancel")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<OrderDetailResponse> cancelOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) String reason) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Cancel order successfully",
                orderService.cancelOrder(orderId, reason, null, true));
    }

    @PatchMapping("/my/{orderId}/cancel")
    public ApiResponse<OrderDetailResponse> cancelMyOrder(
            @PathVariable Long orderId,
            @RequestParam(required = false) String reason) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Cancel order successfully",
                orderService.cancelOrder(orderId, reason, currentUserId, false));
    }
}