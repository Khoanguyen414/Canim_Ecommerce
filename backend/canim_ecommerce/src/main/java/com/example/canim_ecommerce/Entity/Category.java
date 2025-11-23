package com.example.canim_ecommerce.Entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "categories")
@Data
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String slug;
    private String description;

    @ManyToOne
    @JoinColumn(name = "parent_id")
    private Category parent;
}