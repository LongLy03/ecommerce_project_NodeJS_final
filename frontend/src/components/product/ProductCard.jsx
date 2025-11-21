import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // --- LOGIC MỚI ĐỂ LẤY ẢNH ---
  const getImageUrl = (product) => {
    if (!product.images || product.images.length === 0) {
      return "https://via.placeholder.com/300x300?text=No+Image";
    }
    
    const firstImage = product.images[0];
    
    // Kiểm tra xem firstImage là chuỗi (string) hay đối tượng (object)
    if (typeof firstImage === 'string') {
        return firstImage;
    } else if (typeof firstImage === 'object' && firstImage.url) {
        return firstImage.url; // <--- Đây là dòng sửa lỗi cho data của bạn
    }
    
    return "https://via.placeholder.com/300x300?text=Error";
  };

  const imageUrl = getImageUrl(product);
  // -----------------------------

  return (
    <div className="col">
      <div className="card h-100 shadow-sm border-0">
        <Link to={`/product/${product.slug || product._id}`}>
          <img
            src={imageUrl}
            className="card-img-top p-3"
            alt={product.name}
            style={{ objectFit: "contain", height: "200px" }}
            // Thêm xử lý khi ảnh lỗi thì hiện ảnh mặc định
            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300?text=Lỗi+Ảnh"; }}
          />
        </Link>
        <div className="card-body d-flex flex-column">
          <h6 className="card-title text-truncate">
            <Link
              to={`/product/${product.slug || product._id}`}
              className="text-decoration-none text-dark"
              title={product.name}
            >
              {product.name}
            </Link>
          </h6>
          
          <div className="mt-auto">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-danger fw-bold">
                {formatPrice(product.price)}
              </span>
              <small className="text-warning">
                {product.rating > 0 ? product.rating : 0} <i className="fas fa-star"></i>
              </small>
            </div>
            
            <Link 
              to={`/product/${product.slug || product._id}`} 
              className="btn btn-outline-primary btn-sm w-100"
            >
              Xem chi tiết
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;