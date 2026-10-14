/* ============================================================
   CART + CHECKOUT
   ============================================================ */

import { init, mountStages, productCard, qs, qsa, bindOptions, C } from "./app.js";
import {
  cartLines, setQty, removeFromCart, clearCart, totals, money, createOrder,
  orderToWhatsApp, waLink, PAYMENT_LABELS, setPrefs, getPrefs, getProduct
} from "./store.js";
import { bindAddButtons, mountReveal, toast } from "./ui.js";

const gallery = init("shop");
let lastIds = "";

const STATES = [
  ["Johor","west"],["Kedah","west"],["Kelantan","west"],["Melaka","west"],
  ["Negeri Sembilan","west"],["Pahang","west"],["Perak","west"],["Perlis","west"],
  ["Pulau Pinang","west"],["Selangor","west"],["Terengganu","west"],
  ["W.P. Kuala Lumpur","west"],["W.P. Putrajaya","west"],
  ["Sabah","east"],["Sarawak","east"],["W.P. Labuan","east"]
];

let payment = getPrefs().payment || "";

/* ============================================================
   RENDER
   ============================================================ */
function render() {
  const lines = cartLines();
  const hasItems = lines.length > 0;

  qs("#empty").hidden = hasItems;
  qs("#cartgrid").style.display = hasItems ? "" : "none";
  qs("#suggest").hidden = hasItems;

  if (!hasItems) { lastIds = ""; renderSuggestions(); return; }

  /* Only rebuild the 3D line items when the set of products changes —
     changing a quantity just updates the numbers (no flicker, no re-mount). */
  const ids = lines.map(l => l.id).join(",");
  const rebuild = ids !== lastIds;
  lastIds = ids;
  if (!rebuild) {
    lines.forEach(l => {
      const row = document.querySelector(`[data-line="${l.id}"]`);
      if (!row) return;
      row.querySelector(".stepper span").textContent = l.qty;
      row.querySelector(".cline__total").textContent = money(l.total);
    });
    qs("#line-count").textContent = `· ${lines.reduce((a, l) => a + l.qty, 0)} item${lines.reduce((a, l) => a + l.qty, 0) > 1 ? "s" : ""}`;
    renderSummary();
    return;
  }

  gallery?.clear();

  qs("#line-count").textContent = `· ${lines.reduce((a, l) => a + l.qty, 0)} item${lines.reduce((a, l) => a + l.qty, 0) > 1 ? "s" : ""}`;

  qs("#lines").innerHTML = lines.map(l => `
    <div class="cline" data-line="${l.id}">
      <div class="cline__thumb"><div class="stage" data-stage="${l.id}" data-pad="1.42" data-spin="0.45"
           role="img" aria-label="3D model of ${l.product.name}"></div></div>
      <div>
        <a class="cline__name" href="product.html?id=${l.id}" data-name-for="${l.id}">${l.product.name}</a>
        <div class="cline__meta">${l.product.packSize} · SKU ${l.product.sku} · ${money(l.product.price)} each</div>
        <div class="stepper" data-step="${l.id}">
          <button data-act="dec" aria-label="Decrease quantity">−</button>
          <span>${l.qty}</span>
          <button data-act="inc" aria-label="Increase quantity">+</button>
        </div>
      </div>
      <div class="cline__right">
        <div class="cline__total">${money(l.total)}</div>
        <button class="rm" data-rm="${l.id}">Remove</button>
      </div>
    </div>`).join("");

  mountStages(qs("#lines"));

  qsa("[data-step]").forEach(s => {
    const id = s.dataset.step;
    s.addEventListener("click", (e) => {
      const act = e.target.dataset?.act;
      const line = cartLines().find(l => l.id === id);
      if (!line) return;
      if (act === "inc") setQty(id, line.qty + 1);
      if (act === "dec") {
        if (line.qty === 1) {
          if (!confirm("Remove this item from your cart?")) return;
          removeFromCart(id);
        } else setQty(id, line.qty - 1);
      }
    });
  });
  qsa("[data-rm]").forEach(b => b.addEventListener("click", () => {
    removeFromCart(b.dataset.rm);
    toast("Item removed", "info");
  }));

  renderSummary();
  renderSuggestions();
}

