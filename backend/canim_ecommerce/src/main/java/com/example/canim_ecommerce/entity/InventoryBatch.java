package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

<<<<<<< HEAD
@Entity
@Table(name = "inventory_batches") 
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryBatch {

=======

@Entity
@Table(name = "inventory_batches")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryBatch {
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

<<<<<<< HEAD
    // Liên kết với bảng Products
=======
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

<<<<<<< HEAD
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
=======
    @Column(name = "product_id", insertable = false, updatable = false)
    private Long productId;

    // Lưu trữ SKU tại thời điểm nhập kho
    @Column(name = "sku_snapshot") 
    private String sku; 
    // Lưu trữ tên sản phẩm tại thời điểm nhập kho
    @Column(name = "batch_code", nullable = false)
    private String batchCode;
    //Quản lý số lượng tồn kho trong lô
    @Column(name = "quantity_remaining", nullable = false)
    private Integer quantityRemaining;
    
    @Column(name = "import_price")
    private BigDecimal importPrice;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
}