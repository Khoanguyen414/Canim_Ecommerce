package com.example.canim_ecommerce.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.canim_ecommerce.dto.request.user_event.TrackUserEventRequest;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.EventType;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.service.UserEventService;
import com.example.canim_ecommerce.utils.SecurityUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/user-events")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserEventController {

    UserEventService userEventService;
    ObjectMapper objectMapper;

    @PostMapping("/track")
    public ResponseEntity<String> trackEvent(
            @Valid @RequestBody TrackUserEventRequest request) {

        validateTrackingRequest(request);

        Long userId = SecurityUtils.getCurrentUserId();

        userEventService.logEventAsync(
                userId,
                request.getProductId(),
                request.getEventType(),
                buildEventMeta(request));

        return ResponseEntity.ok("Tracked event successfully");
    }

    private void validateTrackingRequest(TrackUserEventRequest request) {
        if (request.getEventType() == null) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "eventType is required");
        }

        boolean productEvent = request.getEventType() == EventType.VIEW
                || request.getEventType() == EventType.CLICK
                || request.getEventType() == EventType.ADD_TO_CART
                || request.getEventType() == EventType.PURCHASE;

        if (productEvent && request.getProductId() == null) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "productId is required for product event");
        }

        boolean searchEvent = request.getEventType() == EventType.SEARCH;

        if (searchEvent && !hasText(request.getKeyword())) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "keyword is required for SEARCH event");
        }
    }

    private String buildEventMeta(TrackUserEventRequest request) {
        Map<String, Object> meta = new LinkedHashMap<>();

        meta.put("eventType", request.getEventType());
        meta.put("eventTypeMeaning", getEventTypeMeaning(request.getEventType()));

        meta.put("productId", request.getProductId());
        meta.put("productIdMeaning", "ID sản phẩm cha mà khách đang tương tác");

        meta.put("variantId", request.getVariantId());
        meta.put("variantIdMeaning", "ID biến thể sản phẩm cụ thể, ví dụ áo màu xanh size L");

        meta.put("keyword", request.getKeyword());
        meta.put("keywordMeaning", "Từ khóa khách đã tìm kiếm trên website");

        meta.put("source", request.getSource());
        meta.put("sourceMeaning", "Vị trí phát sinh hành vi trên giao diện");

        meta.put("page", request.getPage());
        meta.put("pageMeaning", "Trang mà khách đang thao tác");

        meta.put("referrer", request.getReferrer());
        meta.put("referrerMeaning", "Đường dẫn hoặc trang trước đó dẫn khách tới hành vi này");

        meta.put("device", request.getDevice());
        meta.put("deviceMeaning", "Thiết bị khách đang sử dụng, ví dụ DESKTOP hoặc MOBILE");

        try {
            return objectMapper.writeValueAsString(meta);
        } catch (JsonProcessingException e) {
            log.warn("⚠️ Không thể build USER_EVENT eventMeta JSON: {}", e.getMessage());

            return "{\"source\":\"USER_EVENT_TRACKING\"}";
        }
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

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}