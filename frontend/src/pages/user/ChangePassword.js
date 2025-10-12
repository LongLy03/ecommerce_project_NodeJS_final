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
        <h2 style="text-align:center;margin-bottom:20px;color:#111827">Đổi mật khẩu</h2>
        <form id="changeForm">
          <div style="margin:12px 0">
            <label style="font-size:14px;font-weight:500">Mật khẩu hiện tại</label><br/>
            <input type="password" id="oldPassword" required
              placeholder="••••••••" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px"/>
          </div>
          <div style="margin:12px 0">
            <label style="font-size:14px;font-weight:500">Mật khẩu mới</label><br/>
            <input type="password" id="newPassword" required
              placeholder="••••••••" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px"/>
          </div>
          <div style="margin:12px 0">
            <label style="font-size:14px;font-weight:500">Xác nhận mật khẩu mới</label><br/>
            <input type="password" id="confirmPassword" required
              placeholder="••••••••" style="width:100%;padding:10px;border:1px solid #ccc;border-radius:6px"/>
          </div>
          <button type="submit"
            style="width:100%;padding:12px;background:#111827;color:#fff;border:none;border-radius:6px;cursor:pointer">
            Cập nhật mật khẩu
          </button>
          <p id="msg" style="margin-top:14px;text-align:center;color:#dc2626;font-size:14px"></p>
        </form>
      </div>
    `;

    document.getElementById("changeForm").onsubmit = async(e) => {
        e.preventDefault();
        const oldPassword = document.getElementById("oldPassword").value.trim();
        const newPassword = document.getElementById("newPassword").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();
        const msg = document.getElementById("msg");

        if (newPassword !== confirmPassword) {
            msg.style.color = "#dc2626";
            msg.textContent = "❌ Mật khẩu xác nhận không khớp!";
            return;
        }

        try {
            msg.textContent = "Đang xử lý...";
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + localStorage.getItem("token"),
                },
                body: JSON.stringify({ oldPassword, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Thất bại khi đổi mật khẩu");
            msg.style.color = "#16a34a";
            msg.textContent = "✅ Đổi mật khẩu thành công!";
            document.getElementById("changeForm").reset();
        } catch (err) {
            msg.style.color = "#dc2626";
            msg.textContent = "❌ " + err.message;
        }
    };
})();