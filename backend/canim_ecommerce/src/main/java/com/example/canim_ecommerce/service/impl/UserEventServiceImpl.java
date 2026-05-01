package com.example.canim_ecommerce.service.impl;

import com.example.canim_ecommerce.entity.UserEvent;
import com.example.canim_ecommerce.enums.EventType;
import com.example.canim_ecommerce.repository.UserEventRepository;
import com.example.canim_ecommerce.service.UserEventService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserEventServiceImpl implements UserEventService {

    UserEventRepository userEventRepository;

    @Override
    @Async 
    public void logEventAsync(Long userId, Long productId, EventType type, String meta) {
        try {
            UserEvent event = UserEvent.builder()
                    .userId(userId)
                    .productId(productId)
                    .eventType(type)
                    .eventMeta(meta)
                    .build();
            userEventRepository.save(event);
            log.info("🔥 [AI Tracking] Lưu thành công hành vi: {} - User: {} - Product: {}", type, userId, productId);
        } catch (Exception e) {
            log.error("❌ [AI Tracking] Lỗi ghi nhận hành vi: {}", e.getMessage());
        }
    }
}