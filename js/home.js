/* ============================================================
   HOME PAGE
   ============================================================ */

import { init, makeViewer, mountStages, productCard, categoryCard, qs, qsa, C, PRODUCTS, CATEGORIES } from "./app.js";
import { searchProducts, waLink, money } from "./store.js";
import { thumbHTML } from "./thumb.js";
import { stars } from "./ui.js";

const gallery = init("home");

/* ---------- trust strip ---------- */
const TRUST = [
  { t: "Genuine DXN stock", d: "Bought direct through our distributor account. Batch codes intact, sealed, and within date.",
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6l7-3Z"/><path d="m9 12 2.2 2.2L15.5 10"/></svg>` },
  { t: "Free shipping over RM200", d: `West Malaysia from ${money(C.shipping.westMalaysia.rate)}, Sabah & Sarawak from ${money(C.shipping.eastMalaysia.rate)}.`,
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.8"/><circle cx="17.5" cy="18" r="1.8"/></svg>` },
  { t: "Halal certified", d: "DXN's Malaysian facilities are Halal, GMP, ISO and HACCP certified.",
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>` },
  { t: "Real human support", d: "WhatsApp us and a Malaysian distributor replies — usually within the hour.",
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3.5 21l1.4-4.9A8.5 8.5 0 1 1 21 12Z"/></svg>` }
];
qs("#trust-strip").innerHTML = TRUST.map((f, i) => `
  <div class="feature" data-reveal data-delay="${i + 1}">
    <div class="feature__ico">${f.i}</div>
    <h3>${f.t}</h3><p>${f.d}</p>
  </div>`).join("");

/* ---------- categories ---------- */
qs("#cats").innerHTML = CATEGORIES.map(categoryCard).join("");

/* ---------- featured products ---------- */
const featured = searchProducts("", "all", "popular").slice(0, 8);
qs("#featured").innerHTML = featured.map((p, i) => productCard(p, { delay: (i % 4) + 1 })).join("");

/* ---------- steps ---------- */
const STEPS = [
  { t: "Spin it in 3D", d: "Drag any product to inspect the real packaging, label and size before you commit.",
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3.5 20 8v8l-8 4.5L4 16V8l8-4.5Z"/><path d="M4 8l8 4.5L20 8M12 12.5v8"/></svg>` },
  { t: "Pay or WhatsApp", d: "Card, FPX, DuitNow QR, bank transfer or COD — or just send the order to our WhatsApp.",
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10.5h18M7 15h3"/></svg>` },
  { t: "Packed & dispatched", d: "Orders before 2pm go out the same working day from Ipoh, tracked to your door.",
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"/><path d="m8.5 10.8 7 4M15.5 10.8l-7 4"/></svg>` }
];
const stepsHost = qs("#steps");
stepsHost.classList.add("features--3");
stepsHost.innerHTML = STEPS.map((f, i) => `
  <div class="feature" data-reveal data-delay="${i + 1}">
    <div class="feature__ico">${f.i}</div>
    <h3>${f.t}</h3><p>${f.d}</p>
  </div>`).join("");

/* ---------- testimonials ---------- */
const TESTIS = [
  { n: "Siti Nurhaliza R.", c: "Ipoh, Perak", r: 5,
    t: "Saya order Lingzhi Coffee 3 in 1 setiap bulan. Boleh pusing kotak tu dalam 3D dulu — jadi tak salah beli. Penghantaran pun cepat, dua hari sampai." },
  { n: "Kelvin Tan", c: "Petaling Jaya, Selangor", r: 5,
    t: "Bought the RG + GL starter pack for my mum. The 3D view sold me — I could read the label and check the capsule count before paying. Genuine stock, sealed with batch codes." },
  { n: "Priya Nair", c: "George Town, Penang", r: 5,
    t: "Ganozhi toothpaste is the only one my kids will use. Free shipping over RM200 means I just stock up three at a time. WhatsApp replies were fast and friendly." }
];
qs("#testis").innerHTML = TESTIS.map((t, i) => `
  <div class="testi" data-reveal data-delay="${i + 1}">
    ${stars(t.r)}
    <p>“${t.t}”</p>
    <div class="testi__by">
      <div class="avatar">${t.n.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
      <div><b>${t.n}</b><small>${t.c} · Verified buyer</small></div>
    </div>
  </div>`).join("");

/* ---------- CTA WhatsApp ---------- */
qs("#cta-wa").href = waLink("Hi! I'm not sure which DXN products suit me. Can you recommend a routine?");

/* ============================================================
   HERO 3D VIEWER — switchable product showcase
   ============================================================ */
const HERO_IDS = ["lingzhi-coffee-3in1", "rg-capsules", "ganozhi-toothpaste", "zhi-tea", "spirulina-plus"];
const heroProducts = HERO_IDS.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

const heroEl = qs("#hero-viewer");
const heroViewer = makeViewer(heroEl, { product: heroProducts[0], floorColor: "#efe9e0", accent: "#d6161c" });
if (heroViewer) heroViewer.load(heroProducts[0]);

/* product switcher under the viewer */
const heroSwitch = qs("#hero-switch");
if (heroSwitch) heroSwitch.innerHTML = heroProducts.map((p, i) => `
  <button class="sw ${i === 0 ? "is-active" : ""}" data-hero="${p.id}" title="${p.name} — ${money(p.price)}" aria-label="Show ${p.name} in 3D">
    ${thumbHTML(p, { size: "sm", label: false })}
  </button>`).join("");

qsa("[data-hero]").forEach(b => {
  b.addEventListener("click", () => {
    const p = PRODUCTS.find(x => x.id === b.dataset.hero);
    if (!p || !heroViewer) return;
    qsa("[data-hero]").forEach(x => x.classList.toggle("is-active", x === b));
    heroViewer.load(p);
    const badge = qs("#hero-badge"); if (!badge) return;
    badge.textContent = "LIVE 3D · " + p.short.toUpperCase();
    badge.animate?.([{ opacity: 0, transform: "translateY(-6px)" }, { opacity: 1, transform: "none" }], { duration: 340, easing: "ease-out" });
  });
});

/* angle presets in the HUD */
const heroChips = qs("#hero-chips");
if (heroChips) heroChips.innerHTML = `
  <button class="chipview" data-view="front">Front</button>
  <button class="chipview is-active" data-view="three">3 / 4</button>
  <button class="chipview" data-view="side">Side</button>
  <button class="chipview" data-view="top">Top</button>`;
qsa("#hero-chips [data-view]").forEach(b => {
  b.addEventListener("click", () => {
    qsa("#hero-chips [data-view]").forEach(x => x.classList.toggle("is-active", x === b));
    heroViewer?.preset(b.dataset.view);
    heroViewer?.setAutoRotate(false);
    qs("#btn-spin").classList.add("is-off");
  });
});

/* viewer tools */
const spinBtn = qs("#btn-spin");
spinBtn?.addEventListener("click", () => {
  if (!heroViewer) return;
  const on = !heroViewer.controls.autoRotate;
  heroViewer.setAutoRotate(on);
  spinBtn.classList.toggle("is-off", !on);
});
qs("#btn-zoomin")?.addEventListener("click", () => heroViewer?.zoomBy(0.84));
qs("#btn-zoomout")?.addEventListener("click", () => heroViewer?.zoomBy(1.19));
qs("#btn-reset")?.addEventListener("click", () => {
  heroViewer?.reset();
  spinBtn?.classList.remove("is-off");
});

/* ============================================================
   STORY VIEWER (RG / GL / Ganocelium)
   ============================================================ */
const storyEl = qs("#story-viewer");
const storyViewer = makeViewer(storyEl, { floorColor: "#ece6dd", accent: "#0e7a5f", autoRotateSpeed: 0.8 });
const firstStory = PRODUCTS.find(p => p.id === "rg-capsules");
if (storyViewer && firstStory) storyViewer.load(firstStory, { props: false });

qsa("[data-story]").forEach(b => {
  b.addEventListener("click", () => {
    const p = PRODUCTS.find(x => x.id === b.dataset.story);
    if (!p || !storyViewer) return;
    qsa("[data-story]").forEach(x => x.classList.toggle("is-active", x === b));
    storyViewer.load(p, { props: false });
  });
});
qsa("[data-story-view]").forEach(b => {
  b.addEventListener("click", () => storyViewer?.preset(b.dataset.storyView));
});

/* ---------- mount any remaining stages (cards were injected above) ---------- */
mountStages(document);
window.addEventListener("cart:updated", () => mountStages(document));
