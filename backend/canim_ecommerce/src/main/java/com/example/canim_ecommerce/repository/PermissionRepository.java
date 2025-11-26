package com.example.canim_ecommerce.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.canim_ecommerce.entity.Permission;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Integer>{
    List<Permission> findAllByIdIn(List<Integer> ids);
}
