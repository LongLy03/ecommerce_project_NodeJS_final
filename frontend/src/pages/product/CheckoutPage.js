// src/pages/CheckoutPage.js
(function() {
        function mount(root) {
            const items = window.Cart.all();
            if (!items.length) {
                root.innerHTML = `
                <div class="p-6 text-center">
                    <h3>🛒 Giỏ hàng của bạn đang trống</h3>
                    <a href="#/catalog" class="btn mt-3">⬅ Quay lại cửa hàng</a>
                </div>
            `;
                return;
            }

            const total = items.reduce((sum, it) => sum + (it.price || 0) * (it.qty || 1), 0);

            // HTML giao diện trang checkout
            root.innerHTML = `
        <div class="checkout-container p-6">
            <h2 class="text-2xl font-bold mb-4 border-b pb-2">🧾 Thanh toán đơn hàng</h2>

            <div class="checkout-content" style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px;">
                <!-- Form thông tin người nhận -->
                <div class="shipping-info card p-4 border rounded shadow-sm bg-white">
                    <h3 class="text-lg font-semibold mb-3">Thông tin giao hàng</h3>
                    <form id="frm" class="flex flex-col gap-3">

                        <div>
                            <label>Họ và tên</label>
                            <input name="fullname" class="form-control" placeholder="Nhập họ tên đầy đủ" required />
                        </div>

                        <div>
                            <label>Địa chỉ giao hàng</label>
                            <input name="address" class="form-control" placeholder="Nhập địa chỉ cụ thể" required />
                        </div>

                        <div>
                            <label>Số điện thoại</label>
                            <input name="phone" class="form-control" placeholder="Nhập số điện thoại" required />
                        </div>

                        <div>
                            <label>Ghi chú (tuỳ chọn)</label>
                            <textarea name="note" class="form-control" rows="2" placeholder="Ví dụ: Giao trong giờ hành chính..."></textarea>
                        </div>

                        <div>
                            <label>Phương thức thanh toán</label>
                            <div class="payment-options mt-2">
                                <label class="payment-option">
                                    <input type="radio" name="payment_method" value="COD" checked />
                                    <span>💵 Thanh toán khi nhận hàng (COD)</span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="payment_method" value="BANK" />
                                    <span>🏦 Chuyển khoản ngân hàng</span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="payment_method" value="E_WALLET" />
                                    <span>📱 Ví điện tử (Momo, ZaloPay...)</span>
                                </label>
                                <label class="payment-option">
                                    <input type="radio" name="payment_method" value="CARD" />
                                    <span>💳 Thẻ tín dụng / ghi nợ</span>
                                </label>
                            </div>
                        </div>

                        <button class="btn btn-primary mt-4 w-full" type="submit">Xác nhận đặt hàng</button>
                    </form>

                    <div id="msg" class="mt-3 text-center"></div>
                </div>

                <!-- Tóm tắt đơn hàng -->
                <div class="order-summary card p-4 border rounded shadow-sm bg-white">
                    <h3 class="text-lg font-semibold mb-3">Tóm tắt đơn hàng</h3>
                    <div class="order-items mb-3">
                        ${items.map(it => `
                            <div class="flex justify-between mb-2 border-b pb-1">
                                <div>
                                    <div class="font-medium">${it.name}</div>
                                    <div class="text-sm text-gray-600">Số lượng: ${it.qty}</div>
                                </div>
                                <div class="text-right font-semibold">${(it.price * it.qty).toLocaleString()} đ</div>
                            </div>
                        `).join('')}
                    </div>

                    <hr class="my-2">
                    <div class="flex justify-between text-lg font-bold">
                        <span>Tổng cộng:</span>
                        <span>${total.toLocaleString()} đ</span>
                    </div>
                </div>
            </div>
        </div>
        `;

        // Xử lý submit form
        const form = root.querySelector('#frm');
        const msg = root.querySelector('#msg');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(form).entries());

            try {
                await window.Api.OrderAPI.create({
                    items,
                    shipping: data,
                    payment_method: data.payment_method
                });

                window.Cart.clear();
                msg.innerHTML = `<div class="text-green-600 font-semibold">✅ Đặt hàng thành công! Cảm ơn bạn đã mua sắm.</div>`;
                setTimeout(() => (location.hash = '#/profile'), 1500);
            } catch (err) {
                msg.innerHTML = `<div class="text-red-600">❌ Lỗi đặt hàng: ${err.message}</div>`;
            }
        });
    }

    // Gắn vào hệ thống SPA
    window.Pages = window.Pages || {};
    window.Pages.CheckoutPage = { mount };
})();