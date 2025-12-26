package com.example.featureselection.wrappers;

import org.springframework.stereotype.Component;
import smile.classification.RandomForest;
import smile.data.DataFrame;
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
public class RFE {

    private static final int MIN_FEATURES = 5;

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
            int[] indices = currentFeatures.stream().mapToInt(Integer::intValue).toArray();
            double[][] subset = slice(x, indices);

            java.util.Properties props = new java.util.Properties();
            props.setProperty("smile.random.forest.trees", "50");

            double[] importance;
            if (isClassification) {
                DataFrame df = com.example.featureselection.util.SmileHelper.toDataFrame(subset, (int[]) y);
                RandomForest model = RandomForest.fit(Formula.lhs("Class"), df, props);
                importance = model.importance();
            } else {
                DataFrame df = createDataFrame(subset, (double[]) y, "Target");
                smile.regression.RandomForest model = smile.regression.RandomForest.fit(Formula.lhs("Target"), df,
                        props);
                importance = model.importance();
            }

            int minIdx = -1;
            double minImp = Double.MAX_VALUE;

            for (int i = 0; i < importance.length; i++) {
                if (importance[i] < minImp) {
                    minImp = importance[i];
                    minIdx = i;
                }
            }

            if (minIdx != -1) {
                int featureToRemove = indices[minIdx];
                currentFeatures.remove(featureToRemove);
            } else {
                break;
            }
        }

        return new ArrayList<>(currentFeatures);
    }

    private DataFrame createDataFrame(double[][] x, double[] y, String targetName) {
        int cols = x[0].length;
        StructField[] fields = new StructField[cols + 1];
        for (int i = 0; i < cols; i++)
            fields[i] = new StructField("V" + i, DataTypes.DoubleType);
        fields[cols] = new StructField(targetName, DataTypes.DoubleType);

        StructType schema = new StructType(fields);
        List<Tuple> rows = new ArrayList<>();
        for (int i = 0; i < x.length; i++) {
            Object[] row = new Object[fields.length];
            for (int k = 0; k < cols; k++) {
                row[k] = x[i][k];
            }
            row[cols] = y[i];
            rows.add(Tuple.of(row, schema));
        }
        return DataFrame.of(rows, schema);
    }

    private double[][] slice(double[][] x, int[] indices) {
        int samples = x.length;
        int dims = indices.length;
        double[][] subset = new double[samples][dims];
        for (int i = 0; i < samples; i++) {
            for (int j = 0; j < dims; j++) {
                subset[i][j] = x[i][indices[j]];
            }
        }
        return subset;
    }
}
