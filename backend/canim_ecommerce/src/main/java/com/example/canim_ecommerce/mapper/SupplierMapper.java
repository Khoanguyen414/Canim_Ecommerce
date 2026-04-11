package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.dto.request.supplier.SupplierRequest;
import com.example.canim_ecommerce.dto.response.SupplierResponse;
import com.example.canim_ecommerce.entity.Supplier;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    @Mapping(target = "isDeleted", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Supplier toSupplier(SupplierRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true) 
    @Mapping(target = "isDeleted", ignore = true) 
    @Mapping(target = "createdBy", ignore = true) 
    @Mapping(target = "updatedBy", ignore = true) 
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateSupplier(@MappingTarget Supplier supplier, SupplierRequest request);

    @BeanMapping(unmappedTargetPolicy = ReportingPolicy.IGNORE)
    @Mapping(source = "code", target = "supplierCode")
    @Mapping(source = "contactPerson", target = "contactName")
    SupplierResponse toSupplierResponse(Supplier supplier);

    List<SupplierResponse> toSupplierResponseList(List<Supplier> suppliers);
}