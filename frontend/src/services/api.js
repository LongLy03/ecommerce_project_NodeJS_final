// src/services/api.js
const API_BASE = (typeof window !== 'undefined' && window.__API_BASE__) || 'http://localhost:5000';

async function request(path, { method = 'GET', data, headers = {}, auth = false } = {}) {
    const opts = { method, headers: { 'Content-Type': 'application/json', ...headers }, credentials: 'include' };
    if (data) opts.body = JSON.stringify(data);

    const res = await fetch(`${API_BASE}${path}`, opts);
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = json.message || `HTTP ${res.status}`;
        throw new Error(msg);
    }
    return json;
}

// Products
export const ProductAPI = {
        list: (q) => request(`/api/products${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  get: (id) => request(`/api/products/${id}`)
};

// Auth
export const AuthAPI = {
  register: (payload) => request('/api/users/register', { method: 'POST', data: payload }),
  login: (payload) => request('/api/users/login', { method: 'POST', data: payload }),
  me: () => request('/api/users/profile', { auth: true }),
  logout: () => request('/api/users/logout', { method: 'POST' }),
};

// Orders
export const OrderAPI = {
  create: (payload) => request('/api/orders', { method: 'POST', data: payload }),
  myOrders: () => request('/api/orders/my', { method: 'GET' })
};