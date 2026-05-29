package com.example.canim_ecommerce.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import lombok.Data;

@Component
@ConfigurationProperties(prefix = "google.maps")
@Data
public class GoogleMapsProperties {
    String apiKey = "";
    boolean enabled = false;
}
