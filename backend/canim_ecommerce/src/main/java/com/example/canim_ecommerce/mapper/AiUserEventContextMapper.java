package com.example.canim_ecommerce.mapper;

import org.springframework.stereotype.Component;

import com.example.canim_ecommerce.dto.response.ai.AiUserEventContextResponse;
import com.example.canim_ecommerce.entity.UserEvent;
import com.example.canim_ecommerce.enums.EventType;

@Component
public class AiUserEventContextMapper {

    public AiUserEventContextResponse toResponse(UserEvent event) {
        if (event == null) {
            return null;
        }

        EventType eventType = event.getEventType();

        return AiUserEventContextResponse.builder()
                .id(event.getId())
                .userId(event.getUserId())
                .productId(event.getProductId())
                .eventType(eventType)
                .eventTypeMeaning(getEventTypeMeaning(eventType))
                .eventWeight(getEventWeight(eventType))
                .eventMeta(event.getEventMeta())
                .occurredAt(event.getOccurredAt())
                .build();
    }

    private String getEventTypeMeaning(EventType eventType) {
        if (eventType == null) {
            return "Chưa xác định loại hành vi";
        }

        return switch (eventType) {
            case VIEW -> "Khách xem sản phẩm";
            case CLICK -> "Khách bấm vào sản phẩm hoặc khu vực gợi ý";
            case ADD_TO_CART -> "Khách thêm sản phẩm vào giỏ hàng";
            case PURCHASE -> "Khách mua sản phẩm thành công";
            case SEARCH -> "Khách tìm kiếm sản phẩm bằng từ khóa";
        };
    }

    private Integer getEventWeight(EventType eventType) {
        if (eventType == null) {
            return 0;
        }

        return switch (eventType) {
            case VIEW -> 1;
            case CLICK -> 2;
            case SEARCH -> 3;
            case ADD_TO_CART -> 4;
            case PURCHASE -> 10;
        };
    }
}