package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.dto.request.suppliers.SupplierCreationRequest;
import com.example.canim_ecommerce.dto.request.suppliers.SupplierUpdateRequest;
import com.example.canim_ecommerce.dto.response.SupplierResponse;
import com.example.canim_ecommerce.entity.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

// nullValuePropertyMappingStrategy = IGNORE: Nếu field trong request là null thì giữ nguyên giá trị cũ của Entity
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface SupplierMapper {
    Supplier toSupplier(SupplierCreationRequest request);
    SupplierResponse toSupplierResponse(Supplier supplier);
    void updateSupplier(@MappingTarget Supplier supplier, SupplierUpdateRequest request);
}