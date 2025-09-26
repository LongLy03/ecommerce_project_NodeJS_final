// Giỏ hàng
(function() {
        const root = document.getElementById("app");

        const cart = [
            { id: 1, name: "Laptop A", price: 12000000, qty: 1 },
            { id: 2, name: "Màn hình 24\"", price: 3500000, qty: 2 },
        ];

        root.innerHTML = `
      <div style="padding:20px">
        <h2>Giỏ hàng</h2>
        <table border="1" cellpadding="8" style="width:100%;border-collapse:collapse;margin-top:20px">
          <tr><th>Tên SP</th><th>Giá</th><th>Số lượng</th><th>Thành tiền</th></tr>
          ${cart.map(c => `
            <tr>
              <td>${c.name}</td>
              <td>${c.price.toLocaleString()} đ</td>
              <td>${c.qty}</td>
              <td>${(c.price*c.qty).toLocaleString()} đ</td>
            </tr>
          `).join("")}
        </table>
        <p style="margin-top:20px"><strong>Tổng cộng: </strong>${
          cart.reduce((s,c)=>s+c.price*c.qty,0).toLocaleString()
        } đ</p>
        <a href="CheckoutPage.html"><button>Thanh toán</button></a>
      </div>
    `;
  })();