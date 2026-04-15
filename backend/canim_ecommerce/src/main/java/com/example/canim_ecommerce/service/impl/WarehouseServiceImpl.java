package com.example.canim_ecommerce.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.canim_ecommerce.dto.request.warehouse.WarehouseRequest;
import com.example.canim_ecommerce.entity.Warehouse;
import com.example.canim_ecommerce.enums.ApiStatus;
import com.example.canim_ecommerce.exception.ApiException;
import com.example.canim_ecommerce.mapper.WarehouseMapper;
import com.example.canim_ecommerce.repository.WarehouseRepository;
import com.example.canim_ecommerce.service.WarehouseService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WarehouseServiceImpl implements WarehouseService {

    WarehouseRepository warehouseRepository;
    WarehouseMapper warehouseMapper;

    @Override
    public List<Warehouse> getAllWarehouses() {
        return warehouseRepository.findByIsDeletedFalseOrderByIdDesc();
    }

    @Override
    public Warehouse getWarehouseById(Long id) {
        return warehouseRepository.findById(id)
                .orElseThrow(() -> new ApiException(ApiStatus.NOT_FOUND, "Warehouse not found"));
    }

    @Override
    @Transactional
    public Warehouse createWarehouse(WarehouseRequest request) {
        Warehouse warehouse = warehouseMapper.toWarehouse(request);
        warehouse.setIsActive(true);
        warehouse.setIsDeleted(false);
        return warehouseRepository.save(warehouse);
    }

    @Override
    @Transactional
    public Warehouse updateWarehouse(Long id, WarehouseRequest request) {
        Warehouse warehouse = getWarehouseById(id);
        warehouseMapper.updateWarehouse(warehouse, request);
        return warehouseRepository.save(warehouse);
    }

    @Override
    @Transactional
    public void deleteWarehouse(Long id) {
        Warehouse warehouse = getWarehouseById(id);
        warehouse.setIsDeleted(true);
        warehouse.setIsActive(false);
        warehouseRepository.save(warehouse);
    }
}