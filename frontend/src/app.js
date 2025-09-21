// Component gốc nơi định nghĩa route
// app.js - SPA Router cho Ecommerce Project

const view = document.getElementById('view');
const nav = document.getElementById('nav');

// Các route ứng với 8 trang
const routes = {
    '/landing': () =>
        import ('./pages/LandingPage.js'),
    '/catalog': () =>
        import ('./pages/CatalogPage.js'),
    '/product': () =>
        import ('./pages/ProductDetail.js'), // /product/:id
    '/cart': () =>
        import ('./pages/CartPage.js'),
    '/checkout': () =>
        import ('./pages/CheckoutPage.js'),
    '/profile': () =>
        import ('./pages/ProfilePage.js'),
    '/login': () =>
        import ('./pages/LoginPage.js'),
    '/register': () =>
        import ('./pages/RegisterPage.js'),
    '/admin': () =>
        import ('./pages/AdminDashboard.js'),
};

// Xây menu navbar
function buildNav() {
    nav.innerHTML = [
            ['Trang chủ', '#/landing'],
            ['Danh mục', '#/catalog'],
            ['Giỏ hàng', '#/cart'],
            ['Thanh toán', '#/checkout'],
            ['Hồ sơ', '#/profile'],
            ['Đăng nhập', '#/login'],
            ['Đăng ký', '#/register'],
            ['Admin', '#/admin']
        ]
        .map(([t, href]) => `<a href="${href}">${t}</a>`)
        .join('');
}

// Tách hash ra path + params
function parseHash() {
    const h = location.hash.replace(/^#/, '') || '/landing';
    const parts = h.split('/').filter(Boolean);
    const path = '/' + (parts[0] || 'landing');
    const params = parts.slice(1); // ví dụ #/product/12 => ['12']
    return { path, params };
}

// Điều hướng và render trang
async function navigate() {
    const { path, params } = parseHash();
    const loader = routes[path];

    if (!loader) {
        view.innerHTML = `<h2>404</h2><p>Không tìm thấy trang: <code>${path}</code></p>`;
        return;
    }

    try {
        const mod = await loader();
        view.innerHTML = '';
        const render = mod && (mod.default || mod.render);
        if (typeof render === 'function') {
            await render(view, { params });
        } else if (mod && mod.mount) {
            await mod.mount(view, { params });
        }
    } catch (err) {
        console.error(err);
        view.innerHTML = `<h2>Lỗi</h2><pre>${String(err)}</pre>`;
    }
}

// Sự kiện
window.addEventListener('hashchange', navigate);
window.addEventListener('DOMContentLoaded', () => {
    buildNav();
    navigate();
});