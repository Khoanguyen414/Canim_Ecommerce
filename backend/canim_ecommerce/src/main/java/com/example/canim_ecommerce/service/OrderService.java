package com.example.canim_ecommerce.service;

import java.time.LocalDate;

import com.example.canim_ecommerce.dto.request.order.CancelOrderRequest;
import com.example.canim_ecommerce.dto.request.order.CheckoutRequest;
import com.example.canim_ecommerce.dto.request.order.OrderFilterRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderShippingRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderStatusRequest;
import com.example.canim_ecommerce.dto.response.OrderStatisticsResponse;
import com.example.canim_ecommerce.dto.response.OrderDetailResponse;
import com.example.canim_ecommerce.dto.response.OrderResponse;
import com.example.canim_ecommerce.dto.response.PageResponse;

public interface OrderService {
    OrderDetailResponse checkout(CheckoutRequest request);

    PageResponse<OrderResponse> getOrders(
            OrderFilterRequest filterRequest,
            Long userIdScope,
            int pageNum,
            int sizePage,
            String sortBy,
            String sortDir);

    OrderDetailResponse getOrderById(Long orderId, Long userIdScope);

    OrderDetailResponse cancelOrder(
            Long orderId,
            CancelOrderRequest request,
            Long currentUserId,
            boolean adminAction);

    OrderDetailResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request);

    OrderResponse updateOrderShipping(Long orderId, UpdateOrderShippingRequest request);

    OrderStatisticsResponse getAdminStatistics(LocalDate fromDate, LocalDate toDate);

    void autoCancelExpiredPendingOrders();
}
