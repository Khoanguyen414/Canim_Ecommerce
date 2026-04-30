package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_batches")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryBatch {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "warehouse_id", nullable = false)
    Long warehouseId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    ProductVariant variant;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    Supplier supplier;

    @Column(name = "batch_code", nullable = false, unique = true)
    String batchCode;

    @Column(name = "sku_snapshot", length = 50)
    String skuSnapshot;

    @Column(name = "quantity_remaining", nullable = false)
    Integer quantityRemaining;

    @Column(name = "import_price", precision = 15, scale = 2)
    BigDecimal importPrice;

    @Column(name = "expired_at")
    LocalDateTime expiredAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;
}