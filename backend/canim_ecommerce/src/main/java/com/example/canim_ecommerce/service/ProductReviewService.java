package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.review.CreateProductReviewRequest;
import com.example.canim_ecommerce.dto.request.review.UpdateProductReviewRequest;
import com.example.canim_ecommerce.dto.response.PageResponse;
import com.example.canim_ecommerce.dto.response.ProductReviewResponse;
import com.example.canim_ecommerce.dto.response.ReviewSummaryResponse;

public interface ProductReviewService {
    ProductReviewResponse createReview(Long productId, CreateProductReviewRequest request);

    ProductReviewResponse updateMyReview(Long reviewId, UpdateProductReviewRequest request);

    void deleteMyReview(Long reviewId);

    PageResponse<ProductReviewResponse> getProductReviews(Long productId, int pageNum, int sizePage);

    ReviewSummaryResponse getProductReviewSummary(Long productId);

    void adminHideReview(Long reviewId);

    void adminShowReview(Long reviewId);
}