function renderSummary() {
  const t = totals();

  /* free-shipping progress */
  const bar = qs("#shipbar");
  if (t.subtotal === 0) { bar.className = "shipbar"; bar.innerHTML = "<span>Your cart is empty</span>"; }
  else if (t.freeShip) { bar.className = "shipbar is-free"; bar.innerHTML = "<span>✓ Free shipping unlocked</span>"; }
  else {
    bar.className = "shipbar";
    bar.innerHTML = `<div class="shipbar__fill" style="width:${Math.min(100, (t.subtotal / C.freeShippingThreshold) * 100)}%"></div>
      <span>Add ${money(t.toFreeShip)} more for free shipping</span>`;
  }

  qs("#summary").innerHTML = `
    <div class="sum__row"><span>Subtotal (${t.lines.reduce((a, l) => a + l.qty, 0)} items)</span><b>${money(t.subtotal)}</b></div>
    <div class="sum__row ${t.freeShip ? "is-free" : ""}"><span>Shipping — ${t.region?.label || ""}</span><b>${t.ship === 0 ? "FREE" : money(t.ship)}</b></div>
    ${t.tax ? `<div class="sum__row"><span>${C.taxLabel}</span><b>${money(t.tax)}</b></div>` : ""}
    ${t.codFee ? `<div class="sum__row"><span>COD handling</span><b>${money(t.codFee)}</b></div>` : ""}
    <div class="sum__total"><span>Total payable</span><b>${money(t.total)}</b></div>
    <div class="muted" style="font-size:.78rem;line-height:1.5">
      Prices include everything you pay — no hidden charges.
      ${t.freeShip ? "" : `Spend ${money(t.toFreeShip)} more to remove the ${money(t.ship)} shipping fee.`}
    </div>`;

  /* region ETA */
  qs("#region-eta").textContent = `Estimated delivery: ${t.region?.eta || "—"}`;

  /* delivery info card */
  qs("#delivery-info").innerHTML = `
    <div><strong style="color:var(--ink)">${C.shipping.westMalaysia.label}</strong><br>
      ${money(C.shipping.westMalaysia.rate)} · ${C.shipping.westMalaysia.eta}</div>
    <div style="margin-top:10px"><strong style="color:var(--ink)">${C.shipping.eastMalaysia.label}</strong><br>
      ${money(C.shipping.eastMalaysia.rate)} · ${C.shipping.eastMalaysia.eta}</div>
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--line-2)">
      🚚 Free shipping on orders over <strong style="color:var(--ink)">${money(C.freeShippingThreshold)}</strong><br>
      📦 Orders placed before 2pm (Mon–Sat) are dispatched the same working day.<br>
      📍 Shipped from ${C.addressLines[C.addressLines.length - 1] || "Malaysia"}.
    </div>`;

  /* WhatsApp order link (pre-filled with the live cart) */
  const waText = [
    `*ORDER — ${C.storeName}*`,
    "",
    ...t.lines.map(l => `• ${l.product.name} (${l.product.packSize}) × ${l.qty} — ${money(l.total)}`),
    "",
    `Subtotal: ${money(t.subtotal)}`,
    `Shipping: ${t.ship === 0 ? "FREE" : money(t.ship)}`,
    t.codFee ? `COD handling: ${money(t.codFee)}` : null,
    `*TOTAL: ${money(t.total)}*`,
    "",
    "Please confirm availability and how to pay. Thank you!"
  ].filter(Boolean).join("\n");
  qs("#wa-order").href = waLink(waText);

  /* payment options depend on the COD fee, so re-render them */
  renderPaymentOptions();
}

/* ============================================================
   PAYMENT OPTIONS
   ============================================================ */
