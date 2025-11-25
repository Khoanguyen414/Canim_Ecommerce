package com.example.canim_ecommerce.service.impl;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Set;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.dto.request.AuthRequest;
import com.example.canim_ecommerce.dto.request.RefreshTokenRequest;
import com.example.canim_ecommerce.dto.request.RegisterRequest;
import com.example.canim_ecommerce.dto.response.AuthResponse;
import com.example.canim_ecommerce.entity.InvalidatedToken;
import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.repository.InvalidatedTokenRepository;
import com.example.canim_ecommerce.security.jwt.JwtTokenProvider;
import com.example.canim_ecommerce.service.AuthService;
import com.example.canim_ecommerce.service.RoleService;
import com.example.canim_ecommerce.service.UserService;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthServiceImpl implements AuthService {
    InvalidatedTokenRepository invalidatedTokenRepository;
    AuthenticationManager authenticationManager;
    JwtTokenProvider jwtTokenProvider;
    PasswordEncoder passwordEncoder;
    UserService userService;
    RoleService roleService;

    @Override
    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String accessToken = jwtTokenProvider.generateAccessToken(authentication.getName(),
                authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());

        String refreshToken = jwtTokenProvider.generateRefreshToken(authentication.getName());
        // String jti = jwtTokenProvider.getJti(refreshToken);

        return new AuthResponse(
                accessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenValiditySeconds(), // seconds
                "Bearer",
                authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList()
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

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        String refreshToken = request.getRefreshToken();
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Refresh token is required");
        }

        if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        String jti = jwtTokenProvider.getJti(refreshToken);
        if (jti != null && invalidatedTokenRepository.existsByToken(jti)) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Refresh token has been invalidated");
        }

        String email = jwtTokenProvider.getSubject(refreshToken);
        if (email == null) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Cannot extract subject from refresh token");
        }

        var user = userService.findWithRolesByEmail(email)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "User not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(user.getEmail(),
                user.getRoles().stream().map(r -> r.getName()).toList());

        return new AuthResponse(
                newAccessToken,
                refreshToken,
                jwtTokenProvider.getAccessTokenValiditySeconds(),
                "Bearer",
                user.getRoles().stream().map(r -> r.getName()).toList());
    }

    @Override
    public void logout(String refreshToken) {
        try {
            if (refreshToken == null || refreshToken.isBlank()) {
                throw new ApiException(ApiStatus.BAD_REQUEST, "Refresh token is required");
            }

            if (!jwtTokenProvider.validateRefreshToken(refreshToken)) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Invalid or expired refresh token");
            }

            SignedJWT signedJWT = SignedJWT.parse(refreshToken);
            var claims = signedJWT.getJWTClaimsSet();

            String jti = claims.getJWTID();
            if (jti == null || jti.isBlank()) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Refresh token missing jti");
            }

            Date issueTime = claims.getIssueTime();
            if (issueTime == null) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Refresh token missing iat");
            }

            Date expirationTime = claims.getExpirationTime();
            LocalDateTime expiry = expirationTime.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();

            if (invalidatedTokenRepository.existsByToken(jti)) {
                throw new ApiException(ApiStatus.BAD_REQUEST, "Token already invalidated");
            }

            InvalidatedToken invalidated = InvalidatedToken.builder()
                    .token(jti)
                    .expiredAt(expiry)
                    .build();

            invalidatedTokenRepository.save(invalidated);
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("logout error", e);
            throw new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "Logout failed: " + e.getMessage());
        }
    }
}
