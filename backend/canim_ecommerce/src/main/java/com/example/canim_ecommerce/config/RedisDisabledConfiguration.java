package com.example.canim_ecommerce.config;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "app.redis.enabled", havingValue = "false")
@EnableAutoConfiguration(exclude = RedisAutoConfiguration.class)
public class RedisDisabledConfiguration {
}
