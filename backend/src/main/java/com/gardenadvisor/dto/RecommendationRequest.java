package com.gardenadvisor.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RecommendationRequest {
    @NotBlank(message = "Crop name is required")
    private String cropName;

    @NotBlank(message = "Space type is required")
    private String spaceType;

    private String location;
    private String soilType;
    private String climate;
    private String additionalNotes;
}
