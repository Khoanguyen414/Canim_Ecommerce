package com.example.canim_ecommerce.service.impl;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.dto.request.AuthRequest;
import com.example.canim_ecommerce.dto.request.RegisterRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.AuthResponse;
import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.security.jwt.JwtTokenProvider;
import com.example.canim_ecommerce.service.AuthService;
import com.example.canim_ecommerce.service.RoleService;
import com.example.canim_ecommerce.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService{

    AuthenticationManager authenticationManager;
    JwtTokenProvider jwtTokenProvider;
    PasswordEncoder passwordEncoder;
    UserService userService;
    RoleService roleService;

    @Override
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getEmail(), 
                request.getPassword())
        );

        String accessToken = jwtTokenProvider.generateAccessToken(
            authentication.getName(), 
            authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList())
        );

        return new AuthResponse(
            accessToken,
            60 * 60,
            "Bearer",
            authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList()
        );
    }

    @Override
    public User register(RegisterRequest request) {
        if (userService.existsByEmail(request.getEmail())) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Email already exists!");
        }

        String encoderPassword = passwordEncoder.encode(request.getPassword());

        var roleUser = roleService.findByName("ROLE_USER")
            .orElseThrow(() -> new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "Default role ROLE_USER not found"));

        var user = User.builder()
            .email(request.getEmail())
            .fullName(request.getFullName())
            .password(encoderPassword)
            .roles(Set.of(roleUser))
            .active(true)
            .build();

        User newUser = userService.save(user);

        return newUser;
    }
}
