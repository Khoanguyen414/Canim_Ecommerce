package com.example.canim_ecommerce.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.canim_ecommerce.dto.request.UserCreationRequest;
import com.example.canim_ecommerce.dto.response.UserResponse;
import com.example.canim_ecommerce.entity.User;

@Mapper(componentModel = "spring", uses = {RoleMapper.class})
public interface UserMapper {
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password", ignore = true) 
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toUser(UserCreationRequest request); 

    UserResponse toUserResponse(User user); 
}