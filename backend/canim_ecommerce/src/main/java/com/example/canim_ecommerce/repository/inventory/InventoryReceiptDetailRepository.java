package com.example.canim_ecommerce.repository.inventory;

import com.example.canim_ecommerce.entity.InventoryReceiptDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InventoryReceiptDetailRepository extends JpaRepository<InventoryReceiptDetail, Long> {
}