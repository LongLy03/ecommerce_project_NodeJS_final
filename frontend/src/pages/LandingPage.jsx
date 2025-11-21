// src/pages/LandingPage.jsx
import React, { useEffect, useState } from "react";
import { ProductAPI } from "../services/api";
import ProductCard from "../components/product/ProductCard";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [data, setData] = useState({
    newest: [],
    bestSellers: [],
    categories: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await ProductAPI.getHomeSections();
        setData(res);
      } catch (error) {
        console.error("Lỗi tải trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  return (
    <div className="container my-4">
      {/* Banner Quảng cáo */}
      <div className="p-5 mb-4 bg-light rounded-3 shadow-sm text-center">
        <h1 className="display-5 fw-bold text-primary">Máy Tính & Linh Kiện</h1>
        <p className="col-md-8 fs-4 mx-auto">
          Cấu hình mạnh mẽ - Giá cả hợp lý - Bảo hành chính hãng
        </p>
        <Link to="/catalog" className="btn btn-primary btn-lg" type="button">
          Mua ngay
        </Link>
      </div>

      {/* Section: Sản phẩm mới */}
      <section className="mb-5">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3 className="fw-bold border-start border-4 border-primary ps-3">
            Sản phẩm mới
          </h3>
          <Link to="/catalog?sort=createdAt_desc" className="btn btn-sm btn-outline-secondary">
            Xem tất cả
          </Link>
        </div>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 row-cols-lg-5 g-3">
          {data.newest.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Section: Bán chạy */}
      <section className="mb-5">
        <h3 className="fw-bold border-start border-4 border-danger ps-3 mb-3">
          Bán chạy nhất
        </h3>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 row-cols-lg-5 g-3">
          {data.bestSellers.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </section>

      {/* Section: Các danh mục (Laptop, PC...) */}
      {Object.keys(data.categories).map((key) => {
        const catData = data.categories[key];
        // Bỏ qua nếu danh mục không có sản phẩm
        if (!catData.products || catData.products.length === 0) return null;

        return (
          <section className="mb-5" key={catData.category._id}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fw-bold border-start border-4 border-success ps-3">
                {catData.category.name}
              </h3>
              <Link
                to={`/catalog?category=${catData.category.slug}`}
                className="btn btn-sm btn-outline-secondary"
              >
                Xem thêm
              </Link>
            </div>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 row-cols-lg-5 g-3">
              {catData.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default LandingPage;