#!/bin/bash

# Ultra-comprehensive script to fix ALL remaining dark mode text issues

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

echo "Applying ultra-comprehensive dark mode fixes..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Force ALL th elements to have dark mode
    sed -i '' 's/<th className="/<th className="text-gray-700 dark:text-slate-300 /g' "$file"
    
    # Force ALL td elements to have dark mode  
    sed -i '' 's/<td className="/<td className="text-gray-900 dark:text-white /g' "$file"
    
    # Fix any remaining text without color in common patterns
    sed -i '' 's/className="text-/className="text-gray-900 dark:text-white text-/g' "$file"
    
    # Fix h1, h2, h3, h4 without explicit colors
    sed -i '' 's/<h1 className="/<h1 className="text-gray-900 dark:text-white /g' "$file"
    sed -i '' 's/<h2 className="/<h2 className="text-gray-900 dark:text-white /g' "$file"
    sed -i '' 's/<h3 className="/<h3 className="text-gray-900 dark:text-white /g' "$file"
    sed -i '' 's/<h4 className="/<h4 className="text-gray-900 dark:text-white /g' "$file"
    
    # Fix any div inside cards that might not have color
    sed -i '' 's/className="mt-/className="text-gray-900 dark:text-white mt-/g' "$file"
    sed -i '' 's/className="mb-/className="text-gray-900 dark:text-white mb-/g' "$file"
    sed -i '' 's/className="flex /className="text-gray-900 dark:text-white flex /g' "$file"
    
    echo "✓ Fixed $file"
  fi
done

echo ""
echo "Ultra-comprehensive fixes applied!"
