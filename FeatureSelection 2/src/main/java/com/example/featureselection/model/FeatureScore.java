package com.example.featureselection.model;

public class FeatureScore {
    private String featureName;
    private Double miScore;
    private Double pearsonScore;
    private Double anovaScore;
    private Double rfImportance;
    private Double finalScore;
    private boolean selected;
    private String explanation;

    public FeatureScore() {
    }

    public FeatureScore(String featureName, Double miScore, Double pearsonScore, Double anovaScore,
            Double rfImportance, Double finalScore, boolean selected, String explanation) {
        this.featureName = featureName;
        this.miScore = miScore;
        this.pearsonScore = pearsonScore;
        this.anovaScore = anovaScore;
        this.rfImportance = rfImportance;
        this.finalScore = finalScore;
        this.selected = selected;
        this.explanation = explanation;
    }

    public static FeatureScoreBuilder builder() {
        return new FeatureScoreBuilder();
    }

    public String getFeatureName() {
        return featureName;
    }

    public void setFeatureName(String featureName) {
        this.featureName = featureName;
    }

    public Double getMiScore() {
        return miScore;
    }

    public void setMiScore(Double miScore) {
        this.miScore = miScore;
    }

    public Double getPearsonScore() {
        return pearsonScore;
    }

    public void setPearsonScore(Double pearsonScore) {
        this.pearsonScore = pearsonScore;
    }

    public Double getAnovaScore() {
        return anovaScore;
    }

    public void setAnovaScore(Double anovaScore) {
        this.anovaScore = anovaScore;
    }

    public Double getRfImportance() {
        return rfImportance;
    }

    public void setRfImportance(Double rfImportance) {
        this.rfImportance = rfImportance;
    }

    public Double getFinalScore() {
        return finalScore;
    }

    public void setFinalScore(Double finalScore) {
        this.finalScore = finalScore;
    }

    public boolean isSelected() {
        return selected;
    }

    public void setSelected(boolean selected) {
        this.selected = selected;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public static class FeatureScoreBuilder {
        private String featureName;
        private Double miScore;
        private Double pearsonScore;
        private Double anovaScore;
        private Double rfImportance;
        private Double finalScore;
        private boolean selected;
        private String explanation;

        public FeatureScoreBuilder featureName(String featureName) {
            this.featureName = featureName;
            return this;
        }

        public FeatureScoreBuilder miScore(Double miScore) {
            this.miScore = miScore;
            return this;
        }

        public FeatureScoreBuilder pearsonScore(Double pearsonScore) {
            this.pearsonScore = pearsonScore;
            return this;
        }

        public FeatureScoreBuilder anovaScore(Double anovaScore) {
            this.anovaScore = anovaScore;
            return this;
        }

        public FeatureScoreBuilder rfImportance(Double rfImportance) {
            this.rfImportance = rfImportance;
            return this;
        }

        public FeatureScoreBuilder finalScore(Double finalScore) {
            this.finalScore = finalScore;
            return this;
        }

        public FeatureScoreBuilder selected(boolean selected) {
            this.selected = selected;
            return this;
        }

        public FeatureScoreBuilder explanation(String explanation) {
            this.explanation = explanation;
            return this;
        }

        public FeatureScore build() {
            return new FeatureScore(featureName, miScore, pearsonScore, anovaScore,
                    rfImportance, finalScore, selected, explanation);
        }
    }
}
