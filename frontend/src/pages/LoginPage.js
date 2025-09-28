(function() {
    function render() {
        return `
      <div style="max-width:400px;margin:60px auto;padding:24px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,0.05)">
        <h2 style="text-align:center;margin-bottom:20px">Đăng ký</h2>
        <form id="registerForm">
          <div style="margin:12px 0">
            <label for="fullname" style="font-size:14px;font-weight:500">Họ và tên</label><br/>
            <input type="text" id="fullname" required placeholder="Nguyễn Văn A"
                   style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px"/>
          </div>
          <div style="margin:12px 0">
            <label for="email" style="font-size:14px;font-weight:500">Email</label><br/>
            <input type="email" id="email" required placeholder="you@example.com"
                   style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px"/>
          </div>
          <div style="margin:12px 0">
            <label for="password" style="font-size:14px;font-weight:500">Mật khẩu</label><br/>
            <input type="password" id="password" required placeholder="••••••••"
                   style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px"/>
          </div>
          <div style="margin:12px 0">
            <label for="address" style="font-size:14px;font-weight:500">Địa chỉ giao hàng</label><br/>
            <input type="text" id="address" required placeholder="123 Hai Bà Trưng, Hà Nội"
                   style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px"/>
          </div>
          <button type="submit"
                  style="width:100%;padding:12px;background:#111827;color:#fff;border:none;border-radius:6px;cursor:pointer">
            Tạo tài khoản
          </button>
        </form>
        <p style="margin-top:16px;font-size:14px;text-align:center">
          Đã có tài khoản? <a href="#/login" style="color:#2563eb;text-decoration:none">Đăng nhập</a>
        </p>
      </div>
    `;
    }

    function bind(root) {
        const form = root.querySelector("#registerForm");
        form.onsubmit = async(e) => {
            e.preventDefault();
            const fullname = root.querySelector("#fullname").value.trim();
            const email = root.querySelector("#email").value.trim();
            const password = root.querySelector("#password").value.trim();
            const address = root.querySelector("#address").value.trim();
            if (!fullname || !email || !password || !address) {
                alert("Vui lòng nhập đầy đủ thông tin");
                return;
            }
            try {
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ fullname, email, password, address }),
                });
                if (!res.ok) throw new Error(await res.text());
                alert("Đăng ký thành công!");
                location.hash = "/login";
            } catch (err) {
                alert("Đăng ký thất bại: " + err.message);
            }
        };
    }

    function mount(container) {
        container.innerHTML = render();
        bind(container);
    }

    window.Pages = window.Pages || {};
    window.Pages.RegisterPage = { mount };
})();