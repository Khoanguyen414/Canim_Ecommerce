package com.example.canim_ecommerce.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.example.canim_ecommerce.enums.OrderStatus;
import com.example.canim_ecommerce.enums.PaymentMethod;
import com.example.canim_ecommerce.enums.PaymentStatus;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@Table(name = "orders")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "order_no", unique = true, nullable = false)
    String orderNo;

    @Column(name = "user_id")
    Long userId;

    @Column(name = "sub_total", nullable = false)
    BigDecimal subTotal;

    @Column(name = "shipping_fee")
    BigDecimal shippingFee;

    @Column(name = "discount_amount")
    BigDecimal discountAmount;

    @Column(name = "total_amount", nullable = false)
    BigDecimal totalAmount;

    @Column(name = "receiver_name", nullable = false)
    String receiverName;

    @Column(name = "receiver_phone", nullable = false)
    String receiverPhone;

    @Column(name = "shipping_address", columnDefinition = "TEXT", nullable = false)
    String shippingAddress;

    @Column(name = "order_note", columnDefinition = "TEXT")
    String orderNote;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    PaymentStatus paymentStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    OrderStatus orderStatus;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("createdAt ASC")
    List<OrderStatusHistory> histories = new ArrayList<>();
}
