# backend/Dockerfile

# Sử dụng Node.js bản nhẹ
FROM node:18-alpine

# Tạo thư mục làm việc
WORKDIR /app

# Copy file package để cài thư viện trước (tối ưu cache)
COPY package*.json ./
RUN npm install

# Copy toàn bộ code vào
COPY . .

# Mở port 5000
EXPOSE 5000

# Chạy lệnh dev (để dùng nodemon)
CMD ["npm", "run", "dev"]