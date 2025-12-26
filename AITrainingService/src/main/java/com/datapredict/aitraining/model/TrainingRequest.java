package com.datapredict.aitraining.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

public class TrainingRequest {
    private String datasetId;
    private String targetColumn;
    private String taskType;
    private String description;
    private List<AlgorithmRecommendation> algorithms;

    public TrainingRequest() {
    }

    public String getDatasetId() {
        return datasetId;
    }

    public void setDatasetId(String datasetId) {
        this.datasetId = datasetId;
    }

    public String getTargetColumn() {
        return targetColumn;
    }

    public void setTargetColumn(String targetColumn) {
        this.targetColumn = targetColumn;
    }

    public String getTaskType() {
        return taskType;
    }

    public void setTaskType(String taskType) {
        this.taskType = taskType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<AlgorithmRecommendation> getAlgorithms() {
        return algorithms;
    }

    public void setAlgorithms(List<AlgorithmRecommendation> algorithms) {
        this.algorithms = algorithms;
    }
}
