package com.example.canim_ecommerce.repository;


import org.springframework.data.jpa.repository.JpaRepository;

import com.example.canim_ecommerce.Entity.Permission;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    boolean existsByNamePermission(String namePermission);
}