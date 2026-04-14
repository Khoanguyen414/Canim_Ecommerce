package com.example.canim_ecommerce.entity;

import com.example.canim_ecommerce.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "inventory_reasons")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryReason {
    @Id
    @Column(length = 50, nullable = false)
    String code;

    @Column(nullable = false)
    String name; 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    TransactionType type; 

    @Column(name = "is_system")
    @Builder.Default
    Boolean isSystem = true;

    @Column(length = 255)
    String description;
}