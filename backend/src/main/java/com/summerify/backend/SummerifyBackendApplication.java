package com.summerify.backend;

import com.summerify.backend.config.HuggingFaceProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(HuggingFaceProperties.class)
public class SummerifyBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SummerifyBackendApplication.class, args);
	}

}
