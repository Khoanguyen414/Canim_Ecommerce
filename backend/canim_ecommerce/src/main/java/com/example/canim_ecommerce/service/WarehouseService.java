package com.example.canim_ecommerce.service;

import com.example.canim_ecommerce.dto.request.warehouse.WarehouseRequest;
import com.example.canim_ecommerce.entity.Warehouse;

import java.util.List;

public interface WarehouseService {
    List<Warehouse> getAllWarehouses();
    Warehouse getWarehouseById(Long id);
    Warehouse createWarehouse(WarehouseRequest request);
    Warehouse updateWarehouse(Long id, WarehouseRequest request);
    void deleteWarehouse(Long id);
}