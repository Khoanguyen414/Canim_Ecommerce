package com.example.canim_ecommerce.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.example.canim_ecommerce.dto.response.UserAddressResponse;
import com.example.canim_ecommerce.entity.UserAddress;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserAddressMapper {

    UserAddressResponse toResponse(UserAddress address);
}
