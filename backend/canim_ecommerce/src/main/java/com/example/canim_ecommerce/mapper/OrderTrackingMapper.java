package com.example.canim_ecommerce.mapper;

import org.springframework.stereotype.Component;

import com.example.canim_ecommerce.dto.response.OrderTrackingEventResponse;
import com.example.canim_ecommerce.entity.OrderTrackingEvent;
import com.example.canim_ecommerce.util.MapUrlUtils;

@Component
public class OrderTrackingMapper {
    public OrderTrackingEventResponse toResponse(OrderTrackingEvent event) {
        OrderTrackingEventResponse response = new OrderTrackingEventResponse();
        response.setId(event.getId());
        response.setOrderId(event.getOrder().getId());
        response.setShippingStatus(event.getShippingStatus());
        response.setLatitude(event.getLatitude());
        response.setLongitude(event.getLongitude());
        response.setLocationLabel(event.getLocationLabel());
        response.setNote(event.getNote());
        response.setCreatedAt(event.getCreatedAt());
        response.setGoogleMapsUrl(MapUrlUtils.buildGoogleMapsUrl(event.getLatitude(), event.getLongitude()));

        if (event.getCreatedBy() != null) {
            response.setCreatedById(event.getCreatedBy().getId());
            response.setCreatedByName(event.getCreatedBy().getFullName());
        }

        return response;
    }
}
