package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Integer> {
    // Nghiệp vụ: Chỉ lấy các nhà cung cấp đang hoạt động
    List<Supplier> findAllByIsActiveTrue();
    
    // Check trùng email
    boolean existsByEmail(String email);
}