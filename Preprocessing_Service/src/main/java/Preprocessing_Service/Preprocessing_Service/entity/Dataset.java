package Preprocessing_Service.Preprocessing_Service.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "datasets")
public class Dataset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;

    private String title;

    private String description;

    @Column(name = "imported_file_path")
    private String importedFilePath;

    @Column(name = "exported_file_path")
    private String exportedFilePath;

    @Column(name = "date_import")
    private LocalDateTime dateImport;

    @Column(name = "date_export")
    private LocalDateTime dateExport;

    @Enumerated(EnumType.STRING)
    private DatasetStatus status;

    @Column(columnDefinition = "TEXT")
    private String processingConfig;

    @Column(name = "target_variable")
    private String targetVariable;

    @Column(name = "row_count")
    private Integer rowCount;

    @Column(name = "column_count")
    private Integer columnCount;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "quality_score")
    private Double qualityScore;

    @PrePersist
    protected void onCreate() {
        if (dateImport == null) {
            dateImport = LocalDateTime.now();
        }
        if (status == null) {
            status = DatasetStatus.IMPORTED;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getImportedFilePath() {
        return importedFilePath;
    }

    public void setImportedFilePath(String importedFilePath) {
        this.importedFilePath = importedFilePath;
    }

    public String getExportedFilePath() {
        return exportedFilePath;
    }

    public void setExportedFilePath(String exportedFilePath) {
        this.exportedFilePath = exportedFilePath;
    }

    public LocalDateTime getDateImport() {
        return dateImport;
    }

    public void setDateImport(LocalDateTime dateImport) {
        this.dateImport = dateImport;
    }

    public LocalDateTime getDateExport() {
        return dateExport;
    }

    public void setDateExport(LocalDateTime dateExport) {
        this.dateExport = dateExport;
    }

    public DatasetStatus getStatus() {
        return status;
    }

    public void setStatus(DatasetStatus status) {
        this.status = status;
    }

    public String getProcessingConfig() {
        return processingConfig;
    }

    public void setProcessingConfig(String processingConfig) {
        this.processingConfig = processingConfig;
    }

    public String getTargetVariable() {
        return targetVariable;
    }

    public void setTargetVariable(String targetVariable) {
        this.targetVariable = targetVariable;
    }

    public Integer getRowCount() {
        return rowCount;
    }

    public void setRowCount(Integer rowCount) {
        this.rowCount = rowCount;
    }

    public Integer getColumnCount() {
        return columnCount;
    }

    public void setColumnCount(Integer columnCount) {
        this.columnCount = columnCount;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Double getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Double qualityScore) {
        this.qualityScore = qualityScore;
    }

    public enum DatasetStatus {
        IMPORTED,
        EXPORTED
    }
}
