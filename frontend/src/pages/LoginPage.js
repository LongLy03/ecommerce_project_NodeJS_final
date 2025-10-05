// src/pages/LoginPage.js
(function() {
    function mount(root) {
        root.innerHTML = `
      <div class="auth">
        <h2>Đăng nhập</h2>
        <form id="frm">
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Mật khẩu" required />
          <button class="btn" type="submit">Đăng nhập</button>
        </form>
        <div id="msg"></div>
        <div class="mt"><a href="#/register">Chưa có tài khoản? Đăng ký</a></div>
      </div>
    `;
        const frm = root.querySelector('#frm');
        const msg = root.querySelector('#msg');

        frm.addEventListener('submit', async(e) => {
            e.preventDefault();
            const payload = Object.fromEntries(new FormData(frm).entries());
            try {
                await window.Api.AuthAPI.login(payload);
                msg.innerHTML = `<div class="text-green-700">Đăng nhập thành công!</div>`;
                setTimeout(() => location.hash = '#/landing', 800);
            } catch (err) {
                msg.innerHTML = `<div class="text-red-600">${err.message}</div>`;
            }
        });
    }

    window.Pages = window.Pages || {};
    window.Pages.LoginPage = { mount };
})();