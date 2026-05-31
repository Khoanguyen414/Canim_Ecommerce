package com.example.canim_ecommerce.service.cart;

import com.example.canim_ecommerce.dto.request.cart.AddToCartRequest;
import com.example.canim_ecommerce.dto.request.cart.ToggleSelectionRequest;
import com.example.canim_ecommerce.dto.request.cart.UpdateCartItemRequest;
import com.example.canim_ecommerce.dto.response.CartResponse;

public interface CartService {
    
    CartResponse getMyCart();
    CartResponse addToCart(AddToCartRequest request);
    CartResponse updateCartItem(UpdateCartItemRequest request);
    CartResponse toggleItemSelection(ToggleSelectionRequest request);
    void clearCart();
    
}