package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findByIdAndIsDeletedFalse(Long id);
    List<Supplier> findByIsDeletedFalseOrderByIdDesc();
    boolean existsByCode(String code);
    boolean existsByEmail(String email);
}