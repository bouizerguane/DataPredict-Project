package com.example.featureselection.util;

import smile.data.DataFrame;
import smile.data.Tuple;
import smile.data.type.DataTypes;
import smile.data.type.StructField;
import smile.data.type.StructType;
import java.util.ArrayList;
import java.util.List;

public class SmileHelper {

    public static DataFrame toDataFrame(double[][] x, int[] y) {
        if (x.length == 0)
            return null;
        int features = x[0].length;

        StructField[] fields = new StructField[features + 1];
        for (int i = 0; i < features; i++) {
            fields[i] = new StructField("V" + i, DataTypes.DoubleType);
        }
        fields[features] = new StructField("Class", DataTypes.IntegerType);

        StructType schema = new StructType(fields);

        List<Tuple> data = new ArrayList<>(x.length);
        for (int i = 0; i < x.length; i++) {
            Object[] row = new Object[features + 1];
            for (int j = 0; j < features; j++) {
                row[j] = x[i][j];
            }
            row[features] = y[i];
            data.add(Tuple.of(row, schema));
        }

        return DataFrame.of(data, schema);
    }

    public static DataFrame toDataFrame(double[][] x) {
        if (x.length == 0)
            return null;
        int features = x[0].length;

        StructField[] fields = new StructField[features];
        for (int i = 0; i < features; i++) {
            fields[i] = new StructField("V" + i, DataTypes.DoubleType);
        }

        StructType schema = new StructType(fields);

        List<Tuple> data = new ArrayList<>(x.length);
        for (int i = 0; i < x.length; i++) {
            Object[] row = new Object[features];
            for (int j = 0; j < features; j++) {
                row[j] = x[i][j];
            }
            data.add(Tuple.of(row, schema));
        }
        return DataFrame.of(data, schema);
    }
}
