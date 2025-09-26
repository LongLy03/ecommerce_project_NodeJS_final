(function() {
    const root = document.getElementById("app");

    root.innerHTML = `
      <div style="max-width:400px;margin:40px auto;padding:20px;border:1px solid #ddd;border-radius:8px">
        <h2>Đăng nhập</h2>
        <form id="loginForm">
          <div style="margin:12px 0">
            <label>Email</label><br/>
            <input type="email" id="email" style="width:100%;padding:8px"/>
          </div>
          <div style="margin:12px 0">
            <label>Mật khẩu</label><br/>
            <input type="password" id="password" style="width:100%;padding:8px"/>
          </div>
          <button type="submit" style="padding:10px 16px">Đăng nhập</button>
        </form>
        <p style="margin-top:12px">Chưa có tài khoản? <a href="RegisterPage.html">Đăng ký</a></p>
      </div>
    `;

    document.getElementById("loginForm").onsubmit = (e) => {
        e.preventDefault();
        alert("Đăng nhập thành công (mock)!");
    };
})();