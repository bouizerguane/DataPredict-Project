package com.example.featureselection.filters;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import java.util.Map;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;

class FCBFFilterTest {

    private FCBFFilter filter;

    @BeforeEach
    void setUp() {
        filter = new FCBFFilter();
    }

    @Test
    void testCalculateWithValidData() {
        double[][] features = {
                { 1.0, 2, 1.5 },
                { 2.0, 4, 3 },
                { 3.0, 6, 4.5 },
                { 4.0, 8, 6 },
                { 5.0, 10, 7.5 }
        };
        int[] target = { 0, 1, 0, 1, 0 };
        String[] featureNames = { "f1", "f2", "f3" };

        List<String> selected = filter.calculate(features, target, featureNames);

        assertNotNull(selected);
        assertTrue(selected.size() <= 3); 
    }

    @Test
    void testCalculateWithRedundantFeatures() {
        
        double[][] features = {
                { 1.0, 2 },
                { 2.0, 4 },
                { 3.0, 6 },
                { 4.0, 8 },
                { 5.0, 10 }
        };
        int[] target = { 0, 1, 0, 1, 0 };
        String[] featureNames = { "f1", "f2" };

        List<String> selected = filter.calculate(features, target, featureNames);

        assertNotNull(selected);
        
        assertTrue(selected.size() >= 1);
        assertTrue(selected.size() < 2, "Should remove redundant feature");
    }

    @Test
    void testCalculateWithIndependentFeatures() {
        double[][] features = {
                { 1.0, 10, 100 },
                { 2.0, 9, 90 },
                { 3.0, 8, 80 },
                { 4.0, 7, 70 },
                { 5.0, 6, 60 }
        };
        int[] target = { 0, 1, 0, 1, 0 };
        String[] featureNames = { "f1", "f2", "f3" };

        List<String> selected = filter.calculate(features, target, featureNames);

        assertNotNull(selected);
        assertTrue(selected.size() >= 1);
    }

    @Test
    void testCalculateWithSingleFeature() {
        double[][] features = {
                { 1.0 },
                { 2.0 },
                { 3.0 },
                { 4.0 },
                { 5.0 }
        };
        int[] target = { 0, 1, 0, 1, 0 };
        String[] featureNames = { "f1" };

        List<String> selected = filter.calculate(features, target, featureNames);

        assertNotNull(selected);
        assertEquals(1, selected.size());
        assertTrue(selected.contains("f1"));
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
        int[] target = { 0, 1, 0, 1, 0 };
        String[] featureNames = { "constant", "varying" };

        List<String> selected = filter.calculate(features, target, featureNames);

        assertNotNull(selected);
        
        assertFalse(selected.contains("constant"));
        assertTrue(selected.contains("varying"));
    }
}
