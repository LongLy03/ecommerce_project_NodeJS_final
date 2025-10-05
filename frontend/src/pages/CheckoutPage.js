// src/pages/CheckoutPage.js
(function() {
    function mount(root) {
        const items = window.Cart.all();
        if (!items.length) {
            root.innerHTML = `<div class="p-4">Giỏ hàng trống. <a href="#/catalog">Quay lại cửa hàng</a></div>`;
            return;
        }

        const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);
        root.innerHTML = `
      <div class="checkout">
        <h2>Thanh toán</h2>
        <div class="summary">Tổng thanh toán: <b>${total.toLocaleString()} đ</b></div>
        <form id="frm">
          <input name="fullname" placeholder="Họ tên" required />
          <input name="address" placeholder="Địa chỉ" required />
          <input name="phone" placeholder="SĐT" required />
          <button class="btn" type="submit">Đặt hàng</button>
        </form>
        <div id="msg"></div>
      </div>
    `;

        const form = root.querySelector('#frm');
        const msg = root.querySelector('#msg');

        form.addEventListener('submit', async(e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());
            try {
                await window.Api.OrderAPI.create({ items, shipping: data });
                window.Cart.clear();
                msg.innerHTML = `<div class="text-green-700">Đặt hàng thành công!</div>`;
                setTimeout(() => location.hash = '#/profile', 1200);
            } catch (err) {
                msg.innerHTML = `<div class="text-red-600">Lỗi đặt hàng: ${err.message}</div>`;
            }
        });
    }

    window.Pages = window.Pages || {};
    window.Pages.CheckoutPage = { mount };
})();