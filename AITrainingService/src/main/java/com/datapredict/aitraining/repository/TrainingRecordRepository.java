package com.datapredict.aitraining.repository;

import com.datapredict.aitraining.model.TrainingRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainingRecordRepository extends JpaRepository<TrainingRecord, Long> {
    List<TrainingRecord> findAllByOrderByDateDesc();

    @Query("SELECT MAX(t.accuracy) FROM TrainingRecord t WHERE t.status = 'success'")
    Double findBestAccuracy();

    long countByStatus(String status);
}
