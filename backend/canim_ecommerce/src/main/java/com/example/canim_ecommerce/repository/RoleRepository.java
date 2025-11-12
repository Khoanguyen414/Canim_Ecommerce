package com.example.canim_ecommerce.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.canim_ecommerce.Entity.Role;

public interface RoleRepository extends JpaRepository<Role, Long> {
    boolean existsByNameRole(String nameRole);
}
