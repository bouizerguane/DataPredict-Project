package com.datapredict.aitraining.controller;

import com.datapredict.aitraining.model.TrainingRequest;
import com.datapredict.aitraining.model.TrainingResponse;
import com.datapredict.aitraining.service.TrainingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/training")
public class TrainingController {

    private final TrainingService trainingService;

    public TrainingController(TrainingService trainingService) {
        this.trainingService = trainingService;
    }

    @PostMapping("/train")
    public ResponseEntity<TrainingResponse> trainModels(@RequestBody TrainingRequest request) {
        TrainingResponse response = trainingService.processTraining(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory() {
        return ResponseEntity.ok(trainingService.getHistory());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        return ResponseEntity.ok(trainingService.getDashboardStats());
    }

    @GetMapping("/history/{id}")
    public ResponseEntity<?> getRecord(@PathVariable Long id) {
        return ResponseEntity.ok(trainingService.getRecord(id));
    }

    @GetMapping("/export/{id}")
    public ResponseEntity<?> exportModel(@PathVariable Long id, @RequestParam String format) {
        return ResponseEntity.ok(java.util.Map.of(
                "id", id,
                "format", format,
                "downloadUrl", "/api/training/download/" + id + "?format=" + format));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("AITrainingService is up and running");
    }
}
