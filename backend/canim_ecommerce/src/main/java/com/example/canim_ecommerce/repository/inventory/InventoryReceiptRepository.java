package com.example.canim_ecommerce.repository.inventory;

import com.example.canim_ecommerce.entity.InventoryReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryReceiptRepository extends JpaRepository<InventoryReceipt, Long> {
}
