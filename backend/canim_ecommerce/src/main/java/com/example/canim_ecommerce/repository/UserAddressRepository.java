package com.example.canim_ecommerce.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.canim_ecommerce.entity.UserAddress;

public interface UserAddressRepository extends JpaRepository<UserAddress, Long> {

    List<UserAddress> findByUserIdAndIsDeletedFalseOrderByIsDefaultDescUpdatedAtDesc(Long userId);

    Optional<UserAddress> findByIdAndUserIdAndIsDeletedFalse(Long id, Long userId);

    Optional<UserAddress> findFirstByUserIdAndIsDefaultTrueAndIsDeletedFalse(Long userId);

    boolean existsByUserIdAndIsDeletedFalse(Long userId);
}
