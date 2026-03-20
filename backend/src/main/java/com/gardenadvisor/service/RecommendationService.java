package com.gardenadvisor.service;

import com.gardenadvisor.dto.FertilizerRecommendationDto;
import com.gardenadvisor.dto.RecommendationRequest;
import com.gardenadvisor.dto.RecommendationResponse;
import com.gardenadvisor.model.Crop;
import com.gardenadvisor.model.Fertilizer;
import com.gardenadvisor.model.User;
import com.gardenadvisor.model.UserCropHistory;
import com.gardenadvisor.repository.CropRepository;
import com.gardenadvisor.repository.FertilizerRepository;
import com.gardenadvisor.repository.UserCropHistoryRepository;
import com.gardenadvisor.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private CropRepository cropRepository;

    @Autowired
    private FertilizerRepository fertilizerRepository;

    @Autowired
    private UserCropHistoryRepository historyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public RecommendationResponse getRecommendation(RecommendationRequest request, String userEmail) {

        // Try to find the crop in DB
        Optional<Crop> cropOpt = cropRepository.findFirstByNameIgnoreCase(request.getCropName());

        // Get fertilizers for this crop
        List<Fertilizer> fertilizers = fertilizerRepository.findByCropName(request.getCropName());

        // If no specific fertilizers found, use general ones
        if (fertilizers.isEmpty()) {
            fertilizers = fertilizerRepository.findAll();
        }

        // Build fertilizer recommendations
        List<FertilizerRecommendationDto> fertRecommendations = buildFertilizerRecommendations(fertilizers, request);

        // Build full response
        RecommendationResponse response = buildResponse(request, cropOpt.orElse(null), fertRecommendations);

        // Save history
        saveHistory(request, response, userEmail);

        return response;
    }

    private List<FertilizerRecommendationDto> buildFertilizerRecommendations(
            List<Fertilizer> fertilizers, RecommendationRequest request) {

        List<FertilizerRecommendationDto> recommendations = new ArrayList<>();

        // Prioritize fertilizers based on space type and crop category
        for (Fertilizer f : fertilizers) {
            String priority = determinePriority(f, request);
            String purpose = determinePurpose(f);

            recommendations.add(FertilizerRecommendationDto.builder()
                    .fertilizerName(f.getName())
                    .type(f.getType())
                    .dosage(adjustDosageForSpaceType(f.getDosageInstruction(), request.getSpaceType()))
                    .timing(f.getTiming())
                    .purpose(purpose)
                    .priority(priority)
                    .nitrogenPct(f.getNitrogenPct())
                    .phosphorusPct(f.getPhosphorusPct())
                    .potassiumPct(f.getPotassiumPct())
                    .build());
        }

        // Sort: PRIMARY first, then SECONDARY
        recommendations.sort(Comparator.comparing(r -> {
            switch (r.getPriority()) {
                case "PRIMARY": return 0;
                case "SECONDARY": return 1;
                default: return 2;
            }
        }));

        // Limit to top 5
        return recommendations.stream().limit(5).collect(Collectors.toList());
    }

    private String determinePriority(Fertilizer f, RecommendationRequest request) {
        String spaceType = request.getSpaceType().toUpperCase();

        // For organic options in pots/indoors → organic fertilizers are primary
        if ((spaceType.equals("POTS") || spaceType.equals("INDOORS")) &&
                f.getType() != null && f.getType().toLowerCase().contains("organic")) {
            return "PRIMARY";
        }

        // NPK balanced → always primary for beginners
        if (f.getName().contains("NPK")) {
            return "PRIMARY";
        }

        // Urea/DAP for garden beds → primary
        if ((spaceType.equals("GARDEN_BED") || spaceType.equals("RAISED_BED")) &&
                (f.getName().contains("Urea") || f.getName().contains("DAP"))) {
            return "PRIMARY";
        }

        // Vermicompost is always secondary (supplementary)
        if (f.getName().toLowerCase().contains("vermicompost") || f.getName().toLowerCase().contains("compost")) {
            return "SECONDARY";
        }

        return "OPTIONAL";
    }

    private String determinePurpose(Fertilizer f) {
        if (f.getNitrogenPct() != null && f.getNitrogenPct() > 20) {
            return "Promotes leafy growth & green color";
        }
        if (f.getPhosphorusPct() != null && f.getPhosphorusPct() > 20) {
            return "Strengthens roots & promotes flowering";
        }
        if (f.getPotassiumPct() != null && f.getPotassiumPct() > 20) {
            return "Improves fruit quality & plant immunity";
        }
        if (f.getType() != null && f.getType().toLowerCase().contains("organic")) {
            return "Improves soil health & provides balanced nutrition";
        }
        return "Provides essential nutrients for overall plant health";
    }

    private String adjustDosageForSpaceType(String originalDosage, String spaceType) {
        if (originalDosage == null) return "Follow package instructions";

        switch (spaceType.toUpperCase()) {
            case "POTS":
                return "For pots: 1/4 of field dose. Mix into top 2 inches of soil or dissolve in water.";
            case "INDOORS":
                return "For indoor plants: Use very diluted liquid form. 1/8th of outdoor dose every 3 weeks.";
            case "RAISED_BED":
                return "For raised beds: Use 1/2 of field dose. Mix evenly into top 4 inches of growing medium.";
            case "GARDEN_BED":
                return originalDosage;
            default:
                return originalDosage;
        }
    }

    private RecommendationResponse buildResponse(RecommendationRequest request, Crop crop,
                                                   List<FertilizerRecommendationDto> fertilizers) {
        String cropName = request.getCropName();
        String spaceType = request.getSpaceType();

        String wateringSchedule = getWateringSchedule(spaceType, crop);
        String sunlight = crop != null ? crop.getSunlightRequirement() : "Full Sun (6-8 hours daily)";
        String soilPrep = getSoilPreparation(spaceType, request.getSoilType());
        String harvestTime = crop != null ? crop.getDaysToHarvest() + " days approximately" : "Varies by variety";

        List<String> commonMistakes = getCommonMistakes(cropName, spaceType);
        List<String> careTips = getCareTips(cropName, spaceType, crop);

        // Soil & climate recommendation
        String recommendedSoil = getRecommendedSoil(cropName, spaceType);
        String recommendedSoilReason = getRecommendedSoilReason(cropName, spaceType);
        String recommendedClimate = getRecommendedClimate(cropName);
        String recommendedClimateReason = getRecommendedClimateReason(cropName);
        String bestSeason = crop != null && crop.getGrowingSeason() != null && !crop.getGrowingSeason().isEmpty()
                ? crop.getGrowingSeason()
                : getDefaultSeason(request.getCropName());

        return RecommendationResponse.builder()
                .cropName(cropName)
                .spaceType(spaceType)
                .generalTips("Growing " + cropName + " in " + formatSpaceType(spaceType) +
                        " is " + (crop != null ? crop.getDifficultyLevel() : "manageable") +
                        " level. " + (crop != null ? crop.getDescription() : "Follow care instructions for best results."))
                .wateringSchedule(wateringSchedule)
                .sunlightNeeds(sunlight)
                .soilPreparation(soilPrep)
                .fertilizers(fertilizers)
                .commonMistakes(commonMistakes)
                .careTips(careTips)
                .harvestTime(harvestTime)
                .recommendedSoilType(recommendedSoil)
                .recommendedSoilReason(recommendedSoilReason)
                .recommendedClimate(recommendedClimate)
                .recommendedClimateReason(recommendedClimateReason)
                .bestPlantingSeason(bestSeason)
                .build();
    }

    private String getWateringSchedule(String spaceType, Crop crop) {
        String baseSchedule = crop != null ? crop.getWaterRequirement() : "Regular";
        switch (spaceType.toUpperCase()) {
            case "POTS":
                return "Check daily — pots dry out faster. Water when top 1 inch of soil feels dry. " + baseSchedule + ".";
            case "INDOORS":
                return "Water every 3-4 days. Ensure drainage holes are clear. Mist leaves in dry weather.";
            case "RAISED_BED":
                return "Water every 1-2 days. Raised beds drain well — check moisture regularly. " + baseSchedule + ".";
            case "GARDEN_BED":
                return "Water at base of plants 2-3 times per week. Adjust based on rainfall. " + baseSchedule + ".";
            default:
                return "Water regularly based on weather conditions.";
        }
    }

    private String getSoilPreparation(String spaceType, String soilType) {
        switch (spaceType.toUpperCase()) {
            case "POTS":
                return "Use 60% potting mix + 20% vermicompost + 20% cocopeat. Ensure drainage holes are not blocked.";
            case "INDOORS":
                return "Use premium potting mix with perlite for drainage. Avoid garden soil in pots — it compacts and blocks drainage.";
            case "RAISED_BED":
                return "Fill with 50% topsoil + 30% compost + 20% cocopeat or perlite for drainage. pH target: 6.0-7.0.";
            case "GARDEN_BED":
                return (soilType != null && !soilType.isEmpty())
                        ? "Your " + soilType + " soil: dig 12 inches deep, mix in compost (2-3 kg per sq meter), check pH (ideal 6.0-7.0)."
                        : "Loosen soil 12 inches deep. Add 2-3 kg compost per sq meter. Ensure good drainage.";
            default:
                return "Prepare well-draining, nutrient-rich soil. Add compost before planting.";
        }
    }

    private String formatSpaceType(String spaceType) {
        switch (spaceType.toUpperCase()) {
            case "POTS": return "Pots / Containers";
            case "INDOORS": return "Indoors";
            case "RAISED_BED": return "Raised Bed / Grow Bag";
            case "GARDEN_BED": return "Garden Bed";
            default: return spaceType;
        }
    }

    private List<String> getCommonMistakes(String cropName, String spaceType) {
        List<String> mistakes = new ArrayList<>(Arrays.asList(
                "Overwatering — the #1 killer. Always check soil moisture before watering",
                "Using garden soil in pots — it compacts and kills roots",
                "Too much fertilizer at once — causes salt burn on roots",
                "Ignoring drainage — waterlogging causes root rot"
        ));

        if (spaceType.equalsIgnoreCase("INDOORS")) {
            mistakes.add("Placing in low-light corners — most crops need 4-6 hrs of light minimum");
        }

        if (cropName.toLowerCase().contains("tomato") || cropName.toLowerCase().contains("chilli")) {
            mistakes.add("Not staking plants when they grow tall — leads to stem breakage");
        }

        return mistakes;
    }

    private List<String> getCareTips(String cropName, String spaceType, Crop crop) {
        List<String> tips = new ArrayList<>(Arrays.asList(
                "Start with quality seeds or seedlings from a trusted nursery",
                "Monitor for pests weekly — early detection saves the plant",
                "Remove yellowing leaves promptly to prevent disease spread",
                "Label your pots/beds with planting date to track progress"
        ));

        if (crop != null && crop.getGrowingSeason() != null) {
            tips.add("Best planting season: " + crop.getGrowingSeason());
        }

        if (spaceType.equalsIgnoreCase("POTS")) {
            tips.add("Upgrade pot size as plant grows — root-bound plants stop producing");
        }

        return tips;
    }

    private void saveHistory(RecommendationRequest request, RecommendationResponse response, String userEmail) {
        try {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            if (user == null) return;

            String responseJson = objectMapper.writeValueAsString(response);

            UserCropHistory history = UserCropHistory.builder()
                    .user(user)
                    .cropName(request.getCropName())
                    .spaceType(request.getSpaceType())
                    .location(request.getLocation())
                    .soilType(request.getSoilType())
                    .recommendationJson(responseJson)
                    .build();

            historyRepository.save(history);
        } catch (Exception e) {
            // Don't fail the request if history saving fails
        }
    }



    public List<UserCropHistory> getUserHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return historyRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
    }

    public RecommendationResponse getRecommendationPublic(RecommendationRequest request) {
        Optional<Crop> cropOpt = cropRepository.findFirstByNameIgnoreCase(request.getCropName());
        List<Fertilizer> fertilizers = fertilizerRepository.findByCropName(request.getCropName());
        if (fertilizers.isEmpty()) {
            fertilizers = fertilizerRepository.findAll();
        }
        List<FertilizerRecommendationDto> fertRecommendations = buildFertilizerRecommendations(fertilizers, request);
        return buildResponse(request, cropOpt.orElse(null), fertRecommendations);
    }

    private String getRecommendedSoil(String cropName, String spaceType) {
        if (spaceType.equalsIgnoreCase("POTS") || spaceType.equalsIgnoreCase("INDOORS")) {
            return "Potting Mix (60% soil + 20% vermicompost + 20% cocopeat)";
        }
        if (spaceType.equalsIgnoreCase("RAISED_BED")) {
            return "Raised Bed Mix (50% topsoil + 30% compost + 20% perlite)";
        }
        String name = cropName.toLowerCase();
        if (name.contains("tomato") || name.contains("chilli") || name.contains("capsicum")) {
            return "Loamy soil — well-drained, rich in organic matter";
        }
        if (name.contains("spinach") || name.contains("coriander") || name.contains("methi") || name.contains("mint")) {
            return "Loamy or sandy loam — light, well-draining with compost";
        }
        if (name.contains("rose") || name.contains("marigold")) {
            return "Loamy soil — slightly acidic (pH 6.0-6.5) with good drainage";
        }
        if (name.contains("rice") || name.contains("paddy")) {
            return "Clay or clay loam — water-retaining, ideal for paddy cultivation";
        }
        if (name.contains("wheat") || name.contains("maize") || name.contains("corn")) {
            return "Loamy or sandy loam — well-drained, deep soil";
        }
        if (name.contains("lemon") || name.contains("citrus") || name.contains("curry")) {
            return "Loamy or sandy loam — well-drained, slightly acidic (pH 5.5-6.5)";
        }
        return "Loamy soil — dark, crumbly, well-draining with good organic content";
    }

    private String getRecommendedSoilReason(String cropName, String spaceType) {
        if (spaceType.equalsIgnoreCase("POTS") || spaceType.equalsIgnoreCase("INDOORS")) {
            return "Never use garden soil in pots — it compacts, blocks drainage, and suffocates roots. The 60/20/20 potting mix drains well while holding moisture and nutrients perfectly.";
        }
        String name = cropName.toLowerCase();
        if (name.contains("rice") || name.contains("paddy")) {
            return "Rice needs standing water for growth — clay soil holds water in the field. Sandy soil would not support paddy cultivation.";
        }
        return "Loamy soil holds moisture while draining excess water, provides air to roots, and is rich in nutrients. It gives the best germination and root development for most crops.";
    }

    private String getRecommendedClimate(String cropName) {
        String name = cropName.toLowerCase();
        if (name.contains("tomato") || name.contains("chilli") || name.contains("capsicum") || name.contains("brinjal")) {
            return "Warm & Dry (Semi-arid / Subtropical)";
        }
        if (name.contains("spinach") || name.contains("coriander") || name.contains("methi") || name.contains("wheat")) {
            return "Cool Season (Highland / Subtropical winter)";
        }
        if (name.contains("rice") || name.contains("coconut") || name.contains("banana")) {
            return "Tropical (Hot & Humid)";
        }
        if (name.contains("rose") || name.contains("marigold")) {
            return "Mild & Sunny (Subtropical / Semi-arid)";
        }
        if (name.contains("lemon") || name.contains("citrus")) {
            return "Subtropical to Tropical (Warm all year)";
        }
        if (name.contains("mint") || name.contains("tulsi")) {
            return "Grows in all climates — adapts well";
        }
        return "Subtropical or Semi-arid (suits most Indian regions)";
    }

    private String getRecommendedClimateReason(String cropName) {
        String name = cropName.toLowerCase();
        if (name.contains("tomato") || name.contains("chilli")) {
            return "Fruiting crops need warm days (25-35°C), cool nights, and low humidity. High humidity causes fungal diseases and fruit rot. Deccan plateau and South India interior are ideal.";
        }
        if (name.contains("spinach") || name.contains("coriander") || name.contains("wheat") || name.contains("methi")) {
            return "Cool-season crops bolt (go to seed) in heat. They need temperatures 15-25°C for leaf/grain development. Grow October to March in most of India.";
        }
        if (name.contains("rice")) {
            return "Rice needs high temperatures (25-35°C), high humidity, and abundant water. It evolved in tropical conditions and performs best with monsoon rainfall.";
        }
        return "This crop adapts well to most Indian climate zones. Avoid extreme heat (>42°C) and frost. Optimal temperature range is 20-35°C with adequate rainfall or irrigation.";
    }


    private String getDefaultSeason(String cropName) {
        if (cropName == null) return "Feb-May or Aug-Nov";
        String name = cropName.toLowerCase();
        if (name.contains("tomato") || name.contains("capsicum") || name.contains("brinjal")) return "Feb-May, Aug-Nov";
        if (name.contains("chilli") || name.contains("mirchi") || name.contains("pepper")) return "Year-round (Best: Feb-Apr)";
        if (name.contains("spinach") || name.contains("palak") || name.contains("coriander") ||
            name.contains("methi") || name.contains("wheat") || name.contains("lettuce") ||
            name.contains("cabbage") || name.contains("carrot") || name.contains("onion") ||
            name.contains("potato") || name.contains("radish") || name.contains("garlic")) return "Oct-Mar (Rabi / Cool season)";
        if (name.contains("rice") || name.contains("paddy") || name.contains("basmati")) return "Jun-Nov (Kharif / Monsoon season)";
        if (name.contains("maize") || name.contains("corn") || name.contains("sorghum") ||
            name.contains("jowar") || name.contains("bajra")) return "Jun-Sep (Kharif) or Feb-May (Rabi)";
        if (name.contains("okra") || name.contains("bhindi") || name.contains("cucumber") ||
            name.contains("gourd") || name.contains("pumpkin")) return "Mar-Jun (Summer vegetables)";
        if (name.contains("rose") || name.contains("marigold") || name.contains("jasmine")) return "Oct-Feb (Best planting season)";
        if (name.contains("tulsi") || name.contains("mint") || name.contains("basil") ||
            name.contains("curry")) return "Year-round (Best: Mar-Jun)";
        if (name.contains("lemon") || name.contains("citrus") || name.contains("orange")) return "Year-round (Best: Feb-Apr)";
        if (name.contains("mango") || name.contains("banana") || name.contains("papaya") ||
            name.contains("coconut") || name.contains("guava")) return "Feb-Apr (Planting season for fruit trees)";
        if (name.contains("groundnut") || name.contains("soybean") || name.contains("sunflower") ||
            name.contains("cotton")) return "Jun-Jul (Kharif oilseeds / cash crops)";
        if (name.contains("grape") || name.contains("strawberry")) return "Nov-Jan (Best planting season)";
        return "Feb-May or Aug-Nov (consult local agriculture department)";
    }

}