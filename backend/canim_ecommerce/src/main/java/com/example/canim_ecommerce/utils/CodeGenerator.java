package com.example.canim_ecommerce.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class CodeGenerator {
    // Phải có tham số String prefix để nhận "IN", "OUT", "CHK"
    public static String generateReceiptCode(String prefix) {
        return "RC-" + prefix + "-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) 
             + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    public static String generateBatchCode(Long variantId) {
        return "BAT-" + System.currentTimeMillis() + "-V" + variantId;
    }

    public static String generateAdjustBatchCode() {
        return "ADJ-IN-" + System.currentTimeMillis();
    }
}