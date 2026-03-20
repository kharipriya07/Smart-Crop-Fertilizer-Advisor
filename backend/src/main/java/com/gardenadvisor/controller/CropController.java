package com.gardenadvisor.controller;

import com.gardenadvisor.model.Crop;
import com.gardenadvisor.repository.CropRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/crops")
@CrossOrigin
public class CropController {

    @Autowired
    private CropRepository cropRepository;

    @GetMapping("/public/all")
    public ResponseEntity<List<Crop>> getAllCrops() {
        return ResponseEntity.ok(cropRepository.findAll());
    }

    @GetMapping("/public/search")
    public ResponseEntity<?> searchCrops(@RequestParam String query) {
        List<Crop> results = cropRepository.searchCrops(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/public/space/{spaceType}")
    public ResponseEntity<List<Crop>> getCropsBySpace(@PathVariable String spaceType) {
        return ResponseEntity.ok(cropRepository.findBySpaceType(spaceType));
    }

    @GetMapping("/public/categories")
    public ResponseEntity<?> getCategories() {
        List<String> categories = List.of("Vegetable", "Herb", "Leafy Green", "Flower", "Fruit");
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/public/{id}")
    public ResponseEntity<?> getCropById(@PathVariable Long id) {
        return cropRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
