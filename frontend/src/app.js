// src/app.js
import React from "react";
import { Routes, Route } from "react-router-dom";

// Import các trang React
import LandingPage from "./pages/LandingPage";
import CatalogPage from "./pages/product/CatalogPage";
import ProductDetail from "./pages/product/ProductDetail";
import CartPage from "./pages/product/CartPage";
import CheckoutPage from "./pages/product/CheckoutPage";
import ProfilePage from "./pages/user/ProfilePage";
import LoginPage from "./pages/user/LoginPage";
import RegisterPage from "./pages/user/RegisterPage";

// Thành phần chính của ứng dụng React
function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/product/:id" element={<ProductDetail />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default App;
