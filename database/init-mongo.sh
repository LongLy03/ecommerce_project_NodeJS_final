#!/bin/bash
set -e

echo ">>> BẮT ĐẦU IMPORT DỮ LIỆU..."
for file in /docker-entrypoint-initdb.d/ecommerce.*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")

        collection_name=$(echo "$filename" | cut -d'.' -f2)
        
        echo "Dang import file: $filename vao collection: $collection_name"

        mongoimport --host localhost \
                    --username root \
                    --password password123 \
                    --authenticationDatabase admin \
                    --db ecommerce_db \
                    --collection "$collection_name" \
                    --type json \
                    --file "$file" \
                    --jsonArray
    fi
done

echo ">>> HOÀN TẤT IMPORT DỮ LIỆU!"