package com.example.canim_ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class CanimEcommerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CanimEcommerceApplication.class, args);
	}

}
