package com.gardenadvisor.controller;

import com.gardenadvisor.dto.RecommendationRequest;
import com.gardenadvisor.dto.RecommendationResponse;
import com.gardenadvisor.model.UserCropHistory;
import com.gardenadvisor.service.RecommendationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @PostMapping
    public ResponseEntity<?> getRecommendation(
            @Valid @RequestBody RecommendationRequest request,
            Principal principal) {
        try {
            RecommendationResponse response = recommendationService.getRecommendation(request, principal.getName());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<List<UserCropHistory>> getHistory(Principal principal) {
        List<UserCropHistory> history = recommendationService.getUserHistory(principal.getName());
        return ResponseEntity.ok(history);
    }
}
