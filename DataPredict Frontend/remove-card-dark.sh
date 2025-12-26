#!/bin/bash

# Remove dark mode from all cards - keep them white

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

echo "Removing dark mode from cards - keeping them white..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Remove dark:bg-slate-900 from white backgrounds
    sed -i '' 's/bg-white dark:bg-slate-900/bg-white/g' "$file"
    
    # Remove dark:bg-slate-800 from gray backgrounds  
    sed -i '' 's/bg-gray-50 dark:bg-slate-800/bg-gray-50/g' "$file"
    sed -i '' 's/bg-gray-100 dark:bg-slate-800/bg-gray-100/g' "$file"
    
    # Remove dark:text-white from text inside cards
    sed -i '' 's/text-gray-900 dark:text-white/text-gray-900/g' "$file"
    sed -i '' 's/text-gray-700 dark:text-slate-300/text-gray-700/g' "$file"
    sed -i '' 's/text-gray-600 dark:text-slate-400/text-gray-600/g' "$file"
    sed -i '' 's/text-gray-500 dark:text-slate-400/text-gray-500/g' "$file"
    
    # Remove dark mode from borders inside cards
    sed -i '' 's/border-gray-200 dark:border-slate-800/border-gray-200/g' "$file"
    sed -i '' 's/border-gray-200 dark:border-slate-700/border-gray-200/g' "$file"
    
    # Remove dark mode from inputs
    sed -i '' 's/bg-white dark:bg-slate-800/bg-white/g' "$file"
    
    # Remove dark mode from table headers
    sed -i '' 's/bg-gray-50 dark:bg-slate-800/bg-gray-50/g' "$file"
    
    # Remove dark mode from hover states inside cards
    sed -i '' 's/hover:bg-gray-50 dark:hover:bg-slate-800/hover:bg-gray-50/g' "$file"
    sed -i '' 's/hover:bg-gray-100 dark:hover:bg-slate-800/hover:bg-gray-100/g' "$file"
    
    echo "✓ Fixed $file"
  fi
done

echo ""
echo "Cards now stay white in dark mode!"
