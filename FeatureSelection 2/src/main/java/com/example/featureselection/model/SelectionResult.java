package com.example.featureselection.model;

import java.util.List;

public class SelectionResult {
    private List<String> selectedFeatures;
    private List<String> rejectedFeatures;
    private List<FeatureScore> featureScores;
    private String mode;

    public SelectionResult() {
    }

    public SelectionResult(List<String> selectedFeatures, List<String> rejectedFeatures,
            List<FeatureScore> featureScores, String mode) {
        this.selectedFeatures = selectedFeatures;
        this.rejectedFeatures = rejectedFeatures;
        this.featureScores = featureScores;
        this.mode = mode;
    }

    public static SelectionResultBuilder builder() {
        return new SelectionResultBuilder();
    }

    public List<String> getSelectedFeatures() {
        return selectedFeatures;
    }

    public void setSelectedFeatures(List<String> selectedFeatures) {
        this.selectedFeatures = selectedFeatures;
    }

    public List<String> getRejectedFeatures() {
        return rejectedFeatures;
    }

    public void setRejectedFeatures(List<String> rejectedFeatures) {
        this.rejectedFeatures = rejectedFeatures;
    }

    public List<FeatureScore> getFeatureScores() {
        return featureScores;
    }

    public void setFeatureScores(List<FeatureScore> featureScores) {
        this.featureScores = featureScores;
    }

    public String getMode() {
        return mode;
    }

    public void setMode(String mode) {
        this.mode = mode;
    }

    public static class SelectionResultBuilder {
        private List<String> selectedFeatures;
        private List<String> rejectedFeatures;
        private List<FeatureScore> featureScores;
        private String mode;

        public SelectionResultBuilder selectedFeatures(List<String> selectedFeatures) {
            this.selectedFeatures = selectedFeatures;
            return this;
        }

        public SelectionResultBuilder rejectedFeatures(List<String> rejectedFeatures) {
            this.rejectedFeatures = rejectedFeatures;
            return this;
        }

        public SelectionResultBuilder featureScores(List<FeatureScore> featureScores) {
            this.featureScores = featureScores;
            return this;
        }

        public SelectionResultBuilder mode(String mode) {
            this.mode = mode;
            return this;
        }

        public SelectionResult build() {
            return new SelectionResult(selectedFeatures, rejectedFeatures, featureScores, mode);
        }
    }
}
