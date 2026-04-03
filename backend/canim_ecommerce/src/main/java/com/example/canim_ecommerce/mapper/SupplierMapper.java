package com.example.canim_ecommerce.mapper;

<<<<<<< HEAD
import com.example.canim_ecommerce.dto.request.Supplier.SupplierRequest;
import com.example.canim_ecommerce.entity.Supplier;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
=======
import com.example.canim_ecommerce.dto.request.suppliers.SupplierRequest;
import com.example.canim_ecommerce.entity.Supplier;
import org.mapstruct.Mapper;
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SupplierMapper {
    Supplier toEntity(SupplierRequest request);
<<<<<<< HEAD
    
    
=======
>>>>>>> 72c17a95770e973f5c4312b110e7a2a9b3c8d059
    void updateEntity(@MappingTarget Supplier supplier, SupplierRequest request);
}