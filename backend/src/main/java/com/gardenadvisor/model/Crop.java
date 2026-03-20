package com.gardenadvisor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "crops")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Crop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column
    private String category; // Vegetable, Herb, Flower, Fruit, Leafy Green

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column
    private String growingSeason;

    @Column
    private Integer daysToHarvest;

    @Column
    private String sunlightRequirement;

    @Column
    private String waterRequirement;

    @Column
    private String spaceType; // comma-separated: POTS,GARDEN_BED,RAISED_BED,INDOORS

    @Column
    private String difficultyLevel; // BEGINNER, INTERMEDIATE, ADVANCED

    @Column
    private String iconEmoji;
}
