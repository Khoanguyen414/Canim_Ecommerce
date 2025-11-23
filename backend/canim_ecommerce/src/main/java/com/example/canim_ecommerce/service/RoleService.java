package com.example.canim_ecommerce.service;

import java.util.Optional;

import com.example.canim_ecommerce.Entity.Role;



public interface RoleService {
    Optional<Role> findByName(String name);
}