function renderPaymentOptions() {
  const t = totals();
  const onlineReady = !!(C.payments.onlineLink && C.payments.onlineLink.trim());
  const bank = C.payments.bank || {};
  const qr = C.payments.qr || {};
  const cod = C.payments.cashOnDelivery || {};

  const opts = [
    {
      v: "online", on: onlineReady,
      b: "Card / FPX online",
      s: onlineReady ? "Visa, Mastercard, FPX online banking — you'll be taken to the secure payment page."
                     : "Add a payment link in js/config.js to switch this on (Stripe, ToyyibPay, Billplz or Razorpay).",
      tag: onlineReady ? "Secure" : "Setup needed"
    },
    {
      v: "qr", on: !!qr.enabled,
      b: qr.label || "DuitNow QR",
      s: "Scan with your banking app or TnG eWallet and send us the receipt.",
      tag: "Instant"
    },
    {
      v: "bank", on: !!bank.enabled,
      b: "Bank transfer",
      s: bank.enabled ? `${bank.bankName} · ${bank.accountNumber}` : "Not available",
      tag: null
    },
    {
      v: "cod", on: !!cod.enabled,
      b: "Cash on delivery",
      s: cod.enabled ? `Pay the courier when your parcel arrives${cod.fee ? ` (+${money(cod.fee)} handling fee)` : "."}` : "Not available",
      tag: cod.enabled && cod.fee ? `+${money(cod.fee)}` : null
    },
    {
      v: "whatsapp", on: true,
      b: "Confirm on WhatsApp",
      s: "We reply with stock, final total and a payment method that suits you.",
      tag: "Popular"
    }
  ].filter(o => o.on);

  if (!payment || !opts.some(o => o.v === payment)) payment = opts[0]?.v || "whatsapp";
  setPrefs({ payment });

  qs("#pay-options").innerHTML = opts.map(o => `
    <label class="opt ${o.v === payment ? "is-on" : ""}" data-pay="${o.v}">
      <input type="radio" name="payment" value="${o.v}" ${o.v === payment ? "checked" : ""}>
      <span class="opt__radio"></span>
      <span class="opt__body"><b>${o.b}</b><small>${o.s}</small></span>
      ${o.tag ? `<span class="opt__tag">${o.tag}</span>` : ""}
    </label>`).join("");

  qsa("#pay-options .opt").forEach(el => {
    el.addEventListener("click", () => {
      payment = el.dataset.pay;
      setPrefs({ payment });
      qsa("#pay-options .opt").forEach(x => x.classList.toggle("is-on", x === el));
      renderSummary();
      showPayDetail();
    });
  });

  /* detail panels */
  const qrImg = qr.image || "assets/qr-duitnow.png";
  qs("#pay-details").innerHTML = `
    <div class="paydetail ${payment === "online" ? "is-on" : ""}" data-detail="online">
      You'll be redirected to our secure payment page after placing the order. Your order ID is attached
      automatically so we can match the payment.
      ${onlineReady ? "" : `<div class="notice" style="margin-top:12px">
        <strong>Not configured yet.</strong> Open <code>js/config.js</code> and paste your payment link into
        <code>payments.onlineLink</code>. Until then, please choose another method below.</div>`}
    </div>

    <div class="paydetail ${payment === "qr" ? "is-on" : ""}" data-detail="qr">
      <div class="qrbox">
        <div class="qr">
          <img src="${qrImg}" alt="DuitNow QR code"
               onerror="this.outerHTML='<div class=&quot;qr-missing&quot;>Upload your DuitNow&nbsp;QR to<br><b>assets/qr-duitnow.png</b><br>to show it here.</div>'">
        </div>
        <div style="flex:1;min-width:200px">
          <strong>${qr.label || "DuitNow QR"}</strong><br>
          Scan with Maybank2u, CIMB Clicks, Public Bank, TnG eWallet, GrabPay, Boost or ShopeePay.<br><br>
          <span class="muted">After paying, WhatsApp us a screenshot with your order ID so we can dispatch immediately.</span>
        </div>
      </div>
    </div>

    <div class="paydetail ${payment === "bank" ? "is-on" : ""}" data-detail="bank">
      <table>
        <tr><td>Bank</td><td>${bank.bankName || "—"}</td></tr>
        <tr><td>Account name</td><td>${bank.accountName || "—"}</td></tr>
        <tr><td>Account number</td><td><code>${bank.accountNumber || "—"}</code></td></tr>
        <tr><td>Reference</td><td>${bank.reference || "Your order ID"}</td></tr>
      </table>
      <div class="muted" style="margin-top:10px">Transfer after placing your order and send us the receipt on WhatsApp.</div>
    </div>

    <div class="paydetail ${payment === "cod" ? "is-on" : ""}" data-detail="cod">
      Pay the courier in cash when your parcel arrives. Please have the exact amount ready —
      <strong>${money(t.total)}</strong> including ${cod.fee ? money(cod.fee) : "no"} handling fee.
      Available for West Malaysia addresses only.
    </div>

    <div class="paydetail ${payment === "whatsapp" ? "is-on" : ""}" data-detail="whatsapp">
      Your order is recorded here first, then sent to our WhatsApp with one tap. We'll confirm stock and
      arrange payment — usually within the hour during <strong>${C.operatingHours}</strong>.
    </div>`;
}

function showPayDetail() {
  qsa("[data-detail]").forEach(d => d.classList.toggle("is-on", d.dataset.detail === payment));
}

/* ============================================================
   FORM
   ============================================================ */
const stateSel = qs("#f-state");
stateSel.innerHTML += STATES.map(([n]) => `<option value="${n}">${n}</option>`).join("");

/* restore saved details */
(function restore() {
  const p = getPrefs();
  const c = p.customer || {};
  ["name", "phone", "email", "address", "city", "postcode", "state", "notes"].forEach(k => {
    const el = document.getElementById("f-" + k);
    if (el && c[k]) el.value = c[k];
  });
  const r = getPrefs().region || "westMalaysia";
  qs("#f-region").value = r;
})();

/* state -> region auto-detect */
stateSel.addEventListener("change", () => {
  const found = STATES.find(([n]) => n === stateSel.value);
  if (found) {
    qs("#f-region").value = found[1] === "east" ? "eastMalaysia" : "westMalaysia";
    setPrefs({ region: qs("#f-region").value });
    renderSummary();
  }
});
qs("#f-region").addEventListener("change", (e) => { setPrefs({ region: e.target.value }); renderSummary(); });

