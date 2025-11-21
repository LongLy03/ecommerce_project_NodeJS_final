(function() {
    const root = document.getElementById("app");

    root.innerHTML = `
      <div style="
        max-width:400px;
        margin:60px auto;
        padding:24px;
        border:1px solid #e5e7eb;
        border-radius:12px;
        background:#fff;
        box-shadow:0 2px 6px rgba(0,0,0,0.05)">
        <h2 style="text-align:center;margin-bottom:20px;color:#111827">Quên mật khẩu</h2>
        <form id="forgotForm">
          <div style="margin:12px 0">
            <label style="font-size:14px;font-weight:500">Nhập email để đặt lại mật khẩu</label><br/>
            <input type="email" id="email" required
              placeholder="you@example.com" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px"/>
          </div>
          <button type="submit"
            style="width:100%;padding:12px;background:#111827;color:#fff;border:none;border-radius:6px;cursor:pointer">
            Gửi yêu cầu đặt lại
          </button>
          <p id="msg" style="margin-top:14px;text-align:center;color:#dc2626;font-size:14px"></p>
        </form>
        <p style="margin-top:16px;text-align:center">
          <a href="#/login" style="color:#2563eb;text-decoration:none">← Quay lại đăng nhập</a>
        </p>
      </div>
    `;

    document.getElementById("forgotForm").onsubmit = async(e) => {
        e.preventDefault();
        const email = document.getElementById("email").value.trim();
        const msg = document.getElementById("msg");

        try {
            msg.textContent = "Đang gửi yêu cầu...";
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Không thể gửi email đặt lại mật khẩu");
            msg.style.color = "#16a34a";
            msg.textContent = "✅ Kiểm tra hộp thư của bạn để nhận hướng dẫn đặt lại mật khẩu!";
            document.getElementById("forgotForm").reset();
        } catch (err) {
            msg.style.color = "#dc2626";
            msg.textContent = "❌ " + err.message;
        }
    };
})();