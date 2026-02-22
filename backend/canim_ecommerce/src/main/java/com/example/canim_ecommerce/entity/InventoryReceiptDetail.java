package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "inventory_receipt_details")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class InventoryReceiptDetail {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "receipt_id")
    private InventoryReceipt receipt;

    @ManyToOne
    @JoinColumn(name = "product_id")
    private Product product;

    @ManyToOne
    @JoinColumn(name = "batch_id")
    private InventoryBatch batch;

    private Integer quantity;
    private BigDecimal price;
}