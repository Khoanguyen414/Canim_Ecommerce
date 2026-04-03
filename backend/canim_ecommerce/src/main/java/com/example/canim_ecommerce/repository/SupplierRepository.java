package com.example.canim_ecommerce.repository;

import com.example.canim_ecommerce.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
<<<<<<< HEAD
import java.util.Optional;
=======
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    boolean existsByCode(String code);
    boolean existsByEmail(String email);
}