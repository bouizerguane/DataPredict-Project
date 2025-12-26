import sys
import pandas as pd
import json
import re
from collections import Counter


try:
    import nltk
    from nltk.corpus import stopwords
    from nltk.tokenize import word_tokenize
    from nltk.stem import PorterStemmer, WordNetLemmatizer
    NLTK_AVAILABLE = True
except ImportError:
    NLTK_AVAILABLE = False
    print("Warning: NLTK not available. Install with: pip install nltk", file=sys.stderr)

def ensure_nltk_data():
    """Download required NLTK data if not present"""
    if not NLTK_AVAILABLE:
        return False
    
    try:
        nltk.data.find('tokenizers/punkt')
        nltk.data.find('corpora/stopwords')
        nltk.data.find('corpora/wordnet')
    except LookupError:
        try:
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
            nltk.download('averaged_perceptron_tagger', quiet=True)
        except:
            return False
    return True

def basic_text_cleaning(text):
    """Basic text cleaning without NLTK"""
    if pd.isna(text):
        return ""
    
    text = str(text)
    
    text = text.lower()
    
    text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
    
    text = re.sub(r'\S+@\S+', '', text)
    
    text = re.sub(r'@\w+|#\w+', '', text)
    
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def advanced_text_cleaning(text, config):
    """Advanced text cleaning with NLP"""
    if pd.isna(text):
        return ""
    
    text = str(text)
    
    
    text = basic_text_cleaning(text)
    
    if not NLTK_AVAILABLE or not ensure_nltk_data():
        return text
    
    
    if config.get('remove_stopwords', False):
        stop_words = set(stopwords.words('english'))
        tokens = word_tokenize(text)
        text = ' '.join([word for word in tokens if word.lower() not in stop_words])
    
    
    if config.get('stemming', False):
        stemmer = PorterStemmer()
        tokens = word_tokenize(text)
        text = ' '.join([stemmer.stem(word) for word in tokens])
    
    
    if config.get('lemmatization', False):
        lemmatizer = WordNetLemmatizer()
        tokens = word_tokenize(text)
        text = ' '.join([lemmatizer.lemmatize(word) for word in tokens])
    
    
    if config.get('remove_numbers', False):
        text = re.sub(r'\d+', '', text)
    
    
    if config.get('remove_punctuation', False):
        text = re.sub(r'[^\w\s]', '', text)
    
    
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

def extract_text_features(text):
    """Extract NLP features from text"""
    if pd.isna(text) or text == "":
        return {
            'word_count': 0,
            'char_count': 0,
            'avg_word_length': 0,
            'sentence_count': 0,
            'uppercase_count': 0,
            'punctuation_count': 0
        }
    
    text = str(text)
    
    
    words = text.split()
    word_count = len(words)
    
    
    char_count = len(text)
    
    
    avg_word_length = sum(len(word) for word in words) / word_count if word_count > 0 else 0
    
    
    sentence_count = len(re.findall(r'[.!?]+', text)) + 1
    
    
    uppercase_count = sum(1 for c in text if c.isupper())
    
    
    punctuation_count = sum(1 for c in text if c in '.,!?;:')
    
    return {
        'word_count': word_count,
        'char_count': char_count,
        'avg_word_length': round(avg_word_length, 2),
        'sentence_count': sentence_count,
        'uppercase_count': uppercase_count,
        'punctuation_count': punctuation_count
    }


from sklearn.feature_extraction.text import CountVectorizer

def get_top_ngrams(series, n=10, ngram_range=(1, 1), stop_words='english'):
    """Get top n-grams using CountVectorizer"""
    try:
        
        clean_series = series.dropna().astype(str)
        if len(clean_series) == 0:
            return {}
            
        vec = CountVectorizer(ngram_range=ngram_range, stop_words=stop_words, max_features=1000)
        bag_of_words = vec.fit_transform(clean_series)
        
        sum_words = bag_of_words.sum(axis=0) 
        words_freq = [(word, sum_words[0, idx]) for word, idx in vec.vocabulary_.items()]
        words_freq = sorted(words_freq, key = lambda x: x[1], reverse=True)
        
        return dict(words_freq[:n])
    except Exception as e:
        print(f"Error in n-grams: {e}", file=sys.stderr)
        return {}

def analyze_sentiment(series):
    """Analyze sentiment using NLTK VADER"""
    try:
        from nltk.sentiment import SentimentIntensityAnalyzer
        
        
        try:
             nltk.data.find('sentiment/vader_lexicon.zip')
        except LookupError:
             nltk.download('vader_lexicon', quiet=True)
             
        sia = SentimentIntensityAnalyzer()
        
        sentiments = series.dropna().astype(str).apply(lambda x: sia.polarity_scores(x)['compound'])
        
        return {
            'positive_count': int((sentiments > 0.05).sum()),
            'negative_count': int((sentiments < -0.05).sum()),
            'neutral_count': int(((sentiments >= -0.05) & (sentiments <= 0.05)).sum()),
            'avg_sentiment': float(sentiments.mean()) if not sentiments.empty else 0.0
        }
    except ImportError:
        return {"error": "NLTK VADER not available"}
    except Exception as e:
        return {"error": str(e)}

