package com.example.canim_ecommerce.repository.specification;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.jpa.domain.Specification;

import com.example.canim_ecommerce.dto.request.product.ProductFilterRequest;
import com.example.canim_ecommerce.entity.Category;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.enums.ProductStatus;
import com.example.canim_ecommerce.util.ProductFacetKeywords;
import com.example.canim_ecommerce.util.ProductFacetPredicates;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;

public class ProductSpecification {
    public static Specification<Product> filterProducts(ProductFilterRequest filterRequest) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            boolean needsDistinct = false;
            boolean categoryResolved = Boolean.TRUE.equals(filterRequest.getCategoryFacetResolved());

            String facet = filterRequest.getFacet();
            boolean hasFacet = facet != null && !facet.isBlank();

            Predicate keywordPredicate = ProductFacetPredicates.keywordPredicate(
                    root, criteriaBuilder, filterRequest.getKeyWord());
            if (keywordPredicate != null) {
                predicates.add(keywordPredicate);
            }

            if (filterRequest.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), filterRequest.getStatus()));
            } else if (!Boolean.TRUE.equals(filterRequest.getIncludeHidden())) {
                predicates.add(criteriaBuilder.notEqual(root.get("status"), ProductStatus.HIDDEN));
            }

            List<Integer> categoryIds = filterRequest.getCategoryIds();
            if (categoryIds != null && !categoryIds.isEmpty()) {
                Join<Product, Category> categoryJoin = root.join("category", JoinType.INNER);
                predicates.add(categoryJoin.get("id").in(categoryIds));
            } else if (filterRequest.getCategoryId() != null) {
                Join<Product, Category> categoryJoin = root.join("category", JoinType.INNER);
                predicates.add(criteriaBuilder.equal(categoryJoin.get("id"), filterRequest.getCategoryId()));
            }

            // Facet text: luôn áp dụng khi có ?facet= (kể cả đã resolve danh mục nhóm cha)
            if (hasFacet) {
                List<String> facetTokens = ProductFacetKeywords.tokensForFacet(facet.toLowerCase());
                Predicate facetPredicate = ProductFacetPredicates.tokensPredicate(
                        root, criteriaBuilder, facetTokens);
                if (facetPredicate != null) {
                    predicates.add(facetPredicate);
                }
            } else if (!categoryResolved) {
                String group = filterRequest.getGroup();
                if (group != null && ProductFacetKeywords.GROUPS.contains(group.toLowerCase())) {
                    List<String> groupTokens = ProductFacetKeywords.GROUP.get(group.toLowerCase());
                    Predicate groupPredicate = ProductFacetPredicates.tokensPredicate(
                            root, criteriaBuilder, groupTokens);
                    if (groupPredicate != null) {
                        predicates.add(groupPredicate);
                    }
                }
            }

            // Gender rộng chỉ khi không có facet (tránh "Nam" → hiện giày/áo lẫn tất)
            if (!hasFacet && !categoryResolved) {
                Predicate genderPredicate = ProductFacetPredicates.genderPredicate(
                        root, criteriaBuilder, filterRequest.getGender());
                if (genderPredicate != null) {
                    predicates.add(genderPredicate);
                }
            }

            Predicate collectionPredicate = ProductFacetPredicates.collectionPredicate(
                    root, criteriaBuilder, filterRequest.getCollection());
            if (collectionPredicate != null) {
                predicates.add(collectionPredicate);
            }

            Predicate sizesPredicate = ProductFacetPredicates.variantSizesPredicate(
                    root, criteriaBuilder, filterRequest.getSizes());
            if (sizesPredicate != null) {
                predicates.add(sizesPredicate);
                needsDistinct = true;
            }

            Predicate colorsPredicate = ProductFacetPredicates.variantColorsPredicate(
                    root, criteriaBuilder, filterRequest.getColors());
            if (colorsPredicate != null) {
                predicates.add(colorsPredicate);
                needsDistinct = true;
            }

            if (filterRequest.getMinPrice() != null || filterRequest.getMaxPrice() != null) {
                Join<Product, ProductVariant> variantJoin = root.join("variants", JoinType.INNER);
                needsDistinct = true;

                if (filterRequest.getMinPrice() != null) {
                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                            variantJoin.get("price"), filterRequest.getMinPrice()));
                }
                if (filterRequest.getMaxPrice() != null) {
                    predicates.add(criteriaBuilder.lessThanOrEqualTo(
                            variantJoin.get("price"), filterRequest.getMaxPrice()));
                }
            }

            if (needsDistinct) {
                query.distinct(true);
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}