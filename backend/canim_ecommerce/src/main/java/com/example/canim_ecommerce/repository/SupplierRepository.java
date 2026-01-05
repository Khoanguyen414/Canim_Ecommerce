package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    Optional<Supplier> findBySupplierCode(String supplierCode);
    List<Supplier> findByIsActiveTrue();
    boolean existsBySupplierCode(String supplierCode);
    Page<Supplier> findByIsActiveTrue(Pageable pageable);
    @Query("""
        SELECT s FROM Supplier s
        WHERE s.isActive = true
        AND (
            s.name LIKE CONCAT('%', :searchTerm, '%')
            OR s.supplierCode LIKE CONCAT('%', :searchTerm, '%')
            OR s.email LIKE CONCAT('%', :searchTerm, '%')
        )
    """)
    Page<Supplier> searchActiveSuppliers(
            @Param("searchTerm") String searchTerm,
            Pageable pageable
    );
}

