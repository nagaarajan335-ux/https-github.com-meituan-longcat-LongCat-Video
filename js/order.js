/* ============================================================
   ORDER CONFIRMATION
   ============================================================ */

import { init, qs, param, C } from "./app.js";
import { getOrder, getOrders, money, waLink, orderToWhatsApp, PAYMENT_LABELS } from "./store.js";
import { toast } from "./ui.js";

init("shop", { gallery: false });

const id = param("id");
const via = param("via");
let order = id ? getOrder(id) : getOrders()[0];

if (!order) {
  qs("#donebox").innerHTML = `
    <div class="donebox__ico" style="background:linear-gradient(135deg,#3C4654,#1A1E25);box-shadow:none">
      <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M12 8v5M12 16.5v.01"/><circle cx="12" cy="12" r="9"/></svg>
    </div>
    <h1>No order found on this device</h1>
    <p>Orders are stored in this browser only. If you cleared your browser data or switched devices,
       we won't see it here — but if you sent it to us on WhatsApp, we already have it.</p>
    <div class="hero__cta" style="justify-content:center;margin-top:24px">
      <a class="btn btn--primary" href="catalogue.html">Back to the shop</a>
      <a class="btn btn--wa" href="${waLink("Hi! I placed an order but I can't find my confirmation.")}" target="_blank" rel="noopener">Ask us on WhatsApp</a>
    </div>`;
} else {
  render(order);
}

