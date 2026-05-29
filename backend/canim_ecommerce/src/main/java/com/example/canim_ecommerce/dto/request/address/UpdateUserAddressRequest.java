package com.example.canim_ecommerce.dto.request.address;

import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserAddressRequest {

    @Size(max = 100, message = "Recipient name must not exceed 100 characters")
    String receiverName;

    @Size(max = 20, message = "Receiver phone must not exceed 20 characters")
    String receiverPhone;

    @Size(max = 50, message = "Province code must not exceed 50 characters")
    String provinceCode;

    @Size(max = 100, message = "Province name must not exceed 100 characters")
    String provinceName;

    @Size(max = 50, message = "District code must not exceed 50 characters")
    String districtCode;

    @Size(max = 100, message = "District name must not exceed 100 characters")
    String districtName;

    @Size(max = 50, message = "Ward code must not exceed 50 characters")
    String wardCode;

    @Size(max = 100, message = "Ward name must not exceed 100 characters")
    String wardName;

    @Size(max = 255, message = "Street address must not exceed 255 characters")
    String streetAddress;

    String fullAddress;

    @Size(max = 500, message = "Note must not exceed 500 characters")
    String note;

    Boolean isDefault;
}
