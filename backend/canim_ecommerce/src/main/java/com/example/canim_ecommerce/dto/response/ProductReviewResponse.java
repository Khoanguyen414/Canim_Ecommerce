package com.example.canim_ecommerce.dto.response;

import java.time.LocalDateTime;

import com.example.canim_ecommerce.enums.ProductReviewStatus;

import lombok.Data;

@Data
public class ProductReviewResponse {
    Long id;
    Long productId;
    Long variantId;
    Long orderId;
    Long orderItemId;
    Long userId;
    String userName;
    Integer rating;
    String comment;
    ProductReviewStatus status;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
