package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"variant_id", "warehouse_id"})
})
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Inventory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "warehouse_id", nullable = false)
    @Builder.Default
    Long warehouseId = 1L; 

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
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