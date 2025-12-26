package com.example.featureselection.filters;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class MutualInformationFilterTest {

    private MutualInformationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new MutualInformationFilter();
    }

    @Test
    void testCalculateWithValidData() {
        double[][] features = {
                { 1.0, 2 },
                { 2.0, 4 },
                { 3.0, 6 },
                { 4.0, 8 },
                { 5.0, 10 }
        };
        int[] target = { 0, 1, 0, 1, 0 };
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
    void testCalculateWithConstantFeature() {
        double[][] features = {
                { 1.0, 5 },
                { 1.0, 5 },
                { 1.0, 5 },
                { 1.0, 5 },
                { 1.0, 5 }
        };
        int[] target = { 0, 1, 0, 1, 0 };
        String[] featureNames = { "constant", "feature2" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(2, scores.size());

        
        assertTrue(scores.get("constant") >= 0);
    }

    @Test
    void testCalculateWithPerfectCorrelation() {
        double[][] features = {
                { 0.0 },
                { 1.0 },
                { 0.0 },
                { 1.0 },
                { 0.0 }
        };
        int[] target = { 0, 1, 0, 1, 0 };
        String[] featureNames = { "perfect" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(1, scores.size());

        
        assertTrue(scores.get("perfect") > 0);
    }

    @Test
    void testCalculateWithMultipleFeatures() {
        double[][] features = {
                { 1.0, 2, 3, 4 },
                { 2.0, 4, 6, 8 },
                { 3.0, 6, 9, 12 },
                { 4.0, 8, 12, 16 },
                { 5.0, 10, 15, 20 },
                { 6.0, 12, 18, 24 }
        };
        int[] target = { 0, 1, 0, 1, 0, 1 };
        String[] featureNames = { "f1", "f2", "f3", "f4" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(4, scores.size());

        for (String feature : featureNames) {
            assertTrue(scores.containsKey(feature));
            assertTrue(scores.get(feature) >= 0);
        }
    }

    @Test
    void testCalculateWithSingleSample() {
        double[][] features = { { 1.0, 2 } };
        int[] target = { 0 };
        String[] featureNames = { "f1", "f2" };

        Map<String, Double> scores = filter.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(2, scores.size());
    }
}
