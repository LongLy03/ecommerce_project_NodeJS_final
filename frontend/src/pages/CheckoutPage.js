// Thanh toán
(function() {
    const root = document.getElementById("app");

    root.innerHTML = `
      <div style="padding:20px;max-width:600px;margin:auto">
        <h2>Thanh toán</h2>
        <form id="checkoutForm">
          <div style="margin:12px 0">
            <label>Địa chỉ giao hàng</label><br/>
            <input type="text" id="address" style="width:100%;padding:8px"/>
          </div>
          <div style="margin:12px 0">
            <label>Mã giảm giá</label><br/>
            <input type="text" id="discount" style="width:100%;padding:8px"/>
          </div>
          <button type="submit" style="padding:10px 16px">Đặt hàng</button>
        </form>
      </div>
    `;

    document.getElementById("checkoutForm").onsubmit = (e) => {
        e.preventDefault();
        alert("Đặt hàng thành công (mock)!");
    };
})();