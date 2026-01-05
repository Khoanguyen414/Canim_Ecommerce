package com.example.canim_ecommerce.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import java.util.List;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PageResponse<T> {
    // Danh sách items trên trang hiện tại
    private List<T> content;
    //số trang hiện tại 
    private Integer currentPage;
    //số mặt hàng trên mỗi trang
    private Integer pageSize;
    //Tổng số mặt hàng
    private Long totalElements;
    //Tổng số trang
    private Integer totalPages;
    private Boolean hasNext;
    //Có trang trước hay không
    private Boolean hasPrevious;
    
    // Chuyển đổi từ Page<T> của Spring Data sang PageResponse<T>
    public static <T> PageResponse<T> of(org.springframework.data.domain.Page<T> page) {
        return PageResponse.<T>builder()
            .content(page.getContent())
            .currentPage(page.getNumber())
            .pageSize(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .hasNext(page.hasNext())
            .hasPrevious(page.hasPrevious())
            .build();
    }
}