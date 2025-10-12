(function() {
    const root = document.getElementById("app");

    // =============== GIAO DIỆN GỐC ===============
    root.innerHTML = `
    <div style="padding:24px;max-width:1200px;margin:auto;font-family:Segoe UI, sans-serif;">
      <h2 style="font-size:24px;margin-bottom:10px;">🧭 Admin Dashboard</h2>

      <!-- NAVIGATION TABS -->
      <div style="display:flex;gap:8px;margin-bottom:20px;">
        <button class="tab-btn active" data-tab="dashboard">📊 Thống kê</button>
        <button class="tab-btn" data-tab="products">📦 Sản phẩm</button>
        <button class="tab-btn" data-tab="users">👤 Người dùng</button>
      </div>

      <div id="tab-content"></div>
    </div>
  `;

    // CSS ngắn gọn
    const style = document.createElement("style");
    style.textContent = `
    .tab-btn {
      background:#111827;
      color:white;
      border:none;
      padding:8px 14px;
      border-radius:6px;
      cursor:pointer;
      transition:background .2s;
    }
    .tab-btn:hover { background:#1f2937; }
    .tab-btn.active { background:#2563eb; }
    table { border-collapse:collapse;width:100%;margin-top:10px; }
    th, td { border:1px solid #ccc;padding:8px;text-align:left; }
    th { background:#f3f4f6; }
    .form-inline input, .form-inline select {
      padding:6px;border:1px solid #ccc;border-radius:4px;margin-right:6px;
    }
    .btn { padding:6px 10px;border:none;border-radius:4px;cursor:pointer; }
    .btn.edit { background:#2563eb;color:#fff; }
    .btn.delete { background:#dc2626;color:#fff; }
    .btn.add { background:#16a34a;color:#fff; }
  `;
    document.head.appendChild(style);

    const tabContent = document.getElementById("tab-content");

    // =============== DASHBOARD TAB ===============
    function renderDashboard() {
        tabContent.innerHTML = `
      <section>
        <h3>📈 Dashboard tổng quan</h3>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px;margin-top:10px;">
          <div class="card"><h4>Tổng người dùng</h4><p>150</p></div>
          <div class="card"><h4>Người dùng mới</h4><p>25</p></div>
          <div class="card"><h4>Tổng đơn hàng</h4><p>320</p></div>
          <div class="card"><h4>Doanh thu</h4><p>1.200.000.000 đ</p></div>
        </div>

        <canvas id="revChart" height="140" style="margin-top:30px;background:#fff;border-radius:10px;"></canvas>
      </section>
    `;

        // Chart.js mock
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = () => {
            new Chart(document.getElementById("revChart"), {
                type: "line",
                data: {
                    labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
                    datasets: [
                        { label: "Doanh thu (triệu VND)", data: [10, 15, 9, 20, 25, 28], borderColor: "#2563eb", tension: 0.4 },
                        { label: "Lợi nhuận (triệu VND)", data: [3, 4, 2, 6, 7, 8], borderColor: "#16a34a", tension: 0.4 },
                    ],
                },
                options: { responsive: true, plugins: { legend: { position: "top" } } },
            });
        };
        document.body.appendChild(script);
    }

    // =============== PRODUCT MANAGEMENT ===============
    let products = [
        { id: 1, name: "Laptop Dell", price: 20000000, stock: 12, category: "Laptop" },
        { id: 2, name: "Asus TUF", price: 18000000, stock: 9, category: "Laptop" },
    ];

    function renderProducts() {
        tabContent.innerHTML = `
      <section>
        <h3>📦 Quản lý sản phẩm</h3>
        <div class="form-inline" style="margin:10px 0;">
          <input id="name" placeholder="Tên sản phẩm" />
          <input id="price" type="number" placeholder="Giá" />
          <input id="stock" type="number" placeholder="Tồn kho" />
          <select id="category">
            <option value="Laptop">Laptop</option>
            <option value="Màn hình">Màn hình</option>
            <option value="Phụ kiện">Phụ kiện</option>
          </select>
          <button class="btn add" id="addProduct">Thêm</button>
        </div>
        <table>
          <thead>
            <tr><th>ID</th><th>Tên</th><th>Giá</th><th>Tồn</th><th>Danh mục</th><th>Hành động</th></tr>
          </thead>
          <tbody id="productTable"></tbody>
        </table>
      </section>
    `;

        const tbody = document.getElementById("productTable");
        const renderRows = () => {
            tbody.innerHTML = products
                .map(
                    (p) => `
          <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.price.toLocaleString("vi-VN")} đ</td>
            <td>${p.stock}</td>
            <td>${p.category}</td>
            <td>
              <button class="btn edit" onclick="editProduct(${p.id})">Sửa</button>
              <button class="btn delete" onclick="deleteProduct(${p.id})">Xóa</button>
            </td>
          </tr>`
                )
                .join("");
        };
        renderRows();

        document.getElementById("addProduct").onclick = () => {
            const name = document.getElementById("name").value.trim();
            const price = parseInt(document.getElementById("price").value);
            const stock = parseInt(document.getElementById("stock").value);
            const category = document.getElementById("category").value;
            if (!name || !price || !stock) return alert("Nhập đầy đủ thông tin!");
            const id = products.length ? products[products.length - 1].id + 1 : 1;
            products.push({ id, name, price, stock, category });
            renderRows();
            document.getElementById("name").value = "";
            document.getElementById("price").value = "";
            document.getElementById("stock").value = "";
        };

        // Gắn các hàm CRUD ra global để có thể gọi được trong onclick
        window.editProduct = (id) => {
            const p = products.find((x) => x.id === id);
            const name = prompt("Tên mới:", p.name);
            const price = +prompt("Giá mới:", p.price);
            const stock = +prompt("Tồn kho mới:", p.stock);
            if (name) Object.assign(p, { name, price, stock });
            renderRows();
        };
        window.deleteProduct = (id) => {
            if (confirm("Xóa sản phẩm này?")) {
                products = products.filter((x) => x.id !== id);
                renderRows();
            }
        };
    }

    // =============== USER MANAGEMENT ===============
    let users = [
        { id: 1, name: "Nguyễn Văn A", email: "a@gmail.com", role: "Customer", status: "Active" },
        { id: 2, name: "Trần Thị B", email: "b@gmail.com", role: "Customer", status: "Banned" },
    ];

    function renderUsers() {
        tabContent.innerHTML = `
      <section>
        <h3>👤 Quản lý người dùng</h3>
        <div class="form-inline" style="margin:10px 0;">
          <input id="userName" placeholder="Họ tên" />
          <input id="userEmail" type="email" placeholder="Email" />
          <select id="userRole">
            <option value="Customer">Customer</option>
            <option value="Admin">Admin</option>
          </select>
          <button class="btn add" id="addUser">Thêm</button>
        </div>
        <table>
          <thead>
            <tr><th>ID</th><th>Họ tên</th><th>Email</th><th>Vai trò</th><th>Trạng thái</th><th>Hành động</th></tr>
          </thead>
          <tbody id="userTable"></tbody>
        </table>
      </section>
    `;

        const tbody = document.getElementById("userTable");
        const renderRows = () => {
            tbody.innerHTML = users
                .map(
                    (u) => `
          <tr>
            <td>${u.id}</td>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.role}</td>
            <td>${u.status}</td>
            <td>
              <button class="btn edit" onclick="toggleUser(${u.id})">${u.status === "Active" ? "Chặn" : "Mở"}</button>
              <button class="btn delete" onclick="deleteUser(${u.id})">Xóa</button>
            </td>
          </tr>`
                )
                .join("");
        };
        renderRows();

        document.getElementById("addUser").onclick = () => {
            const name = document.getElementById("userName").value.trim();
            const email = document.getElementById("userEmail").value.trim();
            const role = document.getElementById("userRole").value;
            if (!name || !email) return alert("Vui lòng nhập đủ thông tin!");
            const id = users.length ? users[users.length - 1].id + 1 : 1;
            users.push({ id, name, email, role, status: "Active" });
            renderRows();
            document.getElementById("userName").value = "";
            document.getElementById("userEmail").value = "";
        };

        window.toggleUser = (id) => {
            const u = users.find((x) => x.id === id);
            u.status = u.status === "Active" ? "Banned" : "Active";
            renderRows();
        };
        window.deleteUser = (id) => {
            if (confirm("Xóa người dùng này?")) {
                users = users.filter((x) => x.id !== id);
                renderRows();
            }
        };
    }

    // =============== TAB LOGIC ===============
    function setActiveTab(tab) {
        document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
        document.querySelector(`[data-tab="${tab}"]`).classList.add("active");
        if (tab === "dashboard") renderDashboard();
        if (tab === "products") renderProducts();
        if (tab === "users") renderUsers();
    }

    document.querySelectorAll(".tab-btn").forEach((btn) =>
        btn.addEventListener("click", () => setActiveTab(btn.dataset.tab))
    );

    // khởi tạo tab mặc định
    setActiveTab("dashboard");
})();