package com.example.canim_ecommerce.service;

import java.util.List;
import java.util.Optional;

import com.example.canim_ecommerce.dto.request.address.CreateUserAddressRequest;
import com.example.canim_ecommerce.dto.request.address.UpdateUserAddressRequest;
import com.example.canim_ecommerce.dto.response.UserAddressResponse;
import com.example.canim_ecommerce.entity.UserAddress;

public interface UserAddressService {

    List<UserAddressResponse> getMyAddresses();

    UserAddressResponse createMyAddress(CreateUserAddressRequest request);

    UserAddressResponse updateMyAddress(Long addressId, UpdateUserAddressRequest request);

    void deleteMyAddress(Long addressId);

    UserAddressResponse setDefaultAddress(Long addressId);

    Optional<UserAddress> getDefaultAddressEntity(Long userId);

    UserAddress getAddressEntityForCheckout(Long addressId, Long userId);
}
