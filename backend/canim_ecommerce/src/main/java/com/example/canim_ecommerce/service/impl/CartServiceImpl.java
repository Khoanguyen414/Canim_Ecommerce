package com.example.canim_ecommerce.service.impl;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.canim_ecommerce.dto.request.cart.AddToCartRequest;
import com.example.canim_ecommerce.dto.request.cart.UpdateCartItemRequest;
import com.example.canim_ecommerce.dto.response.CartResponse;
import com.example.canim_ecommerce.entity.Cart;
import com.example.canim_ecommerce.entity.CartItem;
import com.example.canim_ecommerce.entity.ProductVariant;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.EventType;
import com.example.canim_ecommerce.enums.ProductStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.CartMapper;
import com.example.canim_ecommerce.repository.CartRepository;
import com.example.canim_ecommerce.repository.ProductVariantRepository;
import com.example.canim_ecommerce.service.CartService;
import com.example.canim_ecommerce.service.InventoryService;
import com.example.canim_ecommerce.service.UserEventService; // Import Service mật thám
import com.example.canim_ecommerce.utils.SecurityUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CartServiceImpl implements CartService {

    CartRepository cartRepository;
    ProductVariantRepository productVariantRepository;
    CartMapper cartMapper;
    InventoryService inventoryService;
    
    // [CACHE] Redis để tăng tốc độ truy xuất
    RedisTemplate<String, Object> redisTemplate; 
    
    // [AI TRACKING] Tiêm Service Mật thám vào
    UserEventService userEventService; 
    
    static final String REDIS_CART_KEY = "cart:user:";

    @Override
    public CartResponse getMyCart() {
        Long userId = SecurityUtils.getCurrentUserId();
        String redisKey = REDIS_CART_KEY + userId;

        CartResponse cachedResponse = (CartResponse) redisTemplate.opsForValue().get(redisKey);
        if (cachedResponse != null) {
            log.info("🚀 HIT CACHE Redis: User {}", userId);
            return cachedResponse;
        }

        log.warn("🐢 MISS CACHE MySQL: User {}", userId);
        Cart cart = cartRepository.findByUserId(userId).orElse(null);
        
        if (cart == null) return CartResponse.builder().userId(userId).totalAmount(BigDecimal.ZERO).build();
        
        CartResponse response = cartMapper.toCartResponse(cart);
        enrichCartData(response);

        redisTemplate.opsForValue().set(redisKey, response, 7, TimeUnit.DAYS);
        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CartResponse addToCart(AddToCartRequest request) {
        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Invalid quantity");
        }

        Long userId = SecurityUtils.getCurrentUserId();
        Cart cart = cartRepository.findByUserId(userId)
                .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));

        ProductVariant variant = productVariantRepository.findById(request.getVariantId())
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product variant not found"));

        if (variant.getProduct().getStatus() != ProductStatus.ACTIVE) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Product is no longer active");
        }

        int currentQtyInCart = cart.getItems().stream()
                .filter(i -> i.getVariant().getId().equals(variant.getId()))
                .mapToInt(CartItem::getQuantity)
                .sum();

        int availableQty = inventoryService.getAvailableQuantityForVariant(variant.getId());
        if (currentQtyInCart + request.getQuantity() > availableQty) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Not enough stock. Only " + availableQty + " items available.");
        }

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(i -> i.getVariant().getId().equals(variant.getId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
        } else {
            CartItem newItem = CartItem.builder()
                    .variant(variant)
                    .quantity(request.getQuantity())
                    .isSelected(false) 
                    .cart(cart) 
                    .build();
            cart.getItems().add(newItem);
        }

        cart = cartRepository.save(cart);
        CartResponse response = cartMapper.toCartResponse(cart);
        enrichCartData(response);

        // [CACHE]: Lưu đè Redis
        redisTemplate.opsForValue().set(REDIS_CART_KEY + userId, response, 7, TimeUnit.DAYS);

        // [AI TRACKING]: Bắn sự kiện ngầm cho hệ thống theo dõi hành vi
        // Chú ý: Bốc ID của bảng Product gốc ra thay vì Variant, vì thuật toán AI gợi ý Sản phẩm gốc.
        Long productId = variant.getProduct().getId();
        userEventService.logEventAsync(userId, productId, EventType.ADD_TO_CART, "{\"quantity\":" + request.getQuantity() + "}");

        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public CartResponse updateCartItem(UpdateCartItemRequest request) {
        if (request.getQuantity() == null || request.getQuantity() < 0) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Invalid quantity");
        }

        Long userId = SecurityUtils.getCurrentUserId();
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Cart is empty"));

        CartItem item = cart.getItems().stream()
                .filter(i -> i.getVariant().getId().equals(request.getVariantId()))
                .findFirst()
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Product not found in cart"));

        if (request.getQuantity() > 0) {
            int availableQty = inventoryService.getAvailableQuantityForVariant(request.getVariantId());
            if (request.getQuantity() > availableQty && Boolean.TRUE.equals(request.getIsSelected())) {
                throw new ApiException(ApiStatus.BAD_REQUEST, "Not enough stock. Only " + availableQty + " items available.");
            }
            item.setQuantity(request.getQuantity());
            item.setIsSelected(request.getIsSelected());
        } else {
            cart.getItems().remove(item);
            item.setCart(null); 
        }

        cart = cartRepository.save(cart);
        CartResponse response = cartMapper.toCartResponse(cart);
        enrichCartData(response);

        redisTemplate.opsForValue().set(REDIS_CART_KEY + userId, response, 7, TimeUnit.DAYS);

        return response;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void clearCart() {
        Long userId = SecurityUtils.getCurrentUserId();
        cartRepository.findByUserId(userId).ifPresent(cart -> {
            cart.getItems().forEach(item -> item.setCart(null));
            cart.getItems().clear();
            cartRepository.save(cart);
            log.info("User {} cleared cart", userId);

            redisTemplate.delete(REDIS_CART_KEY + userId);
        });
    }

    private void enrichCartData(CartResponse response) {
        if (response.getItems() == null || response.getItems().isEmpty()) {
            response.setTotalAmount(BigDecimal.ZERO);
            return;
        }

        BigDecimal calculatedTotal = BigDecimal.ZERO;

        for (var item : response.getItems()) {
            ProductVariant variant = productVariantRepository.findById(item.getVariantId()).orElse(null);
            int availableQty = inventoryService.getAvailableQuantityForVariant(item.getVariantId());
            
            item.setAvailableStock(availableQty);
            item.setIsAvailable(true);
            item.setWarningMessage(null);

            if (variant == null || variant.getProduct().getStatus() != ProductStatus.ACTIVE) {
                item.setIsAvailable(false);
                item.setWarningMessage("Product is no longer active");
            } 
            else if (item.getQuantity() > availableQty) {
                item.setIsAvailable(false);
                item.setWarningMessage("Quantity exceeds available stock (" + availableQty + ")");
            }
            if (Boolean.TRUE.equals(item.getIsSelected()) && Boolean.TRUE.equals(item.getIsAvailable())) {
                calculatedTotal = calculatedTotal.add(item.getSubTotal());
            }
        }
        response.setTotalAmount(calculatedTotal);
    }
}