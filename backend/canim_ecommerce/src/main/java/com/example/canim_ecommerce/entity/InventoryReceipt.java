package com.example.canim_ecommerce.entity;

import com.example.canim_ecommerce.entity.Supplier; 
import com.example.canim_ecommerce.enums.ReceiptType; 
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "inventory_receipts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryReceipt {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_code", unique = true, nullable = false)
    private String receiptCode; // PN-20240101-01

    @Enumerated(EnumType.STRING)
    private ReceiptType type; // INBOUND, OUTBOUND

    @ManyToOne
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    // Quan hệ 1-N với chi tiết phiếu
    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL)
    private List<InventoryReceiptDetail> details;

    @Column(columnDefinition = "TEXT")
    private String note;

    @CreationTimestamp
    private LocalDateTime createdAt;
}