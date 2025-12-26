import sys
import pandas as pd
import json
import numpy as np
import os

def analyze_column_type(series):
    """Determine if a column is numeric, text, categorical, or datetime"""
    if series.empty or series.isnull().all():
        return "empty"
        
    if pd.api.types.is_numeric_dtype(series):
        # Even if numeric, if it has very few unique values compared to row count, it's categorical
        unique_count = series.nunique()
        if unique_count < 20 or (unique_count < 100 and unique_count / len(series) < 0.05):
            return "categorical"
        return "numeric"
        
    # Try to parse as datetime if it's an object/string
    if pd.api.types.is_object_dtype(series) or pd.api.types.is_string_dtype(series):
        try:
            # Check if it looks like a date/time string before attempting heavy conversion
            sample = series.dropna().head(10).astype(str)
            date_patterns = [r'\d{4}-\d{2}-\d{2}', r'\d{2}/\d{2}/\d{4}', r'\d{4}/\d{2}/\d{2}']
            is_date_like = any(sample.str.contains(pattern).any() for pattern in date_patterns)
            
            if is_date_like:
                pd.to_datetime(sample, errors='raise')
                return "datetime"
        except:
            pass

    if pd.api.types.is_datetime64_any_dtype(series):
        return "datetime"
        
    unique_count = series.nunique()
    if unique_count < 50 or unique_count / len(series) < 0.1:
        return "categorical"
        
    return "text"

def get_column_metadata(df):
    """Get detailed metadata for each column"""
    metadata = {}
    
    for col in df.columns:
        col_data = df[col]
        col_type = analyze_column_type(col_data)
        
        sample_value = col_data.dropna().iloc[0] if not col_data.dropna().empty else None
        if isinstance(sample_value, (np.integer, np.floating)):
            sample_value = float(sample_value)
        elif isinstance(sample_value, (pd.Timestamp, np.datetime64)):
            sample_value = str(sample_value)
        elif pd.isna(sample_value):
            sample_value = None
        else:
            sample_value = str(sample_value)
        
        metadata[col] = {
            "columnName": col,
            "dataType": col_type,
            "uniqueValues": int(col_data.nunique()),
            "missingValues": int(col_data.isnull().sum()),
            "missingPercentage": float(col_data.isnull().sum() / len(df) * 100),
            "sampleValue": sample_value
        }
    
    return metadata

def get_numeric_statistics(df, numeric_cols):
    """Get statistics for numeric columns"""
    if not numeric_cols:
        return {}
    
    stats = {}
    for col in numeric_cols:
        try:
            col_stats = df[col].describe()
            stats[col] = {
                "mean": float(col_stats['mean']) if not pd.isna(col_stats.get('mean')) else None,
                "std": float(col_stats['std']) if not pd.isna(col_stats.get('std')) else None,
                "min": float(col_stats['min']) if not pd.isna(col_stats.get('min')) else None,
                "max": float(col_stats['max']) if not pd.isna(col_stats.get('max')) else None,
                "median": float(df[col].median()) if not pd.isna(df[col].median()) else None,
                "q25": float(col_stats['25%']) if not pd.isna(col_stats.get('25%')) else None,
                "q75": float(col_stats['75%']) if not pd.isna(col_stats.get('75%')) else None,
                "skewness": float(df[col].skew()) if not pd.isna(df[col].skew()) else 0
            }
        except:
            continue
    
    return stats

def get_text_statistics(df, text_cols):
    """Get statistics for text columns"""
    if not text_cols:
        return {}
    
    stats = {}
    for col in text_cols:
        try:
            text_series = df[col].astype(str)
            word_counts = text_series.str.split().str.len()
            
            stats[col] = {
                "avgLength": float(text_series.str.len().mean()),
                "maxLength": int(text_series.str.len().max()),
                "minLength": int(text_series.str.len().min()),
                "avgWordCount": float(word_counts.mean()),
                "uniqueValues": int(df[col].nunique()),
                "mostCommon": df[col].value_counts().head(5).to_dict()
            }
        except:
            continue
    
    return stats

