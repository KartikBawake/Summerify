package com.summerify.backend.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.summerify.backend.api.ApiException;
import com.summerify.backend.config.HuggingFaceProperties;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;

@Service
public class SummarizationService {
    private final HuggingFaceProperties properties;
    private final ObjectMapper objectMapper;
    private final RestClient restClient;

    public SummarizationService(HuggingFaceProperties properties, ObjectMapper objectMapper) {
        this.properties = properties;
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder().build();
    }

    public String summarize(String text, double ratio) {
        if (!StringUtils.hasText(properties.apiKey())) {
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE,
                    "The summarization service has not been configured.");
        }

        int wordCount = text.trim().split("\\s+").length;
        if (wordCount < 40) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Please provide at least 40 words to summarize.");
        }

        int targetLength = Math.max(30, (int) Math.round(wordCount * ratio));
        int minLength = Math.max(20, (int) Math.round(targetLength * 0.7));
        int maxLength = Math.max(minLength + 10, targetLength);
        Map<String, Object> payload = Map.of(
                "inputs", text,
                "parameters", Map.of("max_length", maxLength, "min_length", minLength, "do_sample", false)
        );

        try {
            String response = restClient.post()
                    .uri(properties.apiUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.apiKey())
                    .body(payload)
                    .retrieve()
                    .body(String.class);
            return readSummary(response);
        } catch (RestClientException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "The summarization provider could not be reached. Please try again shortly.");
        }
    }

    private String readSummary(String response) {
        try {
            JsonNode body = objectMapper.readTree(response);
            if (body.isArray() && !body.isEmpty() && body.get(0).hasNonNull("summary_text")) {
                return body.get(0).get("summary_text").asText();
            }
            if (body.hasNonNull("error")) {
                throw new ApiException(HttpStatus.BAD_GATEWAY,
                        "The summarization provider returned an error: " + body.get("error").asText());
            }
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY,
                    "The summarization provider returned an unreadable response.");
        }
        throw new ApiException(HttpStatus.BAD_GATEWAY,
                "The summarization provider did not return a summary.");
    }
}
