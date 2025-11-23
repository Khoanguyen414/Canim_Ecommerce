package com.example.canim_ecommerce.dto.response;

import com.example.canim_ecommerce.enums.ApiStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    boolean success;
    int status;
    String message;
    T result;

    public static <T> ApiResponse<T> success(ApiStatus status, T result) {
        return ApiResponse.<T>builder()
            .success(true)
            .status(status.getStatusCode())
            .message(status.getMessage())
            .result(result)
            .build();
    }

    public static <T> ApiResponse<T> success(ApiStatus status, String message, T result) {
        return ApiResponse.<T>builder()
            .success(true)
            .status(status.getStatusCode())
            .message(message)
            .result(result)
            .build();
    }

    public static <T> ApiResponse<T> error(ApiStatus status, String message) {
        return ApiResponse.<T>builder()
            .success(false)
            .status(status.getStatusCode())
            .message(message != null ? message : status.getMessage())
            .build();
    }
}
