package com.example.canim_ecommerce.entity;

import com.example.canim_ecommerce.enums.StockCheckStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "stock_checks")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StockCheck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "warehouse_id", nullable = false)
    Long warehouseId;

    @Column(nullable = false, unique = true, length = 50)
    String code;

    @Column(name = "staff_id")
    Long staffId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    StockCheckStatus status = StockCheckStatus.DRAFT;

    @Column(columnDefinition = "TEXT")
    String note;

    @Column(name = "created_by")
    Long createdBy;

    @Column(name = "updated_by")
    Long updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @OneToMany(mappedBy = "stockCheck", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<StockCheckDetail> details;
}