package com.example.canim_ecommerce.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.dto.request.UserCreatedRequest;
import com.example.canim_ecommerce.dto.response.UserResponse;
import com.example.canim_ecommerce.service.UserSevice;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserSevice userSevice;

    @PostMapping
    UserResponse createUser(@RequestBody UserCreatedRequest request) {
        return userSevice.createUser(request);
    }
}