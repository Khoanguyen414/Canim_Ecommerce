package com.example.canim_ecommerce.dto.request.user_event;

import com.example.canim_ecommerce.enums.EventType;

import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TrackUserEventRequest {

    EventType eventType;
    Long productId;
    Long variantId;

    @Size(max = 255)
    String keyword;

    @Size(max = 100)
    String source;

    @Size(max = 100)
    String page;

    @Size(max = 255)
    String referrer;
    
    @Size(max = 100)
    String device;
    
}