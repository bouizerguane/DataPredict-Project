package com.example.featureselection.filters;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class PearsonFilterTest {

    private PearsonFilter filter;

    @BeforeEach
    void setUp() {
        filter = new PearsonFilter();
    }

    @Test
    void testCalculateWithPositiveCorrelation() {
        double[][] features = {
                { 1.0 },
                { 2.0 },
                { 3.0 },
                { 4.0 },
                { 5.0 }
        };
        int[] target = { 2, 4, 6, 8, 10 };
        String[] featureNames = { "feature1" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(1, scores.size());
        assertTrue(scores.containsKey("feature1"));

        
        double score = Math.abs(scores.get("feature1"));
        assertTrue(score > 0.9, "Expected high correlation, got: " + score);
    }

    @Test
    void testCalculateWithNegativeCorrelation() {
        double[][] features = {
                { 1.0 },
                { 2.0 },
                { 3.0 },
                { 4.0 },
                { 5.0 }
        };
        int[] target = { 10, 8, 6, 4, 2 };
        String[] featureNames = { "feature1" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);

        
        double score = Math.abs(scores.get("feature1"));
        assertTrue(score > 0.9, "Expected high negative correlation, got: " + score);
    }

    @Test
    void testCalculateWithZeroCorrelation() {
        double[][] features = {
                { 1.0 },
                { 2.0 },
                { 3.0 },
                { 4.0 },
                { 5.0 }
        };
        int[] target = { 5, 5, 5, 5, 5 };
        String[] featureNames = { "feature1" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);

        
        Double score = scores.get("feature1");
        assertTrue(score == null || score.isNaN() || Math.abs(score) < 0.1);
    }

    @Test
    void testCalculateWithMultipleFeatures() {
        double[][] features = {
                { 1.0, 5, 10 },
                { 2.0, 4, 9 },
                { 3.0, 3, 8 },
                { 4.0, 2, 7 },
                { 5.0, 1, 6 }
        };
        int[] target = { 1, 2, 3, 4, 5 };
        String[] featureNames = { "positive", "negative", "mixed" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(3, scores.size());

        
        assertTrue(scores.get("positive") > 0.9);

        
        
        assertTrue(scores.get("negative") > 0.9);
    }

    @Test
    void testCalculateWithConstantFeature() {
        double[][] features = {
                { 5.0, 1 },
                { 5.0, 2 },
                { 5.0, 3 },
                { 5.0, 4 },
                { 5.0, 5 }
        };
        int[] target = { 1, 2, 3, 4, 5 };
        String[] featureNames = { "constant", "varying" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);

        
        Double constantScore = scores.get("constant");
        assertTrue(constantScore == null || constantScore.isNaN() || Math.abs(constantScore) < 0.1);

        
        assertTrue(Math.abs(scores.get("varying")) > 0.9);
    }

    @Test
    void testCalculateWithSmallDataset() {
        double[][] features = {
                { 1.0, 2 },
                { 2.0, 4 },
                { 3.0, 6 }
        };
        int[] target = { 1, 2, 3 };
        String[] featureNames = { "f1", "f2" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(2, scores.size());

        
        assertTrue(Math.abs(scores.get("f1")) > 0.99);
        assertTrue(Math.abs(scores.get("f2")) > 0.99);
    }
}
