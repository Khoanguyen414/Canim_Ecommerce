package com.example.canim_ecommerce.exception;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.enums.ApiStatus;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ApiResponse<?> handleApiException(ApiException exception) {
        return ApiResponse.error(exception.getApiStatus(), exception.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ApiResponse<?> handleGenericException(Exception exception) {
        return ApiResponse.error(ApiStatus.INTERNAL_SERVER_ERROR, exception.getMessage());
    }
}
