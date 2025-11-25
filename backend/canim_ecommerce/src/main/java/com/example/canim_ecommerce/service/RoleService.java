package com.example.canim_ecommerce.service;

import java.util.List;
import java.util.Optional;

import com.example.canim_ecommerce.dto.request.RoleRequest;
import com.example.canim_ecommerce.dto.response.RoleResponse;
import com.example.canim_ecommerce.entity.Role;

public interface RoleService {
    Optional<Role> findByName(String name);

    List<RoleResponse> getAllRoles();
    RoleResponse createRole(RoleRequest request);
    void deleteRole(Integer id);
}
