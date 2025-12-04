package com.example.canim_ecommerce.service;

import java.util.Random;

import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.repository.ProductRepository;
import com.example.canim_ecommerce.utils.SkuUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SkuService {
    ProductRepository productRepository;

    public String generateOrValidateSku(String input, String productName, String color) {
        String sku;

        if (input != null && !input.isBlank()) {
            sku = input.trim().toUpperCase().replaceAll("\\s+", "");
            if (productRepository.existsBySku(sku)) {
                throw new ApiException(ApiStatus.BAD_REQUEST, "SKU already exists: " + sku);
            }
        } else {
            sku = generateUniqueSku(productName, color);
        }

        return sku;
    }

    private String generateUniqueSku(String productName, String color) {
        String productCode = SkuUtils.getInitials(productName);
        String colorCode = SkuUtils.getInitials(color);

        String baseSku = productCode + colorCode;

        if (baseSku.length() < 2) {
            baseSku += new Random().nextInt(100);
        }

        String finalSku = baseSku;
        int count = 0;

        while (productRepository.existsBySku(finalSku)) {
            finalSku = baseSku + count;
            count++;
        }

        return finalSku;
    }
}
