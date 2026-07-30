package com.summerify.backend.api;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;

public record SummarizeRequest(
        @NotBlank(message = "Text is required.") String text,
        @DecimalMin(value = "0.2", message = "Ratio must be between 0.2 and 0.8.")
        @DecimalMax(value = "0.8", message = "Ratio must be between 0.2 and 0.8.")
        double ratio
) {
}
