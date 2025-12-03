package com.example.canim_ecommerce.mapper;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.canim_ecommerce.dto.request.users.UserCreationRequest;
import com.example.canim_ecommerce.dto.request.users.UserProfileRequest;
import com.example.canim_ecommerce.dto.request.users.UserUpdateRequest;
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

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE) 
    @Mapping(target = "roles", ignore = true)   
    @Mapping(target = "password", ignore = true) 
    @Mapping(target = "id", ignore = true) 
    @Mapping(target = "email", ignore = true) 
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE) 
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "email", ignore = true)   
    @Mapping(target = "password", ignore = true)  
    @Mapping(target = "roles", ignore = true)   
    @Mapping(target = "active", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateUserProfile(@MappingTarget User user, UserProfileRequest request);
}