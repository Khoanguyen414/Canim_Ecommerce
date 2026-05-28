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
import com.example.canim_ecommerce.enums.ShippingStatus;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@Builder
@Table(name = "orders")
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "order_no", unique = true, nullable = false, length = 64)
    String orderNo;

    @Column(name = "idempotency_key", length = 100)
    String idempotencyKey;

    @Column(name = "user_id")
    Long userId;

    @Column(name = "sub_total", nullable = false, precision = 15, scale = 2)
    BigDecimal subTotal;

    @Builder.Default
    @Column(name = "shipping_fee", precision = 15, scale = 2)
    BigDecimal shippingFee = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "discount_amount", precision = 15, scale = 2)
    BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    BigDecimal totalAmount;

    @Column(name = "receiver_name", nullable = false, length = 100)
    String receiverName;

    @Column(name = "receiver_phone", nullable = false, length = 20)
    String receiverPhone;

    @Column(name = "shipping_address", columnDefinition = "TEXT", nullable = false)
    String shippingAddress;

    @Column(name = "order_note", columnDefinition = "TEXT")
    String orderNote;

    @Column(name = "cancel_reason", length = 500)
    String cancelReason;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cancelled_by")
    User cancelledBy;

    @Column(name = "shipping_provider", length = 100)
    String shippingProvider;

    @Column(name = "tracking_code", length = 100)
    String trackingCode;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    PaymentMethod paymentMethod = PaymentMethod.COD;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status")
    PaymentStatus paymentStatus = PaymentStatus.UNPAID;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    OrderStatus orderStatus = OrderStatus.PENDING;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(name = "shipping_status")
    ShippingStatus shippingStatus = ShippingStatus.NOT_SHIPPED;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    LocalDateTime updatedAt;

    @Column(name = "confirmed_at")
    LocalDateTime confirmedAt;

    @Column(name = "shipped_at")
    LocalDateTime shippedAt;

    @Column(name = "delivered_at")
    LocalDateTime deliveredAt;

    @Column(name = "cancelled_at")
    LocalDateTime cancelledAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    List<OrderItem> items = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("createdAt ASC")
    List<OrderStatusHistory> histories = new ArrayList<>();
}
