package com.example.canim_ecommerce.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.canim_ecommerce.Entity.User;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
}