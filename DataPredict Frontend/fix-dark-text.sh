#!/bin/bash

# Script to fix dark mode text visibility issues

FILES=(
  "src/components/DataExploration.tsx"
  "src/components/DataPreprocessing.tsx"
  "src/components/DatasetImport.tsx"
  "src/components/TaskSelection.tsx"
  "src/components/Training.tsx"
  "src/components/Results.tsx"
  "src/components/VariableSelection.tsx"
  "src/components/ModelRecommendation.tsx"
  "src/components/Export.tsx"
  "src/components/Visualization.tsx"
  "src/components/Comparison.tsx"
  "src/components/History.tsx"
)

echo "Fixing dark mode text visibility..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Fix text-black to have dark mode
    sed -i '' 's/text-black"/text-black dark:text-white"/g' "$file"
    
    # Fix text-gray-700 without dark mode
    sed -i '' 's/text-gray-700"/text-gray-700 dark:text-slate-300"/g' "$file"
    sed -i '' 's/text-gray-700 /text-gray-700 dark:text-slate-300 /g' "$file"
    
    # Fix text-gray-800 without dark mode
    sed -i '' 's/text-gray-800"/text-gray-800 dark:text-slate-200"/g' "$file"
    sed -i '' 's/text-gray-800 /text-gray-800 dark:text-slate-200 /g' "$file"
    
    # Fix text-gray-900 that doesn't have dark mode yet
    sed -i '' 's/\([^-]\)text-gray-900"/\1text-gray-900 dark:text-white"/g' "$file"
    sed -i '' 's/\([^-]\)text-gray-900 /\1text-gray-900 dark:text-white /g' "$file"
    
    # Fix font-medium and font-semibold text that might be dark
    sed -i '' 's/font-medium text-gray-900"/font-medium text-gray-900 dark:text-white"/g' "$file"
    sed -i '' 's/font-semibold text-gray-900"/font-semibold text-gray-900 dark:text-white"/g' "$file"
    
    # Fix standalone dark text without dark mode
    sed -i '' 's/className="text-sm"/className="text-sm text-gray-900 dark:text-white"/g' "$file"
    sed -i '' 's/className="text-base"/className="text-base text-gray-900 dark:text-white"/g' "$file"
    
    echo "✓ Fixed $file"
  fi
done

echo "All text visibility issues fixed!"
