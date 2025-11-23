package com.example.canim_ecommerce.service;

import java.util.Optional;

import com.example.canim_ecommerce.entity.Role;

public interface RoleService {
    Optional<Role> findByName(String name);
}
