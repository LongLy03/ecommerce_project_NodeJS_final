// src/pages/RegisterPage.js
(function() {
    function mount(root) {
        root.innerHTML = `
      <div class="auth">
        <h2>Đăng ký</h2>
        <form id="frm">
          <input name="name" placeholder="Họ tên" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Mật khẩu" required />
          <button class="btn" type="submit">Tạo tài khoản</button>
        </form>
        <div id="msg"></div>
        <div class="mt"><a href="#/login">Đã có tài khoản? Đăng nhập</a></div>
      </div>
    `;
        const frm = root.querySelector('#frm');
        const msg = root.querySelector('#msg');

        frm.addEventListener('submit', async(e) => {
            e.preventDefault();
            const payload = Object.fromEntries(new FormData(frm).entries());
            try {
                await window.Api.AuthAPI.register(payload);
                msg.innerHTML = `<div class="text-green-700">Đăng ký thành công! Vui lòng đăng nhập.</div>`;
                setTimeout(() => location.hash = '#/login', 800);
            } catch (err) {
                msg.innerHTML = `<div class="text-red-600">${err.message}</div>`;
            }
        });
    }

    window.Pages = window.Pages || {};
    window.Pages.RegisterPage = { mount };
})();