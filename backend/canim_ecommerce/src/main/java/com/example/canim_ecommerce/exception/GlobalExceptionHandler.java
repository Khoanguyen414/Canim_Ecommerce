package com.example.canim_ecommerce.exception;

import java.nio.file.AccessDeniedException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import com.example.canim_ecommerce.dto.response.ApiResponse;
import com.example.canim_ecommerce.enums.ApiStatus;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<?>> handleApiException(ApiException e) {
        return ResponseEntity
            .status(e.getApiStatus().getStatusCode())
            .body(ApiResponse.error(e.getApiStatus(), e.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handlevalidtion(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(ApiStatus.INVALID_INPUT, message));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<?>> handleDatabaseError(DataIntegrityViolationException e) {
        String message = "System data error"; 
        String detailedMessage = e.getRootCause() != null ? e.getRootCause().getMessage() : e.getMessage();

        if (detailedMessage != null && detailedMessage.contains("Duplicate entry")) {
            message = "Information already exists in the system.";
        } else if (detailedMessage != null && detailedMessage.contains("Foreign key constraint")) {
            message = "Relevant data is invalid or already in use.";
        }

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(ApiStatus.RESOURCE_EXIST, message));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<?>> handleFileSizeError(MaxUploadSizeExceededException e) {
        return ResponseEntity
            .status(HttpStatus.PAYLOAD_TOO_LARGE)
            .body(ApiResponse.error(ApiStatus.FILE_TOO_LARGE, "File too large! Please select a file smaller than the allowed size."));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<?>> handleAccessDenied(AccessDeniedException e) {
        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(ApiResponse.error(ApiStatus.FORBIDDEN, "You do not have the authority to perform this action."));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<?>> handleTypeMismatch(MethodArgumentTypeMismatchException e) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(ApiStatus.INVALID_INPUT, "Input parameter is not in the correct format."));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handleJsonError(HttpMessageNotReadableException e) {
        return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(ApiResponse.error(ApiStatus.INVALID_INPUT, "JSON data being uploaded has formatting errors."));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodNotSupported(HttpRequestMethodNotSupportedException e) {
        return ResponseEntity
            .status(HttpStatus.METHOD_NOT_ALLOWED) // 405
            .body(ApiResponse.error(ApiStatus.METHOD_NOT_SUPPORTED, "Method " + e.getMethod() + " is not supported"));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleGenericException(Exception exception) {
        exception.printStackTrace();

        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(ApiResponse.error(ApiStatus.INTERNAL_SERVER_ERROR, exception.getMessage()));
    }
}
