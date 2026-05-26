package com.example.canim_ecommerce.repository.specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.example.canim_ecommerce.dto.request.order.OrderFilterRequest;
import com.example.canim_ecommerce.entity.Order;

import jakarta.persistence.criteria.Predicate;

public class OrderSpecification {
    public static Specification<Order> filterOrders(OrderFilterRequest filterRequest, Long userIdScope) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (userIdScope != null) {
                predicates.add(criteriaBuilder.equal(root.get("userId"), userIdScope));
            }

            if (StringUtils.hasText(filterRequest.getKeywords())) {
                String likeKeyword = "%" + filterRequest.getKeywords().trim() + "%";

                Predicate matchOrderNo = criteriaBuilder.like(root.get("orderNo"), likeKeyword);
                Predicate matchPhone = criteriaBuilder.like(root.get("receiverPhone"), likeKeyword);

                predicates.add(criteriaBuilder.or(matchOrderNo, matchPhone));
            }

            if (filterRequest.getOrderStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("orderStatus"), filterRequest.getOrderStatus()));
            }

            if (filterRequest.getPaymentStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("paymentStatus"), filterRequest.getPaymentStatus()));
            }

            if (filterRequest.getFromDate() != null) {
                predicates
                        .add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), filterRequest.getFromDate()));
            }

            if (filterRequest.getToDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), filterRequest.getToDate()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
