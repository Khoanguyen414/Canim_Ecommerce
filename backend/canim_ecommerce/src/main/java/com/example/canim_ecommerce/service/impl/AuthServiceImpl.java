package com.example.canim_ecommerce.service.impl;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.Entity.InvalidatedToken;
import com.example.canim_ecommerce.Entity.User;
import com.example.canim_ecommerce.dto.request.AuthRequest;
import com.example.canim_ecommerce.dto.request.RefreshTokenRequest;
import com.example.canim_ecommerce.dto.request.RegisterRequest;
import com.example.canim_ecommerce.dto.response.AuthResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.repository.InvalidatedTokenRepository;
import com.example.canim_ecommerce.security.jwt.JwtTokenProvider;
import com.example.canim_ecommerce.service.AuthService;
import com.example.canim_ecommerce.service.RoleService;
import com.example.canim_ecommerce.service.UserService;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthServiceImpl implements AuthService{
    InvalidatedTokenRepository invalidatedTokenRepository;
    AuthenticationManager authenticationManager;
    JwtTokenProvider jwtTokenProvider;
    PasswordEncoder passwordEncoder;
    UserService userService;
    RoleService roleService;

    SignedJWT verifyToken(String token, boolean isRefresh) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(jwtTokenProvider.getSecret().getBytes());

            if (!signedJWT.verify(verifier)) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Invalid token signature");
            }

            var claims = signedJWT.getJWTClaimsSet();

            Date now = new Date();

            Date issueTime = claims.getIssueTime();
            Date claimExp = claims.getExpirationTime();

            Date expiration;
            if (isRefresh) {
                if (issueTime == null) {
                    throw new ApiException(ApiStatus.UNAUTHORIZED, "Refresh token missing iat");
                }
                var expiryInstant = issueTime.toInstant().plusMillis(jwtTokenProvider.getRefreshTokenValidityMillis());
                expiration = Date.from(expiryInstant);
            } else {
                if (claimExp == null) {
                    throw new ApiException(ApiStatus.UNAUTHORIZED, "Token missing exp");
                }
                expiration = claimExp;
            }

            if (expiration.before(now)) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Token expired");
            }

            String jti = claims.getJWTID();
            if (jti != null && invalidatedTokenRepository.existsByToken(jti)) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Token has been invalidated");
            }

            return signedJWT;

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Token verification failed: " + e.getMessage());
        }
    }

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
            (long) jwtTokenProvider.getAccessTokenValiditySeconds(),
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

    @Override
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        var signedJWT = verifyToken(request.getRefreshToken(), true);

        String email = null;
        try {
            email = signedJWT.getJWTClaimsSet().getSubject();
        } catch (Exception e) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Cannot extract email from token");
        }

        var user = userService.findWithRolesByEmail(email)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "User not found"));

        String newAccessToken = jwtTokenProvider.generateAccessToken(
            user.getEmail(), 
            user.getRoles().stream().map(r -> r.getName()).toList()
        );

        return new AuthResponse(
            newAccessToken,
            (long) jwtTokenProvider.getAccessTokenValiditySeconds(),
            "Bearer",
            user.getRoles().stream().map(r -> r.getName()).toList()
        );
    }

    @Override
    public void logout(String refreshToken) {
    try {
        SignedJWT signedJWT = verifyToken(refreshToken, true);

        var claims = signedJWT.getJWTClaimsSet();

        String jwtId = claims.getJWTID();
        if (jwtId == null) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Token missing jti");
        }

        LocalDateTime expiry = claims.getExpirationTime()
                .toInstant()
                .atZone(ZoneId.systemDefault())
                .toLocalDateTime();

        if (invalidatedTokenRepository.existsByToken(jwtId)) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Token already invalidated");
        }

        InvalidatedToken invalidated = InvalidatedToken.builder()
                .token(jwtId)
                .expiryTime(expiry)
                .build();

        invalidatedTokenRepository.save(invalidated);

        } catch (ApiException e) {
            throw e; 
        } catch (Exception e) {
            throw new ApiException(ApiStatus.INTERNAL_SERVER_ERROR,
                    "Logout failed: " + e.getMessage());
        }
    }
}