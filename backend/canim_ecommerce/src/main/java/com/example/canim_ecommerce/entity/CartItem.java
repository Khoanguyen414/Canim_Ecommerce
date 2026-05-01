package com.example.canim_ecommerce.entity;

import com.fasterxml.jackson.annotation.JsonIgnore; // 👇 Chú ý import thư viện này
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @JsonIgnore 
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    ProductVariant variant;

    @Column(nullable = false)
    Integer quantity;

    @Column(name = "is_selected", nullable = false)
    @Builder.Default
    Boolean isSelected = false;

    @CreationTimestamp
    @Column(name = "added_at", updatable = false)
    LocalDateTime addedAt;
}