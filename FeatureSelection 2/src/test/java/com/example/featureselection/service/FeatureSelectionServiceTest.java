package com.example.featureselection.service;

import com.example.featureselection.model.SelectionResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class FeatureSelectionServiceTest {

    @Autowired
    private FeatureSelectionService featureSelectionService;

    private MultipartFile validCsvFile;
    private MultipartFile smallCsvFile;

    @BeforeEach
    void setUp() throws IOException {
        
        byte[] csvContent = Files.readAllBytes(
                Paths.get("src/test/resources/test-data.csv"));
        validCsvFile = new MockMultipartFile(
                "file",
                "test-data.csv",
                "text/csv",
                csvContent);

        byte[] smallCsvContent = Files.readAllBytes(
                Paths.get("src/test/resources/test-data-small.csv"));
        smallCsvFile = new MockMultipartFile(
                "file",
                "test-data-small.csv",
                "text/csv",
                smallCsvContent);
    }

    @Test
    void testAnalyzeWithValidData() {
        SelectionResult result = featureSelectionService.analyze(validCsvFile, "target");

        assertNotNull(result);
        assertNotNull(result.getSelectedFeatures());
        assertNotNull(result.getRejectedFeatures());
        assertNotNull(result.getFeatureScores());

        
        int totalFeatures = result.getSelectedFeatures().size() + result.getRejectedFeatures().size();
        assertEquals(5, totalFeatures, "Should analyze all 5 features");

        
        assertEquals(5, result.getFeatureScores().size());
    }

    @Test
    void testAnalyzeWithSmallDataset() {
        SelectionResult result = featureSelectionService.analyze(smallCsvFile, "target");

        assertNotNull(result);
        assertNotNull(result.getSelectedFeatures());
        assertNotNull(result.getRejectedFeatures());

        int totalFeatures = result.getSelectedFeatures().size() + result.getRejectedFeatures().size();
        assertEquals(3, totalFeatures, "Should analyze all 3 features");
    }

    @Test
    void testAnalyzeFeatureScoresAreNormalized() {
        SelectionResult result = featureSelectionService.analyze(validCsvFile, "target");

        assertNotNull(result);

        
        result.getFeatureScores().forEach(score -> {
            if (score.getFinalScore() != null) {
                assertTrue(score.getFinalScore() >= 0 && score.getFinalScore() <= 1,
                        "Final score should be normalized between 0 and 1 for " + score.getFeatureName());
            }
        });
    }

    @Test
    void testAnalyzeFeatureScoresHaveAllComponents() {
        SelectionResult result = featureSelectionService.analyze(validCsvFile, "target");

        assertNotNull(result);

        
        result.getFeatureScores().forEach(score -> {
            assertNotNull(score.getFeatureName());
            
            assertTrue(
                    score.getMiScore() != null ||
                            score.getPearsonScore() != null ||
                            score.getAnovaScore() != null ||
                            score.getRfImportance() != null,
                    "At least one score component should be present for " + score.getFeatureName());
        });
    }

    @Test
    void testAnalyzeWithInvalidTargetFeature() {
        Exception exception = assertThrows(RuntimeException.class, () -> {
            featureSelectionService.analyze(validCsvFile, "nonexistent_target");
        });

        assertTrue(exception.getMessage().contains("Target feature") ||
                exception.getMessage().contains("not found") ||
                exception.getMessage().contains("nonexistent_target"));
    }

    @Test
    void testAnalyzeWithEmptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.csv",
                "text/csv",
                "".getBytes());

        assertThrows(RuntimeException.class, () -> {
            featureSelectionService.analyze(emptyFile, "target");
        });
    }

    @Test
    void testAnalyzeWithInvalidCsvFormat() {
        MockMultipartFile invalidFile = new MockMultipartFile(
                "file",
                "invalid.csv",
                "text/csv",
                "not,a,valid,csv,format\n1,2,3".getBytes());

        assertThrows(RuntimeException.class, () -> {
            featureSelectionService.analyze(invalidFile, "target");
        });
    }

    @Test
    void testAnalyzeSelectedFeaturesHaveHighScores() {
        SelectionResult result = featureSelectionService.analyze(validCsvFile, "target");

        assertNotNull(result);

        
        if (!result.getSelectedFeatures().isEmpty() && !result.getRejectedFeatures().isEmpty()) {
            double avgSelectedScore = result.getFeatureScores().stream()
                    .filter(score -> result.getSelectedFeatures().contains(score.getFeatureName()))
                    .filter(score -> score.getFinalScore() != null)
                    .mapToDouble(score -> score.getFinalScore())
                    .average()
                    .orElse(0.0);

            double avgRejectedScore = result.getFeatureScores().stream()
                    .filter(score -> result.getRejectedFeatures().contains(score.getFeatureName()))
                    .filter(score -> score.getFinalScore() != null)
                    .mapToDouble(score -> score.getFinalScore())
                    .average()
                    .orElse(0.0);

            assertTrue(avgSelectedScore >= avgRejectedScore,
                    "Selected features should have higher average scores than rejected features");
        }
    }

    @Test
    void testAnalyzeConsistency() {
        
        SelectionResult result1 = featureSelectionService.analyze(validCsvFile, "target");

        
        try {
            byte[] csvContent = Files.readAllBytes(
                    Paths.get("src/test/resources/test-data.csv"));
            MultipartFile validCsvFile2 = new MockMultipartFile(
                    "file",
                    "test-data.csv",
                    "text/csv",
                    csvContent);

            SelectionResult result2 = featureSelectionService.analyze(validCsvFile2, "target");

            
            assertEquals(result1.getSelectedFeatures().size(), result2.getSelectedFeatures().size());
            assertEquals(result1.getRejectedFeatures().size(), result2.getRejectedFeatures().size());

        } catch (IOException e) {
            fail("Failed to load test file: " + e.getMessage());
        }
    }

    @Test
    void testAnalyzeWithNullFile() {
        assertThrows(RuntimeException.class, () -> {
            featureSelectionService.analyze(null, "target");
        });
    }

    @Test
    void testAnalyzeWithNullTarget() {
        assertThrows(RuntimeException.class, () -> {
            featureSelectionService.analyze(validCsvFile, null);
        });
    }

    @Test
    void testAnalyzeWithEmptyTarget() {
        assertThrows(RuntimeException.class, () -> {
            featureSelectionService.analyze(validCsvFile, "");
        });
    }

    @Test
    void testParseCsvReturnsCorrectDimensions() {
        SelectionResult result = featureSelectionService.analyze(validCsvFile, "target");

        assertNotNull(result);
        
        assertEquals(5, result.getFeatureScores().size());
    }

    @Test
    void testAnalyzeWithRegressionLargeDataset() throws IOException {
        byte[] csvContent = Files.readAllBytes(Paths.get("src/test/resources/test-data-large-regression.csv"));
        MockMultipartFile largeFile = new MockMultipartFile("file", "test-data-large-regression.csv", "text/csv",
                csvContent);

        SelectionResult result = featureSelectionService.analyze(largeFile, "Target");
        assertNotNull(result);
        assertNotNull(result.getSelectedFeatures());
        
    }
}
