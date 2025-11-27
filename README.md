Hướng dẫn cho giảng viên đối với bài final môn Lập trình web với NodeJS
# Bài final môn Lập trình web với NodeJS

Đây là project website thương mại điện tử (E-Commerce) cuối kỳ cho môn Lập trình web với NodeJS.

## Các công nghệ sử dụng

* **Backend:** Node.js, Express, MongoDB (Mongoose)
* **Frontend:** React (hoặc Vue/Angular)
* **Xác thực:** JSON Web Tokens (JWT)

## Hướng dẫn cài đặt

1.  Clone repository:
    ```bash
    git clone [URL_REPOSITORY_CUA_BAN]
    cd [TEN_THU_MUC_PROJECT]
    ```
2.  Cài đặt dependencies cho backend:
    ```bash
    cd backend
    npm install
    ```
3.  Cài đặt dependencies cho frontend (nếu có):
    ```bash
    cd ../frontend
    npm install
    npm install sweetalert2
    ```

## Hướng dẫn chạy dự án

1.  Tạo file `.env` trong thư mục `backend` và điền các biến môi trường cần thiết (ví dụ: `MONGO_URI`, `JWT_SECRET`).
2.  Chạy backend server:
    ```bash
    cd backend
    npm run dev
    ```
3.  Chạy frontend (nếu có):
    ```bash
    cd frontend
    npm start
    ```

---

## Hướng dẫn cho giảng viên

* **Tài khoản Admin:** `admin@gmail.com` / `Admin123@`
* **Tài khoản User:** `user@example.com` / `user123`