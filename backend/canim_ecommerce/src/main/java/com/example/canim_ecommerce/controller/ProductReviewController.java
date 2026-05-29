package com.example.canim_ecommerce.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.dto.request.review.CreateProductReviewRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.PageResponse;
import com.example.canim_ecommerce.dto.response.ProductReviewResponse;
import com.example.canim_ecommerce.dto.response.ReviewSummaryResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.ProductReviewService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/products")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductReviewController {
    ProductReviewService productReviewService;

    @GetMapping("/{productId}/reviews")
    public ApiResponse<PageResponse<ProductReviewResponse>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "10") int sizePage) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Get product reviews successfully",
                productReviewService.getProductReviews(productId, pageNum, sizePage));
    }

    @GetMapping("/{productId}/reviews/summary")
    public ApiResponse<ReviewSummaryResponse> getProductReviewSummary(@PathVariable Long productId) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Get product review summary successfully",
                productReviewService.getProductReviewSummary(productId));
    }

    @PostMapping("/{productId}/reviews")
    @PreAuthorize("isAuthenticated()")
    public ApiResponse<ProductReviewResponse> createReview(
            @PathVariable Long productId,
            @RequestBody @Validated CreateProductReviewRequest request) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Review created successfully",
                productReviewService.createReview(productId, request));
    }
}
