/* ============================================================
   CONTACT PAGE
   ============================================================ */

import { init, qs, qsa, C, bindAccordions } from "./app.js";
import { waLink, money } from "./store.js";
import { toast } from "./ui.js";

init("contact", { gallery: false });

/* ---------- contact info ---------- */
const INFO = [
  { t: "WhatsApp", v: `<a href="${waLink("Hi! I have a question about DXN products.")}" target="_blank" rel="noopener">${C.phone} — tap to chat</a>`,
    i: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.53 3.75 1.44 5.3L2 22l4.98-1.6a9.8 9.8 0 0 0 5.06 1.4h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm0 17.98h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.1 1 .83-3.03-.2-.31a8.13 8.13 0 0 1-1.25-4.35c0-4.5 3.68-8.17 8.19-8.17a8.17 8.17 0 0 1 0 16.18Z"/></svg>` },
  { t: "Phone", v: `<a href="tel:${C.phone.replace(/\s/g, "")}">${C.phone}</a>`,
    i: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M6.5 3h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5L16 12l4 1.5v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z"/></svg>` },
  { t: "Email", v: `<a href="mailto:${C.email}">${C.email}</a>`,
    i: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m3.8 7 7.1 5.3a2 2 0 0 0 2.2 0L20.2 7"/></svg>` },
  { t: "Address", v: C.addressLines.join("<br>"),
    i: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>` },
  { t: "Working hours", v: C.operatingHours,
    i: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>` }
];
qs("#contact-info").innerHTML = INFO.map(x => `
  <div class="infocard">
    <div class="infocard__ico">${x.i}</div>
    <div><b>${x.t}</b><p>${x.v}</p></div>
  </div>`).join("");

/* ---------- map ---------- */
const q = encodeURIComponent(C.mapQuery || C.addressLines.join(" "));
qs("#map").innerHTML = `
  <iframe title="Map of our location" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
    src="https://maps.google.com/maps?q=${q}&z=12&output=embed"></iframe>`;

qs("#big-wa").href = waLink("Hi! I found your DXN store online and I'd like to ask something.");

/* ---------- delivery cards ---------- */
const DELIVERY = [
  { t: "Same-day dispatch", d: `Order before 2pm, Monday to Saturday, and it leaves our shelf the same working day.`,
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>` },
  { t: "Nationwide coverage", d: `West Malaysia ${C.shipping.westMalaysia.eta}. Sabah, Sarawak and Labuan ${C.shipping.eastMalaysia.eta}.`,
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>` },
  { t: "Packed properly", d: `Bottles wrapped individually, sachet boxes boxed flat, glass-free packaging throughout.`,
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"/><path d="m8.5 10.8 7 4M15.5 10.8l-7 4"/></svg>` }
];
qs("#delivery-cards").innerHTML = DELIVERY.map((f, i) => `
  <div class="feature" data-reveal data-delay="${i + 1}">
    <div class="feature__ico">${f.i}</div><h3>${f.t}</h3><p>${f.d}</p>
  </div>`).join("");

qs("#delivery-table").innerHTML = `
  <table class="spectable">
    <tbody>
      <tr><th>West Malaysia (Semenanjung)</th><td>${money(C.shipping.westMalaysia.rate)} · ${C.shipping.westMalaysia.eta}</td></tr>
      <tr><th>East Malaysia (Sabah / Sarawak / Labuan)</th><td>${money(C.shipping.eastMalaysia.rate)} · ${C.shipping.eastMalaysia.eta}</td></tr>
      <tr><th>Orders over ${money(C.freeShippingThreshold)}</th><td><strong style="color:var(--leaf)">FREE shipping</strong> (West Malaysia)</td></tr>
      <tr><th>Cash on delivery</th><td>${C.payments.cashOnDelivery?.enabled ? `Available in West Malaysia${C.payments.cashOnDelivery.fee ? ` · ${money(C.payments.cashOnDelivery.fee)} handling fee` : ""}` : "Not currently available"}</td></tr>
      <tr><th>Self collect</th><td>Available by arrangement from ${C.addressLines[C.addressLines.length - 1] || "our address"} — message us first</td></tr>
      <tr><th>Tracking</th><td>Sent to you on WhatsApp once the parcel is handed to the courier</td></tr>
      <tr><th>Returns</th><td>Unopened items within 7 days. Sealed health products cannot be resold once opened, so we cannot accept opened returns.</td></tr>
    </tbody>
  </table>`;

/* ---------- FAQ ---------- */
const FAQ = [
  { q: "Are these genuine DXN products?", a: `Yes. We buy through our own DXN distributor account (${C.memberCode}), so every item is sealed, batch-coded and within its expiry date. Ask us for a photo of the batch code before you order if you'd like to check.` },
  { q: "Why is the 3D model not an actual photo?", a: "The 3D models on this site are built in your browser from the product's real packaging shape, colours and label layout, so you can check the pack size and read the label from any angle. They are accurate representations, not photographs — the physical pack may differ slightly in artwork between production runs." },
  { q: "How do I pay?", a: `Whatever suits you: ${[
      C.payments.onlineLink ? "card or FPX online" : null,
      C.payments.qr?.enabled ? "DuitNow QR / eWallet" : null,
      C.payments.bank?.enabled ? `bank transfer to ${C.payments.bank.bankName}` : null,
      C.payments.cashOnDelivery?.enabled ? "cash on delivery" : null,
      "or confirm on WhatsApp and we'll arrange it"
    ].filter(Boolean).join(", ")}.` },
  { q: "Can I order through WhatsApp instead of the cart?", a: "Absolutely — that's how most of our customers do it. Build a cart here and press “Send order on WhatsApp”, or just message us the product names and quantities directly." },
  { q: "How long does delivery take?", a: `West Malaysia ${C.shipping.westMalaysia.eta}. East Malaysia ${C.shipping.eastMalaysia.eta}. Orders placed before 2pm on a working day are dispatched the same day.` },
  { q: "Is there free shipping?", a: `Yes — orders over ${money(C.freeShippingThreshold)} ship free within West Malaysia.` },
  { q: "How should I take RG and GL?", a: "Most customers take RG in the morning and GL in the evening, with plenty of warm water. Follow the directions on the pack, start with a smaller amount if you're new to ganoderma, and speak to a doctor or pharmacist if you take prescription medication." },
  { q: "Are the products Halal?", a: "DXN's Malaysian manufacturing is Halal certified, along with GMP, ISO and HACCP controls. Check the individual product page for specifics." },
  { q: "Do you sell to offices, kiosks or resellers?", a: `Yes, we handle bulk orders — for example the 100-sachet coffee carton. Message us on WhatsApp with the quantities you need and we'll quote member or wholesale pricing where applicable.` },
  { q: "Can I become a DXN member?", a: "Yes. Membership means buying at distributor price and, if you want, sharing products with others. We'll explain the structure honestly — including what it is not — before you commit. Just ask." },
  { q: "What if something arrives damaged?", a: "Message us on WhatsApp with a photo within 48 hours of delivery and we'll replace it or refund you. Couriers handle parcels roughly; we'd rather fix it than argue about it." },
  { q: "Do you ship outside Malaysia?", a: "Not at the moment — we're set up for West and East Malaysia. If you're overseas, contact your local DXN distributor." }
];
qs("#faq-list").innerHTML = FAQ.map((f, i) => `
  <div class="acc" data-reveal data-delay="${Math.min(4, i + 1)}">
    <button class="acc__q" aria-expanded="false"><span>${f.q}</span><i>+</i></button>
    <div class="acc__a"><div>${f.a}</div></div>
  </div>`).join("");
bindAccordions();

/* ---------- contact form ---------- */
const RULES = {
  "c-name": v => v.trim().length >= 2,
  "c-phone": v => { const d = v.replace(/[\s\-()]/g, ""); return /^(\+?60|0)1\d{7,9}$/.test(d) || /^\+?\d{9,14}$/.test(d); },
  "c-msg": v => v.trim().length >= 8
};
qsa("#contact-form input, #contact-form textarea").forEach(el => {
  el.addEventListener("input", () => {
    el.classList.remove("is-bad");
    el.closest(".field")?.classList.remove("is-bad");
  });
});

function compose() {
  const g = (id) => (document.getElementById(id)?.value || "").trim();
  const lines = [
    `*MESSAGE — ${C.storeName}*`,
    `Topic: ${g("c-topic")}`,
    g("c-order") ? `Order ID: ${g("c-order")}` : null,
    "",
    g("c-msg"),
    "",
    `From: ${g("c-name")}`,
    `Phone: ${g("c-phone")}`
  ].filter(Boolean);
  return lines.join("\n");
}

qs("#contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  let ok = true, first = null;
  Object.entries(RULES).forEach(([id, fn]) => {
    const el = document.getElementById(id);
    const good = fn(el.value);
    el.classList.toggle("is-bad", !good);
    el.closest(".field")?.classList.toggle("is-bad", !good);
    if (!good) { ok = false; first = first || el; }
  });
  if (!ok) {
    first.focus();
    toast("Please complete the highlighted fields", "error");
    return;
  }
  const text = compose();
  window.open(waLink(text), "_blank", "noopener");
  const g = (id) => (document.getElementById(id)?.value || "").trim();
  qs("#send-mail").href =
    `mailto:${C.email}?subject=${encodeURIComponent(`[${g("c-topic")}] enquiry from ${g("c-name")}`)}&body=${encodeURIComponent(text)}`;
  toast("WhatsApp opened with your message", "success", { sub: "Press send in WhatsApp to deliver it" });
});

/* keep the mailto link useful even before submitting */
qs("#send-mail").href = `mailto:${C.email}?subject=${encodeURIComponent("Enquiry from your website")}`;
