package com.example.canim_ecommerce.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.canim_ecommerce.dto.request.review.CreateProductReviewRequest;
import com.example.canim_ecommerce.dto.request.review.UpdateProductReviewRequest;
import com.example.canim_ecommerce.dto.response.PageResponse;
import com.example.canim_ecommerce.dto.response.ProductReviewResponse;
import com.example.canim_ecommerce.dto.response.ReviewSummaryResponse;
import com.example.canim_ecommerce.entity.Order;
import com.example.canim_ecommerce.entity.OrderItem;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.ProductReview;
import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.OrderStatus;
import com.example.canim_ecommerce.enums.ProductReviewStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.ProductReviewMapper;
import com.example.canim_ecommerce.repository.OrderItemRepository;
import com.example.canim_ecommerce.repository.ProductRepository;
import com.example.canim_ecommerce.repository.ProductReviewRepository;
import com.example.canim_ecommerce.repository.ProductVariantRepository;
import com.example.canim_ecommerce.repository.UserRepository;
import com.example.canim_ecommerce.service.ProductReviewService;
import com.example.canim_ecommerce.utils.SecurityUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductReviewServiceImpl implements ProductReviewService {
    ProductReviewRepository productReviewRepository;
    ProductRepository productRepository;
    ProductVariantRepository productVariantRepository;
    OrderItemRepository orderItemRepository;
    UserRepository userRepository;
    ProductReviewMapper productReviewMapper;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductReviewResponse createReview(Long productId, CreateProductReviewRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found"));

        OrderItem orderItem = orderItemRepository.findByIdWithOrder(request.getOrderItemId())
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Order item not found"));

        Order order = orderItem.getOrder();
        validateReviewEligibility(currentUserId, productId, order, orderItem);

        if (productReviewRepository.existsByUserIdAndOrderItemId(currentUserId, orderItem.getId())) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "You have already reviewed this order item");
        }

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "User not found"));

        ProductReview review = ProductReview.builder()
                .product(product)
                .variantId(orderItem.getVariantId())
                .order(order)
                .orderItemId(orderItem.getId())
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .status(ProductReviewStatus.VISIBLE)
                .build();

        ProductReview saved = productReviewRepository.save(review);
        return productReviewMapper.toResponse(saved);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public ProductReviewResponse updateMyReview(Long reviewId, UpdateProductReviewRequest request) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ProductReview review = productReviewRepository.findByIdAndUser_Id(reviewId, currentUserId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Review not found"));

        if (review.getStatus() == ProductReviewStatus.DELETED) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Deleted reviews cannot be updated");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        return productReviewMapper.toResponse(productReviewRepository.save(review));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMyReview(Long reviewId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();
        ProductReview review = productReviewRepository.findByIdAndUser_Id(reviewId, currentUserId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Review not found"));

        if (review.getStatus() == ProductReviewStatus.DELETED) {
            return;
        }
        review.setStatus(ProductReviewStatus.DELETED);
        productReviewRepository.save(review);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductReviewResponse> getProductReviews(Long productId, int pageNum, int sizePage) {
        if (!productRepository.existsById(productId)) {
            throw new ApiException(ApiStatus.NOT_FOUND, "Product not found");
        }

        int pageIndex = Math.max(pageNum - 1, 0);
        int size = Math.max(sizePage, 1);
        Pageable pageable = PageRequest.of(pageIndex, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<ProductReview> page = productReviewRepository.findByProduct_IdAndStatus(
                productId, ProductReviewStatus.VISIBLE, pageable);

        List<ProductReviewResponse> data = page.getContent().stream()
                .map(productReviewMapper::toResponse)
                .toList();

        return PageResponse.<ProductReviewResponse>builder()
                .page(pageNum)
                .size(size)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .data(data)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewSummaryResponse getProductReviewSummary(Long productId) {
        if (!productRepository.existsById(productId)) {
            throw new ApiException(ApiStatus.NOT_FOUND, "Product not found");
        }

        ProductReviewStatus status = ProductReviewStatus.VISIBLE;
        Double average = productReviewRepository.averageRatingByProductId(productId, status);
        long total = productReviewRepository.countByProductIdAndStatus(productId, status);

        Map<Integer, Long> ratingCounts = new HashMap<>();
        for (int i = 1; i <= 5; i++) {
            ratingCounts.put(i, 0L);
        }
        for (Object[] row : productReviewRepository.countByRatingGrouped(productId, status)) {
            int rating = ((Number) row[0]).intValue();
            long count = ((Number) row[1]).longValue();
            ratingCounts.put(rating, count);
        }

        ReviewSummaryResponse response = new ReviewSummaryResponse();
        response.setAverageRating(BigDecimal.valueOf(average == null ? 0 : average)
                .setScale(2, RoundingMode.HALF_UP));
        response.setReviewCount(total);
        response.setRating1Count(ratingCounts.get(1));
        response.setRating2Count(ratingCounts.get(2));
        response.setRating3Count(ratingCounts.get(3));
        response.setRating4Count(ratingCounts.get(4));
        response.setRating5Count(ratingCounts.get(5));
        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void adminHideReview(Long reviewId) {
        ProductReview review = productReviewRepository.findByIdAndStatusNot(reviewId, ProductReviewStatus.DELETED)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Review not found"));
        review.setStatus(ProductReviewStatus.HIDDEN);
        productReviewRepository.save(review);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void adminShowReview(Long reviewId) {
        ProductReview review = productReviewRepository.findByIdAndStatusNot(reviewId, ProductReviewStatus.DELETED)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Review not found"));
        review.setStatus(ProductReviewStatus.VISIBLE);
        productReviewRepository.save(review);
    }

    private void validateReviewEligibility(Long currentUserId, Long productId, Order order, OrderItem orderItem) {
        if (order.getUserId() == null || !order.getUserId().equals(currentUserId)) {
            throw new ApiException(ApiStatus.FORBIDDEN, "You can only review your own delivered orders");
        }
        if (order.getOrderStatus() != OrderStatus.DELIVERED) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "You can only review products from delivered orders");
        }

        ProductVariant variant = productVariantRepository.findByIdWithProduct(orderItem.getVariantId())
                .orElseThrow(() -> new ApiException(ApiStatus.BAD_REQUEST, "Product variant not found for order item"));

        if (!variant.getProduct().getId().equals(productId)) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Order item does not belong to this product");
        }
    }
}
