package com.example.canim_ecommerce.controller;

import java.time.LocalDate;

import com.example.canim_ecommerce.dto.request.order.CancelOrderRequest;
import com.example.canim_ecommerce.dto.request.order.CheckoutRequest;
import com.example.canim_ecommerce.dto.request.order.OrderFilterRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderShippingRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderStatusRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.OrderDetailResponse;
import com.example.canim_ecommerce.dto.response.OrderResponse;
import com.example.canim_ecommerce.dto.response.OrderStatisticsResponse;
import com.example.canim_ecommerce.dto.response.PageResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.OrderService;
import com.example.canim_ecommerce.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.format.annotation.DateTimeFormat;
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

    @GetMapping("/admin/statistics")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<OrderStatisticsResponse> getAdminStatistics(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Get order statistics successfully",
                orderService.getAdminStatistics(fromDate, toDate));
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
            @RequestBody(required = false) @Valid CancelOrderRequest request) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Cancel order successfully",
                orderService.cancelOrder(orderId, request, null, true));
    }

    @PatchMapping("/my/{orderId}/cancel")
    public ApiResponse<OrderDetailResponse> cancelMyOrder(
            @PathVariable Long orderId,
            @RequestBody(required = false) @Valid CancelOrderRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Cancel order successfully",
                orderService.cancelOrder(orderId, request, currentUserId, false));
    }

    @PatchMapping("/{orderId}/shipping")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<OrderResponse> updateOrderShipping(
            @PathVariable Long orderId,
            @RequestBody @Valid UpdateOrderShippingRequest request) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Update order shipping successfully",
                orderService.updateOrderShipping(orderId, request));
    }
}
