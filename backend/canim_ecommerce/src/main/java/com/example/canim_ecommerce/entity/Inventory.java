package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false, unique = true)
    ProductVariant variant;

    @Column(nullable = false)
    @Builder.Default
    Integer quantity = 0; 

    @Column(nullable = false)
    @Builder.Default
    Integer reserved = 0; 

    @Column(name = "min_stock")
    @Builder.Default
    Integer minStock = 0; 

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}