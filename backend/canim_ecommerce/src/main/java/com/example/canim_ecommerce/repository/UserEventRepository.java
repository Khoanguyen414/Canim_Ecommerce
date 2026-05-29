package com.example.canim_ecommerce.repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.entity.UserEvent;
import com.example.canim_ecommerce.enums.EventType;

@Repository
public interface UserEventRepository extends JpaRepository<UserEvent, Long> {

    List<UserEvent> findTop100ByUserIdOrderByOccurredAtDesc(Long userId);

    List<UserEvent> findTop200ByOrderByOccurredAtDesc();

    List<UserEvent> findTop100ByProductIdOrderByOccurredAtDesc(Long productId);

    List<UserEvent> findByUserIdAndEventTypeInOrderByOccurredAtDesc(
            Long userId,
            Collection<EventType> eventTypes);

    List<UserEvent> findByUserIdAndOccurredAtAfterOrderByOccurredAtDesc(
            Long userId,
            LocalDateTime occurredAfter);

    List<UserEvent> findByProductIdAndEventTypeInOrderByOccurredAtDesc(
            Long productId,
            Collection<EventType> eventTypes);

    List<UserEvent> findByEventTypeInAndOccurredAtAfterOrderByOccurredAtDesc(
            Collection<EventType> eventTypes,
            LocalDateTime occurredAfter);
}