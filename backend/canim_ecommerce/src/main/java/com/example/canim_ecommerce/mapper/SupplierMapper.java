package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.dto.request.suppliers.SupplierRequest;
import com.example.canim_ecommerce.entity.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SupplierMapper {
    Supplier toEntity(SupplierRequest request);
    void updateEntity(@MappingTarget Supplier supplier, SupplierRequest request);
}