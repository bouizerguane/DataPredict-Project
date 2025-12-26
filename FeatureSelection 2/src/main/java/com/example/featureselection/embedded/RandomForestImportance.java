package com.example.featureselection.embedded;

import org.springframework.stereotype.Component;
import smile.classification.RandomForest;
import smile.data.DataFrame;
import smile.data.Tuple;
import smile.data.formula.Formula;
import smile.data.type.StructField;
import smile.data.type.StructType;
import smile.data.type.DataTypes;
import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Component
public class RandomForestImportance {

    public Map<String, Double> calculate(double[][] x, int[] y, String[] featureNames) {
        
        return calculateInternal(x, y, featureNames, true);
    }

    public Map<String, Double> calculate(double[][] x, double[] y, String[] featureNames) {
        
        return calculateInternal(x, y, featureNames, false);
    }

    private Map<String, Double> calculateInternal(double[][] x, Object y, String[] featureNames,
            boolean isClassification) {
        Map<String, Double> scores = new HashMap<>();

        
        StructField[] fields = new StructField[featureNames.length + 1];
        for (int i = 0; i < featureNames.length; i++) {
            fields[i] = new StructField(featureNames[i], DataTypes.DoubleType);
        }

        if (isClassification) {
            fields[featureNames.length] = new StructField("Class", DataTypes.IntegerType);
        } else {
            fields[featureNames.length] = new StructField("Target", DataTypes.DoubleType);
        }

        StructType schema = new StructType(fields);

        
        int rows = x.length;
        List<Tuple> data = new java.util.ArrayList<>();

        int[] yInt = isClassification ? (int[]) y : null;
        double[] yDouble = !isClassification ? (double[]) y : null;

        for (int i = 0; i < rows; i++) {
            Object[] row = new Object[featureNames.length + 1];
            for (int j = 0; j < featureNames.length; j++) {
                row[j] = x[i][j];
            }
            if (isClassification) {
                row[featureNames.length] = yInt[i];
            } else {
                row[featureNames.length] = yDouble[i];
            }
            data.add(Tuple.of(row, schema));
        }

        DataFrame df = DataFrame.of(data, schema);

        
        java.util.Properties props = new java.util.Properties();
        props.setProperty("smile.random.forest.trees", "100");
        int mtry = (int) Math.sqrt(featureNames.length);
        if (mtry < 1)
            mtry = 1;
        props.setProperty("smile.random.forest.mtry", String.valueOf(mtry));
        
        props.setProperty("smile.random.forest.max.nodes", String.valueOf(rows));
        props.setProperty("smile.random.forest.node.size", "1");

        double[] importance;
        if (isClassification) {
            RandomForest model = RandomForest.fit(Formula.lhs("Class"), df, props);
            importance = model.importance();
        } else {
            smile.regression.RandomForest model = smile.regression.RandomForest.fit(Formula.lhs("Target"), df, props);
            importance = model.importance();
        }

        
        for (int i = 0; i < featureNames.length; i++) {
            double imp = 0.0;
            if (i < importance.length) {
                imp = importance[i];
            }
            scores.put(featureNames[i], imp);
        }

        return scores;
    }
}
