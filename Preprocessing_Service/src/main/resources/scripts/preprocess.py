import sys
import json
import traceback


with open("preprocess_debug.log", "w", encoding="utf-8") as f:
    f.write(f"Arguments: {sys.argv}\n")

import pandas as pd
import numpy as np
import os
import re
from pathlib import Path


from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.preprocessing import LabelEncoder, StandardScaler, MinMaxScaler


try:
    import nltk
    from nltk.tokenize import word_tokenize
    from nltk.corpus import stopwords
    
    
    
    try:
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            nltk.download('punkt', quiet=True)
        
        try:
            nltk.data.find('corpora/stopwords')
        except LookupError:
            nltk.download('stopwords', quiet=True)
            
        NLTK_AVAILABLE = True
    except Exception as e:
        print(f"Warning: Failed to download NLTK data: {e}. Advanced text preprocessing will be disabled.", file=sys.stderr)
        NLTK_AVAILABLE = False

except ImportError:
    NLTK_AVAILABLE = False
    print("Warning: NLTK not available. Advanced text preprocessing will be limited.", file=sys.stderr)
except Exception as e:
    NLTK_AVAILABLE = False
    print(f"Warning: Unexpected error initializing NLTK: {e}", file=sys.stderr)


POSITIVE_EMOJIS = {
    '😀', '😃', '😄', '😁', '😆', '😊', '😍', '🥰', '😘', '😗', '😙', '😚',
    '🙂', '🤗', '🤩', '🤠', '😎', '👍', '👏', '🎉', '❤️', '💕', '💖', '💗',
    '💙', '💚', '💛', '🧡', '💜', '🖤', '💯', '✨', '⭐', '🌟'
}

NEGATIVE_EMOJIS = {
    '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '😢', '😭', '😤',
    '😠', '😡', '🤬', '😱', '😨', '😰', '😥', '😓', '💔', '👎', '😒', '🙄'
}

def load_data(file_path):
    """Load dataset supporting multiple formats"""
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == '.csv':
        encodings = ['utf-8', 'latin1', 'iso-8859-1', 'cp1252', 'utf-16']
        for encoding in encodings:
            try:
                # Try with common delimiters
                for sep in [',', ';', '\t', '|']:
                    try:
                        df = pd.read_csv(file_path, encoding=encoding, sep=sep)
                        if len(df.columns) > 1: # Successfully split
                            return df
                    except:
                        continue
                # If separator detection fails, try default read
                return pd.read_csv(file_path, encoding=encoding)
            except:
                continue
        raise ValueError(f"Could not read CSV with any encoding")
        
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

def handle_emojis(text):
    """Replace emojis with sentiment tokens"""
    for emoji in POSITIVE_EMOJIS:
        if emoji in text:
            text = text.replace(emoji, ' EMO_POS ')
    
    for emoji in NEGATIVE_EMOJIS:
        if emoji in text:
            text = text.replace(emoji, ' EMO_NEG ')
    
    return text

def get_stop_words(language='english'):
    """Get stop words for specified language"""
    if not NLTK_AVAILABLE:
        return set()
    
    
    language_map = {
        'en': 'english',
        'english': 'english',
        'fr': 'french',
        'french': 'french',
        'es': 'spanish',
        'spanish': 'spanish',
        'de': 'german',
        'german': 'german',
        'it': 'italian',
        'italian': 'italian',
        'pt': 'portuguese',
        'portuguese': 'portuguese',
        'nl': 'dutch',
        'dutch': 'dutch',
        'ru': 'russian',
        'russian': 'russian',
        'ar': 'arabic',
        'arabic': 'arabic'
    }
    
    lang = language_map.get(language.lower(), 'english')
    
    try:
        return set(stopwords.words(lang))
    except:
        print(f"Warning: Stop words for '{lang}' not available. Using English.", file=sys.stderr)
        return set(stopwords.words('english'))

def preprocess_social_media_text(text, language='english', remove_stopwords=True):
    """
    Advanced preprocessing for social media text (tweets, comments, posts)
    Based on the provided preprocess_tweet function
    """
    if not isinstance(text, str):
        text = str(text)
    
    
    text = text.lower()
    
    
    text = re.sub(r'<[^>]+>', ' ', text)
    
    
    text = re.sub(r'&[a-z0-9]+;', ' ', text)
    
    
    text = re.sub(r'((www\.[\S]+)|(https?://[\S]+))', ' ', text)
    
    
    text = re.sub(r'\burl\b', ' ', text)
    
    
    text = re.sub(r'@[\S]+', 'USER_MENTION', text)
    
    
    text = re.sub(r'#(\S+)', r' \1 ', text)
    
    
    text = re.sub(r'\brt\b', '', text)
    
    
    text = text.replace('^', ' ')
    
    
    text = re.sub(r'\.{2,}', ' ', text)
    
    
    text = text.strip(' "\'')
    
    
    text = handle_emojis(text)
    
    
    text = re.sub(r'\s+', ' ', text)
    
    
    words = " ".join(text.split())
    
    
    no_digits = ''.join([i for i in words if not i.isdigit()])
    cleaner = " ".join(no_digits.split())
    
    
    if remove_stopwords and NLTK_AVAILABLE:
        try:
            stop_words_set = get_stop_words(language)
            word_tokens = word_tokenize(cleaner)
            filtered_sentence = [w for w in word_tokens if w not in stop_words_set]
            return " ".join(filtered_sentence)
        except:
            return cleaner
    
    return cleaner

