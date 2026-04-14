package com.example.canim_ecommerce.entity;

import com.example.canim_ecommerce.enums.ReceiptStatus;
import com.example.canim_ecommerce.enums.ReceiptType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "inventory_receipts")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InventoryReceipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "warehouse_id", nullable = false)
    Long warehouseId;

    @Column(name = "receipt_code", nullable = false, unique = true, length = 50)
    String receiptCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    ReceiptType type;

    
    @Column(name = "reason_code", nullable = false, length = 50)
    String reasonCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    Supplier supplier;

    @Column(name = "order_id")
    Long orderId;

    @Column(name = "warehouse_staff_id")
    Long warehouseStaffId;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    ReceiptStatus status = ReceiptStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    String note;

    @Column(name = "is_deleted")
    @Builder.Default
    Boolean isDeleted = false;

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

    // Quan hệ 1 phiếu có nhiều chi tiết
    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    List<InventoryReceiptDetail> details;
}