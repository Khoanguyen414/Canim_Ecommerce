package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.auths.AuthRequest;
import com.example.canim_ecommerce.dto.request.auths.RefreshTokenRequest;
import com.example.canim_ecommerce.dto.request.auths.RegisterRequest;
import com.example.canim_ecommerce.dto.response.AuthResponse;
import com.example.canim_ecommerce.entity.User;

public interface AuthService {
    AuthResponse login(AuthRequest request);
    User register(RegisterRequest request);
    AuthResponse refreshToken(RefreshTokenRequest request);
    void logout(String refreshToken);
}
