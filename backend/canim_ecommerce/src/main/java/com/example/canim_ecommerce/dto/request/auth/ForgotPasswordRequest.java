package com.example.canim_ecommerce.dto.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @Email(message = "Email is invalid")
    @NotBlank(message = "Email is required")
    String email;
}
