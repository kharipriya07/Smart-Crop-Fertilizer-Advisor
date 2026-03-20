package com.gardenadvisor.repository;

import com.gardenadvisor.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CropRepository extends JpaRepository<Crop, Long> {
    Optional<Crop> findFirstByNameIgnoreCase(String name);

    @Query("SELECT c FROM Crop c WHERE c.spaceType LIKE %:spaceType%")
    List<Crop> findBySpaceType(@Param("spaceType") String spaceType);

    List<Crop> findByCategory(String category);

    List<Crop> findByDifficultyLevel(String difficultyLevel);

    @Query("SELECT c FROM Crop c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(c.category) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Crop> searchCrops(@Param("query") String query);
}
