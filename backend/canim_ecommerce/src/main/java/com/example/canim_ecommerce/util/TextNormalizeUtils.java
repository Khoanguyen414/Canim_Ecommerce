package com.example.canim_ecommerce.util;

import java.text.Normalizer;
import java.util.Locale;

public final class TextNormalizeUtils {
    private TextNormalizeUtils() {}

    public static String fold(String input) {
        if (input == null) {
            return "";
        }
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        return normalized
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }

    public static String likePattern(String token) {
        return "%" + fold(token) + "%";
    }
}
