package com.example.featureselection.filters;

import org.springframework.stereotype.Component;
import smile.math.MathEx;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

@Component
public class ANOVAFilter {

    public Map<String, Double> calculate(double[][] x, int[] y, String[] featureNames) {
        Map<String, Double> scores = new HashMap<>();
        int features = x[0].length;
        int samples = x.length;

        
        int[] uniqueClasses = IntStream.of(y).distinct().sorted().toArray();
        int k = uniqueClasses.length;

        for (int j = 0; j < features; j++) {
            double[] featureCol = new double[samples];
            for (int i = 0; i < samples; i++) {
                featureCol[i] = x[i][j];
            }

            
            List<double[]> groups = new ArrayList<>();
            for (int label : uniqueClasses) {
                
                
                List<Double> groupList = new ArrayList<>();
                for (int i = 0; i < samples; i++) {
                    if (y[i] == label) {
                        groupList.add(featureCol[i]);
                    }
                }
                groups.add(groupList.stream().mapToDouble(d -> d).toArray());
            }

            
            
            
            

            double globalMean = MathEx.mean(featureCol);
            double ssb = 0.0;
            double ssw = 0.0;

            for (double[] group : groups) {
                double groupMean = MathEx.mean(group);
                ssb += group.length * Math.pow(groupMean - globalMean, 2);

                for (double val : group) {
                    ssw += Math.pow(val - groupMean, 2);
                }
            }

            double msb = ssb / (k - 1);
            double msw = ssw / (samples - k);

            double fScore = 0.0;
            if (msw > 1e-10) {
                fScore = msb / msw;
            } else {
                fScore = 0.0; 
            }

            if (Double.isNaN(fScore))
                fScore = 0.0;

            scores.put(featureNames[j], fScore);
        }
        return scores;
    }

    public Map<String, Double> calculate(double[][] x, double[] y, String[] featureNames) {
        Map<String, Double> scores = new HashMap<>();
        for (String name : featureNames) {
            scores.put(name, 0.0);
        }
        return scores;
    }
}
