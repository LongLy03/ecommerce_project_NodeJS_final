// giao diện admin
(function() {
    const root = document.getElementById("app");

    root.innerHTML = `
      <div style="padding:20px">
        <h2>Admin Dashboard</h2>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:20px">
          <div style="border:1px solid #ddd;padding:10px;border-radius:8px;text-align:center">
            <h3>Tổng người dùng</h3>
            <p>150</p>
          </div>
          <div style="border:1px solid #ddd;padding:10px;border-radius:8px;text-align:center">
            <h3>Tổng đơn hàng</h3>
            <p>320</p>
          </div>
          <div style="border:1px solid #ddd;padding:10px;border-radius:8px;text-align:center">
            <h3>Doanh thu</h3>
            <p>1.200.000.000 đ</p>
          </div>
        </div>
        <h3 style="margin-top:30px">Quản lý sản phẩm / người dùng / đơn hàng</h3>
        <p>(Mock table ở đây)</p>
      </div>
    `;
})();