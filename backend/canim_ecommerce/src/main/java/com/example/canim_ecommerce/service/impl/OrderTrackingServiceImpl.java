package com.example.canim_ecommerce.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.canim_ecommerce.dto.request.order.CreateOrderTrackingEventRequest;
import com.example.canim_ecommerce.dto.request.order.UpdateOrderLocationRequest;
import com.example.canim_ecommerce.dto.response.OrderTrackingEventResponse;
import com.example.canim_ecommerce.dto.response.OrderTrackingResponse;
import com.example.canim_ecommerce.entity.Order;
import com.example.canim_ecommerce.entity.OrderTrackingEvent;
import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.OrderStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.OrderTrackingMapper;
import com.example.canim_ecommerce.repository.OrderRepository;
import com.example.canim_ecommerce.repository.OrderTrackingEventRepository;
import com.example.canim_ecommerce.repository.UserRepository;
import com.example.canim_ecommerce.service.OrderTrackingService;
import com.example.canim_ecommerce.util.MapUrlUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class OrderTrackingServiceImpl implements OrderTrackingService {
    OrderRepository orderRepository;
    OrderTrackingEventRepository trackingEventRepository;
    UserRepository userRepository;
    OrderTrackingMapper orderTrackingMapper;

    @Override
    @Transactional(readOnly = true)
    public OrderTrackingResponse getTracking(Long orderId, Long userIdScope) {
        Order order = loadOrderForScope(orderId, userIdScope);
        return buildTrackingResponse(order);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderTrackingEventResponse updateOrderLocation(
            Long orderId,
            UpdateOrderLocationRequest request,
            Long actorId) {
        Order order = loadOrderForAdmin(orderId);
        assertOrderNotCancelled(order);

        if (request.getReceiverLatitude() == null && request.getReceiverLongitude() == null) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "At least one of latitude or longitude must be provided");
        }

        if (request.getReceiverLatitude() != null) {
            order.setReceiverLatitude(request.getReceiverLatitude());
        }
        if (request.getReceiverLongitude() != null) {
            order.setReceiverLongitude(request.getReceiverLongitude());
        }

        order.setMapUrl(MapUrlUtils.buildGoogleMapsUrl(order.getReceiverLatitude(), order.getReceiverLongitude()));
        orderRepository.save(order);

        OrderTrackingEvent event = OrderTrackingEvent.builder()
                .order(order)
                .shippingStatus(order.getShippingStatus())
                .latitude(order.getReceiverLatitude())
                .longitude(order.getReceiverLongitude())
                .locationLabel(normalizeNullableText(request.getLocationLabel()))
                .createdBy(resolveActor(actorId))
                .build();

        OrderTrackingEvent savedEvent = trackingEventRepository.save(event);
        return orderTrackingMapper.toResponse(savedEvent);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public OrderTrackingEventResponse createTrackingEvent(
            Long orderId,
            CreateOrderTrackingEventRequest request,
            Long actorId) {
        Order order = loadOrderForAdmin(orderId);
        assertOrderNotCancelled(order);

        order.setShippingStatus(request.getShippingStatus());
        orderRepository.save(order);

        OrderTrackingEvent event = OrderTrackingEvent.builder()
                .order(order)
                .shippingStatus(request.getShippingStatus())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .locationLabel(normalizeNullableText(request.getLocationLabel()))
                .note(normalizeNullableText(request.getNote()))
                .createdBy(resolveActor(actorId))
                .build();

        OrderTrackingEvent savedEvent = trackingEventRepository.save(event);
        return orderTrackingMapper.toResponse(savedEvent);
    }

    private OrderTrackingResponse buildTrackingResponse(Order order) {
        List<OrderTrackingEventResponse> events = trackingEventRepository
                .findByOrder_IdOrderByCreatedAtAsc(order.getId())
                .stream()
                .map(orderTrackingMapper::toResponse)
                .toList();

        OrderTrackingResponse response = new OrderTrackingResponse();
        response.setOrderId(order.getId());
        response.setReceiverLatitude(order.getReceiverLatitude());
        response.setReceiverLongitude(order.getReceiverLongitude());
        response.setMapUrl(resolveMapUrl(order));
        response.setShippingAddress(order.getShippingAddress());
        response.setShippingStatus(order.getShippingStatus());
        response.setEvents(events);
        return response;
    }

    private String resolveMapUrl(Order order) {
        if (StringUtils.hasText(order.getMapUrl())) {
            return order.getMapUrl();
        }
        return MapUrlUtils.buildGoogleMapsUrl(order.getReceiverLatitude(), order.getReceiverLongitude());
    }

    private Order loadOrderForScope(Long orderId, Long userIdScope) {
        if (userIdScope == null) {
            return loadOrderForAdmin(orderId);
        }

        return orderRepository.findByIdAndUserId(orderId, userIdScope)
                .orElseThrow(() -> new ApiException(
                        ApiStatus.NOT_FOUND,
                        "Order not found or you do not have permission to view this order"));
    }

    private Order loadOrderForAdmin(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Order not found"));
    }

    private void assertOrderNotCancelled(Order order) {
        if (order.getOrderStatus() == OrderStatus.CANCELLED) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Cannot update tracking for a cancelled order");
        }
    }

    private User resolveActor(Long actorId) {
        if (actorId == null) {
            return null;
        }
        return userRepository.findById(actorId).orElse(null);
    }

    private String normalizeNullableText(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
