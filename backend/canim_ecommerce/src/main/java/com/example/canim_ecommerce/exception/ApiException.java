package com.example.canim_ecommerce.exception;

import com.example.canim_ecommerce.enums.ApiStatus;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApiException extends RuntimeException {
    ApiStatus apiStatus;

    public ApiException(ApiStatus apiStatus, String message) {
        super(message);
        this.apiStatus = apiStatus;
    }
}
