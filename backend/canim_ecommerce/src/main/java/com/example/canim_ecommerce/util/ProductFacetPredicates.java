package com.example.canim_ecommerce.util;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import com.example.canim_ecommerce.entity.Category;
import com.example.canim_ecommerce.entity.Product;
import com.example.canim_ecommerce.entity.ProductVariant;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;

public final class ProductFacetPredicates {
    private ProductFacetPredicates() {}

    public static Predicate genderPredicate(Root<Product> root, CriteriaBuilder cb, String gender) {
        if (gender == null || gender.isBlank()) {
            return null;
        }
        Join<Product, Category> category = root.join("category", JoinType.INNER);
        Expression<String> productName = cb.lower(root.get("name"));
        Expression<String> categoryName = cb.lower(category.get("name"));
        Expression<String> categorySlug = cb.lower(category.get("slug"));

        Predicate notFemaleProduct = cb.and(
                cb.not(cb.like(productName, "%nữ%")),
                cb.not(cb.like(productName, "% nu%")));
        Predicate notFemaleCategory = cb.and(
                cb.not(cb.like(categoryName, "%nữ%")),
                cb.not(cb.like(categoryName, "% nu%")),
                cb.not(cb.like(categorySlug, "%-nu%")),
                cb.not(cb.like(categorySlug, "%nu-%")));

        if ("nam".equalsIgnoreCase(gender)) {
            return cb.and(notFemaleProduct, notFemaleCategory);
        }

        if ("nu".equalsIgnoreCase(gender)) {
            return cb.or(
                    cb.like(productName, "%nữ%"),
                    cb.like(productName, "% nu%"),
                    cb.like(categoryName, "%nữ%"),
                    cb.like(categoryName, "%nu%"),
                    cb.like(categorySlug, "%-nu%"),
                    cb.like(categorySlug, "%nu%"));
        }

        return null;
    }

    public static Predicate keywordPredicate(Root<Product> root, CriteriaBuilder cb, String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }
        String pattern = TextNormalizeUtils.likePattern(keyword.trim());
        Join<Product, Category> category = root.join("category", JoinType.LEFT);
        Expression<String> blob = searchBlob(root, category, cb);
        return cb.like(blob, pattern);
    }

    public static Predicate tokensPredicate(Root<Product> root, CriteriaBuilder cb, List<String> tokens) {
        if (tokens == null || tokens.isEmpty()) {
            return null;
        }
        Join<Product, Category> category = root.join("category", JoinType.LEFT);
        Expression<String> blob = searchBlob(root, category, cb);

        List<Predicate> tokenPredicates = new ArrayList<>();
        for (String token : tokens) {
            if (token == null || token.isBlank() || token.length() < 2) {
                continue;
            }
            tokenPredicates.add(cb.like(blob, TextNormalizeUtils.likePattern(token)));
        }
        if (tokenPredicates.isEmpty()) {
            return null;
        }
        return cb.or(tokenPredicates.toArray(Predicate[]::new));
    }

    public static Predicate variantSizesPredicate(Root<Product> root, CriteriaBuilder cb, List<String> sizes) {
        if (sizes == null || sizes.isEmpty()) {
            return null;
        }
        Join<Product, ProductVariant> variantJoin = root.join("variants", JoinType.INNER);
        return variantJoin.get("size").in(sizes);
    }

    public static Predicate variantColorsPredicate(Root<Product> root, CriteriaBuilder cb, List<String> colors) {
        if (colors == null || colors.isEmpty()) {
            return null;
        }
        Join<Product, ProductVariant> variantJoin = root.join("variants", JoinType.INNER);
        List<Predicate> colorPredicates = new ArrayList<>();
        for (String color : colors) {
            if (color == null || color.isBlank()) {
                continue;
            }
            colorPredicates.add(cb.like(cb.lower(variantJoin.get("color")), TextNormalizeUtils.likePattern(color)));
        }
        if (colorPredicates.isEmpty()) {
            return null;
        }
        return cb.or(colorPredicates.toArray(Predicate[]::new));
    }

    public static Predicate collectionPredicate(Root<Product> root, CriteriaBuilder cb, String collection) {
        if (collection == null || collection.isBlank()) {
            return null;
        }
        return switch (collection.toLowerCase(Locale.ROOT)) {
            case "new" -> cb.greaterThanOrEqualTo(root.get("createdAt"), LocalDateTime.now().minusDays(365));
            case "sale", "promo" -> cb.or(
                    cb.like(cb.lower(root.get("name")), "%sale%"),
                    cb.like(cb.lower(root.get("name")), "%khuyen%"),
                    cb.like(cb.lower(root.get("shortDesc")), "%khuyen%"));
            case "bestseller" -> null;
            default -> null;
        };
    }

    private static Expression<String> searchBlob(
            Root<Product> root,
            Join<Product, Category> category,
            CriteriaBuilder cb) {
        return cb.lower(cb.concat(
                cb.concat(cb.concat(root.get("name"), " "), cb.coalesce(root.get("shortDesc"), "")),
                cb.concat(
                        cb.concat(" ", cb.coalesce(root.get("slug"), "")),
                        cb.concat(" ", cb.concat(category.get("name"), cb.concat(" ", category.get("slug")))))));
    }
}
