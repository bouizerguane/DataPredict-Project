package com.example.featureselection.filters;

import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.Arrays;

@Component
public class MutualInformationFilter {

    public Map<String, Double> calculate(double[][] x, int[] y, String[] featureNames) {
        return calculateInternal(x, y, featureNames);
    }

    public Map<String, Double> calculate(double[][] x, double[] y, String[] featureNames) {
        
        int[] discretizedY = discretize(y, 10);
        return calculateInternal(x, discretizedY, featureNames);
    }

    private Map<String, Double> calculateInternal(double[][] x, int[] y, String[] featureNames) {
        Map<String, Double> scores = new HashMap<>();
        int samples = x.length;
        int features = x[0].length;

        for (int j = 0; j < features; j++) {
            double[] featureCol = new double[samples];
            for (int i = 0; i < samples; i++) {
                featureCol[i] = x[i][j];
            }

            
            int[] discretizedFeature = discretize(featureCol, 10);

            
            double mi = calculateMutualInformation(discretizedFeature, y);
            scores.put(featureNames[j], mi);
        }
        return scores;
    }

    private int[] discretize(double[] feature, int bins) {
        int n = feature.length;
        int[] discretized = new int[n];
        double min = Arrays.stream(feature).min().orElse(0);
        double max = Arrays.stream(feature).max().orElse(1);
        double width = (max - min) / bins;

        if (width == 0) {
            return new int[n]; 
        }

        for (int i = 0; i < n; i++) {
            int bin = (int) ((feature[i] - min) / width);
            if (bin >= bins)
                bin = bins - 1;
            discretized[i] = bin;
        }
        return discretized;
    }

    private double calculateMutualInformation(int[] x, int[] y) {
        
        

        double hx = entropy(x);
        double hy = entropy(y);
        double hxy = jointEntropy(x, y);

        return hx + hy - hxy;
    }

    private double entropy(int[] data) {
        Map<Integer, Integer> counts = new HashMap<>();
        for (int val : data) {
            counts.put(val, counts.getOrDefault(val, 0) + 1);
        }

        double entropy = 0.0;
        int n = data.length;
        for (int count : counts.values()) {
            double p = (double) count / n;
            entropy -= p * Math.log(p);
        }
        return entropy;
    }

    private double jointEntropy(int[] x, int[] y) {
        Map<String, Integer> counts = new HashMap<>();
        int n = x.length;
        for (int i = 0; i < n; i++) {
            String key = x[i] + "," + y[i];
            counts.put(key, counts.getOrDefault(key, 0) + 1);
        }

        double entropy = 0.0;
        for (int count : counts.values()) {
            double p = (double) count / n;
            entropy -= p * Math.log(p);
        }
        return entropy;
    }
}
