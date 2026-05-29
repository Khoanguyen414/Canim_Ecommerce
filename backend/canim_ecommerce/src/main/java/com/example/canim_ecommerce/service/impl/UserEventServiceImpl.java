package com.example.canim_ecommerce.service.impl;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

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
    public void logEventAsync(
            Long userId,
            Long productId,
            EventType type,
            String meta) {
        try {
            UserEvent event = UserEvent.builder()
                    .userId(userId)
                    .productId(productId)
                    .eventType(type)
                    .eventMeta(meta)
                    .build();

            userEventRepository.save(event);

            log.info(
                    "🔥 [AI Tracking] Lưu thành công hành vi: {} - User: {} - Product: {}",
                    type,
                    userId,
                    productId);
        } catch (Exception e) {
            log.error("❌ [AI Tracking] Lỗi ghi nhận hành vi: {}", e.getMessage());
        }
    }

    @Override
    public List<UserEvent> getRecentEventsByUser(Long userId) {
        if (userId == null) {
            return List.of();
        }

        return userEventRepository.findTop100ByUserIdOrderByOccurredAtDesc(userId);
    }

    @Override
    public List<UserEvent> getRecentEventsByProduct(Long productId) {
        if (productId == null) {
            return List.of();
        }

        return userEventRepository.findTop100ByProductIdOrderByOccurredAtDesc(productId);
    }

    @Override
    public List<UserEvent> getRecentEventsInSystem() {
        return userEventRepository.findTop200ByOrderByOccurredAtDesc();
    }

    @Override
    public List<UserEvent> getEventsByUserAndTypes(
            Long userId,
            Collection<EventType> eventTypes) {
        if (userId == null || eventTypes == null || eventTypes.isEmpty()) {
            return List.of();
        }

        return userEventRepository.findByUserIdAndEventTypeInOrderByOccurredAtDesc(
                userId,
                eventTypes);
    }

    @Override
    public List<UserEvent> getRecentEventsByUserAfter(
            Long userId,
            LocalDateTime occurredAfter) {
        if (userId == null || occurredAfter == null) {
            return List.of();
        }

        return userEventRepository.findByUserIdAndOccurredAtAfterOrderByOccurredAtDesc(
                userId,
                occurredAfter);
    }

    @Override
    public List<UserEvent> getEventsByProductAndTypes(
            Long productId,
            Collection<EventType> eventTypes) {
        if (productId == null || eventTypes == null || eventTypes.isEmpty()) {
            return List.of();
        }

        return userEventRepository.findByProductIdAndEventTypeInOrderByOccurredAtDesc(
                productId,
                eventTypes);
    }

    @Override
    public List<UserEvent> getEventsByTypesAfter(
            Collection<EventType> eventTypes,
            LocalDateTime occurredAfter) {
        if (eventTypes == null || eventTypes.isEmpty() || occurredAfter == null) {
            return List.of();
        }

        return userEventRepository.findByEventTypeInAndOccurredAtAfterOrderByOccurredAtDesc(
                eventTypes,
                occurredAfter);
    }
}