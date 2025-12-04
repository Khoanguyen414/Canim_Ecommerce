package com.example.canim_ecommerce.utils;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class SkuUtils {
    private SkuUtils() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static String getInitials(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }

        String temp = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String normalized = pattern.matcher(temp).replaceAll("").toUpperCase();

        String[] words = normalized.split("\\s+");

        StringBuilder initials = new StringBuilder();

        for (String word : words) {
            if (!word.isEmpty() && Character.isLetterOrDigit(word.charAt(0))) {
                initials.append(word.charAt(0));
            }
            if (initials.length() >= 3) break;
        }

        if (initials.length() == 0) return normalized.length() >= 3 ? normalized.substring(0, 3) : normalized;  

        return initials.toString();
    }
}
