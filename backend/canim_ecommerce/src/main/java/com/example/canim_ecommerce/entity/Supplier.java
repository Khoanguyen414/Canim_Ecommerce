package com.example.canim_ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "suppliers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(nullable = false, unique = true, length = 50)
    String code;

    @Column(nullable = false, length = 255)
    String name;

    @Column(name = "contact_person", length = 100)
    String contactPerson;

    @Column(nullable = false, unique = true, length = 100)
    String email;

    @Column(nullable = false, length = 20)
    String phone;

    @Column(columnDefinition = "TEXT")
    String address;

    @Column(name = "is_active")
    @Builder.Default
    Boolean isActive = true;

    // Soft delete: Giữ lại data để không làm hỏng lịch sử nhập/xuất kho cũ
    @Column(name = "is_deleted")
    @Builder.Default
    Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "created_by")
    Long createdBy; 

    @Column(name = "updated_by")
    Long updatedBy; 
}