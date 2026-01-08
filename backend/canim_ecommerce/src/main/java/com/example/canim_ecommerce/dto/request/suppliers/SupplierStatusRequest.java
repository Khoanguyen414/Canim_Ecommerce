package com.example.canim_ecommerce.dto.request.suppliers;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierStatusRequest {
   
    @NotNull(message = "Status is required")
    @JsonProperty("status")
    private String status;
                       
}