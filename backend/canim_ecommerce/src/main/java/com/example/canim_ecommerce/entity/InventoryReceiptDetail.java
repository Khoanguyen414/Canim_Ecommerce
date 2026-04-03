package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "inventory_receipt_details")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryReceiptDetail {
<<<<<<< HEAD
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
=======
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
    private Long id;

    @ManyToOne
    @JoinColumn(name = "receipt_id")
    private InventoryReceipt receipt;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "batch_id")
<<<<<<< HEAD
    private InventoryBatch batch; 
=======
    private InventoryBatch batch;
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059

    private Integer quantity;
    private BigDecimal price;
}