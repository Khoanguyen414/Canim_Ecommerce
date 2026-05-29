package com.example.canim_ecommerce.util;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

public final class ProductFacetKeywords {
    private ProductFacetKeywords() {}

    public static final Set<String> GENDERS = Set.of("nam", "nu");

    public static final Set<String> GROUPS = Set.of("phu-kien", "ao", "quan", "the-thao");

    public static final Set<String> COLLECTIONS = Set.of("new", "sale", "bestseller", "promo");

    public static final Map<String, List<String>> GROUP = Map.of(
            "phu-kien", List.of("tat", "tui", "xach", "mu", "non", "that", "lung", "phu kien", "accessory"),
            "ao", List.of("ao", "shirt", "polo", "som", "so mi", "thun", "khoac", "ni", "len", "hoodie", "sweater"),
            "quan", List.of("quan", "jean", "jeans", "kaki", "short", "au", "pants", "trouser"),
            "the-thao", List.of("the thao", "sport", "athletic", "gym", "training", "polo", "thun"));

    public static final Map<String, List<String>> FACET = Map.ofEntries(
            Map.entry("tat", List.of("tat", "sock", "vo", "vớ", "vớ nam", "tất")),
            Map.entry("tui", List.of("tui", "xach", "bag")),
            Map.entry("mu", List.of("mu", "non", "cap", "hat")),
            Map.entry("that-lung", List.of("that", "lung", "belt")),
            Map.entry("phu-kien-khac", List.of("phu kien", "accessory")),
            Map.entry("ao-khoac", List.of("khoac", "jacket", "coat")),
            Map.entry("ao-ni", List.of("ni", "hoodie", "sweat")),
            Map.entry("ao-len", List.of("len", "sweater", "knit")),
            Map.entry("ao-so-mi", List.of("so mi", "som", "shirt")),
            Map.entry("ao-polo", List.of("polo")),
            Map.entry("ao-thun", List.of("thun", "tee", "tshirt")),
            Map.entry("ao-hoodie-ni", List.of("hoodie", "ni")),
            Map.entry("quan-kaki", List.of("kaki", "chino")),
            Map.entry("quan-short", List.of("short")),
            Map.entry("quan-jeans", List.of("jean", "denim", "jeans")),
            Map.entry("quan-au", List.of("au", "trouser")),
            Map.entry("quan-dai", List.of("dai", "long")),
            Map.entry("quan-ni", List.of("ni", "jogger", "sweatpant")),
            Map.entry("quan-the-thao", List.of("the thao", "sport", "jogger")),
            Map.entry("ao-polo-the-thao", List.of("polo", "the thao", "sport")),
            Map.entry("ao-thun-the-thao", List.of("thun", "the thao", "sport", "tee")),
            Map.entry("bo-the-thao", List.of("bo", "the thao", "tracksuit", "sport")));

    public static List<String> tokensForFacet(String facet) {
        if (facet == null || facet.isBlank()) {
            return List.of();
        }
        LinkedHashSet<String> tokens = new LinkedHashSet<>();
        String key = facet.trim().toLowerCase();
        List<String> mapped = FACET.get(key);
        if (mapped != null) {
            tokens.addAll(mapped);
        }
        for (String part : key.split("-")) {
            if (part.length() >= 3 && !part.equals("the") && !part.equals("nam") && !part.equals("nu")) {
                tokens.add(part);
            }
        }
        return new ArrayList<>(tokens);
    }
}
