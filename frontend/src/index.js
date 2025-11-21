import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";

// Import Bootstrap CSS (Bắt buộc để giao diện đẹp)
import "bootstrap/dist/css/bootstrap.min.css"; 
// Import CSS cho Toast thông báo
import "react-toastify/dist/ReactToastify.css"; 
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import * as Api from "./services/api";
import { CartStore } from "./services/storage";

// Debug: Gán vào window để test console trình duyệt (Tùy chọn)
if (process.env.NODE_ENV !== 'production' && typeof window !== "undefined") {
  window.Api = Api;
  window.Cart = CartStore;
}

const container = document.getElementById("root");
if (!container) {
  throw new Error('Root element with id "root" not found');
}

const root = ReactDOM.createRoot(container);

root.render(
  // Xóa React.StrictMode nếu muốn tránh render 2 lần lúc dev (tùy chọn)
  <React.StrictMode> 
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);