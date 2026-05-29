package com.example.canim_ecommerce.mapper;

import org.springframework.stereotype.Component;

import com.example.canim_ecommerce.dto.response.ProductReviewResponse;
import com.example.canim_ecommerce.entity.ProductReview;

@Component
public class ProductReviewMapper {
    public ProductReviewResponse toResponse(ProductReview review) {
        ProductReviewResponse response = new ProductReviewResponse();
        response.setId(review.getId());
        response.setProductId(review.getProduct().getId());
        response.setVariantId(review.getVariantId());
        response.setOrderId(review.getOrder().getId());
        response.setOrderItemId(review.getOrderItemId());
        response.setUserId(review.getUser().getId());
        response.setUserName(review.getUser().getFullName());
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setStatus(review.getStatus());
        response.setCreatedAt(review.getCreatedAt());
        response.setUpdatedAt(review.getUpdatedAt());
        return response;
    }
}
