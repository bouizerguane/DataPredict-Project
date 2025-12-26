# Social Media & Multi-Language NLP Guide

## Overview
Advanced text preprocessing for social media content (tweets, posts, comments) with multi-language support.

## 🌍 Multi-Language Support

### Supported Languages

The service supports stop words in the following languages:

| Language | Code | Example |
|----------|------|---------|
| English | `en` or `english` | Default |
| French | `fr` or `french` | Français |
| Spanish | `es` or `spanish` | Español |
| German | `de` or `german` | Deutsch |
| Italian | `it` or `italian` | Italiano |
| Portuguese | `pt` or `portuguese` | Português |
| Dutch | `nl` or `dutch` | Nederlands |
| Russian | `ru` or `russian` | Русский |
| Arabic | `ar` or `arabic` | العربية |

### Setting Language

```json
{
  "language": "french",
  "text_vectorization": {
    "enabled": true
  }
}
```

The language setting affects:
- Stop words removal in vectorization
- Stop words removal in social media mode
- Text tokenization

## 📱 Social Media Mode

### What is Social Media Mode?

A specialized preprocessing mode for social media text that handles:
- ✅ URLs → Replaced with `URL`
- ✅ @mentions → Replaced with `USER_MENTION`
- ✅ #hashtags → Keeps the word, removes `#`
- ✅ RT (retweets) → Removed
- ✅ Emojis → Replaced with sentiment tokens (`EMO_POS` or `EMO_NEG`)
- ✅ Multiple dots → Replaced with space
- ✅ Digits → Removed
- ✅ Stop words → Removed (optional)

### Emoji Sentiment Detection

**Positive Emojis** → `EMO_POS`:
😀 😃 😄 😁 😆 😊 😍 🥰 😘 👍 👏 🎉 ❤️ 💕 ⭐ ✨

**Negative Emojis** → `EMO_NEG`:
😞 😔 😟 😕 😣 😢 😭 😤 😠 😡 💔 👎

### Configuration

```json
{
  "language": "english",
  "text_preprocessing": {
    "social_media_mode": true,
    "remove_stopwords_nltk": true
  }
}
```

## 📊 Complete Examples

### Example 1: English Tweets
```json
{
  "language": "english",
  "text_preprocessing": {
    "social_media_mode": true,
    "remove_stopwords_nltk": true
  },
  "text_vectorization": {
    "method": "tfidf",
    "max_features": 200,
    "ngram_range": [1, 2]
  }
}
```

**Input:**
```
"RT @user: Check out this amazing product! 😍 https://example.com #awesome"
```

**After Preprocessing:**
```
"USER_MENTION check amazing product EMO_POS URL awesome"
```

**After Vectorization:**
200 numerical features representing the text

### Example 2: French Social Media
```json
{
  "language": "french",
  "text_preprocessing": {
    "social_media_mode": true,
    "remove_stopwords_nltk": true
  },
  "text_vectorization": {
    "method": "tfidf",
    "max_features": 150,
    "stop_words": "french"
  }
}
```

### Example 3: Spanish Comments
```json
{
  "language": "spanish",
  "text_preprocessing": {
    "social_media_mode": true,
    "remove_stopwords_nltk": true
  },
  "text_vectorization": {
    "method": "count",
    "max_features": 100,
    "stop_words": "spanish",
    "ngram_range": [1, 2]
  }
}
```

### Example 4: Standard Text (Non-Social Media)
```json
{
  "language": "english",
  "text_preprocessing": {
    "social_media_mode": false,
    "lowercase": true,
    "remove_whitespace": true,
    "remove_special_chars": true
  },
  "text_vectorization": {
    "method": "tfidf",
    "max_features": 300
  }
}
```

## 🎯 Use Cases

### Sentiment Analysis (Twitter)
```json
{
  "language": "english",
  "text_preprocessing": {
    "social_media_mode": true,
    "remove_stopwords_nltk": true
  },
  "text_vectorization": {
    "method": "tfidf",
    "max_features": 500,
    "ngram_range": [1, 2],
    "min_df": 2
  }
}
```

