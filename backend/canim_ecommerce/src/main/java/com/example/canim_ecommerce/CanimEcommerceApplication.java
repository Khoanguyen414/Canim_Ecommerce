package com.example.canim_ecommerce;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.example.canim_ecommerce.config.PaymentProperties;
import com.example.canim_ecommerce.config.PersonalQrProperties;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({ PaymentProperties.class, PersonalQrProperties.class })
public class CanimEcommerceApplication {

	public static void main(String[] args) {
		SpringApplication.run(CanimEcommerceApplication.class, args);
	}

}
