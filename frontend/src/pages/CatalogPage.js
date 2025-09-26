// Danh sách sản phẩm theo danh mục
(function() {
        const root = document.getElementById("app");

        const products = [
            { id: 1, name: "Laptop A", price: 12000000 },
            { id: 2, name: "Laptop B", price: 18000000 },
            { id: 3, name: "Màn hình 24\"", price: 3500000 },
            { id: 4, name: "Ổ cứng SSD 1TB", price: 2200000 },
        ];

        root.innerHTML = `
      <div style="padding:20px">
        <h2>Danh mục sản phẩm</h2>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;margin-top:20px">
          ${products.map(p => `
            <div style="border:1px solid #ddd;border-radius:8px;padding:10px;text-align:center">
              <h4>${p.name}</h4>
              <p>${p.price.toLocaleString()} đ</p>
              <button onclick="alert('Thêm ${p.name} vào giỏ')">Thêm vào giỏ</button>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  })();