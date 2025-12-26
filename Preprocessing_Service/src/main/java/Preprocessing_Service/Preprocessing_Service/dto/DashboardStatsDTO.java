package Preprocessing_Service.Preprocessing_Service.dto;

import java.util.Map;

public class DashboardStatsDTO {
    private long totalDatasets;
    private long totalProcessed;
    private double bestAccuracy;
    private long modelsTrained;
    private Map<String, Long> serviceHealth;

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(long totalDatasets, long totalProcessed, double bestAccuracy, long modelsTrained) {
        this.totalDatasets = totalDatasets;
        this.totalProcessed = totalProcessed;
        this.bestAccuracy = bestAccuracy;
        this.modelsTrained = modelsTrained;
    }

    public long getTotalDatasets() {
        return totalDatasets;
    }

    public void setTotalDatasets(long totalDatasets) {
        this.totalDatasets = totalDatasets;
    }

    public long getTotalProcessed() {
        return totalProcessed;
    }

    public void setTotalProcessed(long totalProcessed) {
        this.totalProcessed = totalProcessed;
    }

    public double getBestAccuracy() {
        return bestAccuracy;
    }

    public void setBestAccuracy(double bestAccuracy) {
        this.bestAccuracy = bestAccuracy;
    }

    public long getModelsTrained() {
        return modelsTrained;
    }

    public void setModelsTrained(long modelsTrained) {
        this.modelsTrained = modelsTrained;
    }

    public Map<String, Long> getServiceHealth() {
        return serviceHealth;
    }

    public void setServiceHealth(Map<String, Long> serviceHealth) {
        this.serviceHealth = serviceHealth;
    }
}
