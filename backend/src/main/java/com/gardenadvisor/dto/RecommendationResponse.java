package com.gardenadvisor.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RecommendationResponse {
    private String cropName;
    private String spaceType;
    private String generalTips;
    private String wateringSchedule;
    private String sunlightNeeds;
    private String soilPreparation;
    private List<FertilizerRecommendationDto> fertilizers;
    private List<String> commonMistakes;
    private List<String> careTips;
    private String harvestTime;
    // Soil & climate recommendation (shown when user selects "I don't know")
    private String recommendedSoilType;
    private String recommendedSoilReason;
    private String recommendedClimate;
    private String recommendedClimateReason;
    private String bestPlantingSeason;
}