package com.gardenadvisor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fertilizers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Fertilizer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String type; // Organic, Synthetic, Micronutrient, etc.

    @Column
    private Double nitrogenPct;

    @Column
    private Double phosphorusPct;

    @Column
    private Double potassiumPct;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String howItWorks;

    @Column(columnDefinition = "TEXT")
    private String bestForCrops;

    @Column(columnDefinition = "TEXT")
    private String avoidFor;

    @Column(columnDefinition = "TEXT")
    private String dosageInstruction;

    @Column(columnDefinition = "TEXT")
    private String timing;

    @Column(columnDefinition = "TEXT")
    private String bestSoil;

    @Column
    private String optimalPh;

    @Column(columnDefinition = "TEXT")
    private String environmentalImpact;

    @Column
    private String costLevel;

    @Column(columnDefinition = "TEXT")
    private String storageInstruction;
}
