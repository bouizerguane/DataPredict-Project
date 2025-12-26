package com.example.featureselection.model;

import org.junit.jupiter.api.Test;
import java.util.Arrays;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class SelectionResultTest {

    @Test
    void testBuilderPattern() {
        List<String> selected = Arrays.asList("feature1", "feature2");
        List<String> rejected = Arrays.asList("feature3", "feature4");
        List<FeatureScore> scores = Arrays.asList(
                FeatureScore.builder().featureName("feature1").finalScore(0.9).selected(true).build(),
                FeatureScore.builder().featureName("feature2").finalScore(0.8).selected(true).build());

        SelectionResult result = SelectionResult.builder()
                .selectedFeatures(selected)
                .rejectedFeatures(rejected)
                .featureScores(scores)
                .build();

        assertEquals(2, result.getSelectedFeatures().size());
        assertEquals(2, result.getRejectedFeatures().size());
        assertEquals(2, result.getFeatureScores().size());
        assertTrue(result.getSelectedFeatures().contains("feature1"));
        assertTrue(result.getRejectedFeatures().contains("feature3"));
    }

    @Test
    void testDefaultConstructor() {
        SelectionResult result = new SelectionResult();
        assertNull(result.getSelectedFeatures());
        assertNull(result.getRejectedFeatures());
        assertNull(result.getFeatureScores());
    }

    @Test
    void testSettersAndGetters() {
        SelectionResult result = new SelectionResult();

        List<String> selected = Arrays.asList("f1", "f2");
        List<String> rejected = Arrays.asList("f3");
        List<FeatureScore> scores = Arrays.asList(
                FeatureScore.builder().featureName("f1").build());

        result.setSelectedFeatures(selected);
        result.setRejectedFeatures(rejected);
        result.setFeatureScores(scores);

        assertEquals(2, result.getSelectedFeatures().size());
        assertEquals(1, result.getRejectedFeatures().size());
        assertEquals(1, result.getFeatureScores().size());
    }

    @Test
    void testEmptyLists() {
        SelectionResult result = SelectionResult.builder()
                .selectedFeatures(Arrays.asList())
                .rejectedFeatures(Arrays.asList())
                .featureScores(Arrays.asList())
                .build();

        assertNotNull(result.getSelectedFeatures());
        assertNotNull(result.getRejectedFeatures());
        assertNotNull(result.getFeatureScores());
        assertTrue(result.getSelectedFeatures().isEmpty());
        assertTrue(result.getRejectedFeatures().isEmpty());
        assertTrue(result.getFeatureScores().isEmpty());
    }

    @Test
    void testConstructorWithParameters() {
        List<String> selected = Arrays.asList("feature1");
        List<String> rejected = Arrays.asList("feature2");
        List<FeatureScore> scores = Arrays.asList(
                FeatureScore.builder().featureName("feature1").build());

        SelectionResult result = new SelectionResult(selected, rejected, scores, "CLASSIFICATION");

        assertEquals(selected, result.getSelectedFeatures());
        assertEquals(rejected, result.getRejectedFeatures());
        assertEquals(scores, result.getFeatureScores());
    }
}
