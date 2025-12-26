# Quick Start - Preprocessing with NLP

## Example 1: Simple Dataset with Text Reviews

### Step 1: Upload Dataset
```bash
curl -X POST http://localhost:8080/api/datasets/upload \
  -F "file=@reviews.csv" \
  -F "description=Customer product reviews" \
  -F "userId=1"
```

### Step 2: Preprocess with Text Vectorization
```bash
curl -X POST http://localhost:8080/api/datasets/1/preprocess \
  -H "Content-Type: application/json" \
  -d '{
    "fillna": {
      "method": "mean"
    },
    "text_vectorization": {
      "enabled": true,
      "method": "tfidf",
      "max_features": 100
    },
    "categorical_encoding": {
      "method": "label"
    }
  }'
```

**Result**: 
- Text columns converted to 100 numerical features each
- Missing values filled
- Categorical columns encoded
- File saved to `export/processed_TIMESTAMP_reviews.csv`

---

## Example 2: Advanced Text Processing

```bash
curl -X POST http://localhost:8080/api/datasets/1/preprocess \
  -H "Content-Type: application/json" \
  -d '{
    "fillna": {
      "method": "median"
    },
    "text_preprocessing": {
      "lowercase": true,
      "remove_whitespace": true,
      "remove_special_chars": true,
      "remove_numbers": false
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
      "method": "standard"
    }
  }'
```

**What this does**:
1. ✅ Fills missing values with median
2. ✅ Cleans text (lowercase, removes special chars)
3. ✅ Converts text to 200 TF-IDF features
4. ✅ One-hot encodes categories
5. ✅ Standardizes all numeric columns
6. ✅ Saves to `export/` folder

---

## Example 3: Minimal Configuration (Auto-detect)

```bash
curl -X POST http://localhost:8080/api/datasets/1/preprocess \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Default behavior**:
- Automatically detects text, numeric, and categorical columns
- Applies TF-IDF with 100 features
- Uses label encoding for categories
- No scaling

---

## Configuration Cheat Sheet

### Missing Values
```json
"fillna": {"method": "mean|median|mode|drop|zero"}
```

### Text Cleaning
```json
"text_preprocessing": {
  "lowercase": true,
  "remove_whitespace": true,
  "remove_special_chars": false,
  "remove_numbers": false
}
```

### Text Vectorization
```json
"text_vectorization": {
  "enabled": true,
  "method": "tfidf|count",
  "max_features": 100,
  "drop_original": true
}
```

### Categorical Encoding
```json
"categorical_encoding": {
  "method": "label|onehot"
}
```

### Scaling
```json
"scaling": {
  "enabled": true,
  "method": "standard|minmax"
}
```

---

## File Organization

```
Project/
├── uploads/              # Original uploaded files
│   └── dataset.csv
├── export/               # Processed files (ML-ready)
│   └── processed_1234567890_dataset.csv
└── Database (datasets table)
    ├── importedFilePath → uploads/dataset.csv
    ├── exportedFilePath → export/processed_1234567890_dataset.csv
    ├── status → EXPORTED
    └── dateExport → 2025-12-13T12:00:00
```

---

## Common Use Cases

### Use Case 1: Sentiment Analysis Dataset
```json
{
  "text_vectorization": {
    "method": "tfidf",
    "max_features": 500
  }
}
```

### Use Case 2: Mixed Data (Text + Numbers + Categories)
```json
{
  "fillna": {"method": "mean"},
  "text_vectorization": {"enabled": true, "max_features": 100},
  "categorical_encoding": {"method": "onehot"},
  "scaling": {"enabled": true, "method": "standard"}
}
```

### Use Case 3: Keep Text for Reference
```json
{
  "text_vectorization": {
    "enabled": true,
    "drop_original": false
  }
}
```

---

## Verify Results

### Get Dataset Info
```bash
curl http://localhost:8080/api/datasets/1/export
```

### Get Statistics
```bash
curl http://localhost:8080/api/datasets/1/stats
```

---

## Tips

1. **Start Simple**: Use default settings first, then customize
2. **Max Features**: More features = more detail, but slower training
   - Small datasets: 50-100 features
   - Large datasets: 200-500 features
3. **TF-IDF vs Count**: 
   - TF-IDF: Better for most cases (considers word importance)
   - Count: Simpler, just word frequency
4. **Scaling**: Enable for algorithms like SVM, Neural Networks
5. **Check Export Folder**: Processed files are always in `export/`
