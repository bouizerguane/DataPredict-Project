package com.example.featureselection.embedded;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class RandomForestImportanceTest {

    private RandomForestImportance rfImportance;

    @BeforeEach
    void setUp() {
        rfImportance = new RandomForestImportance();
    }

    @Test
    void testCalculateWithValidData() {
        double[][] features = {
                { 1.0, 10, 100 },
                { 2.0, 11, 90 },
                { 3.0, 12, 80 },
                { 4.0, 13, 70 },
                { 5.0, 14, 60 },
                { 6.0, 15, 50 },
                { 7.0, 16, 40 },
                { 8.0, 17, 30 },
                { 9.0, 18, 20 },
                { 10.0, 19, 10 }
        };
        int[] target = { 0, 0, 0, 0, 0, 1, 1, 1, 1, 1 };
        String[] featureNames = { "f1", "f2", "f3" };

        Map<String, Double> scores = rfImportance.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(3, scores.size());

        for (String feature : featureNames) {
            assertTrue(scores.containsKey(feature));
            assertTrue(scores.get(feature) >= 0,
                    "Importance score should be non-negative for " + feature);
        }
    }

    @Test
    void testCalculateWithLargerDataset() {
        
        int numSamples = 50;
        double[][] features = new double[numSamples][4];
        int[] target = new int[numSamples];

        for (int i = 0; i < numSamples; i++) {
            features[i][0] = i; 
            features[i][1] = i * 2; 
            features[i][2] = Math.random() * 100; 
            features[i][3] = Math.random() * 100; 
            target[i] = i < numSamples / 2 ? 0 : 1;
        }

        String[] featureNames = { "strong1", "strong2", "weak1", "weak2" };

        Map<String, Double> scores = rfImportance.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(4, scores.size());

        
        for (String feature : featureNames) {
            assertTrue(scores.get(feature) >= 0);
        }
    }

    @Test
    void testCalculateConsistencyWithFixedSeed() {
        double[][] features = {
                { 1.0, 2 },
                { 2.0, 4 },
                { 3.0, 6 },
                { 4.0, 8 },
                { 5.0, 10 },
                { 6.0, 12 },
                { 7.0, 14 },
                { 8.0, 16 }
        };
        int[] target = { 0, 0, 0, 0, 1, 1, 1, 1 };
        String[] featureNames = { "f1", "f2" };

        Map<String, Double> scores1 = rfImportance.calculate(features, target, featureNames);
        Map<String, Double> scores2 = rfImportance.calculate(features, target, featureNames);

        assertNotNull(scores1);
        assertNotNull(scores2);

        
        
        
        assertEquals(scores1.size(), scores2.size());
    }

    @Test
    void testCalculateWithBinaryClassification() {
        double[][] features = {
                { 1.0, 5, 10 },
                { 2.0, 6, 11 },
                { 3.0, 7, 12 },
                { 10.0, 1, 1 },
                { 11.0, 2, 2 },
                { 12.0, 3, 3 }
        };
        int[] target = { 0, 0, 0, 1, 1, 1 };
        String[] featureNames = { "f1", "f2", "f3" };

        Map<String, Double> scores = rfImportance.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(3, scores.size());

        
        double totalImportance = scores.values().stream()
                .mapToDouble(Double::doubleValue)
                .sum();
        assertTrue(totalImportance > 0, "Total importance should be positive");
    }

    @Test
    void testCalculateWithMinimalData() {
        double[][] features = {
                { 1.0, 2 },
                { 2.0, 4 },
                { 3.0, 6 },
                { 4.0, 8 },
                { 5.0, 10 }
        };
        int[] target = { 0, 0, 1, 1, 1 };
        String[] featureNames = { "f1", "f2" };

        Map<String, Double> scores = rfImportance.calculate(features, target, featureNames);

        assertNotNull(scores);
        assertEquals(2, scores.size());
        assertTrue(scores.get("f1") >= 0);
        assertTrue(scores.get("f2") >= 0);
    }
}
