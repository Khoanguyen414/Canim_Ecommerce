package com.example.canim_ecommerce.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.dto.request.users.UserCreationRequest;
import com.example.canim_ecommerce.dto.request.users.UserProfileRequest;
import com.example.canim_ecommerce.dto.request.users.UserUpdateRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.UserResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
    UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<List<UserResponse>> getAllUsers() {
        var users = userService.getAllUsers();
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Get all users successfully", 
            users
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<UserResponse> getUserById(@PathVariable Long id) {
        var user = userService.getUserById(id);
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Get user detail successfully",
            user
        );
    }

    @GetMapping("/me")
    public  ApiResponse<UserResponse> getMyProfile() {
        var myProfile = userService.getMyProfile();
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Get my profile successfully", 
            myProfile
        );
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<UserResponse> createUser(@RequestBody @Validated UserCreationRequest request) {
        var newUser = userService.createUserByAdmin(request);
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Create user successfully", 
            newUser
        );
    }

    @PutMapping("/me")
    public ApiResponse<UserResponse> putMethodName(@RequestBody UserProfileRequest request) {
        var updateProfile = userService.updateMyProfile(request);        
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Update profile successfully",
            updateProfile
        );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<UserResponse> updateUser(@PathVariable Long id, @RequestBody UserUpdateRequest request) {
        var updateUser = userService.updateUser(id, request);
        return ApiResponse.success(
            ApiStatus.SUCCESS,
            "Update user successfully", 
            updateUser
        );
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.success(
            ApiStatus.SUCCESS, 
            "Delete user successfully",
            null
        );
    }
}
