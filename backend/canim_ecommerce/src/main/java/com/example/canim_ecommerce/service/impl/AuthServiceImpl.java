package com.example.canim_ecommerce.service.impl;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.canim_ecommerce.dto.request.auth.AuthRequest;
import com.example.canim_ecommerce.dto.request.auth.ForgotPasswordRequest;
import com.example.canim_ecommerce.dto.request.auth.GoogleLoginRequest;
import com.example.canim_ecommerce.dto.request.auth.RefreshTokenRequest;
import com.example.canim_ecommerce.dto.request.auth.RegisterRequest;
import com.example.canim_ecommerce.dto.request.auth.ResetPasswordRequest;
import com.example.canim_ecommerce.dto.response.AuthResponse;
import com.example.canim_ecommerce.entity.InvalidatedToken;
import com.example.canim_ecommerce.entity.PasswordResetToken;
import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.enums.AuthProvider;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.repository.InvalidatedTokenRepository;
import com.example.canim_ecommerce.repository.PasswordResetTokenRepository;
import com.example.canim_ecommerce.repository.UserRepository;
import com.example.canim_ecommerce.security.jwt.JwtTokenProvider;
import com.example.canim_ecommerce.service.AuthService;
import com.example.canim_ecommerce.service.RoleService;
import com.example.canim_ecommerce.service.UserService;
import com.example.canim_ecommerce.service.auth.GoogleIdTokenVerifier;
import com.example.canim_ecommerce.service.auth.GoogleIdTokenVerifier.GoogleUserInfo;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AuthServiceImpl implements AuthService {
    InvalidatedTokenRepository invalidatedTokenRepository;
    PasswordResetTokenRepository passwordResetTokenRepository;
    UserRepository userRepository;
    AuthenticationManager authenticationManager;
    JwtTokenProvider jwtTokenProvider;
    PasswordEncoder passwordEncoder;
    UserService userService;
    RoleService roleService;
    GoogleIdTokenVerifier googleIdTokenVerifier;

    @NonFinal
    @Value("${app.password-reset.base-url:http://localhost:5173/reset-password}")
    String passwordResetBaseUrl;

    @NonFinal
    @Value("${app.password-reset.expiration-minutes:30}")
    int passwordResetExpirationMinutes;

    @Override
    public AuthResponse login(AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            return issueTokens(
                    authentication.getName(),
                    authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).toList());
        } catch (BadCredentialsException exception) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Invalid email or password");
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public AuthResponse googleLogin(GoogleLoginRequest request) {
        GoogleUserInfo googleUser = googleIdTokenVerifier.verify(request.getIdToken());

        User user = userRepository.findByGoogleSubjectId(googleUser.getGoogleSubjectId())
                .map(found -> userService.findWithRolesByEmail(found.getEmail()).orElse(found))
                .or(() -> userService.findWithRolesByEmail(googleUser.getEmail()))
                .orElse(null);

        if (user != null) {
            if (!Boolean.TRUE.equals(user.getActive())) {
                throw new ApiException(ApiStatus.FORBIDDEN, "User account is inactive");
            }
            applyGoogleProfile(user, googleUser);
            user = userRepository.save(user);
            return issueTokensForUser(user);
        }

        var roleUser = roleService.findByName("ROLE_USER")
                .orElseThrow(() -> new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "Default role ROLE_USER not found"));

        User newUser = User.builder()
                .email(googleUser.getEmail())
                .fullName(StringUtils.hasText(googleUser.getFullName()) ? googleUser.getFullName() : googleUser.getEmail())
                .password(passwordEncoder.encode(generateUnusablePassword()))
                .authProvider(AuthProvider.GOOGLE)
                .googleSubjectId(googleUser.getGoogleSubjectId())
                .avatarUrl(googleUser.getAvatarUrl())
                .emailVerified(true)
                .active(true)
                .roles(Set.of(roleUser))
                .build();

        newUser = userRepository.save(newUser);
        return issueTokensForUser(newUser);
    }

    @Override
    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail().trim().toLowerCase()).ifPresent(user -> {
            passwordResetTokenRepository.deleteByUser_IdAndUsedAtIsNullAndExpiresAtAfter(
                    user.getId(), LocalDateTime.now());

            String rawToken = generateResetToken();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .tokenHash(hashResetToken(rawToken))
                    .expiresAt(LocalDateTime.now().plusMinutes(passwordResetExpirationMinutes))
                    .build();
            passwordResetTokenRepository.save(resetToken);

            String resetLink = passwordResetBaseUrl + "?token=" + rawToken;
            log.info("Password reset link for {} (dev only): {}", user.getEmail(), resetLink);
        });
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "New password and confirmation do not match");
        }

        String tokenHash = hashResetToken(request.getToken());
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new ApiException(ApiStatus.BAD_REQUEST, "Invalid or expired reset token"));

        if (resetToken.getUsedAt() != null) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Reset token has already been used");
        }
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Invalid or expired reset token");
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        if (user.getAuthProvider() == AuthProvider.GOOGLE) {
            user.setAuthProvider(AuthProvider.LOCAL);
        }
        userRepository.save(user);

        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);
    }

    @Override
    @Transactional
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
                .phone(request.getPhone())
                .authProvider(AuthProvider.LOCAL)
                .emailVerified(false)
                .roles(Set.of(roleUser))
                .active(true)
                .build();
        return userService.save(user);
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

        return issueTokensForUser(user);
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
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            log.error("logout error", exception);
            throw new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "Logout failed: " + exception.getMessage());
        }
    }

    private void applyGoogleProfile(User user, GoogleUserInfo googleUser) {
        user.setGoogleSubjectId(googleUser.getGoogleSubjectId());
        user.setEmailVerified(true);
        if (StringUtils.hasText(googleUser.getFullName())) {
            user.setFullName(googleUser.getFullName());
        }
        if (StringUtils.hasText(googleUser.getAvatarUrl())) {
            user.setAvatarUrl(googleUser.getAvatarUrl());
        }
    }

    private AuthResponse issueTokensForUser(User user) {
        List<String> roles = user.getRoles().stream().map(role -> role.getName()).toList();
        return issueTokens(user.getEmail(), roles);
    }

    private AuthResponse issueTokens(String subject, List<String> roles) {
        String accessToken = jwtTokenProvider.generateAccessToken(subject, roles);
        String refreshToken = jwtTokenProvider.generateRefreshToken(subject);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(jwtTokenProvider.getAccessTokenValiditySeconds())
                .tokenType("Bearer")
                .roles(roles)
                .build();
    }

    private String generateUnusablePassword() {
        return UUID.randomUUID() + "-" + UUID.randomUUID();
    }

    private String generateResetToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashResetToken(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception exception) {
            throw new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "Cannot hash reset token");
        }
    }
}
