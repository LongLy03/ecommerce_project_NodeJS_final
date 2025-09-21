(function() {
    const root = document.getElementById("app");

    root.innerHTML = `
      <div style="max-width:400px;margin:40px auto;padding:20px;border:1px solid #ddd;border-radius:8px">
        <h2>Đăng ký</h2>
        <form id="registerForm">
          <div style="margin:12px 0">
            <label>Họ và tên</label><br/>
            <input type="text" id="fullname" style="width:100%;padding:8px"/>
          </div>
          <div style="margin:12px 0">
            <label>Email</label><br/>
            <input type="email" id="email" style="width:100%;padding:8px"/>
          </div>
          <div style="margin:12px 0">
            <label>Mật khẩu</label><br/>
            <input type="password" id="password" style="width:100%;padding:8px"/>
          </div>
          <button type="submit" style="padding:10px 16px">Tạo tài khoản</button>
        </form>
        <p style="margin-top:12px">Đã có tài khoản? <a href="LoginPage.html">Đăng nhập</a></p>
      </div>
    `;

    document.getElementById("registerForm").onsubmit = (e) => {
        e.preventDefault();
        alert("Đăng ký thành công (mock)!");
    };
})();