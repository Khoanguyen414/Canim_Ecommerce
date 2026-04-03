package com.example.canim_ecommerce.entity;

<<<<<<< HEAD
import com.example.canim_ecommerce.entity.Supplier; 
import com.example.canim_ecommerce.enums.ReceiptType; 
=======
import com.example.canim_ecommerce.enums.*;
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.List;
<<<<<<< HEAD

=======
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
@Entity
@Table(name = "inventory_receipts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryReceipt {
<<<<<<< HEAD
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
=======
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReceiptReason reason;
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
}