/* postcode: digits only */
qs("#f-postcode").addEventListener("input", (e) => {
  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 5);
});

/* ============================================================
   VALIDATION
   ============================================================ */
const RULES = {
  name: v => v.trim().length >= 3,
  phone: v => {
    const d = v.replace(/[\s\-()]/g, "");
    return /^(\+?60|0)1\d{7,9}$/.test(d) || /^\+?\d{9,14}$/.test(d);
  },
  email: v => v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()),
  address: v => v.trim().length >= 8,
  city: v => v.trim().length >= 2,
  postcode: v => /^\d{5}$/.test(v.trim()),
  state: v => v !== ""
};

function validate() {
  let ok = true, firstBad = null;
  Object.keys(RULES).forEach(k => {
    const el = document.getElementById("f-" + k);
    if (!el) return;
    const field = el.closest(".field");
    const good = RULES[k](el.value);
    field.classList.toggle("is-bad", !good);
    el.classList.toggle("is-bad", !good);
    if (!good) { ok = false; firstBad = firstBad || el; }
  });
  if (firstBad) {
    firstBad.focus();
    firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
    toast("Please check the highlighted fields", "error", { ms: 4200 });
  }
  return ok;
}

function collect() {
  const c = {};
  ["name", "phone", "email", "address", "city", "postcode", "state", "notes"].forEach(k => {
    c[k] = (document.getElementById("f-" + k)?.value || "").trim();
  });
  c.payment = payment;
  c.region = qs("#f-region").value;
  return c;
}

/* clear error styling as the user types */
qsa("#checkout-form input, #checkout-form select, #checkout-form textarea").forEach(el => {
  el.addEventListener("input", () => {
    el.classList.remove("is-bad");
    el.closest(".field")?.classList.remove("is-bad");
  });
});

/* ============================================================
   PLACE ORDER
   ============================================================ */
qs("#place-order").addEventListener("click", () => submit("site"));
qs("#wa-order").addEventListener("click", (e) => {
  e.preventDefault();
  submit("whatsapp");
});

function submit(via) {
  if (!validate()) return;
  const customer = collect();
  setPrefs({ customer, region: customer.region, payment });

  if (via === "site" && payment === "online" && !C.payments.onlineLink?.trim()) {
    toast("Online payment isn't set up yet", "error", { sub: "Choose another payment method", ms: 4500 });
    return;
  }

  customer.payment = via === "whatsapp" ? "whatsapp" : payment;
  const order = createOrder(customer);
  clearCart();

  if (via === "whatsapp" || customer.payment === "whatsapp") {
    window.open(waLink(orderToWhatsApp(order)), "_blank", "noopener");
    location.href = `order.html?id=${encodeURIComponent(order.id)}&via=wa`;
    return;
  }

  if (customer.payment === "online" && C.payments.onlineLink?.trim()) {
    const base = C.payments.onlineLink.trim();
    const sep = base.includes("?") ? "&" : "?";
    const url = `${base}${sep}client_reference_id=${encodeURIComponent(order.id)}` +
                (customer.email ? `&prefilled_email=${encodeURIComponent(customer.email)}` : "") +
                `&amount=${Math.round(order.total * 100)}`;
    window.open(url, "_blank", "noopener");
    location.href = `order.html?id=${encodeURIComponent(order.id)}&via=pay`;
    return;
  }

  location.href = `order.html?id=${encodeURIComponent(order.id)}`;
}

qs("#clear-cart").addEventListener("click", () => {
  if (!confirm("Remove every item from your cart?")) return;
  clearCart();
  toast("Cart cleared", "info");
});

/* ============================================================
   SUGGESTIONS
   ============================================================ */
function renderSuggestions() {
  const inCart = new Set(cartLines().map(l => l.id));
  const picks = ["lingzhi-coffee-3in1", "ganozhi-toothpaste", "spirulina-plus", "starter-pack", "zhi-tea"]
    .map(getProduct).filter(Boolean).filter(p => !inCart.has(p.id)).slice(0, 3);
  const list = picks.length ? picks : ["starter-pack", "ganozhi-toothpaste", "zhi-tea"].map(getProduct).filter(Boolean);
  qs("#suggest-grid").innerHTML = list.map((p, i) => productCard(p, { delay: i + 1 })).join("");
  mountStages(qs("#suggest-grid"));
  bindAddButtons(qs("#suggest-grid"));
  mountReveal(qs("#suggest-grid"));
}

/* live re-render whenever the cart changes */
window.addEventListener("cart:updated", render);
render();
