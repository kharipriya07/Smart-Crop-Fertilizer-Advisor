package com.gardenadvisor.repository;

import com.gardenadvisor.model.UserCropHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserCropHistoryRepository extends JpaRepository<UserCropHistory, Long> {
    List<UserCropHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
