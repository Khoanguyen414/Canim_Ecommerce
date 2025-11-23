package com.example.canim_ecommerce.Entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Data
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sku;
    private String name;
    private String slug;
    private String shortDescription;
    private String longDescription;
    private BigDecimal price;
    private String brand;

    @Enumerated(EnumType.STRING)
    private Status status = Status.ACTIVE;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    public enum Status {
        ACTIVE, INACTIVE
    }
}