FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install
# RUN npm install sweetalert2 (Dòng này có thể gộp vào npm install nếu đã có trong package.json)

COPY . .

EXPOSE 3000

# Chạy lệnh start của React
CMD ["npm", "start"]