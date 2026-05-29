package com.example.canim_ecommerce.service.auth;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.Getter;
import lombok.Setter;

@Component
public class GoogleIdTokenVerifier {
    static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<>() {
    };

    @Value("${google.oauth.client-id:}")
    String clientId;

    final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();
    final ObjectMapper objectMapper = new ObjectMapper();

    public GoogleUserInfo verify(String idToken) {
        if (!StringUtils.hasText(idToken)) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Google ID token is required");
        }
        if (!StringUtils.hasText(clientId)) {
            throw new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "Google OAuth client ID is not configured");
        }

        try {
            String encodedToken = URLEncoder.encode(idToken, StandardCharsets.UTF_8);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodedToken))
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Invalid Google ID token");
            }

            Map<String, Object> claims = objectMapper.readValue(response.body(), MAP_TYPE);
            String audience = stringClaim(claims.get("aud"));
            if (!clientId.equals(audience)) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Google ID token audience mismatch");
            }

            long expiresAt = longClaim(claims.get("exp"));
            if (expiresAt > 0 && Instant.now().getEpochSecond() >= expiresAt) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Google ID token has expired");
            }

            String email = stringClaim(claims.get("email"));
            if (!StringUtils.hasText(email)) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Google account email is missing");
            }

            boolean emailVerified = "true".equalsIgnoreCase(stringClaim(claims.get("email_verified")));
            if (!emailVerified) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Google account email is not verified");
            }

            String subjectId = stringClaim(claims.get("sub"));
            if (!StringUtils.hasText(subjectId)) {
                throw new ApiException(ApiStatus.UNAUTHORIZED, "Google subject ID is missing");
            }

            GoogleUserInfo info = new GoogleUserInfo();
            info.setEmail(email.toLowerCase());
            info.setFullName(stringClaim(claims.get("name")));
            info.setAvatarUrl(stringClaim(claims.get("picture")));
            info.setGoogleSubjectId(subjectId);
            info.setEmailVerified(true);
            return info;
        } catch (ApiException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new ApiException(ApiStatus.UNAUTHORIZED, "Cannot verify Google ID token");
        }
    }

    private String stringClaim(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private long longClaim(Object value) {
        try {
            return Long.parseLong(stringClaim(value));
        } catch (NumberFormatException exception) {
            return 0L;
        }
    }

    @Getter
    @Setter
    public static class GoogleUserInfo {
        String email;
        String fullName;
        String avatarUrl;
        String googleSubjectId;
        boolean emailVerified;
    }
}
