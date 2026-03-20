package com.gardenadvisor.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FertilizerRecommendationDto {
    private String fertilizerName;
    private String type;
    private String dosage;
    private String timing;
    private String purpose;
    private String priority;
    private Double nitrogenPct;
    private Double phosphorusPct;
    private Double potassiumPct;
}
