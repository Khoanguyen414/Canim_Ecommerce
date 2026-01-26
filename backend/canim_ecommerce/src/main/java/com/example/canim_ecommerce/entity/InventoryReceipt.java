package com.example.canim_ecommerce.entity;

import com.example.canim_ecommerce.enums.*;
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
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "receipt_code", unique = true, nullable = false)
    private String receiptCode;

    @Enumerated(EnumType.STRING)
    private ReceiptType type; // INBOUND

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private ReceiptStatus status = ReceiptStatus.COMPLETED;

    @ManyToOne 
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @Column(columnDefinition = "TEXT")
    private String note;
    
    @OneToMany(mappedBy = "receipt", cascade = CascadeType.ALL)
    private List<InventoryReceiptDetail> details;

    @CreationTimestamp
    private LocalDateTime createdAt;
}