package com.example.canim_ecommerce.service;

import java.time.LocalDate;

import com.example.canim_ecommerce.dto.request.order.CancelOrderRequest;
import com.example.canim_ecommerce.dto.request.order.CheckoutRequest;
import com.example.canim_ecommerce.dto.request.order.OrderFilterRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderShippingRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderStatusRequest;
import com.example.canim_ecommerce.dto.response.OrderDynamicQrResponse;
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

    /** Khách bấm "Đã chuyển khoản" sau khi quét QR cá nhân. */
    OrderDetailResponse declarePersonalQrTransfer(Long orderId, Long userId);

    /** Admin xác nhận đã nhận tiền QR cá nhân. */
    OrderDetailResponse confirmPersonalQrPayment(Long orderId);

    /** Admin từ chối khai báo chuyển khoản (chưa thấy tiền). */
    OrderDetailResponse rejectPersonalQrPayment(Long orderId);

    /** QR VietQR động: đúng số tiền đơn + nội dung = mã đơn. */
    OrderDynamicQrResponse getOrderDynamicQr(Long orderId, Long userId);
}
