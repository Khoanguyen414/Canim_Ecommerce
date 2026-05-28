package com.example.canim_ecommerce.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.canim_ecommerce.dto.response.ai.AiUserEventContextResponse;
import com.example.canim_ecommerce.entity.UserEvent;
import com.example.canim_ecommerce.enums.EventType;
import com.example.canim_ecommerce.mapper.AiUserEventContextMapper;
import com.example.canim_ecommerce.service.AiUserEventContextService;
import com.example.canim_ecommerce.service.UserEventService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AiUserEventContextServiceImpl implements AiUserEventContextService {

    UserEventService userEventService;
    AiUserEventContextMapper aiUserEventContextMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AiUserEventContextResponse> getRecentEventsByUser(Long userId) {
        return userEventService.getRecentEventsByUser(userId)
                .stream()
                .map(aiUserEventContextMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiUserEventContextResponse> getRecentEventsInSystem() {
        return userEventService.getRecentEventsInSystem()
                .stream()
                .map(aiUserEventContextMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiUserEventContextResponse> getStrongEventsByUser(Long userId) {
        List<EventType> strongEventTypes = List.of(
                EventType.ADD_TO_CART,
                EventType.PURCHASE
        );

        return userEventService.getEventsByUserAndTypes(userId, strongEventTypes)
                .stream()
                .map(aiUserEventContextMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiUserEventContextResponse> getRecentEventsByProduct(Long productId) {
        return userEventService.getRecentEventsByProduct(productId)
                .stream()
                .map(aiUserEventContextMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiUserEventContextResponse> getTrendingEvents(int days) {
        int safeDays = days <= 0 ? 30 : days;

        LocalDateTime occurredAfter = LocalDateTime.now().minusDays(safeDays);

        List<EventType> trendingEventTypes = List.of(
                EventType.ADD_TO_CART,
                EventType.PURCHASE
        );

        List<UserEvent> events = userEventService.getEventsByTypesAfter(
                trendingEventTypes,
                occurredAfter
        );

        return events.stream()
                .map(aiUserEventContextMapper::toResponse)
                .toList();
    }
}