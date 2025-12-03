package com.example.canim_ecommerce.service.impl;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.canim_ecommerce.dto.request.roles.RoleRequest;
import com.example.canim_ecommerce.dto.response.RoleResponse;
import com.example.canim_ecommerce.entity.Permission;
import com.example.canim_ecommerce.entity.Role;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.RoleMapper;
import com.example.canim_ecommerce.repository.PermissionRepository;
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
    PermissionRepository permisstionRepository;
    RoleMapper roleMapper;

    @Override
    public Optional<Role> findByName(String name) {
        return roleRepository.findByName(name);
    }

    @Override
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
            .map(roleMapper::toRoleResponse)
            .toList();
    }

    @Override
    public RoleResponse createRole(RoleRequest request) {
        Role role = roleMapper.toRole(request);

        if (request.getPermissionIds() != null && !request.getPermissionIds().isEmpty()) {
            List<Permission> permissions = permisstionRepository.findAllByIdIn(request.getPermissionIds());
            role.setPermissions(new HashSet<>(permissions));
        }

        return roleMapper.toRoleResponse(roleRepository.save(role));
    }

    @Override
    public void deleteRole(Integer id) {
        Role role = roleRepository.findById(id)
            .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Role not found"));

        roleRepository.delete(role);
    }


}
