package Preprocessing_Service.Preprocessing_Service.dto;

import java.util.List;
import java.util.Map;

public class DatasetExportDTO {
    private Long datasetId;
    private String filename;
    private String filepath;
    private List<String> allColumns;
    private List<String> numericColumns;
    private List<String> textColumns;
    private String suggestedTargetColumn;
    private Integer numRows;
    private Integer numColumns;
    private Map<String, ColumnMetadata> columnMetadata;
    private Map<String, Object> statistics;
    private PreprocessingInfo preprocessingInfo;

    
    public DatasetExportDTO() {
    }

    
    public Long getDatasetId() {
        return datasetId;
    }

    public void setDatasetId(Long datasetId) {
        this.datasetId = datasetId;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getFilepath() {
        return filepath;
    }

    public void setFilepath(String filepath) {
        this.filepath = filepath;
    }

    public List<String> getAllColumns() {
        return allColumns;
    }

    public void setAllColumns(List<String> allColumns) {
        this.allColumns = allColumns;
    }

    public List<String> getNumericColumns() {
        return numericColumns;
    }

    public void setNumericColumns(List<String> numericColumns) {
        this.numericColumns = numericColumns;
    }

    public List<String> getTextColumns() {
        return textColumns;
    }

    public void setTextColumns(List<String> textColumns) {
        this.textColumns = textColumns;
    }

    public String getSuggestedTargetColumn() {
        return suggestedTargetColumn;
    }

    public void setSuggestedTargetColumn(String suggestedTargetColumn) {
        this.suggestedTargetColumn = suggestedTargetColumn;
    }

    public Integer getNumRows() {
        return numRows;
    }

    public void setNumRows(Integer numRows) {
        this.numRows = numRows;
    }

    public Integer getNumColumns() {
        return numColumns;
    }

    public void setNumColumns(Integer numColumns) {
        this.numColumns = numColumns;
    }

    public Map<String, ColumnMetadata> getColumnMetadata() {
        return columnMetadata;
    }

    public void setColumnMetadata(Map<String, ColumnMetadata> columnMetadata) {
        this.columnMetadata = columnMetadata;
    }

    public Map<String, Object> getStatistics() {
        return statistics;
    }

    public void setStatistics(Map<String, Object> statistics) {
        this.statistics = statistics;
    }

    public PreprocessingInfo getPreprocessingInfo() {
        return preprocessingInfo;
    }

    public void setPreprocessingInfo(PreprocessingInfo preprocessingInfo) {
        this.preprocessingInfo = preprocessingInfo;
    }

    
    public static class ColumnMetadata {
        private String columnName;
        private String dataType; 
        private Integer uniqueValues;
        private Integer missingValues;
        private Object sampleValue;

        public ColumnMetadata() {
        }

        public ColumnMetadata(String columnName, String dataType) {
            this.columnName = columnName;
            this.dataType = dataType;
        }

        
        public String getColumnName() {
            return columnName;
        }

        public void setColumnName(String columnName) {
            this.columnName = columnName;
        }

        public String getDataType() {
            return dataType;
        }

        public void setDataType(String dataType) {
            this.dataType = dataType;
        }

        public Integer getUniqueValues() {
            return uniqueValues;
        }

        public void setUniqueValues(Integer uniqueValues) {
            this.uniqueValues = uniqueValues;
        }

        public Integer getMissingValues() {
            return missingValues;
        }

        public void setMissingValues(Integer missingValues) {
            this.missingValues = missingValues;
        }

        public Object getSampleValue() {
            return sampleValue;
        }

        public void setSampleValue(Object sampleValue) {
            this.sampleValue = sampleValue;
        }
    }

    public static class PreprocessingInfo {
        private Boolean isProcessed;
        private String fillnaMethod;
        private List<String> droppedColumns;
        private String timestamp;

        public PreprocessingInfo() {
        }

        
        public Boolean getIsProcessed() {
            return isProcessed;
        }

        public void setIsProcessed(Boolean isProcessed) {
            this.isProcessed = isProcessed;
        }

        public String getFillnaMethod() {
            return fillnaMethod;
        }

        public void setFillnaMethod(String fillnaMethod) {
            this.fillnaMethod = fillnaMethod;
        }

        public List<String> getDroppedColumns() {
            return droppedColumns;
        }

        public void setDroppedColumns(List<String> droppedColumns) {
            this.droppedColumns = droppedColumns;
        }

        public String getTimestamp() {
            return timestamp;
        }

        public void setTimestamp(String timestamp) {
            this.timestamp = timestamp;
        }
    }
}
