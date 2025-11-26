package com.example.canim_ecommerce.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.dto.request.UserCreationRequest;
import com.example.canim_ecommerce.dto.request.UserProfileRequest;
import com.example.canim_ecommerce.dto.request.UserUpdateRequest;
import com.example.canim_ecommerce.dto.response.UserResponse;
import com.example.canim_ecommerce.entity.Role;
import com.example.canim_ecommerce.entity.User;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.UserMapper;
import com.example.canim_ecommerce.repository.RoleRepository;
import com.example.canim_ecommerce.repository.UserRepository;
import com.example.canim_ecommerce.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
    RoleRepository roleRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;

    @Override
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public Optional<User> findWithRolesByEmail(String email) {
        return userRepository.findWithRolesByEmail(email);
    }

    @Override
    public User save(User user) {
        return userRepository.save(user);
    }

    @Override
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }



    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
            .map(userMapper::toUserResponse)
            .toList();
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "User not found"));
        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse getMyProfile() {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "User not found with email: " + email));

        return userMapper.toUserResponse(user);
    }

    @Override
    public UserResponse createUserByAdmin(UserCreationRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(ApiStatus.BAD_REQUEST, "Email already exists");
        }

        User user = userMapper.toUser(request);

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActive(true);

        Set<Role> roles = new HashSet<>();
        if (request.getRoles() != null && !request.getRoles().isEmpty()) {
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ApiException(ApiStatus.BAD_REQUEST, "Role not found: " + roleName));
                roles.add(role);
            }
        } else {
            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseThrow(() -> new ApiException(ApiStatus.INTERNAL_SERVER_ERROR, "ROLE_USER not found"));
            roles.add(userRole);
        }
        user.setRoles(roles);

        return userMapper.toUserResponse(save(user));
    }

    @Override
    public UserResponse updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "User not found"));

        userMapper.updateUser(user, request);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getRoles() != null) {
            Set<Role> roles = new HashSet<>();
            for (String roleName : request.getRoles()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new ApiException(ApiStatus.BAD_REQUEST, "Role not found: " + roleName));
                roles.add(role);
            }
            user.setRoles(roles);
        }
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public UserResponse updateMyProfile(UserProfileRequest request) {
        var context = SecurityContextHolder.getContext();
        String email = context.getAuthentication().getName();

        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "User not found with email: " + email));

        userMapper.updateUserProfile(user, request);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "User not found"));
        
        user.setActive(false);
        userRepository.save(user);
    }
}