def detect_column_types(df):
    """Automatically detect numeric, categorical, and text columns"""
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    
    text_cols = []
    categorical_cols = []
    
    
    text_col_names = {'text', 'tweet', 'comment', 'review', 'description', 'body', 'message', 'msg', 'content', 'feedback', 'title'}
    
    for col in df.select_dtypes(include=['object']).columns:
        
        series_str = df[col].astype(str)
        
        
        if col.lower() in text_col_names:
            text_cols.append(col)
            continue
            
        
        avg_length = series_str.str.len().mean()
        unique_ratio = df[col].nunique() / len(df)
        
        has_spaces_ratio = series_str.str.contains(r'\s').mean()
        
        if avg_length > 50:
            text_cols.append(col)
        
        elif avg_length > 20 and has_spaces_ratio > 0.8:
            text_cols.append(col)
        elif unique_ratio < 0.5:  
            categorical_cols.append(col)
        else:
            text_cols.append(col)
    
    return {
        'numeric': numeric_cols,
        'categorical': categorical_cols,
        'text': text_cols
    }

def handle_missing_values(df, config):
    """Handle missing values based on configuration"""
    if 'fillna' not in config:
        return df
    
    method = config['fillna'].get('method', 'mean')
    
    numeric_cols = df.select_dtypes(include=['number']).columns
    
    if method == 'mean':
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
    elif method == 'median':
        df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    elif method == 'mode':
        for col in df.columns:
            if df[col].isnull().any():
                mode_val = df[col].mode()
                if not mode_val.empty:
                    df[col] = df[col].fillna(mode_val[0])
    elif method == 'drop':
        df = df.dropna()
    elif method == 'zero':
        df = df.fillna(0)
    
    
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].fillna('Unknown')
    
    return df

def preprocess_text_columns(df, text_cols, config):
    """Preprocess text columns with cleaning and normalization"""
    text_config = config.get('text_preprocessing', {})
    language = config.get('language', 'english')
    
    for col in text_cols:
        if col not in df.columns:
            continue
        
        
        df[col] = df[col].astype(str)
        
        
        is_social_media = text_config.get('social_media_mode', False)
        
        if not is_social_media and 'tweet' in col.lower():
            is_social_media = True
            
        if is_social_media:
            
            df[col] = df[col].apply(lambda x: preprocess_social_media_text(
                x, 
                language=language,
                remove_stopwords=text_config.get('remove_stopwords_nltk', False)
            ))
        else:
            
            
            if text_config.get('lowercase', True):
                df[col] = df[col].str.lower()
            
            
            if text_config.get('remove_whitespace', True):
                df[col] = df[col].str.strip()
                df[col] = df[col].str.replace(r'\s+', ' ', regex=True)
            
            
            if text_config.get('remove_special_chars', False):
                df[col] = df[col].str.replace(r'[^a-zA-Z0-9\s]', '', regex=True)
            
            
            if text_config.get('remove_numbers', False):
                df[col] = df[col].str.replace(r'\d+', '', regex=True)
    
    return df

def vectorize_text_columns(df, text_cols, config):
    """Convert text columns to numerical vectors using TF-IDF or Count Vectorization"""
    vectorization_config = config.get('text_vectorization', {})
    method = vectorization_config.get('method', 'tfidf')  
    max_features = vectorization_config.get('max_features', 100)
    language = config.get('language', 'english')
    
    
    stop_words_config = vectorization_config.get('stop_words', language)
    
    if stop_words_config == False or stop_words_config == 'none':
        stop_words = None
    elif isinstance(stop_words_config, list):
        stop_words = stop_words_config
    else:
        
        stop_words = stop_words_config  
    
    
    ngram_range = vectorization_config.get('ngram_range', (1, 1))  
    if isinstance(ngram_range, list):
        ngram_range = tuple(ngram_range)
    
    
    min_df = vectorization_config.get('min_df', 1)
    max_df = vectorization_config.get('max_df', 1.0)
    
    columns_to_drop = []
    
    for col in text_cols:
        if col not in df.columns:
            continue
        
        
        if col in config.get('skip_vectorization', []):
            continue
        
        try:
            if method == 'tfidf':
                vectorizer = TfidfVectorizer(
                    max_features=max_features,
                    stop_words=stop_words,
                    ngram_range=ngram_range,
                    min_df=min_df,
                    max_df=max_df
                )
            else:
                vectorizer = CountVectorizer(
                    max_features=max_features,
                    stop_words=stop_words,
                    ngram_range=ngram_range,
                    min_df=min_df,
                    max_df=max_df
                )
            
            
            vectors = vectorizer.fit_transform(df[col].astype(str))
            
            
            feature_names = [f"{col}_vec_{i}" for i in range(vectors.shape[1])]
            vector_df = pd.DataFrame(vectors.toarray(), columns=feature_names, index=df.index)
            
            
            df = pd.concat([df, vector_df], axis=1)
            
            
            columns_to_drop.append(col)
        
        except Exception as e:
            print(f"Warning: Could not vectorize column {col}: {str(e)}", file=sys.stderr)
    
    
    if vectorization_config.get('drop_original', True):
        df = df.drop(columns=columns_to_drop, errors='ignore')
    
    return df

