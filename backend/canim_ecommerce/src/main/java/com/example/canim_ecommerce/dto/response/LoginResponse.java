package com.example.canim_ecommerce.dto.response;

import lombok.Data;

@Data
public class LoginResponse {
    private String token;
    private String username;
}