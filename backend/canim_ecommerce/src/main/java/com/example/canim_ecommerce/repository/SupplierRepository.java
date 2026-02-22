package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsByCode(String code);
    boolean existsByEmail(String email);
}