#!/bin/bash

# Comprehensive script to fix all dark mode issues across all components

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

echo "Fixing dark mode issues across all pages..."

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "Processing $file..."
    
    # Fix white backgrounds without dark mode
    sed -i '' 's/className="bg-white rounded/className="bg-white dark:bg-slate-900 rounded/g' "$file"
    sed -i '' 's/className="bg-white border/className="bg-white dark:bg-slate-900 border/g' "$file"
    sed -i '' 's/className="bg-white p-/className="bg-white dark:bg-slate-900 p-/g' "$file"
    
    # Fix gray backgrounds
    sed -i '' 's/bg-gray-50 border-b/bg-gray-50 dark:bg-slate-800 border-b/g' "$file"
    sed -i '' 's/bg-gray-50"/bg-gray-50 dark:bg-slate-800"/g' "$file"
    sed -i '' 's/bg-gray-100"/bg-gray-100 dark:bg-slate-800"/g' "$file"
    
    # Fix input fields without dark mode
    sed -i '' 's/border border-gray-200 rounded-lg focus:outline-none/bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-600 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500/g' "$file"
    
    # Fix select fields
    sed -i '' 's/className="px-4 py-2 border border-gray-200 rounded/className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded text-gray-900 dark:text-white/g' "$file"
    
    # Fix icon colors
    sed -i '' 's/text-blue-600"/text-blue-600 dark:text-blue-400"/g' "$file"
    sed -i '' 's/text-green-600"/text-green-600 dark:text-green-400"/g' "$file"
    sed -i '' 's/text-purple-600"/text-purple-600 dark:text-purple-400"/g' "$file"
    sed -i '' 's/text-orange-600"/text-orange-600 dark:text-orange-400"/g' "$file"
    sed -i '' 's/text-red-600"/text-red-600 dark:text-red-400"/g' "$file"
    sed -i '' 's/text-yellow-600"/text-yellow-600 dark:text-yellow-400"/g' "$file"
    sed -i '' 's/text-teal-600"/text-teal-600 dark:text-teal-400"/g' "$file"
    
    # Fix buttons with old styles
    sed -i '' 's/bg-\[#1E293B\] text-white rounded-lg hover:bg-\[#334155\]/btn-primary/g' "$file"
    sed -i '' 's/className="px-6 py-3 bg-\[#1E293B\]/className="btn-primary/g' "$file"
    
    # Fix borders
    sed -i '' 's/border-\[#E2E8F0\]"/border-gray-200 dark:border-slate-800"/g' "$file"
    sed -i '' 's/divide-\[#E2E8F0\]"/divide-gray-200 dark:divide-slate-700"/g' "$file"
    
    # Fix hover states
    sed -i '' 's/hover:bg-gray-50 transition/hover:bg-gray-50 dark:hover:bg-slate-800 transition/g' "$file"
    sed -i '' 's/hover:bg-gray-100 transition/hover:bg-gray-100 dark:hover:bg-slate-800 transition/g' "$file"
    
    echo "✓ Fixed $file"
  fi
done

echo ""
echo "All pages updated with dark mode support!"
