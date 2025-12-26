package Preprocessing_Service.Preprocessing_Service.service;

import Preprocessing_Service.Preprocessing_Service.dto.DatasetExportDTO;
import Preprocessing_Service.Preprocessing_Service.entity.Dataset;
import Preprocessing_Service.Preprocessing_Service.repository.DatasetRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Map;

@Service
public class PreprocessingService {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private PythonService pythonService;

    @Autowired
    private DatasetRepository datasetRepository;

    public Dataset importDataset(MultipartFile file, String description, Long userId) {
        try {
            String filepath = fileStorageService.storeFile(file);

            Dataset dataset = new Dataset();
            dataset.setUserId(userId);
            dataset.setTitle(file.getOriginalFilename());
            dataset.setDescription(description);
            dataset.setImportedFilePath(filepath);
            dataset.setDateImport(LocalDateTime.now());
            dataset.setStatus(Dataset.DatasetStatus.IMPORTED);

            // AUTOMATIC ANALYSIS
            try {
                String analysisResult = pythonService.analyzeDataset(filepath);
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> analysisData = mapper.readValue(analysisResult, Map.class);

                if (analysisData != null) {
                    dataset.setTargetVariable((String) analysisData.get("suggestedTargetColumn"));
                    dataset.setRowCount((Integer) analysisData.get("numRows"));
                    dataset.setColumnCount((Integer) analysisData.get("numColumns"));
                    dataset.setContentType((String) analysisData.get("contentType"));

                    Object quality = analysisData.get("qualityScore");
                    if (quality instanceof Number) {
                        dataset.setQualityScore(((Number) quality).doubleValue());
                    }
                }
            } catch (Exception e) {
                System.err.println("Warning: Automatic analysis failed: " + e.getMessage());
            }

            return datasetRepository.save(dataset);
        } catch (Exception e) {
            throw new RuntimeException("Failed to import dataset: " + e.getMessage());
        }
    }

    public String getDatasetStats(Long id) throws IOException, InterruptedException {
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));

        String filepath = dataset.getImportedFilePath();

        return pythonService.executeScript("process_data.py", "stats", filepath, null, null);
    }

    public Object getDatasetPreview(Long id) throws IOException, InterruptedException {
        String statsJson = getDatasetStats(id);
        ObjectMapper mapper = new ObjectMapper();
        @SuppressWarnings("unchecked")
        Map<String, Object> stats = mapper.readValue(statsJson, Map.class);
        return stats.get("head");
    }

    public Dataset applyPreprocessing(Long datasetId, String configJson, Long userId)
            throws IOException, InterruptedException {
        Dataset dataset = datasetRepository.findById(datasetId)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));

        String exportDir = "export";
        java.nio.file.Files.createDirectories(java.nio.file.Paths.get(exportDir));

        String timestamp = String.valueOf(System.currentTimeMillis());
        String originalName = dataset.getTitle().replaceAll("\\.[^.]+$", "");
        String newFilename = "processed_" + timestamp + "_" + originalName + ".csv";
        String outputFile = exportDir + "/" + newFilename;

        String configFilename = "config_" + timestamp + ".json";
        String configPath = exportDir + "/" + configFilename;
        java.nio.file.Files.write(java.nio.file.Paths.get(configPath), configJson.getBytes());

        pythonService.executeScript("preprocess.py", "preprocess", dataset.getImportedFilePath(), outputFile,
                configPath);

        dataset.setExportedFilePath(outputFile);
        dataset.setDateExport(LocalDateTime.now());
        dataset.setStatus(Dataset.DatasetStatus.EXPORTED);
        dataset.setProcessingConfig(configJson);

        return datasetRepository.save(dataset);
    }

    public DatasetExportDTO exportDatasetInfo(Long id) throws IOException, InterruptedException {
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));

        String filepath = dataset.getExportedFilePath() != null
                ? dataset.getExportedFilePath()
                : dataset.getImportedFilePath();

        String filename = dataset.getTitle();

        String analysisResult = pythonService.analyzeDataset(filepath);

        ObjectMapper mapper = new ObjectMapper();
        Map<String, Object> analysisData = mapper.readValue(analysisResult, Map.class);

        DatasetExportDTO exportDTO = new DatasetExportDTO();
        exportDTO.setDatasetId(dataset.getId());
        exportDTO.setFilename(filename);
        exportDTO.setFilepath(filepath);

        exportDTO.setAllColumns((ArrayList<String>) analysisData.get("allColumns"));
        exportDTO.setNumericColumns((ArrayList<String>) analysisData.get("numericColumns"));
        exportDTO.setTextColumns((ArrayList<String>) analysisData.get("textColumns"));
        exportDTO.setSuggestedTargetColumn((String) analysisData.get("suggestedTargetColumn"));

        exportDTO.setNumRows((Integer) analysisData.get("numRows"));
        exportDTO.setNumColumns((Integer) analysisData.get("numColumns"));

        Map<String, Object> columnMetadataRaw = (Map<String, Object>) analysisData.get("columnMetadata");
        Map<String, DatasetExportDTO.ColumnMetadata> columnMetadata = new java.util.HashMap<>();

        if (columnMetadataRaw != null) {
            for (Map.Entry<String, Object> entry : columnMetadataRaw.entrySet()) {
                Map<String, Object> colData = (Map<String, Object>) entry.getValue();
                DatasetExportDTO.ColumnMetadata metadata = new DatasetExportDTO.ColumnMetadata();
                metadata.setColumnName((String) colData.get("columnName"));
                metadata.setDataType((String) colData.get("dataType"));
                metadata.setUniqueValues((Integer) colData.get("uniqueValues"));
                metadata.setMissingValues((Integer) colData.get("missingValues"));
                metadata.setSampleValue(colData.get("sampleValue"));
                columnMetadata.put(entry.getKey(), metadata);
            }
        }
        exportDTO.setColumnMetadata(columnMetadata);

        exportDTO.setStatistics((Map<String, Object>) analysisData.get("statistics"));

        DatasetExportDTO.PreprocessingInfo preprocessingInfo = new DatasetExportDTO.PreprocessingInfo();
        preprocessingInfo.setIsProcessed(dataset.getStatus() == Dataset.DatasetStatus.EXPORTED);
        preprocessingInfo.setTimestamp(LocalDateTime.now().toString());
        exportDTO.setPreprocessingInfo(preprocessingInfo);

        return exportDTO;
    }

    public String analyzeTextWithNLP(Long id, java.util.List<String> textColumns)
            throws IOException, InterruptedException {
        Dataset dataset = datasetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dataset not found"));

        String filepath = dataset.getExportedFilePath() != null
                ? dataset.getExportedFilePath()
                : dataset.getImportedFilePath();

        return pythonService.analyzeTextWithNLP(filepath, textColumns);
    }

    public java.util.List<Dataset> getAllDatasets() {
        return datasetRepository.findAll();
    }

    public Preprocessing_Service.Preprocessing_Service.dto.DashboardStatsDTO getDashboardStats() {
        long totalDatasets = datasetRepository.count();
        long totalProcessed = getAllDatasets().stream()
                .filter(d -> d.getStatus() == Dataset.DatasetStatus.EXPORTED)
                .count();

        // Use real counts
        return new Preprocessing_Service.Preprocessing_Service.dto.DashboardStatsDTO(
                totalDatasets,
                totalProcessed,
                0.0, // Best accuracy is actually from AITrainingService
                0 // Models trained count is actually from AITrainingService
        );
    }

    public void recordTraining(double accuracy) {
        // This is now handled by AITrainingService database
    }
}
