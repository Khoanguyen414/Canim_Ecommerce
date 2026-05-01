package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.enums.EventType;

public interface UserEventService {
    void logEventAsync(Long userId, Long productId, EventType type, String meta);
}