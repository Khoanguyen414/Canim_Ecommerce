package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_batches") 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryBatch {
//edit here
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Liên kết với bảng Products
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "batch_code", nullable = false, unique = true)
    private String batchCode; // Mã lô (VD: BATCH-1705648293)

    @Column(name = "quantity_remaining", nullable = false)
    private Integer quantityRemaining; // Số lượng còn lại của lô này (Tồn kho theo lô)

    @Column(name = "import_price")
    private BigDecimal importPrice; // Giá nhập tại thời điểm đó

    @Column(name = "expired_at")
    private LocalDateTime expiredAt; // Hạn sử dụng (nếu có, có thể để null)

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt; // Ngày nhập kho (Quan trọng để xác định cũ/mới)
}