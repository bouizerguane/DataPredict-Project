package Preprocessing_Service.Preprocessing_Service.repository;

import Preprocessing_Service.Preprocessing_Service.entity.Dataset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DatasetRepository extends JpaRepository<Dataset, Long> {
    List<Dataset> findByUserId(Long userId);
}
