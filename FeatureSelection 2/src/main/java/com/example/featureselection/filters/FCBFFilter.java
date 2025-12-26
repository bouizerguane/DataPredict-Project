package com.example.featureselection.filters;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class FCBFFilter {

    public List<String> calculate(double[][] x, int[] y, String[] featureNames) {
        return calculateInternal(x, y, featureNames);
    }

    public List<String> calculate(double[][] x, double[] y, String[] featureNames) {
        int[] discretizedY = discretize(y, 10);
        return calculateInternal(x, discretizedY, featureNames);
    }

    private List<String> calculateInternal(double[][] x, int[] y, String[] featureNames) {
        int samples = x.length;
        int features = x[0].length;

        
        int[][] discretizedX = new int[features][samples];
        for (int j = 0; j < features; j++) {
            double[] col = new double[samples];
            for (int i = 0; i < samples; i++)
                col[i] = x[i][j];
            discretizedX[j] = discretize(col, 10);
        }

        
        List<FeatureSU> featureSUs = new ArrayList<>();
        for (int j = 0; j < features; j++) {
            double su = calculateSU(discretizedX[j], y);
            
            if (su > 1e-4) {
                featureSUs.add(new FeatureSU(decisionIndex(j, featureNames), j, su, featureNames[j]));
            }
        }

        
        featureSUs.sort(Comparator.comparingDouble((FeatureSU f) -> f.su).reversed());

        
        List<String> selectedFeatures = new ArrayList<>();
        boolean[] removed = new boolean[featureSUs.size()];

        for (int i = 0; i < featureSUs.size(); i++) {
            if (removed[i])
                continue;

            FeatureSU fTop = featureSUs.get(i);
            selectedFeatures.add(fTop.name);

            for (int k = i + 1; k < featureSUs.size(); k++) {
                if (removed[k])
                    continue;

                FeatureSU fCandidate = featureSUs.get(k);
                
                double suXX = calculateSU(discretizedX[fTop.index], discretizedX[fCandidate.index]);

                
                if (suXX >= fCandidate.su) {
                    removed[k] = true;
                }
            }
        }

        return selectedFeatures;
    }

    private int decisionIndex(int j, String[] names) {
        return j;
    }

    private static class FeatureSU {
        int index; 
        double su;
        String name;

        FeatureSU(int index, int idx, double su, String name) {
            this.index = idx;
            this.su = su;
            this.name = name;
        }
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

    private double calculateSU(int[] x, int[] y) {
        double hx = entropy(x);
        double hy = entropy(y);
        double hxy = jointEntropy(x, y);
        double mi = hx + hy - hxy;

        if (hx + hy == 0)
            return 0.0;

        return 2.0 * mi / (hx + hy);
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
