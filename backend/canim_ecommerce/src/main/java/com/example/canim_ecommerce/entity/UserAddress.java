package com.example.canim_ecommerce.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "user_addresses")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAddress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "user_id", nullable = false)
    Long userId;

    @Column(name = "receiver_name", nullable = false, length = 100)
    String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    String receiverPhone;

    @Column(name = "province_code", length = 50)
    String provinceCode;

    @Column(name = "province_name", length = 100)
    String provinceName;

    @Column(name = "district_code", length = 50)
    String districtCode;

    @Column(name = "district_name", length = 100)
    String districtName;

    @Column(name = "ward_code", length = 50)
    String wardCode;

    @Column(name = "ward_name", length = 100)
    String wardName;

    @Column(name = "street_address", nullable = false, length = 255)
    String streetAddress;

    @Column(name = "full_address", nullable = false, columnDefinition = "TEXT")
    String fullAddress;

    @Column(length = 500)
    String note;

    @Builder.Default
    @Column(name = "is_default", nullable = false)
    Boolean isDefault = false;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;
}
