// Trang chi tiết sản phấm
(function() {
        const root = document.getElementById("app");

        const product = {
            id: 1,
            name: "Laptop A",
            price: 12000000,
            description: "Laptop hiệu năng cao, thiết kế gọn nhẹ, phù hợp cho học tập và làm việc.",
            images: ["https://picsum.photos/200", "https://picsum.photos/201", "https://picsum.photos/202"]
        };

        root.innerHTML = `
      <div style="padding:20px">
        <h2>${product.name}</h2>
        <p><strong>Giá:</strong> ${product.price.toLocaleString()} đ</p>
        <p>${product.description}</p>
        <div style="display:flex;gap:10px;margin:10px 0">
          ${product.images.map(img => `<img src="${img}" width="100"/>`).join("")}
        </div>
        <button onclick="alert('Thêm vào giỏ')">Thêm vào giỏ</button>
      </div>
    `;
  })();