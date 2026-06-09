package com.example.canim_ecommerce.config;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SecurityConfig {

    @Value("${security.jwt.secret}")
    String secretkey;

    /*
     * CORS production:
     * - Ưu tiên app.cors.allowed-origin-patterns nếu có trong application.properties.
     * - Nếu không có thì đọc biến môi trường CORS_ALLOWED_ORIGINS trên Railway.
     * - Nếu cả hai không có thì fallback localhost để chạy local.
     */
    @Value("${app.cors.allowed-origin-patterns:${CORS_ALLOWED_ORIGINS:https://canim-shop.netlify.app,https://admin-frontend-production-9153.up.railway.app,http://localhost:*,http://127.0.0.1:*}}")
    String corsAllowedOriginPatterns;

    String[] PUBLIC_ENDPOINTS = {
            "/actuator/health",
            "/actuator/health/**",

            "/auth/**",

            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",

            "/categories/**",
            "/products/**",
            "/uploads/**",

            "/payments/vnpay/return",
            "/payments/vnpay/ipn",
            "/payments/momo/return",
            "/payments/momo/notify",
            "/payments/personal-qr/config"
    };

    String[] PUBLIC_AI_PRODUCT_CONTEXT_ENDPOINTS = {
            "/ai/products/context",
            "/ai/product-contexts/available"
    };

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKeySpec =
                new SecretKeySpec(secretkey.getBytes(), "HS512");

        return NimbusJwtDecoder
                .withSecretKey(secretKeySpec)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    @Bean
    AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig
    ) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter =
                new JwtGrantedAuthoritiesConverter();

        grantedAuthoritiesConverter.setAuthorityPrefix("");
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");

        JwtAuthenticationConverter converter =
                new JwtAuthenticationConverter();

        converter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);

        return converter;
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        List<String> originPatterns = Arrays.stream(corsAllowedOriginPatterns.split(","))
                .map(String::trim)
                .filter(pattern -> !pattern.isEmpty())
                .collect(Collectors.toList());

        /*
         * Dùng allowedOriginPatterns thay vì allowedOrigins
         * để hỗ trợ pattern local như:
         * http://localhost:*
         * http://127.0.0.1:*
         */
        config.setAllowedOriginPatterns(originPatterns);

        config.setAllowedMethods(List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
        ));

        config.setAllowedHeaders(List.of("*"));

        /*
         * Authorization: cho JWT token.
         * Content-Disposition: hỗ trợ export Excel/tải file đọc được filename.
         */
        config.setExposedHeaders(List.of(
                "Authorization",
                "Content-Disposition"
        ));

        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", config);

        return source;
    }

    /*
     * Ép CORS chạy trước Spring Security/JWT.
     * Đây là phần quan trọng để fix lỗi:
     * No 'Access-Control-Allow-Origin' header is present.
     */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    CorsFilter corsFilter() {
        return new CorsFilter(corsConfigurationSource());
    }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        /*
                         * Browser sẽ gửi OPTIONS trước các request như:
                         * POST /auth/login
                         * GET /products/public
                         *
                         * Nếu không permit OPTIONS, request thật sẽ bị chặn preflight CORS.
                         */
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        /*
                         * Public endpoint cho Python AI lấy dữ liệu sản phẩm.
                         * Endpoint cũ: /ai/products/context
                         * Endpoint alias mới: /ai/product-contexts/available
                         */
                        .requestMatchers(HttpMethod.GET, PUBLIC_AI_PRODUCT_CONTEXT_ENDPOINTS).permitAll()

                        /*
                         * Các endpoint public cho khách xem shop, login, sản phẩm, danh mục.
                         */
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

                        /*
                         * Các API còn lại yêu cầu đăng nhập/JWT.
                         */
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder())
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );

        return http.build();
    }
}