def get_datetime_statistics(df, datetime_cols):
    """Get statistics for datetime columns"""
    if not datetime_cols:
        return {}
        
    stats = {}
    for col in datetime_cols:
        try:
            dt_series = pd.to_datetime(df[col], errors='coerce')
            valid_dates = dt_series.dropna()
            if not valid_dates.empty:
                stats[col] = {
                    "min": str(valid_dates.min()),
                    "max": str(valid_dates.max()),
                    "range_days": int((valid_dates.max() - valid_dates.min()).days),
                    "most_frequent_year": int(valid_dates.dt.year.mode()[0]) if not valid_dates.dt.year.mode().empty else None
                }
        except:
            continue
    return stats

def calculate_correlations(df, numeric_cols):
    """Calculate correlation matrix for numeric columns"""
    if len(numeric_cols) < 2:
        return {}
    try:
        corr_matrix = df[numeric_cols].corr().round(3)
        return corr_matrix.to_dict()
    except:
        return {}

def detect_content_type(df, metadata):
    """Detect the overall content type of the dataset"""
    num_text = sum(1 for col, meta in metadata.items() if meta['dataType'] == 'text')
    num_numeric = sum(1 for col, meta in metadata.items() if meta['dataType'] == 'numeric')
    num_categorical = sum(1 for col, meta in metadata.items() if meta['dataType'] == 'categorical')
    num_datetime = sum(1 for col, meta in metadata.items() if meta['dataType'] == 'datetime')
    
    total_cols = len(df.columns)
    if total_cols == 0:
        return "Empty"
        
    if num_datetime > 0 and num_numeric > 0 and total_cols < 10:
        return "Time Series / Temporal"
    
    # NLP Heuristic: high percentage of text columns OR any column with long text
    if num_text / total_cols > 0.3:
        return "Textual / NLP"
    
    for col in df.columns:
        if metadata[col]['dataType'] == 'text':
            avg_len = df[col].astype(str).str.len().mean()
            if avg_len > 50:
                return "Textual / NLP"
    
    if num_numeric / total_cols > 0.5:
        return "Tabular / Numerical"
        
    return "Mixed / Tabular"

def suggest_target_column(df, metadata):
    """Suggest which column might be the target variable"""
    common_target_names = ['target', 'label', 'class', 'y', 'output', 'prediction', 'survived', 'price', 'category', 'target_variable', 'quality', 'type']
    ignore_names = ['id', 'uuid', 'index', 'unnamed', 'date', 'timestamp', 'time', 'user_id', 'created_at', 'updated_at']
    
    # 1. Check by name
    for col in df.columns:
        if col.lower() in common_target_names:
            return col
    
    # 2. Look for low cardinality categorical at the very end (often target)
    for col in reversed(df.columns):
        if col.lower() in ignore_names:
            continue
        meta = metadata[col]
        if meta['dataType'] == 'categorical' and 2 <= meta['uniqueValues'] <= 20:
            return col
            
    # 3. Look for numeric at the end (often target for regression)
    for col in reversed(df.columns):
        if col.lower() in ignore_names:
            continue
        if metadata[col]['dataType'] == 'numeric':
            return col
    
    # Fallback to last column excluding IDs
    for col in reversed(df.columns):
        if col.lower() not in ignore_names:
            return col
    
    return df.columns[-1] if len(df.columns) > 0 else None

