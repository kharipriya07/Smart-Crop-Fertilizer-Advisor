package com.gardenadvisor.controller;

import com.gardenadvisor.model.Fertilizer;
import com.gardenadvisor.repository.FertilizerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fertilizers")
@CrossOrigin
public class FertilizerController {

    @Autowired
    private FertilizerRepository fertilizerRepository;

    @GetMapping("/public/all")
    public ResponseEntity<List<Fertilizer>> getAllFertilizers() {
        return ResponseEntity.ok(fertilizerRepository.findAll());
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<?> getFertilizerById(@PathVariable Long id) {
        return fertilizerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/public/type/{type}")
    public ResponseEntity<List<Fertilizer>> getByType(@PathVariable String type) {
        return ResponseEntity.ok(fertilizerRepository.findByType(type));
    }

    @GetMapping("/public/for-crop")
    public ResponseEntity<List<Fertilizer>> getFertilizersForCrop(@RequestParam String cropName) {
        return ResponseEntity.ok(fertilizerRepository.findByCropName(cropName));
    }
}
