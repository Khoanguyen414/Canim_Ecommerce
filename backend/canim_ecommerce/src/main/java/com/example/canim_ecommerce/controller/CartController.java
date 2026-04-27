package com.example.canim_ecommerce.controller;

import com.example.canim_ecommerce.dto.request.cart.AddToCartRequest;
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

    @PostMapping("/add")
    public ResponseEntity<CartResponse> addToCart(@Valid @RequestBody AddToCartRequest request) {
        CartResponse response = cartService.addToCart(request);
        return ResponseEntity.ok(response); 
    }

    @PutMapping("/update")
    public ResponseEntity<CartResponse> updateCartItem(@Valid @RequestBody UpdateCartItemRequest request) {
        CartResponse response = cartService.updateCartItem(request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<String> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok("Cleared cart successfully"); 
    }
}