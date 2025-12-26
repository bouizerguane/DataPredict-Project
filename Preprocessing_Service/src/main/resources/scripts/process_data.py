import sys
import pandas as pd
import json
import os
from sklearn.model_selection import train_test_split

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
                    
                    # Robustness check: is the data actually split?
                    # If columns > 1 but col 0 contains the separator, it's likely a mis-split
                    # that happened because the header had the separator but the rows didn't (or vice versa)
                    # or because of quote issues.
                    sample_col0 = test_df.iloc[:, 0].astype(str)
                    bunched_ratio = sample_col0.str.contains(sep).mean()
                    
                    score = num_cols
                    if bunched_ratio > 0.5:
                        score = num_cols * 0.1 # Heavily penalize bunched data
                        
                    if score > max_score:
                        max_score = score
                        # For the winner, we read the full dataset
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

def detect_content_type(df):
    """Detect the overall content type of the dataset"""
    try:
        num_numeric = len(df.select_dtypes(include=['number']).columns)
        num_text = len(df.select_dtypes(include=['object', 'string', 'category']).columns)
        total_cols = len(df.columns)
        
        if total_cols == 0: return "Empty"
        
        # Heuristic for NLP: Check if any text column has high average length
        obj_cols = df.select_dtypes(include=['object', 'string']).columns
        if not obj_cols.empty:
            for col in obj_cols:
                # Fillna to avoid errors during length calculation
                avg_len = df[col].astype(str).str.len().mean()
                if avg_len > 50:
                    return "Textual / NLP"
        
        if num_numeric / total_cols > 0.5:
            return "Tabular / Numerical"
            
        return "Mixed / Tabular"
    except:
        return "Tabular"

def get_stats(df):
    try:
        # include='all' handles mixed type datasets but can introduce NaN
        desc_df = df.describe(include='all')
    except:
        desc_df = df.describe()
    
    # Use to_json then loads to safely convert NaN/Inf to null (JSON Standard)
    description = json.loads(desc_df.to_json())
    
    # Quality score
    total_cells = df.size
    missing_sum = df.isnull().sum().sum()
    quality_score = round(max(0, 100 - (missing_sum / total_cells * 100)), 2) if total_cells > 0 else 0
        
    info = {
        "columns": list(df.columns),
        "shape": list(df.shape),
        "dtypes": {k: str(v) for k, v in df.dtypes.items()},
        "missing_values": df.isnull().sum().to_dict(),
        "missing_percentage": (df.isnull().sum() / len(df) * 100).to_dict()
    }
    
    # Simple correlation for numeric columns
    numeric_df = df.select_dtypes(include=['number'])
    correlations = {}
    if not numeric_df.empty and len(numeric_df.columns) > 1:
        try:
            corr_df = numeric_df.corr().round(3)
            correlations = json.loads(corr_df.to_json())
        except:
            correlations = {}

    # Head with fillna to avoid NaN in sample
    head = json.loads(df.head(10).fillna("").to_json(orient='records'))
    
    return {
        "description": description, 
        "info": info, 
        "head": head,
        "correlations": correlations,
        "rowCount": int(len(df)),
        "colCount": int(len(df.columns)),
        "contentType": detect_content_type(df),
        "qualityScore": quality_score
    }

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Not enough arguments"}))
        sys.exit(1)

    operation = sys.argv[1]
    input_file = sys.argv[2]
    output_file = sys.argv[3] if len(sys.argv) > 3 else "NONE"
    params_json = sys.argv[4] if len(sys.argv) > 4 else "{}"

    try:
        if not os.path.exists(input_file):
             print(json.dumps({"error": f"File not found: {input_file}"}))
             sys.exit(1)
             
        df = load_any_dataset(input_file)

        if operation == 'stats':
            stats = get_stats(df)
            print(json.dumps(stats))

        elif operation == 'preprocess':
             from preprocess import preprocess_data
             params = json.loads(params_json)
             df_processed = preprocess_data(df, params)
             if output_file != 'NONE':
                 df_processed.to_csv(output_file, index=False)
                 print(json.dumps({"status": "success", "file": output_file}))
             else:
                 print(json.dumps({"error": "Output file not provided"}))
        else:
            print(json.dumps({"error": "Unknown operation"}))

    except Exception as e:
        # Return error as JSON to prevent frontend crash
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