function render(o) {
  const c = o.customer || {};
  const firstName = (c.name || "").split(" ")[0] || "there";

  if (via === "wa") {
    qs("#done-title").textContent = `Order sent to WhatsApp — thank you, ${firstName}!`;
    qs("#done-lead").textContent = "We've opened WhatsApp with your full order. Press send if it hasn't gone yet, and we'll confirm stock and delivery time.";
  } else if (via === "pay") {
    qs("#done-title").textContent = `Almost done, ${firstName} — complete your payment`;
    qs("#done-lead").textContent = "Your order is recorded and the secure payment page has opened in a new tab. Once payment clears, we dispatch the same working day.";
  } else if (o.payment === "cod") {
    qs("#done-title").textContent = `Thank you, ${firstName} — cash on delivery confirmed`;
    qs("#done-lead").textContent = "Please have the exact amount ready when the courier arrives. Send us the order on WhatsApp so we can start packing.";
  } else {
    qs("#done-title").textContent = `Thank you, ${firstName} — your order is recorded`;
  }

  qs("#oid-value").textContent = o.id;
  qs("#wa-send").href = waLink(orderToWhatsApp(o));

  qs("#oid-copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(o.id); toast("Order ID copied", "success", { ms: 2200 }); }
    catch { toast(o.id, "info", { sub: "Copy it manually", ms: 4000 }); }
  });
  qs("#print-order").addEventListener("click", () => window.print());

  /* ---------- receipt ---------- */
  const when = new Date(o.placedAt);
  const dateStr = when.toLocaleString("en-MY", { dateStyle: "full", timeStyle: "short" });

  qs("#receipt").innerHTML = `
    <div class="panel__head">
      <h2>Order summary</h2>
      <span class="muted" style="font-size:.8rem;font-weight:600">${dateStr}</span>
    </div>
    <div class="panel__body">
      ${o.lines.map(l => `
        <div class="cline">
          <div>
            <div class="cline__name">${l.name}</div>
            <div class="cline__meta">${l.packSize} · SKU ${l.sku} · ${money(l.price)} each</div>
          </div>
          <div class="cline__right">
            <div class="muted" style="font-size:.85rem;font-weight:700">× ${l.qty}</div>
            <div class="cline__total">${money(l.total)}</div>
          </div>
        </div>`).join("")}

      <div class="sum" style="margin-top:20px;padding-top:18px;border-top:1.5px solid var(--line)">
        <div class="sum__row"><span>Subtotal</span><b>${money(o.subtotal)}</b></div>
        <div class="sum__row ${o.shipping === 0 ? "is-free" : ""}"><span>Shipping — ${C.shipping[o.region]?.label || o.region}</span><b>${o.shipping === 0 ? "FREE" : money(o.shipping)}</b></div>
        ${o.tax ? `<div class="sum__row"><span>${C.taxLabel}</span><b>${money(o.tax)}</b></div>` : ""}
        ${o.codFee ? `<div class="sum__row"><span>COD handling</span><b>${money(o.codFee)}</b></div>` : ""}
        <div class="sum__total"><span>Total</span><b>${money(o.total)}</b></div>
      </div>

      <div class="fields" style="margin-top:22px">
        <div class="field">
          <label>Deliver to</label>
          <div style="font-size:.88rem;line-height:1.6">
            <strong>${c.name || "—"}</strong><br>
            ${c.address || "—"}<br>
            ${c.postcode || ""} ${c.city || ""}<br>
            ${c.state || ""}, Malaysia<br>
            <a href="tel:${(c.phone || "").replace(/\s/g, "")}">${c.phone || "—"}</a>
            ${c.email ? `<br><a href="mailto:${c.email}">${c.email}</a>` : ""}
          </div>
        </div>
        <div class="field">
          <label>Payment method</label>
          <div style="font-size:.88rem;line-height:1.6">
            <strong>${PAYMENT_LABELS[o.payment] || o.payment || "—"}</strong><br>
            <span class="muted">Status: ${o.status}</span>
            ${paymentNote(o)}
          </div>
        </div>
      </div>

      ${c.notes ? `<div class="notice" style="margin-top:20px"><strong>Your notes:</strong> ${c.notes}</div>` : ""}
    </div>`;

  /* ---------- next steps ---------- */
  const steps = o.payment === "online" && C.payments.onlineLink
    ? [
        { t: "Complete payment", d: "Use the secure payment page that opened in a new tab. Your order ID is attached automatically." },
        { t: "We pack your order", d: "Once payment clears we pack and dispatch, usually the same working day before 2pm." },
        { t: "Track to your door", d: `You'll get a tracking number on WhatsApp. ${C.shipping[o.region]?.eta || ""}.` }
      ]
    : o.payment === "bank"
    ? [
        { t: "Make the transfer", d: `${C.payments.bank.bankName} · ${C.payments.bank.accountNumber} · ${C.payments.bank.accountName}. Use ${o.id} as the reference.` },
        { t: "Send us the receipt", d: "WhatsApp a screenshot with your order ID so we can match the payment." },
        { t: "We dispatch", d: `Packed and shipped — ${C.shipping[o.region]?.eta || "2–4 working days"}.` }
      ]
    : o.payment === "qr"
    ? [
        { t: "Scan & pay", d: `${C.payments.qr.label}. Amount: ${money(o.total)}.` },
        { t: "Send us the receipt", d: "WhatsApp the payment screenshot with your order ID." },
        { t: "We dispatch", d: `Packed and shipped — ${C.shipping[o.region]?.eta || "2–4 working days"}.` }
      ]
    : o.payment === "cod"
    ? [
        { t: "Confirm on WhatsApp", d: "Send us the order so we can confirm stock and lock in the delivery slot." },
        { t: "We dispatch", d: `Packed and shipped — ${C.shipping[o.region]?.eta || "2–4 working days"}.` },
        { t: "Pay the courier", d: `Have ${money(o.total)} ready in cash when the parcel arrives.` }
      ]
    : [
        { t: "Send it to us", d: "Tap the WhatsApp button above — your full order is pre-written for you." },
        { t: "We confirm & pack", d: `We reply during ${C.operatingHours} with stock confirmation and payment details.` },
        { t: "Delivered", d: `${C.shipping[o.region]?.eta || "2–4 working days"} to ${c.city || "your address"}.` }
      ];

  qs("#steps").innerHTML = steps.map((s, i) => `
    <div class="step"><b><i>${i + 1}</i>${s.t}</b><p>${s.d}</p></div>`).join("");
}

function paymentNote(o) {
  if (o.payment === "bank" && C.payments.bank?.enabled) {
    return `<div class="notice" style="margin-top:12px">
      <strong>${C.payments.bank.bankName}</strong> · ${C.payments.bank.accountNumber}<br>
      ${C.payments.bank.accountName}<br>
      <span class="muted">Reference: <code>${o.id}</code></span></div>`;
  }
  if (o.payment === "online" && C.payments.onlineLink) {
    return `<div class="notice" style="margin-top:12px">
      <a href="${C.payments.onlineLink}${C.payments.onlineLink.includes("?") ? "&" : "?"}client_reference_id=${encodeURIComponent(o.id)}"
         target="_blank" rel="noopener" style="font-weight:800;color:var(--brand);text-decoration:underline">
      Open the payment page again ↗</a></div>`;
  }
  return "";
}
