package com.datapredict.aitraining.service;

import com.datapredict.aitraining.model.AlgorithmRecommendation;
import com.datapredict.aitraining.model.TrainingRequest;
import com.datapredict.aitraining.model.TrainingResponse;
import com.datapredict.aitraining.model.TrainingRecord;
import com.datapredict.aitraining.model.TrainingResult;
import com.datapredict.aitraining.repository.TrainingRecordRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class TrainingService {
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(TrainingService.class);

    private final TrainingRecordRepository trainingRecordRepository;

    public TrainingService(TrainingRecordRepository trainingRecordRepository) {
        this.trainingRecordRepository = trainingRecordRepository;
    }

    @Value("${app.dataset.base-path:/tmp/datasets}")
    private String datasetBasePath;

    @Value("${app.python.script-path:/app/python/train_model.py}")
    private String pythonScriptPath;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public TrainingResponse processTraining(TrainingRequest request) {
        log.info("Processing training request for dataset: {}", request.getDatasetId());

        // 1. Select Top 2 Algorithms
        List<AlgorithmRecommendation> topAlgorithms = request.getAlgorithms().stream()
                .sorted(Comparator.comparingDouble(AlgorithmRecommendation::getScore).reversed())
                .limit(2)
                .collect(Collectors.toList());

        List<TrainingResult> results = new ArrayList<>();

        // 2. Train for each
        for (AlgorithmRecommendation algo : topAlgorithms) {
            try {
                TrainingResult result = trainModel(request.getDatasetId(), algo.getName(), algo.getParameters(),
                        request.getTargetColumn(), request.getTaskType());
                results.add(result);

                // Save to database
                saveTrainingRecord(request.getDatasetId(), result, request.getDescription());

            } catch (Exception e) {
                log.error("Failed to train model for algorithm: {}", algo.getName(), e);
            }
        }

        if (results.isEmpty()) {
            log.error("All models failed training for dataset: {}", request.getDatasetId());
            // Return empty response so frontend can handle it gracefully via UI instead of
            // 500
            return new TrainingResponse("None", new HashMap<>(), new ArrayList<>());
        }

        // 3. Compare and Determine Best
        return buildResponse(results);
    }

    private TrainingResult trainModel(String datasetId, String algorithmName, Map<String, Object> parameters,
            String targetColumn, String taskType)
            throws Exception {
        log.info("Starting training for algorithm: {} with params: {}", algorithmName, parameters);

        // ... (dataset path resolution logic)
        String datasetPath;
        if (datasetId.startsWith("/")) {
            datasetPath = datasetId; // Absolute path (rarely the case from frontend)
        } else if (datasetId.startsWith("export/")) {
            // Mapped via volume: ./Preprocessing_Service/export -> /app/datasets/export
            datasetPath = "/app/datasets/" + datasetId;
        } else if (datasetId.startsWith("uploads/")) {
            // Mapped via volume: ./Preprocessing_Service/uploads -> /app/datasets/uploads
            datasetPath = "/app/datasets/" + datasetId;
        } else {
            // Fallback or default structure
            // If frontend sends just the filename or partial path
            if (datasetId.contains("processed_")) {
                datasetPath = "/app/datasets/export/" + datasetId;
            } else {
                datasetPath = "/app/datasets/uploads/" + datasetId;
            }
        }

        // Ensure extension
        if (!datasetPath.toLowerCase().endsWith(".csv")) {
            datasetPath += ".csv";
        }

        log.info("Resolved dataset path: {}", datasetPath); // Debugging log

        // Verify existence (optional but urged for debugging)
        java.io.File file = new java.io.File(datasetPath);
        if (!file.exists()) {
            log.warn("Dataset not found at mapped path: {}. Checking alternatives...", datasetPath);
        }

        String finalScriptPath = pythonScriptPath;
        if (System.getProperty("os.name").toLowerCase().contains("mac")) {
            java.io.File relativeScript = new java.io.File("src/main/resources/python/train_model.py");
            if (relativeScript.exists()) {
                finalScriptPath = relativeScript.getPath();
            }
        }

        String paramsJson = objectMapper.writeValueAsString(parameters != null ? parameters : new HashMap<>());

        ProcessBuilder pb = new ProcessBuilder(
                "python3",
                finalScriptPath,
                datasetPath,
                algorithmName,
                targetColumn != null ? targetColumn : "target",
                taskType != null ? taskType : "classification",
                paramsJson);

        Process process = pb.start();

        BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
        StringBuilder output = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            output.append(line);
        }

        int exitCode = process.waitFor();
        if (exitCode != 0) {
            BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
            StringBuilder errorOutput = new StringBuilder();
            while ((line = errorReader.readLine()) != null) {
                errorOutput.append(line);
            }
            throw new RuntimeException("Python training script failed: " + errorOutput.toString());
        }

        // Parse JSON output
        String outputStr = output.toString();
        int jsonStartIndex = outputStr.indexOf("{");
        if (jsonStartIndex == -1) {
            throw new RuntimeException("No JSON found in Python output: " + outputStr);
        }
        String jsonOutput = outputStr.substring(jsonStartIndex);
        Map<String, Object> scriptResult = objectMapper.readValue(jsonOutput, Map.class);

        return TrainingResult.builder()
                .algorithmName((String) scriptResult.get("algorithm"))
                .metrics((Map<String, Object>) scriptResult.get("metrics"))
                .modelArtifactPath((String) scriptResult.get("modelPath"))
                .build();
    }

    public List<TrainingRecord> getHistory() {
        return trainingRecordRepository.findAllByOrderByDateDesc();
    }

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalDatasets", trainingRecordRepository.count());
        stats.put("modelsTrained", trainingRecordRepository.countByStatus("success"));

        Double bestAcc = trainingRecordRepository.findBestAccuracy();
        stats.put("bestAccuracy", bestAcc != null ? Math.round(bestAcc * 1000) / 10.0 : 0.0);

        stats.put("systemStatus", "healthy");
        stats.put("lastUpdated", LocalDateTime.now());

        List<TrainingRecord> history = trainingRecordRepository.findAllByOrderByDateDesc();
        stats.put("recentActivities", history.stream().limit(5).map(r -> {
            Map<String, Object> act = new HashMap<>();
            act.put("name", r.getModelName());
            act.put("accuracy", Math.round(r.getAccuracy() * 1000) / 10.0 + "%");
            act.put("date", r.getDate().toString());
            act.put("type", "classification");
            return act;
        }).collect(Collectors.toList()));

        return stats;
    }

    @SuppressWarnings("null")
    private void saveTrainingRecord(String datasetId, TrainingResult result, String description) {
        try {
            Map<String, Object> metrics = result.getMetrics();

            TrainingRecord record = TrainingRecord.builder()
                    .datasetName(
                            datasetId.contains("/") ? datasetId.substring(datasetId.lastIndexOf("/") + 1) : datasetId)
                    .modelName(result.getAlgorithmName())
                    .accuracy(getDoubleMetric(metrics, "accuracy"))
                    .precisionMetric(getDoubleMetric(metrics, "precision"))
                    .recall(getDoubleMetric(metrics, "recall"))
                    .f1Score(getDoubleMetric(metrics, "f1"))
                    .trainingTime(getDoubleMetric(metrics, "trainingTime"))
                    .status("success")
                    .date(LocalDateTime.now())
                    .description(description)
                    .fullMetrics(objectMapper.writeValueAsString(result.getMetrics()))
                    .build();

            trainingRecordRepository.save(record);
            log.info("Saved training record for {}", result.getAlgorithmName());
        } catch (Exception e) {
            log.error("Failed to save training record", e);
        }
    }

    public TrainingRecord getRecord(Long id) {
        return trainingRecordRepository.findById(id).orElseThrow();
    }

    private Double getDoubleMetric(Map<String, Object> metrics, String key) {
        Object val = metrics.get(key);
        if (val instanceof Number)
            return ((Number) val).doubleValue();
        return 0.0;
    }

    private TrainingResponse buildResponse(List<TrainingResult> results) {
        if (results.isEmpty()) {
            return new TrainingResponse();
        }

        // Determine best model based on accuracy
        TrainingResult best = results.stream()
                .max(Comparator.comparingDouble(r -> {
                    Map<String, Object> metrics = r.getMetrics();
                    Object acc = metrics.get("accuracy");
                    if (acc instanceof Number) {
                        return ((Number) acc).doubleValue();
                    }
                    return 0.0;
                }))
                .orElse(results.get(0));

        Map<String, Map<String, Object>> comparison = new HashMap<>();
        for (TrainingResult r : results) {
            comparison.put(r.getAlgorithmName(), r.getMetrics());
        }

        List<String> reports = Arrays.asList("training_report.pdf", "metrics.json"); // Mock reports

        return new TrainingResponse(best.getAlgorithmName(), comparison, reports);
    }
}
