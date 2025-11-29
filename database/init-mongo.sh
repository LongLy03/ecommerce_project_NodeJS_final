#!/bin/bash
set -e

echo ">>> BẮT ĐẦU IMPORT DỮ LIỆU..."

for file in /docker-entrypoint-initdb.d/ecommerce.*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        collection_name=$(echo "$filename" | cut -d'.' -f2)

        echo ">>> Importing $filename → $collection_name"

        mongoimport \
            --host 127.0.0.1 \
            --username "$MONGO_INITDB_ROOT_USERNAME" \
            --password "$MONGO_INITDB_ROOT_PASSWORD" \
            --authenticationDatabase admin \
            --db "$MONGO_INITDB_DATABASE" \
            --collection "$collection_name" \
            --type json \
            --file "$file" \
            --jsonArray
    fi
done

echo ">>> IMPORT HOÀN TẤT!"
