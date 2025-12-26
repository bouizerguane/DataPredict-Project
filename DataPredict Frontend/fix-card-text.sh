#!/bin/bash

# Script to fix text colors in cards that are invisible in dark mode

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

echo "Fixing text colors in cards..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Fix divs with text-sm without color
    sed -i '' 's/<div className="text-sm">/<div className="text-sm text-gray-900 dark:text-white">/g' "$file"
    sed -i '' 's/<div className="text-sm /<div className="text-sm text-gray-900 dark:text-white /g' "$file"
    
    # Fix divs with text-base without color
    sed -i '' 's/<div className="text-base">/<div className="text-base text-gray-900 dark:text-white">/g' "$file"
    sed -i '' 's/<div className="text-base /<div className="text-base text-gray-900 dark:text-white /g' "$file"
    
    # Fix divs with text-lg without color
    sed -i '' 's/<div className="text-lg">/<div className="text-lg text-gray-900 dark:text-white">/g' "$file"
    sed -i '' 's/<div className="text-lg /<div className="text-lg text-gray-900 dark:text-white /g' "$file"
    
    # Fix divs with text-xl without color
    sed -i '' 's/<div className="text-xl">/<div className="text-xl text-gray-900 dark:text-white">/g' "$file"
    sed -i '' 's/<div className="text-xl /<div className="text-xl text-gray-900 dark:text-white /g' "$file"
    
    # Fix divs with text-2xl without color
    sed -i '' 's/<div className="text-2xl">/<div className="text-2xl text-gray-900 dark:text-white">/g' "$file"
    sed -i '' 's/<div className="text-2xl /<div className="text-2xl text-gray-900 dark:text-white /g' "$file"
    
    # Fix divs with text-3xl without color
    sed -i '' 's/<div className="text-3xl">/<div className="text-3xl text-gray-900 dark:text-white">/g' "$file"
    sed -i '' 's/<div className="text-3xl /<div className="text-3xl text-gray-900 dark:text-white /g' "$file"
    
    # Fix spans with font-medium without color
    sed -i '' 's/<span className="font-medium">/<span className="font-medium text-gray-900 dark:text-white">/g' "$file"
    sed -i '' 's/<span className="font-medium /<span className="font-medium text-gray-900 dark:text-white /g' "$file"
    
    # Fix spans with font-semibold without color
    sed -i '' 's/<span className="font-semibold">/<span className="font-semibold text-gray-900 dark:text-white">/g' "$file"
    sed -i '' 's/<span className="font-semibold /<span className="font-semibold text-gray-900 dark:text-white /g' "$file"
    
    # Fix spans with font-bold without color
    sed -i '' 's/<span className="font-bold">/<span className="font-bold text-gray-900 dark:text-white">/g' "$file"
    sed -i '' 's/<span className="font-bold /<span className="font-bold text-gray-900 dark:text-white /g' "$file"
    
    # Fix p tags without color
    sed -i '' 's/<p className="text-sm">/<p className="text-sm text-gray-600 dark:text-slate-400">/g' "$file"
    sed -i '' 's/<p className="text-base">/<p className="text-base text-gray-900 dark:text-white">/g' "$file"
    
    # Fix labels without color
    sed -i '' 's/<label className="/<label className="text-gray-700 dark:text-slate-300 /g' "$file"
    
    echo "✓ Fixed $file"
  fi
done

echo ""
echo "All card text colors fixed!"
