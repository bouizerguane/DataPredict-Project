package com.example.featureselection.wrappers;

import org.springframework.stereotype.Component;
import smile.classification.RandomForest;
import smile.data.DataFrame;
import smile.data.Tuple;
import smile.data.formula.Formula;
import smile.data.Tuple;
import smile.data.type.DataTypes;
import smile.data.type.StructField;
import smile.data.type.StructType;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class SBS {

    private static final int MIN_FEATURES = 5;
    private static final int K_FOLD = 5;

    public List<Integer> select(double[][] x, int[] y) {
        return selectInternal(x, y, true);
    }

    public List<Integer> select(double[][] x, double[] y) {
        return selectInternal(x, y, false);
    }

    private List<Integer> selectInternal(double[][] x, Object y, boolean isClassification) {
        int totalFeatures = x[0].length;
        int featuresToKeep = Math.min(MIN_FEATURES, totalFeatures);

        Set<Integer> currentFeatures = new HashSet<>();
        for (int i = 0; i < totalFeatures; i++)
            currentFeatures.add(i);

        while (currentFeatures.size() > featuresToKeep) {
            int bestRemovalCandidate = -1;
            double bestMetric = Double.NEGATIVE_INFINITY;

            for (int feature : currentFeatures) {
                Set<Integer> temp = new HashSet<>(currentFeatures);
                temp.remove(feature);

                int[] indices = temp.stream().mapToInt(Integer::intValue).toArray();
                double metric = evaluate(x, y, indices, isClassification);

                
                
                
                if (metric > bestMetric) {
                    bestMetric = metric;
                    bestRemovalCandidate = feature;
                }
            }

            if (bestRemovalCandidate != -1) {
                currentFeatures.remove(bestRemovalCandidate);
            } else {
                break;
            }
        }

        return new ArrayList<>(currentFeatures);
    }

    private double evaluate(double[][] x, Object y, int[] featureIndices, boolean isClassification) {
        
        
        int samples = x.length;
        int dims = featureIndices.length;
        double[][] subset = new double[samples][dims];

        for (int i = 0; i < samples; i++) {
            for (int j = 0; j < dims; j++) {
                subset[i][j] = x[i][featureIndices[j]];
            }
        }

        int n = subset.length;
        int foldSize = n / K_FOLD;
        double totalMetric = 0.0;

        int[] yInt = isClassification ? (int[]) y : null;
        double[] yDouble = !isClassification ? (double[]) y : null;

        for (int fold = 0; fold < K_FOLD; fold++) {
            int testStart = fold * foldSize;
            int testEnd = (fold == K_FOLD - 1) ? n : (fold + 1) * foldSize;

            List<double[]> trainXList = new ArrayList<>();
            List<double[]> testXList = new ArrayList<>();
            List<Object> trainYList = new ArrayList<>();
            List<Object> testYList = new ArrayList<>();

            for (int i = 0; i < n; i++) {
                double[] row = subset[i];
                Object val;
                if (isClassification) {
                    val = yInt[i];
                } else {
                    val = yDouble[i];
                }
                if (i >= testStart && i < testEnd) {
                    testXList.add(row);
                    testYList.add(val);
                } else {
                    trainXList.add(row);
                    trainYList.add(val);
                }
            }

            double[][] trainX = trainXList.toArray(new double[0][]);
            double[][] testX = testXList.toArray(new double[0][]);

            if (isClassification) {
                int[] trainY = trainYList.stream().mapToInt(o -> (int) o).toArray();
                int[] testY = testYList.stream().mapToInt(o -> (int) o).toArray();

                DataFrame trainDf = com.example.featureselection.util.SmileHelper.toDataFrame(trainX, trainY);
                java.util.Properties props = new java.util.Properties();
                props.setProperty("smile.random.forest.trees", "20");
                RandomForest model = RandomForest.fit(Formula.lhs("Class"), trainDf, props);

                DataFrame testDf = com.example.featureselection.util.SmileHelper.toDataFrame(testX);
                Tuple[] testTuples = testDf.stream().toArray(Tuple[]::new);

                int correct = 0;
                for (int i = 0; i < testTuples.length; i++) {
                    if (model.predict(testTuples[i]) == testY[i])
                        correct++;
                }
                totalMetric += (double) correct / testTuples.length;

            } else {
                double[] trainY = trainYList.stream().mapToDouble(o -> (double) o).toArray();
                double[] testY = testYList.stream().mapToDouble(o -> (double) o).toArray();

                DataFrame trainDf = createDataFrame(trainX, trainY, "Target");
                java.util.Properties props = new java.util.Properties();
                props.setProperty("smile.random.forest.trees", "20");
                smile.regression.RandomForest model = smile.regression.RandomForest.fit(Formula.lhs("Target"), trainDf,
                        props);

                DataFrame testDf = createDataFrame(testX, null, "Target");
                Tuple[] testTuples = testDf.stream().toArray(Tuple[]::new);

                double sse = 0.0;
                double sumY = 0.0;
                for (double v : testY)
                    sumY += v;
                double meanY = sumY / testY.length;
                double sst = 0.0;

                for (int i = 0; i < testTuples.length; i++) {
                    double pred = model.predict(testTuples[i]);
                    sse += Math.pow(testY[i] - pred, 2);
                    sst += Math.pow(testY[i] - meanY, 2);
                }
                double r2 = (sst < 1e-9) ? 0.0 : (1.0 - sse / sst);
                totalMetric += r2;
            }
        }
        return totalMetric / K_FOLD;
    }

    private DataFrame createDataFrame(double[][] x, double[] y, String targetName) {
        int cols = x[0].length;
        StructField[] fields = new StructField[cols + (y != null ? 1 : 0)];
        for (int i = 0; i < cols; i++)
            fields[i] = new StructField("V" + i, DataTypes.DoubleType);
        if (y != null)
            fields[cols] = new StructField(targetName, DataTypes.DoubleType);

        StructType schema = new StructType(fields);
        List<Tuple> rows = new ArrayList<>();
        for (int i = 0; i < x.length; i++) {
            Object[] row = new Object[fields.length];
            for (int k = 0; k < cols; k++) {
                row[k] = x[i][k];
            }
            if (y != null)
                row[cols] = y[i];
            rows.add(Tuple.of(row, schema));
        }
        return DataFrame.of(rows, schema);
    }
}
