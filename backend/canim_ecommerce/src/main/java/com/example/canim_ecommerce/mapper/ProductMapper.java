package com.example.canim_ecommerce.mapper;

import com.example.canim_ecommerce.Entity.Product;
import com.example.canim_ecommerce.dto.request.ProductRequest;
import com.example.canim_ecommerce.dto.response.ProductResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ProductMapper {
    @Mapping(target = "categoryId", source = "category.id")
    ProductResponse toResponse(Product entity);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "status", ignore = true)
    Product toEntity(ProductRequest request);
}