package com.example.canim_ecommerce.scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.canim_ecommerce.service.OrderService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class OrderAutoCancelScheduler {
    OrderService orderService;

    @Scheduled(fixedDelayString = "${order.auto-cancel-fixed-delay-ms:300000}")
    public void autoCancelExpiredPendingOrders() {
        try {
            orderService.autoCancelExpiredPendingOrders();
        } catch (Exception exception) {
            log.error("Failed to run expired pending order auto cancellation", exception);
        }
    }
}
