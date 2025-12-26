# Stop Words & Advanced NLP Configuration

## Stop Words Removal

Stop words are common words (like "the", "is", "at") that usually don't carry much meaning for text analysis. You can configure how they're handled:

### Option 1: Use English Stop Words (Default)
```json
{
  "text_vectorization": {
    "stop_words": "english"
  }
}
```

### Option 2: No Stop Words Removal
```json
{
  "text_vectorization": {
    "stop_words": "none"
  }
}
```
or
```json
{
  "text_vectorization": {
    "stop_words": false
  }
}
```

### Option 3: Custom Stop Words List
```json
{
  "text_vectorization": {
    "stop_words": ["the", "is", "at", "which", "on", "custom", "word"]
  }
}
```

## N-Grams Configuration

N-grams capture sequences of words, not just individual words.

### Unigrams Only (Default)
```json
{
  "text_vectorization": {
    "ngram_range": [1, 1]
  }
}
```
Captures: "great", "product", "quality"

### Bigrams (2-word combinations)
```json
{
  "text_vectorization": {
    "ngram_range": [2, 2]
  }
}
```
Captures: "great product", "product quality"

### Unigrams + Bigrams
```json
{
  "text_vectorization": {
    "ngram_range": [1, 2]
  }
}
```
Captures: "great", "product", "great product", "product quality"

### Trigrams (3-word combinations)
```json
{
  "text_vectorization": {
    "ngram_range": [1, 3]
  }
}
```
Captures: "great", "product", "great product", "great product quality"

## Document Frequency Filtering

Control which words are included based on how often they appear.

### Min Document Frequency
Ignore words that appear in fewer than X documents:

```json
{
  "text_vectorization": {
    "min_df": 2
  }
}
```
Words must appear in at least 2 documents to be included.

Or use percentage:
```json
{
  "text_vectorization": {
    "min_df": 0.01
  }
}
```
Words must appear in at least 1% of documents.

### Max Document Frequency
Ignore words that appear in too many documents:

```json
{
  "text_vectorization": {
    "max_df": 0.8
  }
}
```
Ignore words that appear in more than 80% of documents (likely too common).

## Complete Advanced Configuration

```json
{
  "fillna": {
    "method": "mean"
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
    "stop_words": "english",
    "ngram_range": [1, 2],
    "min_df": 2,
    "max_df": 0.9,
    "drop_original": true
  },
  "categorical_encoding": {
    "method": "onehot"
  },
  "scaling": {
    "enabled": true,
    "method": "standard"
  }
}
```

## Examples by Use Case

### Sentiment Analysis
```json
{
  "text_vectorization": {
    "method": "tfidf",
    "max_features": 500,
    "stop_words": "english",
    "ngram_range": [1, 2],
    "min_df": 2
  }
}
```

### Topic Modeling
```json
{
  "text_vectorization": {
    "method": "count",
    "max_features": 1000,
    "stop_words": "english",
    "ngram_range": [1, 1],
    "min_df": 5,
    "max_df": 0.7
  }
}
```

### Short Text (Tweets, Comments)
```json
{
  "text_vectorization": {
    "method": "tfidf",
    "max_features": 100,
    "stop_words": false,
    "ngram_range": [1, 3],
    "min_df": 1
  }
}
```

### Long Documents (Articles, Reviews)
```json
{
  "text_vectorization": {
    "method": "tfidf",
    "max_features": 500,
    "stop_words": "english",
    "ngram_range": [1, 2],
    "min_df": 3,
    "max_df": 0.8
  }
}
```

### Domain-Specific (Custom Stop Words)
```json
{
  "text_vectorization": {
    "method": "tfidf",
    "max_features": 300,
    "stop_words": ["product", "customer", "service", "company", "the", "is", "at"],
    "ngram_range": [1, 2]
  }
}
```

## Parameter Guide

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `stop_words` | string/list/bool | "english" | Stop words to remove |
| `ngram_range` | [int, int] | [1, 1] | Range of n-grams to extract |
| `min_df` | int/float | 1 | Minimum document frequency |
| `max_df` | int/float | 1.0 | Maximum document frequency |
| `max_features` | int | 100 | Number of features to create |
| `method` | string | "tfidf" | "tfidf" or "count" |

## Tips

1. **Stop Words**:
   - Use "english" for general English text
   - Use custom list for domain-specific text
   - Use false/none for short text or when every word matters

2. **N-Grams**:
   - [1,1]: Fastest, good for most cases
   - [1,2]: Better context, more features
   - [1,3]: Best context, many features, slower

3. **Document Frequency**:
   - `min_df`: Remove rare words (noise)
   - `max_df`: Remove too common words (not discriminative)

4. **Max Features**:
   - Small datasets: 50-100
   - Medium datasets: 100-300
   - Large datasets: 300-1000

## Testing Your Configuration

```bash
# Test with minimal config
curl -X POST http://localhost:8080/api/datasets/1/preprocess \
  -H "Content-Type: application/json" \
  -d '{
    "text_vectorization": {
      "stop_words": "english"
    }
  }'

# Test with custom stop words
curl -X POST http://localhost:8080/api/datasets/1/preprocess \
  -H "Content-Type: application/json" \
  -d '{
    "text_vectorization": {
      "stop_words": ["custom", "words", "here"],
      "ngram_range": [1, 2]
    }
  }'
```
