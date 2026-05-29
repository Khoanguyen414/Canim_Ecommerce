package com.example.canim_ecommerce.dto.request.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class GoogleLoginRequest {
    @NotBlank(message = "Google ID token is required")
    String idToken;
}
