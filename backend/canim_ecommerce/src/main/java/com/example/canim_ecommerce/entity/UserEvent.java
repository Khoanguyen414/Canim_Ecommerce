package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import com.example.canim_ecommerce.enums.EventType;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_events")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "user_id")
    Long userId;

    @Column(name = "product_id")
    Long productId;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    EventType eventType;

    @Column(name = "event_meta", columnDefinition = "JSON")
    String eventMeta; 

    @CreationTimestamp
    @Column(name = "occurred_at", updatable = false)
    LocalDateTime occurredAt;
}