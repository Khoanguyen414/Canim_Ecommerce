package com.example.canim_ecommerce.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration // Đánh dấu đây là file chứa cấu hình
@EnableAsync   // BẬT CÔNG TẮC ĐA LUỒNG Ở ĐÂY THAY VÌ FILE MAIN
public class AsyncConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        executor.setCorePoolSize(2); 
        executor.setMaxPoolSize(5); 
        executor.setQueueCapacity(500); 
        executor.setThreadNamePrefix("AI-Tracking-"); 
        executor.initialize();
        return executor;
    }
}