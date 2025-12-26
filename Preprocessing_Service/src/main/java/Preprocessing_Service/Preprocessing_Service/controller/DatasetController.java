package Preprocessing_Service.Preprocessing_Service.controller;

import Preprocessing_Service.Preprocessing_Service.dto.DatasetExportDTO;
import Preprocessing_Service.Preprocessing_Service.service.PreprocessingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/datasets")
public class DatasetController {

    @Autowired
    private PreprocessingService preprocessingService;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDataset(@RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        return ResponseEntity.ok(preprocessingService.importDataset(file, description, userId));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<String> getStats(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(preprocessingService.getDatasetStats(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error generating stats: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<?> getPreview(@PathVariable("id") Long id) {
        try {
            return ResponseEntity.ok(preprocessingService.getDatasetPreview(id));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error generating preview: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/preprocess")
    public ResponseEntity<?> preprocess(@PathVariable("id") Long id,
            @RequestBody Map<String, Object> config,
            @RequestParam(value = "userId", defaultValue = "1") Long userId) {
        try {

            String configJson = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(config);
            return ResponseEntity.ok(preprocessingService.applyPreprocessing(id, configJson, userId));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error preprocessing: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/export")
    public ResponseEntity<?> exportDataset(@PathVariable("id") Long id) {
        try {
            DatasetExportDTO exportData = preprocessingService.exportDatasetInfo(id);
            return ResponseEntity.ok(exportData);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error exporting dataset: " + e.getMessage());
        }
    }

    @PostMapping("/{id}/nlp-analyze")
    public ResponseEntity<?> analyzeTextWithNLP(@PathVariable("id") Long id,
            @RequestBody Map<String, Object> params) {
        try {
            @SuppressWarnings("unchecked")
            java.util.List<String> textColumns = (java.util.List<String>) params.get("text_columns");
            String result = preprocessingService.analyzeTextWithNLP(id, textColumns);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error analyzing text: " + e.getMessage());
        }
    }

    @GetMapping("")
    public ResponseEntity<?> getAllDatasets() {
        try {
            return ResponseEntity.ok(preprocessingService.getAllDatasets());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching datasets: " + e.getMessage());
        }
    }

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardStats() {
        try {
            return ResponseEntity.ok(preprocessingService.getDashboardStats());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching dashboard stats: " + e.getMessage());
        }
    }
}
