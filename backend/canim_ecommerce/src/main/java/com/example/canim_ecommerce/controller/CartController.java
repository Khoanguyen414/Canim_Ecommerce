package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.cart.AddToCartRequest;
import com.example.canim_ecommerce.dto.request.cart.ToggleSelectionRequest;
import com.example.canim_ecommerce.dto.request.cart.UpdateCartItemRequest;
import com.example.canim_ecommerce.dto.response.CartResponse;
import com.example.canim_ecommerce.service.CartService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/carts") 
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CartController {

    CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getMyCart() {
        CartResponse response = cartService.getMyCart();
        return ResponseEntity.ok(response);
    }
    @PostMapping("/items")
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody AddToCartRequest request) {
        CartResponse response = cartService.addToCart(request);
        return ResponseEntity.ok(response); 
    }
    @PutMapping("/items")
    public ResponseEntity<CartResponse> updateCartItem(@Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse response = cartService.updateCartItem(request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/selection")
    public ResponseEntity<CartResponse> toggleSelection(@Valid @RequestBody ToggleSelectionRequest request) {
        CartResponse response = cartService.toggleItemSelection(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/items/{variantId}")
    public ResponseEntity<CartResponse> removeCartItem(@PathVariable Long variantId) {
        CartResponse response = cartService.removeCartItem(variantId);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping
    public ResponseEntity<String> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok("Cleared cart successfully"); 
    }
}