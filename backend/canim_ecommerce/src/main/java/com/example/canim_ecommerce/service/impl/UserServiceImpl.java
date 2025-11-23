package com.example.canim_ecommerce.service.impl;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.Entity.User;
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
}
