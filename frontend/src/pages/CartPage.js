// src/pages/CartPage.js
(function() {
        function mount(root) {
            const items = window.Cart.all();
            if (!items.length) {
                root.innerHTML = `<div class="p-4">Giỏ hàng trống. <a href="#/catalog" class="link">Mua sắm ngay</a></div>`;
                return;
            }
            const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);

            root.innerHTML = `
      <div class="cart">
        <h2>Giỏ hàng</h2>
        <ul class="list">
          ${items.map(it => `
            <li class="row">
              <div class="name">${it.name}</div>
              <div class="qty">x${it.qty}</div>
              <div class="price">${(it.price * it.qty).toLocaleString()} đ</div>
              <button class="btn-remove" data-id="${it.productId}">Xóa</button>
            </li>
          `).join('')}
        </ul>
        <div class="total">Tổng: <b>${total.toLocaleString()} đ</b></div>
        <a class="btn" href="#/checkout">Thanh toán</a>
      </div>
    `;

    root.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const productId = btn.getAttribute('data-id');
        window.Cart.remove(productId, null);
        mount(root);
      });
    });
  }

  window.Pages = window.Pages || {};
  window.Pages.CartPage = { mount };
})();