### Multi-Language Product Reviews
```json
{
  "language": "french",
  "text_preprocessing": {
    "social_media_mode": false,
    "lowercase": true,
    "remove_special_chars": false
  },
  "text_vectorization": {
    "method": "tfidf",
    "max_features": 300,
    "stop_words": "french"
  }
}
```

### Instagram/Facebook Posts
```json
{
  "language": "english",
  "text_preprocessing": {
    "social_media_mode": true,
    "remove_stopwords_nltk": false
  },
  "text_vectorization": {
    "method": "count",
    "max_features": 200,
    "ngram_range": [1, 3]
  }
}
```

## 🔄 Processing Pipeline

### Social Media Mode Pipeline:
1. Convert to lowercase
2. Replace URLs with `URL`
3. Replace @mentions with `USER_MENTION`
4. Extract hashtag words (remove #)
5. Remove RT
6. Replace emojis with sentiment tokens
7. Remove digits
8. Remove stop words (if enabled)
9. Vectorize to numerical features

### Standard Mode Pipeline:
1. Convert to lowercase (optional)
2. Remove whitespace (optional)
3. Remove special characters (optional)
4. Remove numbers (optional)
5. Vectorize to numerical features

## 📝 API Usage

### Upload Dataset
```bash
curl -X POST http://localhost:8080/api/datasets/upload \
  -F "file=@tweets.csv" \
  -F "description=Twitter sentiment dataset" \
  -F "userId=1"
```

### Preprocess with Social Media Mode
```bash
curl -X POST http://localhost:8080/api/datasets/1/preprocess \
  -H "Content-Type: application/json" \
  -d '{
    "language": "english",
    "text_preprocessing": {
      "social_media_mode": true,
      "remove_stopwords_nltk": true
    },
    "text_vectorization": {
      "method": "tfidf",
      "max_features": 200,
      "ngram_range": [1, 2]
    }
  }'
```

### Preprocess French Text
```bash
curl -X POST http://localhost:8080/api/datasets/1/preprocess \
  -H "Content-Type: application/json" \
  -d '{
    "language": "french",
    "text_vectorization": {
      "method": "tfidf",
      "max_features": 150,
      "stop_words": "french"
    }
  }'
```

## ⚙️ Configuration Reference

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `language` | string | "english" | Dataset language |
| `social_media_mode` | boolean | false | Enable social media preprocessing |
| `remove_stopwords_nltk` | boolean | false | Remove stop words using NLTK |

## 💡 Tips

1. **Social Media Mode**: Use for tweets, posts, comments
2. **Language**: Set to match your dataset language
3. **Stop Words**: 
   - Use NLTK stop words for social media mode
   - Use vectorizer stop words for standard mode
4. **Emojis**: Automatically converted to sentiment tokens
5. **URLs/Mentions**: Normalized to prevent overfitting

## 🚀 Advanced Configuration

### Maximum Preprocessing (Social Media)
```json
{
  "language": "english",
  "fillna": {"method": "drop"},
  "text_preprocessing": {
    "social_media_mode": true,
    "remove_stopwords_nltk": true
  },
  "text_vectorization": {
    "method": "tfidf",
    "max_features": 500,
    "ngram_range": [1, 3],
    "min_df": 3,
    "max_df": 0.8
  },
  "categorical_encoding": {"method": "onehot"},
  "scaling": {"enabled": true, "method": "standard"}
}
```

### Minimal Preprocessing (Keep Everything)
```json
{
  "language": "english",
  "text_preprocessing": {
    "social_media_mode": false,
    "lowercase": false,
    "remove_whitespace": false
  },
  "text_vectorization": {
    "method": "count",
    "max_features": 100,
    "stop_words": false
  }
}
```

## 📦 Requirements

The service automatically downloads required NLTK data:
- `punkt` tokenizer
- `stopwords` corpus

No manual installation needed!

## ✅ Supported Scenarios

- ✅ English tweets/posts
- ✅ Multi-language text
- ✅ Emoji sentiment analysis
- ✅ Hashtag extraction
- ✅ URL normalization
- ✅ User mention handling
- ✅ Mixed content (text + emojis + URLs)
- ✅ Standard text preprocessing
- ✅ Custom stop words
- ✅ N-gram extraction
