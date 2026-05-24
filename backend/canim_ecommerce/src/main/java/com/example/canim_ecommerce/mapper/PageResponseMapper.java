package com.example.canim_ecommerce.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;
import org.springframework.data.domain.Page;

import com.example.canim_ecommerce.dto.response.PageResponse;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PageResponseMapper {
    default <T> PageResponse<T> toPageResponse(Page<T> page) {
        if (page == null) {
            return PageResponse.<T>builder()
                    .page(0)
                    .size(0)
                    .totalElements(0)
                    .totalPages(0)
                    .data(java.util.List.of())
                    .build();
        }

        return PageResponse.<T>builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .data(page.getContent())
                .build();
    }
}
