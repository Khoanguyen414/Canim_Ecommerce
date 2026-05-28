package com.example.canim_ecommerce.dto.response.ai;

import java.time.LocalDateTime;

import com.example.canim_ecommerce.enums.EventType;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AiUserEventContextResponse {

    Long id;
    Long userId;
    Long productId;
    EventType eventType;
    String eventTypeMeaning;
    Integer eventWeight;
    String eventMeta;
    LocalDateTime occurredAt;
}