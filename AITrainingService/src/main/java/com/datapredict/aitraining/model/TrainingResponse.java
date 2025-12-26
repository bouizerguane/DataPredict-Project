package com.datapredict.aitraining.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class TrainingResponse {
    private String bestModel;
    private Map<String, Map<String, Object>> comparison;
    private List<String> reports;

    /*public TrainingResponse() {
    }

    public TrainingResponse(String bestModel, Map<String, Map<String, Object>> comparison, List<String> reports) {
        this.bestModel = bestModel;
        this.comparison = comparison;
        this.reports = reports;
    }*/

    public String getBestModel() {
        return bestModel;
    }

    public void setBestModel(String bestModel) {
        this.bestModel = bestModel;
    }

    public Map<String, Map<String, Object>> getComparison() {
        return comparison;
    }

    public void setComparison(Map<String, Map<String, Object>> comparison) {
        this.comparison = comparison;
    }

    public List<String> getReports() {
        return reports;
    }

    public void setReports(List<String> reports) {
        this.reports = reports;
    }

    public static TrainingResponseBuilder builder() {
        return new TrainingResponseBuilder();
    }

    public static class TrainingResponseBuilder {
        private String bestModel;
        private Map<String, Map<String, Object>> comparison;
        private List<String> reports;

        public TrainingResponseBuilder bestModel(String bestModel) {
            this.bestModel = bestModel;
            return this;
        }

        public TrainingResponseBuilder comparison(Map<String, Map<String, Object>> comparison) {
            this.comparison = comparison;
            return this;
        }

        public TrainingResponseBuilder reports(List<String> reports) {
            this.reports = reports;
            return this;
        }

        public TrainingResponse build() {
            return new TrainingResponse(bestModel, comparison, reports);
        }
    }
}
