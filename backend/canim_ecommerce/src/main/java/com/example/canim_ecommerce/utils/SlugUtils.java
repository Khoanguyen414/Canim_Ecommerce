package com.example.canim_ecommerce.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SlugUtils {
    static Pattern NONLATIN = Pattern.compile("[^\\w-]");
    static Pattern WHITESPACE = Pattern.compile("[\\s]");
    static Pattern EDGESDHASHES = Pattern.compile("(^-|-$)");

    private SlugUtils() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static String toSlug(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }

        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("\\p{InCombiningDiacriticalMarks}+")
            .matcher(normalized)
            .replaceAll("");

        slug = NONLATIN.matcher(slug).replaceAll("");
        slug = EDGESDHASHES.matcher(slug).replaceAll("");

        return slug.toLowerCase(Locale.ENGLISH);
    }
}
