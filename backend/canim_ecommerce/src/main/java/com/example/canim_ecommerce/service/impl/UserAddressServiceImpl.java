package com.example.canim_ecommerce.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.canim_ecommerce.dto.request.address.CreateUserAddressRequest;
import com.example.canim_ecommerce.dto.request.address.UpdateUserAddressRequest;
import com.example.canim_ecommerce.dto.response.UserAddressResponse;
import com.example.canim_ecommerce.entity.UserAddress;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.UserAddressMapper;
import com.example.canim_ecommerce.repository.UserAddressRepository;
import com.example.canim_ecommerce.service.UserAddressService;
import com.example.canim_ecommerce.utils.SecurityUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserAddressServiceImpl implements UserAddressService {

    UserAddressRepository userAddressRepository;
    UserAddressMapper userAddressMapper;

    @Override
    @Transactional(readOnly = true)
    public List<UserAddressResponse> getMyAddresses() {
        Long userId = SecurityUtils.getCurrentUserId();
        return userAddressRepository.findByUserIdAndIsDeletedFalseOrderByIsDefaultDescUpdatedAtDesc(userId)
                .stream()
                .map(userAddressMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserAddressResponse createMyAddress(CreateUserAddressRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        boolean hasExisting = userAddressRepository.existsByUserIdAndIsDeletedFalse(userId);
        boolean makeDefault = Boolean.TRUE.equals(request.getIsDefault()) || !hasExisting;

        if (makeDefault) {
            clearDefaultFlags(userId, null);
        }

        UserAddress address = UserAddress.builder()
                .userId(userId)
                .receiverName(request.getReceiverName().trim())
                .receiverPhone(request.getReceiverPhone().trim())
                .provinceCode(normalizeNullable(request.getProvinceCode()))
                .provinceName(normalizeNullable(request.getProvinceName()))
                .districtCode(normalizeNullable(request.getDistrictCode()))
                .districtName(normalizeNullable(request.getDistrictName()))
                .wardCode(normalizeNullable(request.getWardCode()))
                .wardName(normalizeNullable(request.getWardName()))
                .streetAddress(request.getStreetAddress().trim())
                .fullAddress(request.getFullAddress().trim())
                .note(normalizeNullable(request.getNote()))
                .isDefault(makeDefault)
                .isDeleted(false)
                .build();

        return userAddressMapper.toResponse(userAddressRepository.save(address));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserAddressResponse updateMyAddress(Long addressId, UpdateUserAddressRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        UserAddress address = getOwnedAddress(addressId, userId);

        if (StringUtils.hasText(request.getReceiverName())) {
            address.setReceiverName(request.getReceiverName().trim());
        }
        if (StringUtils.hasText(request.getReceiverPhone())) {
            address.setReceiverPhone(request.getReceiverPhone().trim());
        }
        if (request.getProvinceCode() != null) {
            address.setProvinceCode(normalizeNullable(request.getProvinceCode()));
        }
        if (request.getProvinceName() != null) {
            address.setProvinceName(normalizeNullable(request.getProvinceName()));
        }
        if (request.getDistrictCode() != null) {
            address.setDistrictCode(normalizeNullable(request.getDistrictCode()));
        }
        if (request.getDistrictName() != null) {
            address.setDistrictName(normalizeNullable(request.getDistrictName()));
        }
        if (request.getWardCode() != null) {
            address.setWardCode(normalizeNullable(request.getWardCode()));
        }
        if (request.getWardName() != null) {
            address.setWardName(normalizeNullable(request.getWardName()));
        }
        if (StringUtils.hasText(request.getStreetAddress())) {
            address.setStreetAddress(request.getStreetAddress().trim());
        }
        if (StringUtils.hasText(request.getFullAddress())) {
            address.setFullAddress(request.getFullAddress().trim());
        }
        if (request.getNote() != null) {
            address.setNote(normalizeNullable(request.getNote()));
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            clearDefaultFlags(userId, address.getId());
            address.setIsDefault(true);
        } else if (Boolean.FALSE.equals(request.getIsDefault()) && Boolean.TRUE.equals(address.getIsDefault())) {
            address.setIsDefault(false);
            promoteAnotherDefaultIfNeeded(userId, address.getId());
        }

        return userAddressMapper.toResponse(userAddressRepository.save(address));
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void deleteMyAddress(Long addressId) {
        Long userId = SecurityUtils.getCurrentUserId();
        UserAddress address = getOwnedAddress(addressId, userId);

        boolean wasDefault = Boolean.TRUE.equals(address.getIsDefault());
        address.setIsDeleted(true);
        address.setIsDefault(false);
        userAddressRepository.save(address);

        if (wasDefault) {
            promoteAnotherDefaultIfNeeded(userId, null);
        }
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public UserAddressResponse setDefaultAddress(Long addressId) {
        Long userId = SecurityUtils.getCurrentUserId();
        UserAddress address = getOwnedAddress(addressId, userId);

        clearDefaultFlags(userId, address.getId());
        address.setIsDefault(true);

        return userAddressMapper.toResponse(userAddressRepository.save(address));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<UserAddress> getDefaultAddressEntity(Long userId) {
        return userAddressRepository.findFirstByUserIdAndIsDefaultTrueAndIsDeletedFalse(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public UserAddress getAddressEntityForCheckout(Long addressId, Long userId) {
        return userAddressRepository.findByIdAndUserIdAndIsDeletedFalse(addressId, userId)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Delivery address not found"));
    }

    private UserAddress getOwnedAddress(Long addressId, Long userId) {
        return userAddressRepository.findByIdAndUserIdAndIsDeletedFalse(addressId, userId)
                .orElseThrow(() -> new ApiException(
                        ApiStatus.NOT_FOUND,
                        "Delivery address not found or you do not have permission to access it"));
    }

    private void clearDefaultFlags(Long userId, Long exceptAddressId) {
        List<UserAddress> addresses =
                userAddressRepository.findByUserIdAndIsDeletedFalseOrderByIsDefaultDescUpdatedAtDesc(userId);
        for (UserAddress entry : addresses) {
            if (exceptAddressId != null && exceptAddressId.equals(entry.getId())) {
                continue;
            }
            if (Boolean.TRUE.equals(entry.getIsDefault())) {
                entry.setIsDefault(false);
                userAddressRepository.save(entry);
            }
        }
    }

    private void promoteAnotherDefaultIfNeeded(Long userId, Long excludedAddressId) {
        boolean stillHasDefault = userAddressRepository
                .findFirstByUserIdAndIsDefaultTrueAndIsDeletedFalse(userId)
                .isPresent();
        if (stillHasDefault) {
            return;
        }

        userAddressRepository.findByUserIdAndIsDeletedFalseOrderByIsDefaultDescUpdatedAtDesc(userId)
                .stream()
                .filter(entry -> excludedAddressId == null || !excludedAddressId.equals(entry.getId()))
                .findFirst()
                .ifPresent(candidate -> {
                    candidate.setIsDefault(true);
                    userAddressRepository.save(candidate);
                });
    }

    private String normalizeNullable(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
