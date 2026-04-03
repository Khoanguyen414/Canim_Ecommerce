<<<<<<< HEAD
package com.example.canim_ecommerce.dto.request.inventory;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
=======
package com.example.canim_ecommerce.dto.request.inventory; 

import jakarta.validation.constraints.NotNull;
import lombok.Data;
>>>>>>> main
import java.math.BigDecimal;
import java.util.List;

@Data
<<<<<<< HEAD
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InboundRequest {
    
    @NotNull(message = "Supplier ID cannot be null")
    Long supplierId;
    
    String note;
    
    @NotEmpty(message = "Items list cannot be empty")
    List<InboundItem> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @FieldDefaults(level = AccessLevel.PRIVATE)
    public static class InboundItem {
        @NotNull(message = "Product ID cannot be null")
        Long productId;
        
        @NotNull(message = "Quantity cannot be null")
        Integer quantity;
        
        @NotNull(message = "Price cannot be null")
        BigDecimal price;
=======
public class InboundRequest {
    @NotNull(message = "Nhà cung cấp không được để trống")
    private Long supplierId;
    
    private String note;
    
    @NotNull(message = "Danh sách sản phẩm không được trống")
    private List<InboundItem> items;

    @Data
    public static class InboundItem {
        @NotNull(message = "ID sản phẩm không được trống")
        private Long productId;
        
        @NotNull(message = "Số lượng nhập phải lớn hơn 0")
        private Integer quantity; 
        
        @NotNull(message = "Giá nhập không được trống")
        private BigDecimal price; 
>>>>>>> main
    }
}