// src/services/storage.js
const KEY = 'cart_items';

export const CartStore = {
    all() {
        try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
    },
    save(items) { localStorage.setItem(KEY, JSON.stringify(items)); },
    add(item) {
        const list = CartStore.all();
        const idx = list.findIndex(x => x.productId === item.productId && x.variantId === item.variantId);
        if (idx >= 0) { list[idx].qty += item.qty || 1; } else { list.push({...item, qty: item.qty || 1 }); }
        CartStore.save(list);
        return list;
    },
    remove(productId, variantId) {
        const list = CartStore.all().filter(x => !(x.productId === productId && x.variantId === variantId));
        CartStore.save(list);
        return list;
    },
    clear() { localStorage.removeItem(KEY); }
};