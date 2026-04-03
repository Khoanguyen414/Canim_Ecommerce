package com.example.canim_ecommerce.enums;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ApiStatus {
    SUCCESS(200, "Request processed successfully"),
    BAD_REQUEST(400, "Bad request"),
    INVALID_INPUT(400, "Invalid input"),
    UNAUTHORIZED(401, "Authentication required"),
    FORBIDDEN(403, "Access denied"),
    NOT_FOUND(404, "Resource not found"),
    METHOD_NOT_SUPPORTED(405, "Method not supported"),
    RESOURCE_EXIST(409, "Resource already exists"),
    FILE_TOO_LARGE(413, "File too large"),
    CREATED(201, "Created"),  
    CONFLICT(409, "Conflict"),
    INTERNAL_SERVER_ERROR(500, "Internal server error");

    

    int statusCode;
    String message;
}