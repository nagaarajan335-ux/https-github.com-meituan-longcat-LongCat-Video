/* ============================================================
   STORE — cart, pricing, orders
   All state lives in localStorage so the site needs no server.
   ============================================================ */

import { PRODUCTS, getProduct } from "./products.js";
import { STORE_CONFIG } from "./config.js";

const C = STORE_CONFIG;
const CART_KEY = "dxn3d_cart_v1";
const ORDERS_KEY = "dxn3d_orders_v1";
const PREF_KEY = "dxn3d_prefs_v1";

/* ---------- money ---------- */
const nf = new Intl.NumberFormat(C.locale || "ms-MY", {
  style: "currency", currency: C.currency || "MYR", minimumFractionDigits: 2
});
export const money = (n) => nf.format(Number(n) || 0);
export const pct = (n) => `${Math.round(n)}%`;

/* ---------- tiny event bus ---------- */
const emit = (name, detail) => window.dispatchEvent(new CustomEvent(name, { detail }));

/* ---------- preferences (shipping region etc.) ---------- */
export function getPrefs() {
  try { return JSON.parse(localStorage.getItem(PREF_KEY)) || {}; } catch { return {}; }
}
export function setPrefs(patch) {
  const p = { ...getPrefs(), ...patch };
  localStorage.setItem(PREF_KEY, JSON.stringify(p));
  emit("prefs:updated", p);
  return p;
}

/* ---------- cart ---------- */
export function getCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    return raw.filter(i => getProduct(i.id) && i.qty > 0);
  } catch { return []; }
}
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  emit("cart:updated", { cart, count: cartCount() });
}
export function cartCount() { return getCart().reduce((a, i) => a + i.qty, 0); }

export function addToCart(id, qty = 1) {
  const p = getProduct(id);
  if (!p) return false;
  const cart = getCart();
  const line = cart.find(i => i.id === id);
  if (line) line.qty = Math.min((line.qty || 0) + qty, 99);
  else cart.push({ id, qty: Math.min(qty, 99) });
  saveCart(cart);
  emit("cart:added", { product: p, qty });
  return true;
}
export function setQty(id, qty) {
  const cart = getCart();
  const line = cart.find(i => i.id === id);
  if (!line) return;
  line.qty = Math.max(0, Math.min(99, qty | 0));
  const next = cart.filter(i => i.qty > 0);
  saveCart(next);
}
export function removeFromCart(id) { saveCart(getCart().filter(i => i.id !== id)); }
export function clearCart() { saveCart([]); }

export function cartLines() {
  return getCart().map(i => ({ ...i, product: getProduct(i.id), total: getProduct(i.id).price * i.qty }));
}

/* ---------- totals ---------- */
export function regionRates() { return C.shipping || {}; }
export function getRegion() { return getPrefs().region || "westMalaysia"; }

export function totals() {
  const lines = cartLines();
  const subtotal = lines.reduce((a, l) => a + l.total, 0);
  const region = regionRates()[getRegion()] || Object.values(regionRates())[0];
  const freeShip = subtotal >= (C.freeShippingThreshold || Infinity) && subtotal > 0;
  const ship = freeShip ? 0 : (region?.rate ?? 0);
  const pay = getPrefs().payment || "";
  const codFee = pay === "cod" && C.payments?.cashOnDelivery?.enabled ? (C.payments.cashOnDelivery.fee || 0) : 0;
  const tax = (C.taxRate || 0) ? subtotal * C.taxRate : 0;
  return {
    lines, subtotal, ship, tax, codFee,
    region, freeShip,
    total: subtotal + ship + tax + codFee,
    toFreeShip: Math.max(0, (C.freeShippingThreshold || 0) - subtotal)
  };
}

/* ---------- orders ---------- */
export function orderId() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DXN-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${rand}`;
}

export function createOrder(details) {
  const t = totals();
  const order = {
    id: orderId(),
    placedAt: new Date().toISOString(),
    status: "Pending confirmation",
    customer: details,
    region: getRegion(),
    payment: details.payment,
    lines: t.lines.map(l => ({
      id: l.id, name: l.product.name, sku: l.product.sku,
      packSize: l.product.packSize, price: l.product.price, qty: l.qty, total: l.total
    })),
    subtotal: t.subtotal, shipping: t.ship, tax: t.tax, codFee: t.codFee, total: t.total,
    currency: C.currency
  };
  const all = getOrders();
  all.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(all.slice(0, 60)));
  emit("order:created", order);
  return order;
}
export function getOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch { return []; }
}
export function getOrder(id) { return getOrders().find(o => o.id === id) || null; }

/* ---------- WhatsApp ---------- */
export function waLink(text) {
  const num = (C.whatsapp || "").replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
export function orderToWhatsApp(order) {
  const lines = order.lines
    .map(l => `• ${l.name} (${l.packSize}) × ${l.qty} — ${money(l.total)}`)
    .join("\n");
  const c = order.customer || {};
  return [
    `*NEW ORDER — ${order.id}*`,
    `${C.storeName}`,
    ``,
    lines,
    ``,
    `Subtotal: ${money(order.subtotal)}`,
    `Shipping (${C.shipping[order.region]?.label || order.region}): ${order.shipping === 0 ? "FREE" : money(order.shipping)}`,
    order.codFee ? `COD handling: ${money(order.codFee)}` : null,
    order.tax ? `${C.taxLabel}: ${money(order.tax)}` : null,
    `*TOTAL: ${money(order.total)}*`,
    ``,
    `Name: ${c.name || "-"}`,
    `Phone: ${c.phone || "-"}`,
    `Email: ${c.email || "-"}`,
    `Address: ${[c.address, c.city, c.state, c.postcode].filter(Boolean).join(", ") || "-"}`,
    `Payment: ${PAYMENT_LABELS[c.payment] || c.payment || "-"}`,
    c.notes ? `Notes: ${c.notes}` : null
  ].filter(Boolean).join("\n");
}
export const PAYMENT_LABELS = {
  online: "Online payment (card / FPX)",
  qr: C.payments?.qr?.label || "DuitNow QR",
  bank: "Bank transfer / online banking",
  cod: "Cash on delivery",
  whatsapp: "Confirm via WhatsApp"
};

/* ---------- catalogue helpers ---------- */
export function searchProducts(q = "", category = "all", sort = "popular") {
  const needle = q.trim().toLowerCase();
  let list = PRODUCTS.filter(p => {
    if (category !== "all" && p.category !== category) return false;
    if (!needle) return true;
    return [p.name, p.short, p.shortDesc, p.packSize, p.category, ...(p.tags || [])]
      .join(" ").toLowerCase().includes(needle);
  });
  const by = {
    popular: (a, b) => (b.reviews || 0) - (a.reviews || 0),
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name),
    rating: (a, b) => b.rating - a.rating
  };
  return list.sort(by[sort] || by.popular);
}

export function relatedProducts(product, n = 3) {
  return PRODUCTS
    .filter(p => p.id !== product.id && p.category === product.category)
    .slice(0, n)
    .concat(PRODUCTS.filter(p => p.id !== product.id && p.category !== product.category).slice(0, Math.max(0, n - PRODUCTS.filter(p => p.category === product.category).length)))
    .slice(0, n);
}

export { C as CONFIG, getProduct };
