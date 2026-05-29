package com.example.canim_ecommerce.dto.request.product;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import com.example.canim_ecommerce.enums.ProductStatus;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductFilterRequest {
    String keyWord;
    Long categoryId;
    List<Integer> categoryIds;
    String categorySlug;
    String gender;
    String group;
    String facet;
    String collection;
    List<String> sizes;
    List<String> colors;
    BigDecimal minPrice;
    BigDecimal maxPrice;
    ProductStatus status;
    Boolean includeHidden;
    Boolean categoryFacetResolved;

    public void setSizes(String value) {
        this.sizes = splitCsv(value);
    }

    public void setColors(String value) {
        this.colors = splitCsv(value);
    }

    private static List<String> splitCsv(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        List<String> parts = Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        return parts.isEmpty() ? null : parts;
    }
}
