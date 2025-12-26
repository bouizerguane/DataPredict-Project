package com.example.featureselection.filters;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class ANOVAFilterTest {

    private ANOVAFilter filter;

    @BeforeEach
    void setUp() {
        filter = new ANOVAFilter();
    }

    @Test
    void testCalculateWithValidData() {
        double[][] features = {
                { 1.0, 10 },
                { 2.0, 11 },
                { 3.0, 12 },
                { 10.0, 1 },
                { 11.0, 2 },
                { 12.0, 3 }
        };
        int[] target = { 0, 0, 0, 1, 1, 1 };
        String[] featureNames = { "feature1", "feature2" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(2, scores.size());
        assertTrue(scores.containsKey("feature1"));
        assertTrue(scores.containsKey("feature2"));

        
        assertTrue(scores.get("feature1") >= 0);
        assertTrue(scores.get("feature2") >= 0);
    }

    @Test
    void testCalculateWithHighVarianceBetweenGroups() {
        double[][] features = {
                { 1.0 },
                { 2.0 },
                { 3.0 },
                { 100.0 },
                { 101.0 },
                { 102.0 }
        };
        int[] target = { 0, 0, 0, 1, 1, 1 };
        String[] featureNames = { "feature1" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);

        
        assertTrue(scores.get("feature1") > 10,
                "Expected high F-statistic for high between-group variance, got: " + scores.get("feature1"));
    }

    @Test
    void testCalculateWithLowVarianceBetweenGroups() {
        double[][] features = {
                { 1.0 },
                { 2.0 },
                { 3.0 },
                { 1.5 },
                { 2.5 },
                { 3.5 }
        };
        int[] target = { 0, 0, 0, 1, 1, 1 };
        String[] featureNames = { "feature1" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);

        
        assertTrue(scores.get("feature1") >= 0);
    }

    @Test
    void testCalculateWithMultipleClasses() {
        double[][] features = {
                { 1.0, 10 },
                { 2.0, 11 },
                { 5.0, 5 },
                { 6.0, 6 },
                { 10.0, 1 },
                { 11.0, 2 }
        };
        int[] target = { 0, 0, 1, 1, 2, 2 };
        String[] featureNames = { "f1", "f2" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(2, scores.size());

        for (String feature : featureNames) {
            assertTrue(scores.containsKey(feature));
            assertTrue(scores.get(feature) >= 0);
        }
    }

    @Test
    void testCalculateWithSingleClass() {
        double[][] features = {
                { 1.0, 2 },
                { 2.0, 4 },
                { 3.0, 6 }
        };
        int[] target = { 0, 0, 0 };
        String[] featureNames = { "f1", "f2" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);

        
        for (String feature : featureNames) {
            Double score = scores.get(feature);
            assertTrue(score == null || score.isNaN() || score == 0.0);
        }
    }

    @Test
    void testCalculateWithConstantFeature() {
        double[][] features = {
                { 5.0, 1 },
                { 5.0, 2 },
                { 5.0, 10 },
                { 5.0, 11 }
        };
        int[] target = { 0, 0, 1, 1 };
        String[] featureNames = { "constant", "varying" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);

        
        Double constantScore = scores.get("constant");
        assertTrue(constantScore == null || constantScore.isNaN() || constantScore == 0.0);

        
        assertTrue(scores.get("varying") > 0);
    }

    @Test
    void testCalculateWithBinaryClassification() {
        double[][] features = {
                { 1.0, 2, 3 },
                { 1.5, 2.5, 3.5 },
                { 2.0, 3, 4 },
                { 10.0, 20, 30 },
                { 10.5, 20.5, 30.5 },
                { 11.0, 21, 31 }
        };
        int[] target = { 0, 0, 0, 1, 1, 1 };
        String[] featureNames = { "f1", "f2", "f3" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(3, scores.size());

        
        for (String feature : featureNames) {
            assertTrue(scores.get(feature) > 1,
                    "Expected F-statistic > 1 for " + feature + ", got: " + scores.get(feature));
        }
    }
}
