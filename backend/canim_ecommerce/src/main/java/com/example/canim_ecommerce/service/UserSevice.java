package com.example.canim_ecommerce.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.Entity.User;
import com.example.canim_ecommerce.dto.request.UserCreatedRequest;
import com.example.canim_ecommerce.dto.response.UserResponse;
import com.example.canim_ecommerce.mapper.UserMapper;
import com.example.canim_ecommerce.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserSevice {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    public UserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        return userMapper.toUserResponse(user);
    }

    public UserResponse createUser(UserCreatedRequest request) {
        User user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .roles(request.getRoles())
                .build();

        return userMapper.toUserResponse(userRepository.save(user));
    }
}
