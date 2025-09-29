package com.example.canim_ecommerce.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.dto.request.UserCreateRequest;
import com.example.canim_ecommerce.dto.request.UserUpdateRequest;
import com.example.canim_ecommerce.dto.response.UserResponse;
import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.mapper.UserMapper;
import com.example.canim_ecommerce.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
            .stream()
            .map(userMapper::toUserResponse)
            .toList();
    }

    public UserResponse getOneUser(String userId) {
        return userMapper.toUserResponse(
            userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found.")));
    }

    public UserResponse createUser(UserCreateRequest userCreateRequest) {
        User user = userMapper.toUser(userCreateRequest);
        return userMapper.toUserResponse(userRepository.save(user));
    }

    public UserResponse updateUser(String userId, UserUpdateRequest userUpdateRequest) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found."));
        userMapper.updateUser(user, userUpdateRequest);
        return userMapper.toUserResponse(userRepository.save(user));
    }
}
