package com.example.featureselection.filters;

import org.springframework.stereotype.Component;
import smile.math.MathEx;

import java.util.HashMap;
import java.util.Map;

@Component
public class PearsonFilter {

    public Map<String, Double> calculate(double[][] x, int[] y, String[] featureNames) {
        int samples = x.length;
        double[] target = new double[samples];
        for (int i = 0; i < samples; i++) {
            target[i] = (double) y[i];
        }
        return calculateInternal(x, target, featureNames);
    }

    public Map<String, Double> calculate(double[][] x, double[] y, String[] featureNames) {
        return calculateInternal(x, y, featureNames);
    }

    private Map<String, Double> calculateInternal(double[][] x, double[] y, String[] featureNames) {
        Map<String, Double> scores = new HashMap<>();
        int samples = x.length;
        int features = x[0].length;

        for (int j = 0; j < features; j++) {
            double[] featureCol = new double[samples];
            for (int i = 0; i < samples; i++) {
                featureCol[i] = x[i][j];
            }

            
            double correlation = Math.abs(MathEx.cor(featureCol, y));
            if (Double.isNaN(correlation)) {
                correlation = 0.0;
            }
            scores.put(featureNames[j], correlation);
        }
        return scores;
    }
}