def load_any_dataset(file_path):
    """Load dataset supporting multiple formats"""
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == '.csv':
        encodings = ['utf-8-sig', 'utf-8', 'latin1', 'cp1252']
        seps = [',', ';', '\t', '|']
        
        best_df = None
        max_score = -1
        
        for encoding in encodings:
            for sep in seps:
                try:
                    # Read a small chunk to evaluate the separator
                    test_df = pd.read_csv(file_path, encoding=encoding, sep=sep, nrows=20, on_bad_lines='skip')
                    if test_df.empty: continue
                    
                    num_cols = len(test_df.columns)
                    if num_cols <= 1: continue
                    
                    sample_col0 = test_df.iloc[:, 0].astype(str)
                    bunched_ratio = sample_col0.str.contains(sep).mean()
                    
                    score = num_cols
                    if bunched_ratio > 0.5:
                        score = num_cols * 0.1
                        
                    if score > max_score:
                        max_score = score
                        best_df = pd.read_csv(file_path, encoding=encoding, sep=sep, on_bad_lines='skip')
                except:
                    continue
            if best_df is not None and max_score >= 2:
                break
                
        if best_df is not None:
            return best_df
            
        # Fallback to sniff/default
        for encoding in encodings:
            try:
                return pd.read_csv(file_path, encoding=encoding, sep=None, engine='python')
            except:
                continue
        return pd.read_csv(file_path)
        
    elif ext in ['.xlsx', '.xls']:
        return pd.read_excel(file_path)
    elif ext == '.json':
        try:
            return pd.read_json(file_path)
        except:
            return pd.read_json(file_path, lines=True)
    elif ext == '.parquet':
        return pd.read_parquet(file_path)
    else:
        # Try generic read as CSV
        return pd.read_csv(file_path)

def analyze_dataset(file_path):
    """Main function to analyze dataset and return comprehensive metadata"""
    try:
        df = load_any_dataset(file_path)
        
        # Clean column names (remove whitespace)
        df.columns = [str(c).strip() for c in df.columns]
        
        column_metadata = get_column_metadata(df)
        
        # Groups
        numeric_cols = [col for col, meta in column_metadata.items() if meta['dataType'] == 'numeric']
        text_cols = [col for col, meta in column_metadata.items() if meta['dataType'] == 'text']
        categorical_cols = [col for col, meta in column_metadata.items() if meta['dataType'] == 'categorical']
        datetime_cols = [col for col, meta in column_metadata.items() if meta['dataType'] == 'datetime']
        
        # Stats
        numeric_stats = get_numeric_statistics(df, numeric_cols)
        text_stats = get_text_statistics(df, text_cols)
        datetime_stats = get_datetime_statistics(df, datetime_cols)
        
        # Advanced analysis
        correlations = calculate_correlations(df, numeric_cols)
        suggested_target = suggest_target_column(df, column_metadata)
        content_type = detect_content_type(df, column_metadata)
        
        # Quality score (heuristic)
        total_missing = sum(meta['missingValues'] for meta in column_metadata.values())
        total_cells = len(df) * len(df.columns)
        quality_score = max(0, 100 - (total_missing / total_cells * 100)) if total_cells > 0 else 0

        # Sample for preview (first 5 rows)
        sample_data = df.head(5).fillna("").to_dict(orient='records')
        
        return {
            "allColumns": list(df.columns),
            "numericColumns": numeric_cols,
            "textColumns": text_cols,
            "categoricalColumns": categorical_cols,
            "datetimeColumns": datetime_cols,
            "suggestedTargetColumn": suggested_target,
            "contentType": content_type,
            "qualityScore": round(quality_score, 2),
            "numRows": int(len(df)),
            "numColumns": int(len(df.columns)),
            "columnMetadata": column_metadata,
            "statistics": {
                "numeric": numeric_stats,
                "text": text_stats,
                "datetime": datetime_stats,
                "correlations": correlations
            },
            "sampleData": sample_data
        }
        
    except Exception as e:
        return {"error": str(e)}

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        if isinstance(obj, np.floating):
            return float(obj)
        if isinstance(obj, np.ndarray):
            return obj.tolist()
        if pd.isna(obj):
            return None
        return super(NpEncoder, self).default(obj)

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"error": "File path required"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = analyze_dataset(file_path)
    # Use custom encoder to handle numpy types and NaN
    print(json.dumps(result, cls=NpEncoder))

if __name__ == "__main__":
    main()
