package com.example.canim_ecommerce.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SupplierResponse {
    Long id;
    String supplierCode;
    String name;
    String contactName;
    String email;
    String phone;
    String address;
    String taxId;
    // Điều khoản thanh toán
    String paymentTerms;
    BigDecimal rating;
    //Tổng số đơn đã mua từ supplier
    Integer totalOrders;
    //Trạng thái hoạt động
    Boolean isActive;
    Long createdBy;
    LocalDateTime createdAt;
    Long updatedBy;
    LocalDateTime updatedAt;
}