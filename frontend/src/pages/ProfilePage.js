// Trang hồ sơ người dùng
(function() {
    const root = document.getElementById("app");

    root.innerHTML = `
      <div style="padding:20px">
        <h2>Hồ sơ cá nhân</h2>
        <p><strong>Tên:</strong> Nguyễn Văn A</p>
        <p><strong>Email:</strong> example@gmail.com</p>
        <h3>Lịch sử đơn hàng</h3>
        <ul>
          <li>Đơn hàng #1 - 15/09/2025 - 15.000.000 đ</li>
          <li>Đơn hàng #2 - 20/09/2025 - 8.500.000 đ</li>
        </ul>
      </div>
    `;
})();