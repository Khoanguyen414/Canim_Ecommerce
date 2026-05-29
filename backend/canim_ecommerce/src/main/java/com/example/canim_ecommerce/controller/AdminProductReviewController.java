package com.example.canim_ecommerce.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.ProductReviewService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/admin/reviews")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminProductReviewController {
    ProductReviewService productReviewService;

    @PatchMapping("/{reviewId}/hide")
    public ApiResponse<Void> hideReview(@PathVariable Long reviewId) {
        productReviewService.adminHideReview(reviewId);
        return ApiResponse.success(ApiStatus.SUCCESS, "Review hidden successfully", null);
    }

    @PatchMapping("/{reviewId}/show")
    public ApiResponse<Void> showReview(@PathVariable Long reviewId) {
        productReviewService.adminShowReview(reviewId);
        return ApiResponse.success(ApiStatus.SUCCESS, "Review is now visible", null);
    }
}
