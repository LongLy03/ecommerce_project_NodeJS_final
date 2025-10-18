// src/pages/ProductDetail.js
(function() {
        async function mount(root, { id }) {
            if (!id) {
                root.innerHTML = `<div class="p-4 text-red-600">Thiếu mã sản phẩm.</div>`;
                return;
            }

            root.innerHTML = `<div class="p-6 text-gray-600 italic">Đang tải chi tiết sản phẩm...</div>`;

            try {
                const product = await window.Api.ProductAPI.get(id); // trả về object product từ backend

                if (!product) {
                    root.innerHTML = `<div class="p-4 text-red-600">Không tìm thấy sản phẩm.</div>`;
                    return;
                }

                root.innerHTML = `
            <div class="product-detail-container p-6">
                <div class="product-detail-grid">
                    <!-- Cột trái: Ảnh -->
                    <div class="product-image">
                        <img src="${product.image || '/placeholder.png'}" alt="${product.name}" />
                    </div>

                    <!-- Cột phải: Thông tin -->
                    <div class="product-info">
                        <h2 class="product-title">${product.name}</h2>
                        <div class="product-brand">${product.brand ? `🏷️ ${product.brand}` : ''}</div>
                        <div class="product-price">${(product.price || 0).toLocaleString()} đ</div>
                        <p class="product-desc">${product.description || 'Không có mô tả chi tiết cho sản phẩm này.'}</p>

                        <div class="qty-group">
                            <label for="qty">Số lượng:</label>
                            <input id="qty" type="number" min="1" value="1" class="qty-input" />
                        </div>

                        <button id="btnAdd" class="btn btn-primary mt-3">🛒 Thêm vào giỏ hàng</button>
                        <a href="#/catalog" class="btn btn-secondary mt-2">⬅ Quay lại danh mục</a>
                    </div>
                </div>
            </div>
            `;

            const qtyInput = root.querySelector('#qty');
            const btnAdd = root.querySelector('#btnAdd');

            btnAdd.addEventListener('click', () => {
                const qty = parseInt(qtyInput.value) || 1;
                window.Cart.add({
                    productId: product._id,
                    variantId: null,
                    price: product.price,
                    name: product.name,
                    qty
                });

                alert(`Đã thêm ${qty} sản phẩm "${product.name}" vào giỏ hàng!`);
                location.hash = '#/cart';
            });
        } catch (e) {
            root.innerHTML = `<div class="p-4 text-red-600">Lỗi tải chi tiết sản phẩm: ${e.message}</div>`;
        }
    }

    // Gắn vào hệ thống SPA
    window.Pages = window.Pages || {};
    window.Pages.ProductDetail = { mount };
})();