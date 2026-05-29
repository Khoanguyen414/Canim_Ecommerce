package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.order.CreateOrderTrackingEventRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderLocationRequest;
import com.example.canim_ecommerce.dto.response.OrderTrackingEventResponse;
import com.example.canim_ecommerce.dto.response.OrderTrackingResponse;

public interface OrderTrackingService {
    OrderTrackingResponse getTracking(Long orderId, Long userIdScope);

    OrderTrackingEventResponse updateOrderLocation(Long orderId, UpdateOrderLocationRequest request, Long actorId);

    OrderTrackingEventResponse createTrackingEvent(
            Long orderId,
            CreateOrderTrackingEventRequest request,
            Long actorId);
}
