import sys
import pandas as pd
import re

def clean_text(text):
    """
    Applies basic NLP preprocessing to a text string.
    """
    if pd.isna(text):
        return ""
    if not isinstance(text, str):
        return str(text)
    
    # 1. Lowercase for consistency
    text = text.lower()
    
    # 2. Remove problematic CSV characters (commas, quotes, semicolons)
    #    Replacing them with a space ensures words doesn't get merged (e.g., "hello,world" -> "hello world")
    text = re.sub(r"[,;\"'`]", " ", text)
    
    # 3. Collapse multiple whitespaces into one to tidy up
    text = re.sub(r"\s+", " ", text).strip()
    
    return text

def main():
    # Ensure correct arguments
    if len(sys.argv) != 3:
        print("Usage: python3 text_tokenizer.py <input_csv> <output_csv>")
        sys.exit(2)

    input_path = sys.argv[1]
    output_path = sys.argv[2]

    try:
        # Read the CSV file.
        # Use on_bad_lines='skip' to gracefully handle malformed CSV rows
        # Explicitly use utf-8 encoding to avoid issues with special characters
        df = pd.read_csv(input_path, on_bad_lines='skip', encoding='utf-8')
        
        # Identify text columns (dtype 'object') to apply cleaning
        text_columns = df.select_dtypes(include=['object']).columns
        
        for col in text_columns:
            # Apply the cleaning function to the text column
            df[col] = df[col].apply(clean_text)
            
        # Save the processed data to the output path
        # index=False prevents writing the row numbers as a new column
        df.to_csv(output_path, index=False, encoding='utf-8')
        
        # Print status for the Java service to capture
        print(f"Python tokenizer: Successfully processed {len(df)} rows.")
        print(f"Python tokenizer: Cleaned columns: {list(text_columns)}")

    except Exception as e:
        # Print error for the Java service to capture
        print(f"Error in Python tokenizer: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