def encode_categorical_columns(df, categorical_cols, config):
    """Encode categorical columns using Label Encoding or One-Hot Encoding"""
    encoding_config = config.get('categorical_encoding', {})
    method = encoding_config.get('method', 'label')  
    
    for col in categorical_cols:
        if col not in df.columns:
            continue
        
        try:
            if method == 'onehot':
                
                dummies = pd.get_dummies(df[col], prefix=col, drop_first=True)
                df = pd.concat([df, dummies], axis=1)
                df = df.drop(columns=[col])
            else:
                
                le = LabelEncoder()
                df[col] = le.fit_transform(df[col].astype(str))
        
        except Exception as e:
            print(f"Warning: Could not encode column {col}: {str(e)}", file=sys.stderr)
    
    return df

def scale_numeric_columns(df, numeric_cols, config):
    """Scale numeric columns using StandardScaler or MinMaxScaler"""
    scaling_config = config.get('scaling', {})
    
    if not scaling_config.get('enabled', False):
        return df
    
    method = scaling_config.get('method', 'standard')  
    
    cols_to_scale = [col for col in numeric_cols if col in df.columns]
    
    if not cols_to_scale:
        return df
    
    try:
        if method == 'standard':
            scaler = StandardScaler()
        else:
            scaler = MinMaxScaler()
        
        df[cols_to_scale] = scaler.fit_transform(df[cols_to_scale])
    
    except Exception as e:
        print(f"Warning: Could not scale columns: {str(e)}", file=sys.stderr)
    
    return df

def drop_columns(df, config):
    """Drop specified columns"""
    if 'drop_columns' in config:
        cols_to_drop = config['drop_columns']
        df = df.drop(columns=[c for c in cols_to_drop if c in df.columns], errors='ignore')
    
    return df

def preprocess_data(df, config):
    """Main preprocessing pipeline"""
    
    
    df = drop_columns(df, config)
    
    
    col_types = detect_column_types(df)
    print(f"Detected column types: {col_types}", file=sys.stderr)
    
    
    df = handle_missing_values(df, config)
    
    
    if col_types['text']:
        df = preprocess_text_columns(df, col_types['text'], config)
    
    
    if config.get('text_vectorization', {}).get('enabled', False) and col_types['text']:
        df = vectorize_text_columns(df, col_types['text'], config)
    
    
    if col_types['categorical']:
        df = encode_categorical_columns(df, col_types['categorical'], config)
    
    
    if col_types['numeric']:
        df = scale_numeric_columns(df, col_types['numeric'], config)
    
    return df

def main():
    if len(sys.argv) < 4:
        print(json.dumps({"error": "Not enough arguments"}))
        sys.exit(1)

    operation = sys.argv[1]
    input_file = sys.argv[2]
    output_file = sys.argv[3]
    params_arg = sys.argv[4] if len(sys.argv) > 4 else '{}'

    try:
        
        if os.path.isfile(params_arg):
             with open(params_arg, 'r', encoding='utf-8') as f:
                 params = json.load(f)
        else:
             params = json.loads(params_arg)
        df = load_data(input_file)

        if operation == 'preprocess':
            
            output_path = Path(output_file)
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            
            df_processed = preprocess_data(df, params)
            
            
            df_processed.to_csv(output_file, index=False)
            
            result = {
                "status": "success",
                "file": output_file,
                "original_shape": list(df.shape),
                "processed_shape": list(df_processed.shape),
                "columns": list(df_processed.columns)
            }
            
            print(json.dumps(result))
        
        else:
            print(json.dumps({"error": "Unknown operation"}))

    except Exception as e:
        with open("preprocess_debug.log", "a", encoding="utf-8") as f:
            f.write(f"\nERROR: {str(e)}\n")
            import traceback
            traceback.print_exc(file=f)
            
        print(json.dumps({"error": str(e)}))
        import traceback
        traceback.print_exc(file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()

