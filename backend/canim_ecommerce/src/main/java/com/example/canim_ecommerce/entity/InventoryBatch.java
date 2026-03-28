package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_batches")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryBatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "product_id", insertable = false, updatable = false)
    private Long productId;

    
    @Column(name = "sku_snapshot") 
    private String sku; 
   
    @Column(name = "batch_code", nullable = false)
    private String batchCode;
    
    @Column(name = "quantity_remaining", nullable = false)
    private Integer quantityRemaining;
    
    @Column(name = "import_price")
    private BigDecimal importPrice;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}