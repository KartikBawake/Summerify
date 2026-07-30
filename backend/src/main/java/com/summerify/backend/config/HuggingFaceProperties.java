package com.summerify.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "huggingface")
public record HuggingFaceProperties(String apiUrl, String apiKey) {
}
