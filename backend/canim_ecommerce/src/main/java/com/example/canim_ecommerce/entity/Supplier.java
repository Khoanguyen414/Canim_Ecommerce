package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Table(
    name = "suppliers",
    indexes = {
        @Index(name = "idx_supplier_code", columnList = "supplier_code"),
        @Index(name = "idx_supplier_name", columnList = "name"),
        @Index(name = "idx_supplier_status", columnList = "is_active")
    }
)
public class Supplier {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    //Mã nhà cung cấp
    @Column(nullable = false, unique = true, length = 50)
    String supplierCode;
    //Tên đầy đủ của công ty
    @Column(nullable = false, length = 255)
    String name;
    //Tên người liên hệ
    @Column(length = 200)
    String contactName;
    
    @Column(nullable = false, length = 255)
    String email;

    @Column(length = 20)
    String phone;

    //Địa chỉ nhà cung cấp
    @Column(columnDefinition = "TEXT")
    String address;

    //mã số thuế
    @Column(length = 50)
    String taxId;

    //Điều khoản thanh toán với nhà cung cấp này
    @Column(length = 100)
    String paymentTerms;

    //đánh giá nhà cung cấp
    @Column(precision = 2, scale = 1)
    @Builder.Default
    BigDecimal rating = BigDecimal.valueOf(5.0);

    
    @Column(name = "total_orders")
    @Builder.Default
    Integer totalOrders = 0;

    //Trạng Thái
    @Column(nullable = false, name = "is_active")
    @Builder.Default
    Boolean isActive = true;

    //Ghi Chú Audit
     @Column(name = "created_by")
    Long createdBy;

    @CreationTimestamp
    @Column(name = "created_at")
    LocalDateTime createdAt;

    @Column(name = "updated_by")
    Long updatedBy;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}