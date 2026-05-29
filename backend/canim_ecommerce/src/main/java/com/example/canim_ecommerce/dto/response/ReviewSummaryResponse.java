package com.example.canim_ecommerce.dto.response;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class ReviewSummaryResponse {
    BigDecimal averageRating;
    long reviewCount;
    long rating1Count;
    long rating2Count;
    long rating3Count;
    long rating4Count;
    long rating5Count;
}
