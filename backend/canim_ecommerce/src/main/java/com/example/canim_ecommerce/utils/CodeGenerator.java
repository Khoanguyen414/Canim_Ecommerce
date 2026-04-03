package com.example.canim_ecommerce.utils;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class CodeGenerator {
    public static String generateReceiptCode() {
        return "PN-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) 
             + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
    public static String generateBatchCode(Long productId) {
        return "BAT-" + System.currentTimeMillis() + "-P" + productId;
    }
}