package com.example.canim_ecommerce.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderStatisticsResponse {
    long totalOrders;
    BigDecimal totalRevenue;
    long pendingOrders;
    long processingOrders;
    long shippedOrders;
    long deliveredOrders;
    long cancelledOrders;
    BigDecimal cancelRate;
    List<RevenueByDateResponse> revenueByDate;
    List<TopSellingProductResponse> topSellingProducts;
}
