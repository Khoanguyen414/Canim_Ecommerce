package com.example.canim_ecommerce.dto.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserAddressResponse {

    Long id;
    String receiverName;
    String receiverPhone;
    String provinceCode;
    String provinceName;
    String districtCode;
    String districtName;
    String wardCode;
    String wardName;
    String streetAddress;
    String fullAddress;
    String note;
    Boolean isDefault;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
}
