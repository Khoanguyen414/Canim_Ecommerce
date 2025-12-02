package com.example.canim_ecommerce.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.canim_ecommerce.dto.request.role.RoleRequest;
import com.example.canim_ecommerce.dto.response.RoleResponse;
import com.example.canim_ecommerce.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    default String toName(Role role) {
        return role != null ? role.getName() : null;
    }

    RoleResponse toRoleResponse(Role role);

    @Mapping(target = "permissions", ignore = true)
    @Mapping(target = "id", ignore = true)
    Role toRole(RoleRequest request);
}
