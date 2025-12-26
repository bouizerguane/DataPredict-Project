package com.example.featureselection.model;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class FeatureScoreTest {

    @Test
    void testBuilderPattern() {
        FeatureScore score = FeatureScore.builder()
                .featureName("feature1")
                .miScore(0.8)
                .pearsonScore(0.7)
                .anovaScore(0.9)
                .rfImportance(0.85)
                .finalScore(0.82)
                .selected(true)
                .explanation("High importance")
                .build();

        assertEquals("feature1", score.getFeatureName());
        assertEquals(0.8, score.getMiScore());
        assertEquals(0.7, score.getPearsonScore());
        assertEquals(0.9, score.getAnovaScore());
        assertEquals(0.85, score.getRfImportance());
        assertEquals(0.82, score.getFinalScore());
        assertTrue(score.isSelected());
        assertEquals("High importance", score.getExplanation());
    }

    @Test
    void testDefaultConstructor() {
        FeatureScore score = new FeatureScore();
        assertNull(score.getFeatureName());
        assertNull(score.getMiScore());
        assertNull(score.getPearsonScore());
        assertNull(score.getAnovaScore());
        assertNull(score.getRfImportance());
        assertNull(score.getFinalScore());
        assertFalse(score.isSelected());
        assertNull(score.getExplanation());
    }

    @Test
    void testSettersAndGetters() {
        FeatureScore score = new FeatureScore();

        score.setFeatureName("testFeature");
        score.setMiScore(0.5);
        score.setPearsonScore(0.6);
        score.setAnovaScore(0.7);
        score.setRfImportance(0.8);
        score.setFinalScore(0.65);
        score.setSelected(true);
        score.setExplanation("Test explanation");

        assertEquals("testFeature", score.getFeatureName());
        assertEquals(0.5, score.getMiScore());
        assertEquals(0.6, score.getPearsonScore());
        assertEquals(0.7, score.getAnovaScore());
        assertEquals(0.8, score.getRfImportance());
        assertEquals(0.65, score.getFinalScore());
        assertTrue(score.isSelected());
        assertEquals("Test explanation", score.getExplanation());
    }

    @Test
    void testNullScores() {
        FeatureScore score = FeatureScore.builder()
                .featureName("feature1")
                .selected(false)
                .build();

        assertEquals("feature1", score.getFeatureName());
        assertNull(score.getMiScore());
        assertNull(score.getPearsonScore());
        assertNull(score.getAnovaScore());
        assertNull(score.getRfImportance());
        assertNull(score.getFinalScore());
        assertFalse(score.isSelected());
    }

    @Test
    void testZeroScores() {
        FeatureScore score = FeatureScore.builder()
                .featureName("feature1")
                .miScore(0.0)
                .pearsonScore(0.0)
                .anovaScore(0.0)
                .rfImportance(0.0)
                .finalScore(0.0)
                .selected(false)
                .build();

        assertEquals(0, score.getMiScore());
        assertEquals(0, score.getPearsonScore());
        assertEquals(0, score.getAnovaScore());
        assertEquals(0, score.getRfImportance());
        assertEquals(0, score.getFinalScore());
    }
}
