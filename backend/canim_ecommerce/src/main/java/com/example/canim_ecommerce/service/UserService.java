package com.example.canim_ecommerce.service;

import java.util.Optional;

import com.example.canim_ecommerce.Entity.User;



public interface UserService {
    Optional<User> findByEmail(String email);
    Optional<User> findWithRolesByEmail(String email);
    User save(User user);
    boolean existsByEmail(String email);
}
