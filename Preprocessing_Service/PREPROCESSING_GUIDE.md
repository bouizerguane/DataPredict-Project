# Preprocessing Service - NLP & Text Vectorization Guide

## Overview
This preprocessing service automatically handles all types of data including **text columns** that need to be converted to numerical vectors for machine learning.

## 📁 File Structure
- **Uploaded files**: Stored in `uploads/` folder
- **Processed files**: Stored in `export/` folder
- **Database**: Single `datasets` table tracks both import and export states

## 🔄 Automatic Column Detection

The service automatically detects three types of columns:

1. **Numeric Columns**: int64, float64 types
2. **Categorical Columns**: Text with <50% unique values (e.g., categories, labels)
3. **Text Columns**: Long text (avg length >50 chars) or high uniqueness

## 🎯 Preprocessing Scenarios

### Scenario 1: Basic Preprocessing (No Text)
**Use Case**: Dataset with only numeric and categorical data

```json
{
  "fillna": {
    "method": "mean"
  },
  "drop_columns": ["id", "timestamp"],
  "categorical_encoding": {
    "method": "label"
  },
  "scaling": {
    "enabled": true,
    "method": "standard"
  }
}
```

### Scenario 2: Text Vectorization with TF-IDF
**Use Case**: Dataset with text columns (reviews, descriptions, comments)

```json
{
  "fillna": {
    "method": "mean"
  },
  "text_preprocessing": {
    "lowercase": true,
    "remove_whitespace": true,
    "remove_special_chars": false,
    "remove_numbers": false
  },
  "text_vectorization": {
    "enabled": true,
    "method": "tfidf",
    "max_features": 100,
    "drop_original": true
  },
  "categorical_encoding": {
    "method": "onehot"
  }
}
```

**What happens**:
- Text columns are cleaned (lowercase, whitespace removal)
- TF-IDF creates 100 numerical features per text column
- Original text columns are dropped
- Result: Fully numerical dataset ready for ML

### Scenario 3: Count Vectorization
**Use Case**: When you want word frequency instead of TF-IDF

```json
{
  "text_vectorization": {
    "enabled": true,
    "method": "count",
    "max_features": 50
  }
}
```

### Scenario 4: Keep Original Text Columns
**Use Case**: When you want both text and vectors

```json
{
  "text_vectorization": {
    "enabled": true,
    "method": "tfidf",
    "max_features": 100,
    "drop_original": false
  }
}
```

### Scenario 5: Skip Vectorization for Specific Columns
**Use Case**: Some text columns should remain as-is

```json
{
  "text_vectorization": {
    "enabled": true,
    "method": "tfidf",
    "max_features": 100
  },
  "skip_vectorization": ["customer_name", "product_id"]
}
```

### Scenario 6: Complete Pipeline
**Use Case**: Full preprocessing with all steps

```json
{
  "fillna": {
    "method": "median"
  },
  "drop_columns": ["id", "created_at"],
  "text_preprocessing": {
    "lowercase": true,
    "remove_whitespace": true,
    "remove_special_chars": true,
    "remove_numbers": true
  },
  "text_vectorization": {
    "enabled": true,
    "method": "tfidf",
    "max_features": 200,
    "drop_original": true
  },
  "categorical_encoding": {
    "method": "onehot"
  },
  "scaling": {
    "enabled": true,
    "method": "minmax"
  }
}
```

## 📊 Configuration Options

### Missing Values (`fillna`)
- `mean`: Fill numeric with mean, text with mode
- `median`: Fill numeric with median, text with mode
- `mode`: Fill all with most frequent value
- `drop`: Remove rows with missing values
- `zero`: Fill with 0

### Text Preprocessing (`text_preprocessing`)
- `lowercase`: Convert to lowercase (default: true)
- `remove_whitespace`: Remove extra spaces (default: true)
- `remove_special_chars`: Remove punctuation (default: false)
- `remove_numbers`: Remove digits (default: false)

### Text Vectorization (`text_vectorization`)
- `enabled`: Enable vectorization (default: true)
- `method`: "tfidf" or "count"
- `max_features`: Number of features to create (default: 100)
- `drop_original`: Remove original text columns (default: true)

### Categorical Encoding (`categorical_encoding`)
- `method`: "label" (0,1,2...) or "onehot" (binary columns)

### Scaling (`scaling`)
- `enabled`: Enable scaling (default: false)
- `method`: "standard" (z-score) or "minmax" (0-1 range)

## 🚀 API Usage

### 1. Upload Dataset
```bash
POST /api/datasets/upload
Content-Type: multipart/form-data

file: your_dataset.csv
description: "Customer reviews dataset"
userId: 1
```

**Response**:
```json
{
  "id": 1,
  "userId": 1,
  "title": "your_dataset.csv",
  "description": "Customer reviews dataset",
  "importedFilePath": "uploads/your_dataset.csv",
  "exportedFilePath": null,
  "dateImport": "2025-12-13T12:00:00",
  "dateExport": null,
  "status": "IMPORTED"
}
```

### 2. Preprocess Dataset
```bash
POST /api/datasets/1/preprocess
Content-Type: application/json

{
  "fillna": {"method": "mean"},
  "text_vectorization": {
    "enabled": true,
    "method": "tfidf",
    "max_features": 100
  }
}
```

**Response**:
```json
{
  "id": 1,
  "userId": 1,
  "title": "your_dataset.csv",
  "exportedFilePath": "export/processed_1234567890_your_dataset.csv",
  "dateExport": "2025-12-13T12:05:00",
  "status": "EXPORTED",
  "processingConfig": "{...}"
}
```

### 3. Get Dataset Info
```bash
GET /api/datasets/1/export
```

Returns detailed analysis of the processed dataset.

## 📝 Example Workflow

1. **Upload** a dataset with text reviews
2. **Preprocess** with TF-IDF vectorization
3. **Result**: Text converted to 100 numerical features
4. **Output**: Saved in `export/` folder
5. **Database**: Updated with export path and timestamp

## 🎓 Text Vectorization Explained

**Before Vectorization**:
```
| review                          |
|---------------------------------|
| "Great product, love it!"       |
| "Terrible, waste of money"      |
```

**After TF-IDF Vectorization** (simplified):
```
| review_vec_0 | review_vec_1 | review_vec_2 | ... | review_vec_99 |
|--------------|--------------|--------------|-----|---------------|
| 0.45         | 0.23         | 0.89         | ... | 0.12          |
| 0.12         | 0.78         | 0.34         | ... | 0.56          |
```

Each review is now represented by 100 numbers that capture the importance of words!

## ✅ Benefits

1. **Automatic**: Detects column types automatically
2. **Flexible**: Configure each step independently
3. **Complete**: Handles all data types (numeric, categorical, text)
4. **ML-Ready**: Output is fully numerical for machine learning
5. **Traceable**: Original and processed files both preserved
6. **Organized**: Clean folder structure (uploads/ and export/)
