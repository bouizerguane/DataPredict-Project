#!/bin/bash

# Script to apply standardized styles across all components

# List of component files to update
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

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Updating $file..."
    
    # Replace old title styles with new classes
    sed -i '' 's/text-2xl text-\[#1E293B\]/page-title/g' "$file"
    sed -i '' 's/text-xl text-\[#1E293B\]/section-title/g' "$file"
    sed -i '' 's/text-lg text-\[#1E293B\]/subsection-title/g' "$file"
    
    # Replace card styles
    sed -i '' 's/bg-white rounded-lg p-6 border border-\[#E2E8F0\]/card/g' "$file"
    sed -i '' 's/bg-white rounded-lg p-4 border border-\[#E2E8F0\]/card/g' "$file"
    
    # Add dark mode to remaining text colors
    sed -i '' 's/text-\[#1E293B\]/text-gray-900 dark:text-white/g' "$file"
    sed -i '' 's/text-gray-600"/text-gray-600 dark:text-slate-400"/g' "$file"
    sed -i '' 's/text-gray-500"/text-gray-500 dark:text-slate-400"/g' "$file"
    
    # Add dark mode to backgrounds
    sed -i '' 's/bg-\[#F8FAFC\]/bg-gray-50 dark:bg-slate-800/g' "$file"
    sed -i '' 's/bg-white"/bg-white dark:bg-slate-900"/g' "$file"
    
    # Add dark mode to borders
    sed -i '' 's/border-\[#E2E8F0\]/border-gray-200 dark:border-slate-800/g' "$file"
    
    echo "✓ Updated $file"
  fi
done

echo "All components updated!"
