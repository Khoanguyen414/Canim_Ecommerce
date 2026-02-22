package com.example.canim_ecommerce.repository.inventory;

import com.example.canim_ecommerce.entity.InventoryReceiptDetail;
import com.example.canim_ecommerce.enums.ReceiptType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryReceiptDetailRepository extends JpaRepository<InventoryReceiptDetail, Long> {
    List<InventoryReceiptDetail> findByReceipt_TypeOrderByReceipt_CreatedAtDesc(ReceiptType type);
}