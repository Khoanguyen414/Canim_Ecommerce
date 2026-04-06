package com.example.canim_ecommerce.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.UUID;

public class CodeGenerator {
    
    // Sinh mã phiếu Nhập/Xuất/Kiểm kê (VD: RC-IN-20260406-A1B2)
    public static String generateReceiptCode(String prefix) {
        return "RC-" + prefix + "-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) 
             + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }

    // Sinh mã Lô hàng theo Variant (VD: BAT-1712345678-V12)
    public static String generateBatchCode(Long variantId) {
        return "BAT-" + System.currentTimeMillis() + "-V" + variantId;
    }

    // Sinh mã Lô hàng điều chỉnh do kiểm kê (VD: ADJ-IN-1712345678)
    public static String generateAdjustBatchCode() {
        return "ADJ-IN-" + System.currentTimeMillis();
    }
}