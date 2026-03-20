package com.gardenadvisor.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_crop_history")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCropHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String cropName;

    @Column
    private String spaceType; // POTS, GARDEN_BED, RAISED_BED, INDOORS

    @Column
    private String location;

    @Column
    private String soilType;

    @Column(columnDefinition = "TEXT")
    private String recommendationJson; // stored as JSON string

    @Column
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
