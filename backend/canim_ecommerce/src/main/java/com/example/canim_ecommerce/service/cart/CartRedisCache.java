package com.example.canim_ecommerce.service.cart;

import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import com.example.canim_ecommerce.entity.Cart;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

/**
 * Cache Redis cho entity {@link Cart} theo userId.
 * <p>
 * Nguồn sự thật vẫn là MySQL ({@code CartRepository}). Redis chỉ tăng tốc đọc;
 * mọi thao tác ghi giỏ đều qua DB trước, sau đó cập nhật cache best-effort.
 * Nếu Redis không chạy hoặc lỗi mạng, các phương thức bắt lỗi và coi như cache tắt
 * để API giỏ hàng không fail.
 */
@Slf4j
@Component
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartRedisCache {

    static final String KEY_PREFIX = "cart:user:";
    static final long TTL_DAYS = 7L;

    ObjectProvider<RedisTemplate<String, Object>> redisTemplateProvider;

    public CartRedisCache(ObjectProvider<RedisTemplate<String, Object>> redisTemplateProvider) {
        this.redisTemplateProvider = redisTemplateProvider;
    }

    private RedisTemplate<String, Object> redisTemplate() {
        return redisTemplateProvider.getIfAvailable();
    }

    public static String keyForUser(Long userId) {
        return KEY_PREFIX + userId;
    }

    public Optional<Cart> get(Long userId) {
        RedisTemplate<String, Object> redisTemplate = redisTemplate();
        if (redisTemplate == null) {
            return Optional.empty();
        }

        String key = keyForUser(userId);
        try {
            Object raw = redisTemplate.opsForValue().get(key);
            if (raw instanceof Cart cart) {
                return Optional.of(cart);
            }
            return Optional.empty();
        } catch (Exception e) {
            log.warn("Redis cart cache read failed for user {}: {}", userId, e.getMessage());
            return Optional.empty();
        }
    }

    public void put(Long userId, Cart cart) {
        RedisTemplate<String, Object> redisTemplate = redisTemplate();
        if (redisTemplate == null) {
            return;
        }

        try {
            redisTemplate.opsForValue().set(keyForUser(userId), cart, TTL_DAYS, TimeUnit.DAYS);
        } catch (Exception e) {
            log.warn("Redis cart cache write failed for user {}: {}", userId, e.getMessage());
        }
    }

    public void evict(Long userId) {
        RedisTemplate<String, Object> redisTemplate = redisTemplate();
        if (redisTemplate == null) {
            return;
        }

        try {
            redisTemplate.delete(keyForUser(userId));
        } catch (Exception e) {
            log.warn("Redis cart cache evict failed for user {}: {}", userId, e.getMessage());
        }
    }
}
