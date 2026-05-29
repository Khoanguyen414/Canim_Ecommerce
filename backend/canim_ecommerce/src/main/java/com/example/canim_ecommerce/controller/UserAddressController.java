package com.example.canim_ecommerce.controller;

import java.util.List;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.canim_ecommerce.dto.request.address.CreateUserAddressRequest;
import com.example.canim_ecommerce.dto.request.address.UpdateUserAddressRequest;
import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.dto.response.UserAddressResponse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.service.UserAddressService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/user-addresses")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserAddressController {

    UserAddressService userAddressService;

    @GetMapping
    public ApiResponse<List<UserAddressResponse>> getMyAddresses() {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Get delivery addresses successfully",
                userAddressService.getMyAddresses());
    }

    @PostMapping
    public ApiResponse<UserAddressResponse> createMyAddress(
            @RequestBody @Validated CreateUserAddressRequest request) {
        return ApiResponse.success(
                ApiStatus.CREATED,
                "Create delivery address successfully",
                userAddressService.createMyAddress(request));
    }

    @PutMapping("/{addressId}")
    public ApiResponse<UserAddressResponse> updateMyAddress(
            @PathVariable Long addressId,
            @RequestBody @Validated UpdateUserAddressRequest request) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Update delivery address successfully",
                userAddressService.updateMyAddress(addressId, request));
    }

    @DeleteMapping("/{addressId}")
    public ApiResponse<Void> deleteMyAddress(@PathVariable Long addressId) {
        userAddressService.deleteMyAddress(addressId);
        return ApiResponse.success(ApiStatus.SUCCESS, "Delete delivery address successfully", null);
    }

    @PatchMapping("/{addressId}/default")
    public ApiResponse<UserAddressResponse> setDefaultAddress(@PathVariable Long addressId) {
        return ApiResponse.success(
                ApiStatus.SUCCESS,
                "Set default delivery address successfully",
                userAddressService.setDefaultAddress(addressId));
    }
}
