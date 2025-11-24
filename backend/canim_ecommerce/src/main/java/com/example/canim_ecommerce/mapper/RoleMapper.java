package com.example.canim_ecommerce.mapper;

import org.mapstruct.Mapper;

import com.example.canim_ecommerce.entity.Role;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    default String toName(Role role) {
        return role != null ? role.getName() : null;
    }
}
