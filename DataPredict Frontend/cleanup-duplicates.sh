#!/bin/bash

# Clean up duplicate classes and fix properly

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
)

echo "Cleaning up duplicate classes..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Remove duplicate "text-gray-900 dark:text-white" patterns
    sed -i '' 's/text-gray-900 dark:text-white text-gray-900 dark:text-white/text-gray-900 dark:text-white/g' "$file"
    sed -i '' 's/text-gray-900 dark:text-white text-gray-900 dark:text-white text-gray-900 dark:text-white/text-gray-900 dark:text-white/g' "$file"
    
    # Remove duplicate "text-gray-700 dark:text-slate-300" patterns
    sed -i '' 's/text-gray-700 dark:text-slate-300 text-gray-700 dark:text-slate-300/text-gray-700 dark:text-slate-300/g' "$file"
    
    # Remove any triple or more duplicates
    sed -i '' 's/\(text-gray-[0-9]* dark:text-[a-z]*-[0-9]*\) \1 \1/\1/g' "$file"
    sed -i '' 's/\(text-gray-[0-9]* dark:text-[a-z]*-[0-9]*\) \1/\1/g' "$file"
    
    echo "✓ Cleaned $file"
  fi
done

echo ""
echo "Cleanup complete!"
