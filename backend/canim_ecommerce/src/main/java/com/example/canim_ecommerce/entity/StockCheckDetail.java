package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Formula;

@Entity
@Table(name = "stock_check_details")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StockCheckDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "check_id", nullable = false)
    StockCheck stockCheck;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    ProductVariant variant;

    @Column(name = "system_quantity", nullable = false)
    Integer systemQuantity; 

    @Column(name = "actual_quantity", nullable = false)
    Integer actualQuantity;

    @Formula("actual_quantity - system_quantity")
    Integer difference; 

    @Column(columnDefinition = "TEXT")
    String reason; 
}