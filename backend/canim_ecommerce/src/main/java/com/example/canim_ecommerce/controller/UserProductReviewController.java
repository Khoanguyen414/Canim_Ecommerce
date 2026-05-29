package com.example.canim_ecommerce.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.dto.request.review.UpdateProductReviewRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.ProductReviewResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.ProductReviewService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("isAuthenticated()")
public class UserProductReviewController {
    ProductReviewService productReviewService;

    @PutMapping("/{reviewId}")
    public ApiResponse<ProductReviewResponse> updateMyReview(
            @PathVariable Long reviewId,
            @RequestBody @Validated UpdateProductReviewRequest request) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Review updated successfully",
                productReviewService.updateMyReview(reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ApiResponse<Void> deleteMyReview(@PathVariable Long reviewId) {
        productReviewService.deleteMyReview(reviewId);
        return ApiResponse.success(ApiStatus.SUCCESS, "Review deleted successfully", null);
    }
}
