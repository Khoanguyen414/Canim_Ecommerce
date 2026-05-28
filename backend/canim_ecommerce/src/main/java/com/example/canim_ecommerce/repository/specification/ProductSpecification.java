package com.example.canim_ecommerce.repository.specification;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import com.example.canim_ecommerce.dto.request.product.ProductFilterRequest;
import com.example.canim_ecommerce.entity.Category;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.enums.ProductStatus;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class ProductSpecification {
    private ProductSpecification() {
    }

    public static Specification<Product> filterProducts(ProductFilterRequest filterRequest) {
        ProductFilterRequest filter = filterRequest == null ? new ProductFilterRequest() : filterRequest;

        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            boolean needsDistinct = false;

            Join<Product, Category> categoryJoin = null;
            Join<Product, ProductVariant> variantJoin = null;

            String keyword = filter.getKeyWord();
            if (StringUtils.hasText(keyword)) {
                categoryJoin = root.join("category", JoinType.LEFT);
                predicates.add(searchTextPredicate(root, categoryJoin, criteriaBuilder, keyword));
            }

            if (filter.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), filter.getStatus()));
            } else if (!Boolean.TRUE.equals(filter.getIncludeHidden())) {
                predicates.add(criteriaBuilder.notEqual(root.get("status"), ProductStatus.HIDDEN));
            }

            if (filter.getCategoryIds() != null && !filter.getCategoryIds().isEmpty()) {
                categoryJoin = categoryJoin == null ? root.join("category", JoinType.INNER) : categoryJoin;
                predicates.add(categoryJoin.get("id").in(filter.getCategoryIds()));
            } else if (filter.getCategoryId() != null) {
                categoryJoin = categoryJoin == null ? root.join("category", JoinType.INNER) : categoryJoin;
                predicates.add(criteriaBuilder.equal(categoryJoin.get("id"), filter.getCategoryId().intValue()));
            }

            if (!Boolean.TRUE.equals(filter.getCategoryFacetResolved())) {
                categoryJoin = addTokenPredicate(
                        predicates,
                        root,
                        categoryJoin,
                        criteriaBuilder,
                        filter.getGender());
                categoryJoin = addTokenPredicate(
                        predicates,
                        root,
                        categoryJoin,
                        criteriaBuilder,
                        filter.getGroup());
                categoryJoin = addTokenPredicate(
                        predicates,
                        root,
                        categoryJoin,
                        criteriaBuilder,
                        filter.getFacet());
            }

            categoryJoin = addTokenPredicate(
                    predicates,
                    root,
                    categoryJoin,
                    criteriaBuilder,
                    filter.getCollection());

            if (filter.getSizes() != null && !filter.getSizes().isEmpty()) {
                variantJoin = root.join("variants", JoinType.INNER);
                needsDistinct = true;
                predicates.add(lowerInPredicate(variantJoin.get("size"), filter.getSizes()));
            }

            if (filter.getColors() != null && !filter.getColors().isEmpty()) {
                variantJoin = variantJoin == null ? root.join("variants", JoinType.INNER) : variantJoin;
                needsDistinct = true;
                predicates.add(lowerInPredicate(variantJoin.get("color"), filter.getColors()));
            }

            if (filter.getMinPrice() != null || filter.getMaxPrice() != null) {
                variantJoin = variantJoin == null ? root.join("variants", JoinType.INNER) : variantJoin;
                needsDistinct = true;

                if (filter.getMinPrice() != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                            variantJoin.get("price"),
                            filter.getMinPrice()));
                }

                if (filter.getMaxPrice() != null) {
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(
                            variantJoin.get("price"),
                            filter.getMaxPrice()));
                }
            }

            if (needsDistinct && query != null) {
                query.distinct(true);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private static Join<Product, Category> addTokenPredicate(
            List<Predicate> predicates,
            jakarta.persistence.criteria.Root<Product> root,
            Join<Product, Category> categoryJoin,
            jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
            String value) {
        List<String> tokens = splitTokens(value);
        if (tokens.isEmpty()) {
            return categoryJoin;
        }

        Join<Product, Category> join = categoryJoin == null ? root.join("category", JoinType.LEFT) : categoryJoin;
        List<Predicate> tokenPredicates = tokens.stream()
                .map(token -> searchTextPredicate(root, join, criteriaBuilder, token))
                .toList();

        predicates.add(criteriaBuilder.or(tokenPredicates.toArray(new Predicate[0])));

        return join;
    }

    private static Predicate searchTextPredicate(
            jakarta.persistence.criteria.Root<Product> root,
            Join<Product, Category> categoryJoin,
            jakarta.persistence.criteria.CriteriaBuilder criteriaBuilder,
            String value) {
        String pattern = "%" + value.trim().toLowerCase() + "%";

        return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("slug")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("shortDesc")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("longDesc")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("brand")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(categoryJoin.get("name")), pattern),
                criteriaBuilder.like(criteriaBuilder.lower(categoryJoin.get("slug")), pattern));
    }

    private static Predicate lowerInPredicate(Expression<String> expression, List<String> values) {
        List<String> normalizedValues = values.stream()
                .filter(StringUtils::hasText)
                .map(value -> value.trim().toLowerCase())
                .toList();

        return expression.as(String.class).in(normalizedValues);
    }

    private static List<String> splitTokens(String value) {
        if (!StringUtils.hasText(value)) {
            return List.of();
        }

        return Arrays.stream(value.trim().toLowerCase().split("[,\\s_\\-]+"))
                .filter(StringUtils::hasText)
                .toList();
    }
}
