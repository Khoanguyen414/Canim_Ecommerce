package com.example.canim_ecommerce.util;

import java.util.Locale;
import java.util.Optional;

/**
 * Ánh xạ facet URL → slug danh mục.
 * leaf=true: danh mục con (tat-nam) — chỉ lọc theo cây danh mục.
 * leaf=false: danh mục nhóm (phu-kien-nam) — cần thêm lọc text facet.
 */
public final class FacetCategoryResolver {
    private FacetCategoryResolver() {}

    public record ResolvedCategory(String slug, boolean leaf) {}

    public static Optional<ResolvedCategory> resolve(String gender, String group, String facet) {
        String g = normalizeGender(gender);

        if (facet != null && !facet.isBlank()) {
            String f = facet.trim().toLowerCase(Locale.ROOT);
            String leafSlug = (f.endsWith("-nam") || f.endsWith("-nu")) ? f : f + "-" + g;
            return Optional.of(new ResolvedCategory(leafSlug, true));
        }

        if (group != null && !group.isBlank()) {
            return Optional.of(new ResolvedCategory(group.trim().toLowerCase(Locale.ROOT) + "-" + g, false));
        }

        if (gender != null && !gender.isBlank()) {
            return Optional.of(new ResolvedCategory("thoi-trang-" + g, false));
        }

        return Optional.empty();
    }

    /** Slug nhóm cha khi danh mục lá (tat-nam) chưa tồn tại. */
    public static Optional<String> resolveGroupFallbackSlug(String gender, String group) {
        if (group == null || group.isBlank()) {
            return Optional.empty();
        }
        return Optional.of(group.trim().toLowerCase(Locale.ROOT) + "-" + normalizeGender(gender));
    }

    private static String normalizeGender(String gender) {
        if (gender == null || gender.isBlank()) {
            return "nam";
        }
        String g = gender.trim().toLowerCase(Locale.ROOT);
        return "nu".equals(g) ? "nu" : "nam";
    }
}
