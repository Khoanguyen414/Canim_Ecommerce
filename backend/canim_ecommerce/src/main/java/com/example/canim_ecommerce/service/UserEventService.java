package com.example.canim_ecommerce.service;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import com.example.canim_ecommerce.entity.UserEvent;
import com.example.canim_ecommerce.enums.EventType;

public interface UserEventService {

    void logEventAsync(Long userId, Long productId, EventType type, String meta);

    List<UserEvent> getRecentEventsByUser(Long userId);

    List<UserEvent> getRecentEventsByProduct(Long productId);

    List<UserEvent> getRecentEventsInSystem();

    List<UserEvent> getEventsByUserAndTypes(
            Long userId,
            Collection<EventType> eventTypes);

    List<UserEvent> getRecentEventsByUserAfter(
            Long userId,
            LocalDateTime occurredAfter);

    List<UserEvent> getEventsByProductAndTypes(
            Long productId,
            Collection<EventType> eventTypes);

    List<UserEvent> getEventsByTypesAfter(
            Collection<EventType> eventTypes,
            LocalDateTime occurredAfter);
}