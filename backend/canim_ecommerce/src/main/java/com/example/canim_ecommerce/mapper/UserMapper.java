package com.example.canim_ecommerce.mapper;

import org.mapstruct.Mapper;

import com.example.canim_ecommerce.Entity.User;
import com.example.canim_ecommerce.dto.request.UserCreatedRequest;
import com.example.canim_ecommerce.dto.response.UserResponse;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toUser(UserCreatedRequest userCreatedRequest);
    UserResponse toUserResponse(User user);  
}