package com.example.canim_ecommerce.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.dto.request.auth.AuthRequest;
import com.example.canim_ecommerce.dto.request.auth.ForgotPasswordRequest;
import com.example.canim_ecommerce.dto.request.auth.GoogleLoginRequest;
import com.example.canim_ecommerce.dto.request.auth.RefreshTokenRequest;
import com.example.canim_ecommerce.dto.request.auth.RegisterRequest;
import com.example.canim_ecommerce.dto.request.auth.ResetPasswordRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.AuthResponse;
import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.service.AuthService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;


@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthController {

    AuthService authService;

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Validated @RequestBody AuthRequest request) {
        var auth = authService.login(request);
        return ApiResponse.success(ApiStatus.SUCCESS, "Login successfully", auth);
    }

    @PostMapping("/google")
    public ApiResponse<AuthResponse> googleLogin(@Validated @RequestBody GoogleLoginRequest request) {
        var auth = authService.googleLogin(request);
        return ApiResponse.success(ApiStatus.SUCCESS, "Login successfully", auth);
    }

    @PostMapping("/forgot-password")
    public ApiResponse<Void> forgotPassword(@Validated @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Password reset instructions have been sent if the email exists",
                null);
    }

    @PostMapping("/reset-password")
    public ApiResponse<Void> resetPassword(@Validated @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ApiResponse.success(ApiStatus.SUCCESS, "Password reset successfully", null);
    }

    @PostMapping("/register")
    public ApiResponse<User> register(@Validated @RequestBody RegisterRequest request) {
        var user = authService.register(request);
        return ApiResponse.success(ApiStatus.SUCCESS, "Register successfully", user);
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestHeader("Authorization") String authorizationHeader) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Missing or invalid Authorization header");
        }

        String refreshToken = authorizationHeader.substring(7);

        authService.logout(refreshToken);

        return ApiResponse.success(ApiStatus.SUCCESS, "Logout successfully", null);
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refresh(@Validated @RequestBody RefreshTokenRequest request) {

        var auth = authService.refreshToken(request);

        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Refresh token successfully",
            auth
        );
    }
}
