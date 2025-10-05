// src/pages/ProductDetail.js
(function() {
    async function mount(root, { id }) {
        if (!id) {
            root.innerHTML = `<div class="p-4 text-red-600">Thiếu sản phẩm.</div>`;
            return;
        }

        root.innerHTML = `<div class="p-4">Đang tải chi tiết...</div>`;
        try {
            const product = await window.Api.ProductAPI.get(id); // kỳ vọng backend trả object product
            root.innerHTML = `
        <div class="product-detail">
          <img src="${product.image || '/placeholder.png'}" alt="${product.name}" />
          <div class="info">
            <h2>${product.name}</h2>
            <div class="price">${(product.price || 0).toLocaleString()} đ</div>
            <p>${product.description || ''}</p>
            <button id="btnAdd" class="btn">Thêm vào giỏ</button>
          </div>
        </div>
      `;
            root.querySelector('#btnAdd').addEventListener('click', () => {
                window.Cart.add({ productId: product._id, variantId: null, price: product.price, name: product.name, qty: 1 });
                alert('Đã thêm vào giỏ');
                location.hash = '#/cart';
            });
        } catch (e) {
            root.innerHTML = `<div class="p-4 text-red-600">Lỗi tải: ${e.message}</div>`;
        }
    }

    window.Pages = window.Pages || {};
    window.Pages.ProductDetail = { mount };
})();