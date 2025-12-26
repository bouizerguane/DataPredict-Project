package com.datapredict.aitraining.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrainingResult {
    private String algorithmName;
    private Map<String, Object> metrics; // accuracy, precision, recall, f1, loss
    private String modelArtifactPath;

   /* public TrainingResult() {
    }

    public TrainingResult(String algorithmName, Map<String, Object> metrics, String modelArtifactPath) {
        this.algorithmName = algorithmName;
        this.metrics = metrics;
        this.modelArtifactPath = modelArtifactPath;
    }*/

    public static TrainingResultBuilder builder() {
        return new TrainingResultBuilder();
    }

    public String getAlgorithmName() {
        return algorithmName;
    }

    public void setAlgorithmName(String algorithmName) {
        this.algorithmName = algorithmName;
    }

    public Map<String, Object> getMetrics() {
        return metrics;
    }

    public void setMetrics(Map<String, Object> metrics) {
        this.metrics = metrics;
    }

    public String getModelArtifactPath() {
        return modelArtifactPath;
    }

    public void setModelArtifactPath(String modelArtifactPath) {
        this.modelArtifactPath = modelArtifactPath;
    }

    public static class TrainingResultBuilder {
        private String algorithmName;
        private Map<String, Object> metrics;
        private String modelArtifactPath;

        public TrainingResultBuilder algorithmName(String algorithmName) {
            this.algorithmName = algorithmName;
            return this;
        }

        public TrainingResultBuilder metrics(Map<String, Object> metrics) {
            this.metrics = metrics;
            return this;
        }

        public TrainingResultBuilder modelArtifactPath(String modelArtifactPath) {
            this.modelArtifactPath = modelArtifactPath;
            return this;
        }

        public TrainingResult build() {
            return new TrainingResult(algorithmName, metrics, modelArtifactPath);
        }
    }
}
