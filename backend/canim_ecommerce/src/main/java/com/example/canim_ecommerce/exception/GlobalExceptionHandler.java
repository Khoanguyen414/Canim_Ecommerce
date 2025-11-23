package com.example.canim_ecommerce.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.enums.ApiStatus;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage()));
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeException(RuntimeException ex) {
        return new ResponseEntity<>(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<String> handleAuthenticationException(AuthenticationException ex) {
        return new ResponseEntity<>("Thông tin đăng nhập không đúng", HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ApiException.class)
    public ApiResponse<?> handleApiException(ApiException exception) {
        return ApiResponse.error(exception.getApiStatus(), exception.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public ApiResponse<?> handleGenericException(Exception exception) {
        return ApiResponse.error(ApiStatus.INTERNAL_SERVER_ERROR, exception.getMessage());
    }
}