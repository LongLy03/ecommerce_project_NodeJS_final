import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  // Nếu chỉ có 1 trang hoặc không có trang nào thì không hiển thị
  if (totalPages <= 1) return null;

  // Tạo mảng số trang [1, 2, 3, ...]
  const pages = [...Array(totalPages).keys()].map((num) => num + 1);

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination justify-content-center mt-4">
        {/* Nút Trước (Previous) */}
        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous"
          >
            <span aria-hidden="true">&laquo; Trước</span>
          </button>
        </li>

        {/* Các số trang */}
        {pages.map((page) => (
          <li
            key={page}
            className={`page-item ${currentPage === page ? "active" : ""}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Nút Sau (Next) */}
        <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next"
          >
            <span aria-hidden="true">Sau &raquo;</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;