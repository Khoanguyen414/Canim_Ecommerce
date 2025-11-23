package com.example.canim_ecommerce.service.impl;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.Entity.Role;
import com.example.canim_ecommerce.repository.RoleRepository;
import com.example.canim_ecommerce.service.RoleService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleServiceImpl implements RoleService{
    RoleRepository roleRepository;

    @Override
    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }

}
