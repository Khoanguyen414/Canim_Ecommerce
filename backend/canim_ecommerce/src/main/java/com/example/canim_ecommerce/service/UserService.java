package com.example.canim_ecommerce.service;

import java.util.List;
import java.util.Optional;

import com.example.canim_ecommerce.dto.request.user.UserCreationRequest;
import com.example.canim_ecommerce.dto.request.user.UserProfileRequest;
import com.example.canim_ecommerce.dto.request.user.UserUpdateRequest;
import com.example.canim_ecommerce.dto.response.UserResponse;
import com.example.canim_ecommerce.entity.User;

public interface UserService {
    Optional<User> findByEmail(String email);
    Optional<User> findWithRolesByEmail(String email);
    User save(User user);
    boolean existsByEmail(String email);

    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse createUserByAdmin(UserCreationRequest request);
    UserResponse updateUser(Long id, UserUpdateRequest request);
    void deleteUser(Long id);

    UserResponse getMyProfile();
    UserResponse updateMyProfile(UserProfileRequest request);
}