def apply_nlp_preprocessing(df, config):
    """Apply NLP preprocessing to text columns"""
    nlp_config = config.get('nlp_preprocessing', {})
    text_columns = nlp_config.get('columns', [])
    
    for col in text_columns:
        if col not in df.columns:
            continue
        
        
        df[col] = df[col].apply(lambda x: advanced_text_cleaning(x, nlp_config))
        
        
        if nlp_config.get('extract_features', False):
            features = df[col].apply(extract_text_features)
            
            
            df[f'{col}_word_count'] = features.apply(lambda x: x['word_count'])
            df[f'{col}_char_count'] = features.apply(lambda x: x['char_count'])
            df[f'{col}_avg_word_length'] = features.apply(lambda x: x['avg_word_length'])
            df[f'{col}_sentence_count'] = features.apply(lambda x: x['sentence_count'])
    
    return df

def is_numeric_text(series):
    """Check if a text series is actually numeric"""
    try:
        
        if pd.api.types.is_numeric_dtype(series):
            return True
            
        
        
        sample = series.dropna().astype(str).sample(min(100, len(series)))
        if len(sample) == 0:
            return False
            
        
        numeric_count = sample.str.match(r'^-?\d+(\.\d+)?$').sum()
        
        return (numeric_count / len(sample)) > 0.9 
    except:
        return False

def analyze_text_column(series):
    """Analyze a text column with NLP metrics"""
    
    
    if is_numeric_text(series):
        return None
    
    stats = {
        'total_texts': len(series),
        'non_empty_texts': series.notna().sum(),
        'empty_texts': series.isna().sum(),
        'unique_texts': series.nunique()
    }
    
    
    features = series.apply(extract_text_features)
    
    stats['avg_word_count'] = features.apply(lambda x: x['word_count']).mean()
    stats['max_word_count'] = features.apply(lambda x: x['word_count']).max()
    stats['min_word_count'] = features.apply(lambda x: x['word_count']).min()
    
    stats['avg_char_count'] = features.apply(lambda x: x['char_count']).mean()
    
    
    stats['top_words'] = get_top_ngrams(series, n=20, ngram_range=(1, 1))
    
    
    stats['top_bigrams'] = get_top_ngrams(series, n=20, ngram_range=(2, 2))
    
    
    stats['sentiment_analysis'] = analyze_sentiment(series)
    
    return stats

def load_data(file_path):
    """Load dataset from file with encoding handling"""
    if file_path.endswith('.csv'):
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
        
    elif file_path.endswith('.xlsx') or file_path.endswith('.xls'):
        return pd.read_excel(file_path)
    else:
        raise ValueError("Unsupported file format")

def preprocess_data(df, config):
    """Main preprocessing function with NLP support"""
    
    if 'nlp_preprocessing' in config:
        df = apply_nlp_preprocessing(df, config)
    
    
    
    if 'fillna' in config:
        method = config['fillna'].get('method', 'mean')
        
        numeric_cols = df.select_dtypes(include=['number']).columns
        
        if method == 'mean':
            df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
            non_numeric_cols = df.select_dtypes(exclude=['number']).columns
            for col in non_numeric_cols:
                df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown")
        elif method == 'median':
            df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
            non_numeric_cols = df.select_dtypes(exclude=['number']).columns
            for col in non_numeric_cols:
                df[col] = df[col].fillna(df[col].mode()[0] if not df[col].mode().empty else "Unknown")
        elif method == 'drop':
            df = df.dropna()
    
    
    if 'drop_columns' in config:
        cols_to_drop = config['drop_columns']
        df = df.drop(columns=[c for c in cols_to_drop if c in df.columns])
    
    return df

def main():
    if len(sys.argv) < 5:
        print(json.dumps({"error": "Not enough arguments"}))
        sys.exit(1)
    
    operation = sys.argv[1]
    input_file = sys.argv[2]
    output_file = sys.argv[3]
    params_json = sys.argv[4]
    
    try:
        params = json.loads(params_json)
        df = load_data(input_file)
        
        if operation == 'nlp_analyze':
            
            text_columns = params.get('columns', [])
            results = {}
            
            for col in text_columns:
                if col in df.columns:
                    analysis = analyze_text_column(df[col])
                    if analysis is not None:
                        results[col] = analysis
            
            print(json.dumps(results, default=str))
        
        elif operation == 'preprocess':
            
            df_processed = preprocess_data(df, params)
            if output_file != 'NONE':
                df_processed.to_csv(output_file, index=False)
                print(json.dumps({"status": "success", "file": output_file}))
            else:
                print(json.dumps({"error": "Output file not provided"}))
        
        else:
            print(json.dumps({"error": "Unknown operation"}))
    
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
