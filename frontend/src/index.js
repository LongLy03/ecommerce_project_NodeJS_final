// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./app";

// 👉 Nếu bạn muốn sử dụng Api & CartStore trong toàn app React
//    thì import chúng và gắn vào React Context hoặc export ra module riêng
import * as Api from "./services/api";
import { CartStore } from "./services/storage";

// (Tùy chọn) — nếu bạn muốn có thể truy cập từ console khi debug
window.Api = Api;
window.Cart = CartStore;

// Khởi động ứng dụng React
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
