package com.example.canim_ecommerce.utils;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.repository.UserRepository;

import lombok.AccessLevel;
import lombok.experimental.FieldDefaults;

@Component
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SecurityUtils {
    static UserRepository userRepository;

    public SecurityUtils(UserRepository userRepository) {
        SecurityUtils.userRepository = userRepository;
    }

    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || authentication.getPrincipal().equals("anonymousUser")) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Session expired or not logged in.");
        }

        String email = null;

        if (authentication.getPrincipal() instanceof Jwt) {
            Jwt jwt = (Jwt) authentication.getPrincipal();
            email = jwt.getSubject();
        } else if (authentication.getName() != null) {
            email = authentication.getName();
        }

        if (email == null) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Unable to extract user information from token.");
        }

        final String userEmail = email;

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Không tìm thấy dữ liệu nhân viên với email: " + userEmail));

        return user.getId();
    }
}
