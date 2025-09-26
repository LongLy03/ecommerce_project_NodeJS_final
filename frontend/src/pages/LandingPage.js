// Trang chủ
// Landing Page UI (single-file JS)
// Requirements covered:
// - Show "New Arrivals", "Best Sellers", and at least 3 distinct categories (Laptops, Monitors, Storage)
// - Browsing and purchasing without login; auto-create account on guest checkout (simulated via localStorage)
// - If logged in, default address pre-fills; user can choose a different shipping address
// - Only two user roles in system: customer and a single admin (FYI; admin UI not shown here)
//
// How to use:
// 1) Include this file in an HTML page that has an empty <body> OR a <div id="app"></div>
//    <script type="module" src="./landing-page.js"></script>
// 2) This script will render the entire landing page UI into #app if present, otherwise into document.body
// 3) All data is mocked for UI. Replace API hooks in the API section for real backend integration.

(function() {
        const root = document.getElementById('app') || document.body;

        // ----------------------------- Utilities -----------------------------
        const $ = (sel, el = document) => el.querySelector(sel);
        const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
        const fmt = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);
        const uid = () => Math.random().toString(36).slice(2, 10);

        const storage = {
            get(key, def = null) {
                try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
            },
            set(key, val) { localStorage.setItem(key, JSON.stringify(val)); },
            del(key) { localStorage.removeItem(key); }
        };

        // ----------------------------- Mock Data -----------------------------
        const mockProducts = [
            // Laptops
            { id: 'p1', name: 'Laptop ZenPro X14', price: 23990000, img: 'https://picsum.photos/seed/lap1/600/400', category: 'Laptops', isNew: true, isBest: false },
            { id: 'p2', name: 'Ultrabook Aero 13', price: 28990000, img: 'https://picsum.photos/seed/lap2/600/400', category: 'Laptops', isNew: true, isBest: true },
            { id: 'p3', name: 'Gaming Beast 15', price: 33990000, img: 'https://picsum.photos/seed/lap3/600/400', category: 'Laptops', isNew: false, isBest: true },

            // Monitors
            { id: 'p4', name: 'Monitor 27" 4K IPS', price: 7990000, img: 'https://picsum.photos/seed/mon1/600/400', category: 'Monitors', isNew: true, isBest: false },
            { id: 'p5', name: 'Monitor 34" UltraWide', price: 15990000, img: 'https://picsum.photos/seed/mon2/600/400', category: 'Monitors', isNew: false, isBest: true },

            // Storage
            { id: 'p6', name: 'SSD NVMe 1TB Gen4', price: 2590000, img: 'https://picsum.photos/seed/sto1/600/400', category: 'Storage', isNew: true, isBest: true },
            { id: 'p7', name: 'HDD 4TB 7200rpm', price: 2490000, img: 'https://picsum.photos/seed/sto2/600/400', category: 'Storage', isNew: false, isBest: false },

            // Accessories (extra category)
            { id: 'p8', name: 'Wireless Mouse Pro', price: 690000, img: 'https://picsum.photos/seed/acc1/600/400', category: 'Accessories', isNew: true, isBest: true },
            { id: 'p9', name: 'Mechanical Keyboard 87', price: 1590000, img: 'https://picsum.photos/seed/acc2/600/400', category: 'Accessories', isNew: false, isBest: false },
        ];

        const CATEGORIES = ['Laptops', 'Monitors', 'Storage', 'Accessories'];

        // ----------------------------- State -----------------------------
        const initialUser = storage.get('ecom_user', null); // { id, email, fullName, addresses: [{label, line1, phone}], defaultAddressIndex }
        const initialCart = storage.get('ecom_cart', []); // [{ id, qty }]
        const initialOrders = storage.get('ecom_orders', []);

        const state = {
            user: initialUser, // null or user object
            cart: initialCart, // array of {id, qty}
            products: mockProducts,
            orders: initialOrders,
            ui: { checkoutOpen: false, checkoutStep: 'details' },
            get cartCount() { return this.cart.reduce((s, i) => s + i.qty, 0); },
        };

        function saveState() {
            storage.set('ecom_cart', state.cart);
            storage.set('ecom_orders', state.orders);
            storage.set('ecom_user', state.user);
        }

        // ----------------------------- API hooks (replace with real fetch) -----------------------------
        const API = {
            async createAccountIfNeeded({ fullName, email, phone, addressLine }) {
                // Simulate auto-account creation if not logged in
                if (state.user) return state.user;
                const newUser = {
                    id: 'u_' + uid(),
                    fullName: fullName || 'Guest',
                    email: email || `guest_${uid()}@example.com`,
                    addresses: [{ label: 'Default', line1: addressLine || 'N/A', phone: phone || '' }],
                    defaultAddressIndex: 0,
                    role: 'customer'
                };
                state.user = newUser;
                saveState();
                return newUser;
            },
            async placeOrder({ items, shippingAddress }) {
                // Simulate order placement
                const order = {
                    id: 'ORD-' + Date.now(),
                    userId: state.user ? state.user.id : null,
                    items: items.map(i => ({...i })),
                    total: items.reduce((s, it) => s + productById(it.id).price * it.qty, 0),
                    shippingAddress,
                    createdAt: new Date().toISOString()
                };
                state.orders.unshift(order);
                state.cart = []; // clear cart after purchase
                saveState();
                return order;
            }
        };

        // ----------------------------- Selectors & Mutations -----------------------------
        const productById = (id) => state.products.find(p => p.id === id);

        function addToCart(pid, qty = 1) {
            const found = state.cart.find(i => i.id === pid);
            if (found) found.qty += qty;
            else state.cart.push({ id: pid, qty });
            saveState();
            renderHeader();
            toast('Đã thêm vào giỏ hàng');
        }

        function buyNow(pid) {
            addToCart(pid, 1);
            openCheckout();
        }

        function removeFromCart(pid) {
            state.cart = state.cart.filter(i => i.id !== pid);
            saveState();
            renderCartDropdown();
            renderHeader();
        }

        function updateQty(pid, qty) {
            const it = state.cart.find(i => i.id === pid);
            if (!it) return;
            it.qty = Math.max(1, qty | 0);
            saveState();
            renderCartDropdown();
            renderHeader();
        }

        // ----------------------------- Styling -----------------------------
        const styles = `
    :root { --bg:#0b1020; --card:#121731; --muted:#97a0ba; --fg:#e7eaf6; --acc:#5b8cff; --pill:#1c2346; }
    *{box-sizing:border-box} html,body{margin:0;padding:0;font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif;background:var(--bg);color:var(--fg)}
    a{color:inherit;text-decoration:none}
    .container{max-width:1200px;margin:0 auto;padding:24px}
    .nav{display:flex;align-items:center;gap:16px;justify-content:space-between;padding:16px 24px;position:sticky;top:0;backdrop-filter:saturate(140%) blur(8px);background:rgba(11,16,32,.7);z-index:50;border-bottom:1px solid #1b2344}
    .brand{display:flex;align-items:center;gap:10px;font-weight:800}
    .brand .logo{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#5b8cff,#8a5bff);display:grid;place-items:center}
    .brand span{letter-spacing:.4px}
    .search{flex:1;display:flex;align-items:center;gap:10px;max-width:520px;margin:0 24px}
    .search input{flex:1;padding:12px 14px;border-radius:14px;border:1px solid #1f2a54;background:#0e1430;color:var(--fg)}
    .actions{display:flex;align-items:center;gap:10px}
    .icon-btn{position:relative;border:1px solid #1f2a54;background:#0f1633;padding:8px 12px;border-radius:12px;cursor:pointer}
    .badge{position:absolute;top:-6px;right:-6px;background:#ff5b8c;color:white;border-radius:999px;padding:2px 6px;font-size:11px}
    .hero{display:grid;grid-template-columns:1.2fr .8fr;gap:20px;align-items:stretch;margin-top:18px}
    .card{background:var(--card);border:1px solid #1b2344;border-radius:20px;overflow:hidden}
    .hero-left{position:relative;min-height:280px;background:radial-gradient(1200px 400px at 10% 30%,rgba(91,140,255,.22),transparent),linear-gradient(180deg,rgba(18,23,49,.7),rgba(18,23,49,.9));}
    .hero-left .content{position:absolute;inset:0;padding:28px;display:flex;flex-direction:column;justify-content:flex-end}
    .kicker{display:inline-flex;gap:8px;background:var(--pill);border:1px solid #202b58;color:#c9d3fe;border-radius:999px;padding:6px 10px;font-size:12px;margin-bottom:10px}
    h1{margin:0;font-size:28px;line-height:1.2}
    .sub{color:var(--muted);margin-top:8px}
    .cta{margin-top:16px;display:flex;gap:10px}
    .btn{background:var(--acc);border:none;color:white;padding:12px 16px;border-radius:12px;cursor:pointer;font-weight:600}
    .btn.outline{background:transparent;border:1px solid #2a3970}
    .hero-right{display:grid;grid-template-rows:1fr 1fr;gap:20px}
    .pill-nav{display:flex;gap:8px;flex-wrap:wrap;padding:16px}
    .pill{background:var(--pill);border:1px solid #202b58;color:#c9d3fe;border-radius:999px;padding:8px 12px;cursor:pointer}
    .section{margin-top:26px}
    .section h2{font-size:20px;margin:0 0 12px 0}
    .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
    .product{display:flex;flex-direction:column}
    .product .img{height:170px;border-radius:16px;overflow:hidden;border:1px solid #202b58;background:#0a0f24}
    .product .img img{width:100%;height:100%;object-fit:cover;display:block}
    .product .name{margin:10px 0 4px 0;font-weight:600}
    .product .price{color:#a8b3d4;font-size:14px}
    .product .actions{display:flex;gap:8px;margin-top:10px}
    .btn.sm{padding:8px 10px;border-radius:10px;font-size:13px}
    .footer{margin:40px 0 20px 0;color:#8f98b9;text-align:center}
    .muted{color:var(--muted)}
  
    /* Cart dropdown */
    .cart-dd{position:absolute;right:0;top:48px;width:360px;max-height:420px;overflow:auto;background:var(--card);border:1px solid #1b2344;border-radius:16px;display:none}
    .cart-dd.open{display:block}
    .cart-item{display:grid;grid-template-columns:64px 1fr auto;gap:10px;padding:10px 12px;border-bottom:1px solid #1b2344}
    .cart-item img{width:64px;height:64px;border-radius:10px;object-fit:cover}
    .qty{display:flex;align-items:center;gap:6px}
    .qty input{width:46px;background:#0e1430;border:1px solid #1f2a54;border-radius:8px;color:var(--fg);padding:6px 8px}
    .cart-footer{padding:12px;border-top:1px solid #1b2344}
  
    /* Modal */
    .modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.5);z-index:100}
    .modal.open{display:flex}
    .modal .panel{width:720px;max-width:92vw;background:var(--card);border:1px solid #1b2344;border-radius:18px;overflow:hidden}
    .panel header{display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #1b2344}
    .panel .content{display:grid;gap:16px;padding:16px}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .input{display:flex;flex-direction:column;gap:6px}
    .input input{padding:10px 12px;border-radius:10px;border:1px solid #1f2a54;background:#0e1430;color:var(--fg)}
    .address-card{background:#0f1633;border:1px dashed #2a3970;border-radius:12px;padding:10px}
    .divider{height:1px;background:#1b2344;margin:6px 0}
    @media (max-width: 960px){
      .hero{grid-template-columns:1fr}
      .grid{grid-template-columns:repeat(2,1fr)}
      .hero-right{grid-template-rows:auto;grid-template-columns:1fr 1fr}
    }
    @media (max-width: 560px){ .grid{grid-template-columns:1fr} }
    `;

        function injectStyles() {
            if ($('#landing-styles')) return;
            const st = document.createElement('style');
            st.id = 'landing-styles';
            st.textContent = styles;
            document.head.appendChild(st);
        }

        // ----------------------------- UI: Header, Hero, Sections -----------------------------
        function renderHeader() {
            const el = $('#nav');
            const cartCount = state.cartCount;
            const userName = state.user ? state.user.fullName.split(' ')[0] : 'Khách';

            el.innerHTML = `
        <div class="brand">
          <div class="logo">🛍️</div>
          <span>Electro<span style="color:#8a5bff">Hub</span></span>
        </div>
        <div class="search">
          <input id="searchInput" placeholder="Tìm kiếm sản phẩm, danh mục..." />
        </div>
        <div class="actions">
          <button id="cartBtn" class="icon-btn">🛒<span class="badge" ${cartCount? '':'style="display:none"'}>${cartCount}</span></button>
          <div style="position:relative">
            <div id="cartDropdown" class="cart-dd"></div>
          </div>
          <button id="profileBtn" class="icon-btn">${state.user ? '👤 '+userName : '↪️ Đăng nhập'}</button>
        </div>
      `;

            $('#cartBtn').onclick = () => {
                const dd = $('#cartDropdown');
                dd.classList.toggle('open');
                renderCartDropdown();
            };

            $('#profileBtn').onclick = () => {
                if (state.user) {
                    toast('Đã đăng nhập: ' + state.user.email);
                } else {
                    openCheckout(); // Encourage guest checkout which can auto-create account later
                }
            };

            $('#searchInput').addEventListener('input', (e) => {
                const term = e.target.value.toLowerCase();
                const cards = $$('.product');
                cards.forEach(card => {
                    const txt = (card.dataset.name + ' ' + card.dataset.category).toLowerCase();
                    card.style.display = txt.includes(term) ? '' : 'none';
                });
            });
        }

        function renderCartDropdown() {
            const dd = $('#cartDropdown');
            if (!dd) return;
            if (state.cart.length === 0) {
                dd.innerHTML = `<div style="padding:16px">Giỏ hàng trống</div>`;
                return;
            }
            const rows = state.cart.map(it => {
                const p = productById(it.id);
                return `
          <div class="cart-item">
            <img src="${p.img}" alt="${p.name}" />
            <div>
              <div style="font-weight:600">${p.name}</div>
              <div class="muted">${fmt(p.price)}</div>
              <div class="qty" style="margin-top:6px">
                <span>Số lượng:</span>
                <input type="number" min="1" value="${it.qty}" data-qty="${p.id}" />
              </div>
            </div>
            <button class="icon-btn" data-remove="${p.id}">✖️</button>
          </div>
        `;
            }).join('');

            const total = state.cart.reduce((s, i) => s + productById(i.id).price * i.qty, 0);

            dd.innerHTML = `
        <div style="padding:8px 8px 0 8px; font-weight:700">Giỏ hàng</div>
        ${rows}
        <div class="cart-footer">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px"><span>Tạm tính</span><strong>${fmt(total)}</strong></div>
          <button class="btn" id="goCheckout">Thanh toán</button>
        </div>
      `;

            $$('button[data-remove]', dd).forEach(b => b.onclick = () => removeFromCart(b.dataset.remove));
            $$('input[data-qty]', dd).forEach(inp => inp.onchange = () => updateQty(inp.dataset.qty, Number(inp.value)));
            $('#goCheckout', dd).onclick = openCheckout;
        }

        function renderHero() {
            return `
        <section class="hero">
          <div class="card hero-left">
            <div class="content">
              <span class="kicker">Giao hàng 2H • Trả góp 0% • Bảo hành chính hãng</span>
              <h1>Thiết bị công nghệ cho mọi nhu cầu</h1>
              <p class="sub">Khám phá laptop, màn hình, ổ cứng và phụ kiện với ưu đãi hấp dẫn hôm nay.</p>
              <div class="cta">
                <button class="btn" id="shopNow">Mua ngay</button>
                <button class="btn outline" id="viewBest">Bán chạy nhất</button>
              </div>
            </div>
          </div>
          <div class="hero-right">
            <div class="card">
              <div class="pill-nav">
                ${CATEGORIES.map(c => `<button class="pill" data-cat="${c}">${c}</button>`).join('')}
              </div>
              <div style="padding:0 16px 16px 16px">
                <div class="grid" id="catGrid"></div>
              </div>
            </div>
            <div class="card" style="display:grid;place-items:center;padding:16px">
              <div style="text-align:center">
                <div style="font-weight:700;margin-bottom:8px">Ưu đãi thành viên</div>
                <div class="muted">Đăng nhập để nhận mã giảm ngay 5% cho đơn đầu tiên</div>
                <div style="margin-top:12px"><button class="btn outline" id="memberBtn">Tìm hiểu</button></div>
              </div>
            </div>
          </div>
        </section>
      `;
    }
  
    function renderProductsGrid(list) {
      return list.map(p => `
        <div class="product" data-name="${p.name}" data-category="${p.category}">
          <div class="img"><img src="${p.img}" alt="${p.name}" /></div>
          <div class="name">${p.name}</div>
          <div class="price">${fmt(p.price)}</div>
          <div class="actions">
            <button class="btn sm" data-add="${p.id}">Thêm vào giỏ</button>
            <button class="btn sm outline" data-buy="${p.id}">Mua ngay</button>
          </div>
        </div>
      `).join('');
    }
  
    function renderSections() {
      const newArrivals = state.products.filter(p => p.isNew).slice(0, 8);
      const bestSellers = state.products.filter(p => p.isBest).slice(0, 8);
  
      const sections = `
        <section class="section container">
          <h2>✨ Sản phẩm mới</h2>
          <div class="grid">${renderProductsGrid(newArrivals)}</div>
        </section>
        <section class="section container">
          <h2>🔥 Bán chạy nhất</h2>
          <div class="grid">${renderProductsGrid(bestSellers)}</div>
        </section>
        ${CATEGORIES.map(cat => `
          <section class="section container">
            <h2>${cat}</h2>
            <div class="grid">${renderProductsGrid(state.products.filter(p => p.category === cat))}</div>
          </section>`).join('')}
      `;
      return sections;
    }
  
    function renderFooter() {
      return `<div class="footer container">© ${new Date().getFullYear()} ElectroHub · <span class="muted">Chỉ là mock UI cho trang Landing Page</span></div>`;
    }
  
    // ----------------------------- Modal: Checkout (Guest or Logged-in) -----------------------------
    function openCheckout() {
      state.ui.checkoutOpen = true; state.ui.checkoutStep = 'details';
      $('#checkoutModal').classList.add('open');
      renderCheckout();
    }
    function closeCheckout() {
      state.ui.checkoutOpen = false; $('#checkoutModal').classList.remove('open');
    }
  
    function renderCheckout() {
      const panel = $('#checkoutPanel');
      const subtotal = state.cart.reduce((s, i) => s + productById(i.id).price * i.qty, 0);
  
      // Default address if logged in
      let defaultAddress = null;
      if (state.user && Array.isArray(state.user.addresses) && state.user.addresses.length) {
        defaultAddress = state.user.addresses[state.user.defaultAddressIndex || 0];
      }
  
      panel.innerHTML = `
        <header>
          <div style="font-weight:700">Thanh toán</div>
          <button class="icon-btn" id="closeCheckout">✖️</button>
        </header>
        <div class="content">
          <div class="address-card">
            ${state.user ? `
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
                <div>
                  <div><strong>${state.user.fullName}</strong> · ${state.user.email}</div>
                  ${defaultAddress ? `<div class="muted">Đ/c mặc định: ${defaultAddress.line1} · ${defaultAddress.phone || ''}</div>` : '<div class="muted">Chưa có địa chỉ mặc định</div>'}
                </div>
                <button class="btn sm outline" id="changeAddress">Chọn địa chỉ khác</button>
              </div>
            ` : `
              <div class="muted">Bạn đang thanh toán với tư cách <strong>Khách</strong>. Hệ thống sẽ tự tạo tài khoản bằng email của bạn sau khi đặt hàng.</div>
            `}
          </div>
  
          ${!state.user ? `
          <div class="row">
            <div class="input"><label>Họ tên</label><input id="g_fullName" placeholder="Nguyễn Văn A" /></div>
            <div class="input"><label>Email</label><input id="g_email" placeholder="email@domain.com" /></div>
          </div>
          <div class="row">
            <div class="input"><label>Số điện thoại</label><input id="g_phone" placeholder="09xx xxx xxx" /></div>
            <div class="input"><label>Địa chỉ giao hàng</label><input id="g_address" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" /></div>
          </div>
          ` : `
          <div class="row">
            <div class="input"><label>Địa chỉ giao hàng</label><input id="l_address" placeholder="Nhập địa chỉ khác (tùy chọn)" /></div>
            <div class="input"><label>Ghi chú</label><input id="l_note" placeholder="Ví dụ: Giao giờ hành chính" /></div>
          </div>
          `}
  
          <div class="divider"></div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div class="muted">Tạm tính</div>
            <div><strong>${fmt(subtotal)}</strong></div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div class="muted">Phí vận chuyển</div>
            <div>Miễn phí</div>
          </div>
          <div style="display:flex;align-items:center;justify-content:space-between;font-size:18px">
            <div>Tổng</div>
            <div><strong>${fmt(subtotal)}</strong></div>
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end">
            <button class="btn outline" id="cancelCheckout">Hủy</button>
            <button class="btn" id="confirmCheckout">Đặt hàng</button>
          </div>
        </div>
      `;
  
      $('#closeCheckout').onclick = closeCheckout;
      $('#cancelCheckout').onclick = closeCheckout;
  
      $('#changeAddress') && ($('#changeAddress').onclick = () => {
        promptChangeAddress();
      });
  
      $('#confirmCheckout').onclick = async () => {
        if (state.cart.length === 0) { toast('Giỏ hàng trống'); return; }
        let shippingAddress = '';
        if (!state.user) {
          const fullName = $('#g_fullName').value.trim();
          const email = $('#g_email').value.trim();
          const phone = $('#g_phone').value.trim();
          const addressLine = $('#g_address').value.trim();
          if (!fullName || !email || !addressLine) { toast('Vui lòng nhập họ tên, email và địa chỉ'); return; }
          await API.createAccountIfNeeded({ fullName, email, phone, addressLine });
          shippingAddress = addressLine;
        } else {
          const alt = $('#l_address').value.trim();
          if (alt) { shippingAddress = alt; }
          else if (defaultAddress) { shippingAddress = defaultAddress.line1; }
          else { toast('Vui lòng nhập địa chỉ giao hàng'); return; }
        }
  
        const order = await API.placeOrder({ items: state.cart, shippingAddress });
        closeCheckout();
        renderHeader();
        renderCartDropdown();
        toast('Đặt hàng thành công! Mã đơn: ' + order.id);
      };
    }
  
    function promptChangeAddress() {
      const input = prompt('Nhập địa chỉ giao hàng mới:');
      if (!input) return;
      // Save as a temporary address (not default)
      $('#l_address') && ($('#l_address').value = input);
    }
  
    // ----------------------------- Toast -----------------------------
    function toast(msg) {
      let t = $('#toast');
      if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.style.position = 'fixed';
        t.style.bottom = '20px';
        t.style.right = '20px';
        t.style.background = '#141a38';
        t.style.border = '1px solid #223064';
        t.style.color = 'white';
        t.style.padding = '10px 14px';
        t.style.borderRadius = '10px';
        t.style.boxShadow = '0 6px 20px rgba(0,0,0,.25)';
        t.style.zIndex = '200';
        document.body.appendChild(t);
      }
      t.textContent = msg;
      t.style.opacity = '1';
      setTimeout(() => { t.style.opacity = '0'; }, 1800);
    }
  
    // ----------------------------- Main Render -----------------------------
    function render() {
      injectStyles();
      root.innerHTML = `
        <nav id="nav" class="nav"></nav>
        <main>
          <div class="container">${renderHero()}</div>
          ${renderSections()}
        </main>
        <div class="modal" id="checkoutModal"><div class="panel" id="checkoutPanel"></div></div>
        ${renderFooter()}
      `;
  
      renderHeader();
  
      // Hook hero buttons & category grid
      $('#shopNow').onclick = () => {
        const firstAdd = $('[data-add]');
        if (firstAdd) { firstAdd.click(); }
        openCheckout();
      };
      $('#viewBest').onclick = () => {
        window.scrollTo({ top: $('.section:nth-of-type(2)').offsetTop - 60, behavior: 'smooth' });
      };
      $('#memberBtn').onclick = () => toast('Đăng nhập để nhận ưu đãi thành viên');
  
      // Category pills
      $$('.pill').forEach(p => p.onclick = () => {
        const cat = p.dataset.cat;
        const grid = $('#catGrid');
        const list = state.products.filter(x => x.category === cat).slice(0, 4);
        grid.innerHTML = renderProductsGrid(list);
        bindProductButtons(grid);
      });
      // default category view
      const grid = $('#catGrid');
      grid.innerHTML = renderProductsGrid(state.products.filter(p => p.category === CATEGORIES[0]).slice(0,4));
      bindProductButtons(grid);
  
      // product sections buttons
      $$('.section .grid').forEach(g => bindProductButtons(g));
  
      // modal close on outside click
      $('#checkoutModal').addEventListener('click', (e) => {
        if (e.target.id === 'checkoutModal') closeCheckout();
      });
    }
  
    function bindProductButtons(scopeEl) {
      $$('button[data-add]', scopeEl).forEach(b => b.onclick = () => addToCart(b.dataset.add));
      $$('button[data-buy]', scopeEl).forEach(b => b.onclick = () => buyNow(b.dataset.buy));
    }
  
    // Initial mount
    render();
  })();