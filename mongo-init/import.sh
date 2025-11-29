#!/bin/bash
set -e

echo ">>> BẮT ĐẦU IMPORT DỮ LIỆU TỰ ĐỘNG..."

# Chờ một chút để đảm bảo mongod đã sẵn sàng chấp nhận kết nối
sleep 5

# Duyệt qua tất cả file json bắt đầu bằng ecommerce. trong thư mục mount
for file in /docker-entrypoint-initdb.d/ecommerce.*.json; do
    if [ -f "$file" ]; then
        filename=$(basename "$file")
        # Tách tên collection từ tên file (VD: ecommerce.products.json -> products)
        # Logic: Lấy phần giữa dấu chấm đầu tiên và dấu chấm cuối cùng
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
                    --jsonArray \
                    --drop  # Xóa dữ liệu cũ trước khi import
    fi
done

echo ">>> HOÀN TẤT IMPORT DỮ LIỆU!"