package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.inventory.StockCheckRequest;
import com.example.canim_ecommerce.entity.StockCheck;

public interface StockCheckService {
    
    StockCheck createDraftCheck(StockCheckRequest request);
    void completeStockCheck(Long stockCheckId);
}