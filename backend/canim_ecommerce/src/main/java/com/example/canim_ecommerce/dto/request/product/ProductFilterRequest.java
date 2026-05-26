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
    /** Danh mục gốc + toàn bộ danh mục con (được gán ở service). */
    List<Integer> categoryIds;
    String categorySlug;
    /** Facet: nam | nu */
    String gender;
    /** Facet: phu-kien | ao | quan | the-thao */
    String group;
    /** Facet chi tiết: ao-khoac, quan-jeans, ... */
    String facet;
    /** Facet: new | sale | bestseller | promo */
    String collection;
    /** Lọc theo size variant (vd. M,L). */
    List<String> sizes;
    /** Lọc theo màu variant. */
    List<String> colors;
    BigDecimal minPrice;
    BigDecimal maxPrice;
    ProductStatus status;
    /** Admin: true = hiển thị cả sản phẩm HIDDEN (đã “xóa mềm”). */
    Boolean includeHidden;
    /** Đã resolve facet → categoryIds; bỏ lọc text facet/gender trùng. */
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
