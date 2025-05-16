#!/bin/bash

# Navigate to script's directory to ensure relative paths work
cd "$(dirname "$0")"

# Output file
output_file="components-export.txt"

# Ensure output file is cleared
> "$output_file"

# Check if directory exists
component_dir="./components/ui"
if [ ! -d "$component_dir" ]; then
  echo "❌ Directory $component_dir does not exist."
  exit 1
fi

# Check if any .tsx files exist
shopt -s nullglob
tsx_files=("$component_dir"/*.tsx)

if [ ${#tsx_files[@]} -eq 0 ]; then
  echo "❌ No .tsx files found in $component_dir."
  exit 1
fi

# Loop through files
for filepath in "${tsx_files[@]}"; do
  filename=$(basename "$filepath" .tsx)
  jsname="${filename}.js"

  echo "'/components/ui/$jsname': {" >> "$output_file"
  echo "    file: {" >> "$output_file"
  echo -n "      contents: \`" >> "$output_file"
  sed 's/`/\\`/g' "$filepath" >> "$output_file"
  echo "\`" >> "$output_file"
  echo "}}," >> "$output_file"
done

echo "✅ Exported to $output_file"
