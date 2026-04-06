package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
   
    Optional<Inventory> findByVariantId(Long variantId);
}