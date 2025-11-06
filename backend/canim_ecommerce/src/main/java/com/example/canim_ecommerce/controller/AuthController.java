package com.example.canim_ecommerce.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.dto.request.AuthRequest;
import com.example.canim_ecommerce.dto.request.RegisterRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.AuthResponse;
import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.AuthService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {

    AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Validated @RequestBody AuthRequest request) {
        var auth = authService.login(request);
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Login successfully", 
            auth
        );
    }
    
    @PostMapping("/register")
    public ApiResponse<User> register(@Validated @RequestBody RegisterRequest request) {
        var user = authService.register(request);
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Register successfully", 
            user
        );
    }
}
