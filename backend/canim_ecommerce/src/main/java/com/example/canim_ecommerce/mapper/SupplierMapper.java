package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.dto.request.supplier.SupplierRequest;
import com.example.canim_ecommerce.dto.response.SupplierResponse;
import com.example.canim_ecommerce.entity.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SupplierMapper {
    
    Supplier toSupplier(SupplierRequest request);

    void updateSupplier(@MappingTarget Supplier supplier, SupplierRequest request);

    @Mapping(source = "code", target = "supplierCode")
    @Mapping(source = "contactPerson", target = "contactName")
    SupplierResponse toSupplierResponse(Supplier supplier);

    List<SupplierResponse> toSupplierResponseList(List<Supplier> suppliers);
}