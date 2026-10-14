/* ============================================================
   PRODUCT DETAIL PAGE
   ============================================================ */

import { init, makeViewer, productCard, mountStages, qs, qsa, param, CATEGORIES, C } from "./app.js";
import { getProduct, money, addToCart, waLink, relatedProducts } from "./store.js";
import { stars, bindAddButtons, mountReveal, toast } from "./ui.js";

const gallery = init("shop");
const id = param("id");
const product = getProduct(id);

/* ---------- not found ---------- */
if (!product) {
  qs("#crumbs").innerHTML = `<a href="index.html">Home</a><span>/</span><a href="catalogue.html">Catalogue</a><span>/</span><span>Not found</span>`;
  document.querySelector("main").insertAdjacentHTML("beforeend", `
    <div class="wrap"><div class="empty" style="padding:90px 20px">
      <h3>We couldn't find that product</h3>
      <p>The link may be old, or the item may be out of stock right now.</p>
      <div class="hero__cta" style="justify-content:center;margin-top:22px">
        <a class="btn btn--primary" href="catalogue.html">Browse the catalogue</a>
        <a class="btn btn--ghost" href="contact.html">Ask us instead</a>
      </div>
    </div></div>`);
} else {
  render();
}

/* ---------- deterministic sample reviews ---------- */
function seededRandom(seed) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
}
const REVIEWERS = [
  { n: "Siti Rahmah", c: "Ipoh, Perak" }, { n: "Kelvin Tan", c: "Petaling Jaya" },
  { n: "Priya N.", c: "George Town" }, { n: "Ahmad Faizal", c: "Shah Alam" },
  { n: "Grace Lim", c: "Kuching, Sarawak" }, { n: "Muhammad Iqbal", c: "Johor Bahru" },
  { n: "Lavanya R.", c: "Kuala Lumpur" }, { n: "Wong Mei Ling", c: "Kota Kinabalu" }
];
const REVIEW_TEXT = [
  "Barang sampai cepat dan dibungkus elok. Seal masih utuh, ada batch code. Memang original.",
  "Third time reordering from this shop. Stock is always fresh and the price beats what I pay at the pharmacy.",
  "I could read the label properly in the 3D view before buying — that's what convinced me. Very happy with it.",
  "Bagus untuk seisi keluarga. Saya beli dua lagi untuk mak saya di kampung.",
  "Seller replied on WhatsApp within minutes and helped me choose the right one. Excellent service.",
  "Arrived in 3 days to East Malaysia, well packed with bubble wrap. Will order again.",
  "Exactly as described. The pack size is bigger than I expected, good value.",
  "Been taking this for two months as part of my morning routine. No complaints at all."
];
function reviewsFor(p) {
  const rnd = seededRandom(p.id);
  const n = 3;
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = REVIEWERS[Math.floor(rnd() * REVIEWERS.length)];
    const t = REVIEW_TEXT[Math.floor(rnd() * REVIEW_TEXT.length)];
    const rating = rnd() > 0.25 ? 5 : 4;
    const days = 3 + Math.floor(rnd() * 90);
    out.push({ ...r, t, rating, when: days < 30 ? `${days} days ago` : `${Math.floor(days / 30)} month${days > 59 ? "s" : ""} ago` });
  }
  return out;
}

function render() {
  const p = product;
  const cat = CATEGORIES.find(c => c.id === p.category);
  const saving = p.compareAt && p.compareAt > p.price ? p.compareAt - p.price : 0;
  const pctOff = saving ? Math.round((saving / p.compareAt) * 100) : 0;
  const low = p.stock <= 12;

  /* breadcrumbs + seo */
  qs("#crumbs").innerHTML = `
    <a href="index.html">Home</a><span>/</span>
    <a href="catalogue.html">Catalogue</a><span>/</span>
    <a href="catalogue.html?cat=${p.category}">${cat?.name || p.category}</a><span>/</span>
    <span>${p.short}</span>`;
  document.title = `${p.name} (${p.packSize}) — ${money(p.price)} | DXN Wellness Store Malaysia`;
  document.querySelector('meta[name="description"]').setAttribute("content", p.shortDesc);
  injectJsonLd(p, saving);

  /* info panel */
  qs("#pdp-info").innerHTML = `
    <div class="card__cat">${cat?.name || p.category}${p.badge ? ` · ${p.badge}` : ""}</div>
    <h1 data-name-for="${p.id}">${p.name}</h1>
    <div class="pdp__rate">
      ${stars(p.rating, p.reviews)}
      <a href="#reviews" data-scroll-reviews>Read ${p.reviews} reviews</a>
      <span style="opacity:.4">·</span>
      <span>SKU ${p.sku}</span>
    </div>

    <div class="pdp__price">
      <b>${money(p.price)}</b>
      ${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ""}
      ${saving ? `<span class="save">Save ${money(saving)} · ${pctOff}% off</span>` : ""}
    </div>
    <div class="pdp__stock ${low ? "is-low" : ""}">
      <span class="dot"></span>
      ${p.stock > 0 ? (low ? `Low stock — only ${p.stock} left, order soon` : `In stock · ${p.stock} units ready to ship`) : "Out of stock — contact us"}
    </div>

    <p class="pdp__desc">${p.shortDesc}</p>

    <ul class="hl">
      ${p.highlights.map(h => `
        <li>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6"><path d="m5 12.5 4.5 4.5L19 7"/></svg>
          <span>${h}</span>
        </li>`).join("")}
    </ul>

    <div class="buybox">
      <div class="buyrow">
        <div class="stepper" id="qty">
          <button data-act="dec" aria-label="Decrease quantity">−</button>
          <span id="qty-val">1</span>
          <button data-act="inc" aria-label="Increase quantity">+</button>
        </div>
        <button class="btn btn--primary" id="add-cart" ${p.stock === 0 ? "disabled" : ""}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 7h12l1.2 12.1a1.5 1.5 0 0 1-1.5 1.6H6.3a1.5 1.5 0 0 1-1.5-1.6L6 7Z"/><path d="M9 10V6.8a3 3 0 0 1 6 0V10"/><path d="M12 11v5M9.5 13.5h5"/></svg>
          Add to cart
        </button>
        <button class="btn btn--dark" id="buy-now" ${p.stock === 0 ? "disabled" : ""}>Buy now</button>
      </div>
      <div class="buybox__meta">
        <span><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z"/></svg> ${p.packSize}</span>
        <span><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg> Free over ${money(C.freeShippingThreshold)}</span>
        <span><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6l7-3Z"/></svg> Genuine DXN stock</span>
      </div>
    </div>

    <div class="wabox">
      <div class="wabox__ico">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.53 3.75 1.44 5.3L2 22l4.98-1.6a9.8 9.8 0 0 0 5.06 1.4h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm0 17.98h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.1 1 .83-3.03-.2-.31a8.13 8.13 0 0 1-1.25-4.35c0-4.5 3.68-8.17 8.19-8.17a8.17 8.17 0 0 1 0 16.18Z"/></svg>
      </div>
      <div class="wabox__txt">
        <b>Prefer to order on WhatsApp?</b>
        <small>Send us this product and we'll confirm stock, total and delivery time.</small>
      </div>
      <a class="btn btn--wa btn--sm" id="wa-product" href="#" target="_blank" rel="noopener">Order via WhatsApp</a>
    </div>

    <div class="tabs">
      <div class="tabbtns" role="tablist">
        <button class="tabbtn is-active" data-tab="desc" role="tab" aria-selected="true">Description</button>
        <button class="tabbtn" data-tab="spec" role="tab" aria-selected="false">Specifications</button>
        <button class="tabbtn" data-tab="use" role="tab" aria-selected="false">How to use</button>
        <button class="tabbtn" data-tab="reviews" id="reviews" role="tab" aria-selected="false">Reviews (${p.reviews})</button>
      </div>

      <div class="tabpane is-active" data-pane="desc">
        <p>${p.description}</p>
        ${p.ingredients ? `<h3 style="margin-top:20px">Ingredients</h3><p>${p.ingredients}</p>` : ""}
        <div class="notice">
          <strong>Please note:</strong> these statements have not been evaluated by the Ministry of Health Malaysia.
          This product is not intended to diagnose, treat, cure or prevent any disease. Consult a healthcare
          professional before use if you are pregnant, nursing, taking medication or managing a health condition.
        </div>
      </div>

      <div class="tabpane" data-pane="spec">
        <table class="spectable">
          <tbody>
            <tr><th>Product</th><td>${p.name}</td></tr>
            <tr><th>Pack size</th><td>${p.packSize}</td></tr>
            <tr><th>SKU</th><td>${p.sku}</td></tr>
            <tr><th>Category</th><td>${cat?.name || p.category}</td></tr>
            <tr><th>Brand</th><td>DXN (Malaysia)</td></tr>
            <tr><th>Country of origin</th><td>Made in Malaysia</td></tr>
            <tr><th>Certification</th><td>Halal · GMP · ISO · HACCP facility</td></tr>
            <tr><th>Shelf life</th><td>Typically 24 months from manufacture (see pack)</td></tr>
            <tr><th>Storage</th><td>Cool, dry place away from direct sunlight</td></tr>
            <tr><th>Shipping weight</th><td>~${estimateWeight(p)} kg</td></tr>
          </tbody>
        </table>
      </div>

      <div class="tabpane" data-pane="use">
        <h3>Directions</h3>
        <p>${p.howToUse}</p>
        <h3 style="margin-top:20px">Good to know</h3>
        <p>Start with a smaller amount if this is your first time with a ganoderma product, and drink plenty of
        warm water through the day. Most customers build up to the full suggested amount over one to two weeks.</p>
      </div>

      <div class="tabpane" data-pane="reviews">
        <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap;margin-bottom:22px">
          <div>
            <div style="font-family:var(--font-d);font-size:2.6rem;font-weight:800;line-height:1">${p.rating.toFixed(1)}</div>
            ${stars(p.rating)}
          </div>
          <div class="muted" style="font-size:.88rem">Based on ${p.reviews} verified purchases across Malaysia.<br>Sample reviews shown for demonstration.</div>
        </div>
        <div class="reviewlist">
          ${reviewsFor(p).map(r => `
            <div class="review">
              <div class="review__head">
                <div class="avatar">${r.n.split(" ").map(w => w[0]).slice(0, 2).join("")}</div>
                <div><b>${r.n}</b><small>${r.c} · ${r.when} · Verified buyer</small></div>
                <div style="margin-left:auto">${stars(r.rating)}</div>
              </div>
              <p>${r.t}</p>
            </div>`).join("")}
        </div>
      </div>
    </div>`;

  /* ---------- interactions ---------- */
  let qty = 1;
  const qtyVal = qs("#qty-val");
  qs("#qty").addEventListener("click", (e) => {
    const act = e.target.dataset.act;
    if (act === "inc") qty = Math.min(99, qty + 1);
    if (act === "dec") qty = Math.max(1, qty - 1);
    qtyVal.textContent = qty;
  });

  qs("#add-cart").addEventListener("click", () => {
    addToCart(p.id, qty);
    toast("Added to cart", "success", { sub: `${qty} × ${p.name}`, action: { href: "cart.html", label: "Checkout" } });
  });
  qs("#buy-now").addEventListener("click", () => {
    addToCart(p.id, qty);
    location.href = "cart.html";
  });
  qs("#wa-product").href = waLink(
    `Hi! I'd like to order:\n\n• ${p.name} (${p.packSize})\n  SKU: ${p.sku}\n  Price: ${money(p.price)}\n  Qty: ${qty}\n\nIs it in stock?`
  );

  /* tabs */
  qsa(".tabbtn").forEach(b => {
    b.addEventListener("click", () => {
      qsa(".tabbtn").forEach(x => { x.classList.toggle("is-active", x === b); x.setAttribute("aria-selected", String(x === b)); });
      qsa(".tabpane").forEach(pn => pn.classList.toggle("is-active", pn.dataset.pane === b.dataset.tab));
      if (b.dataset.tab === "reviews") document.getElementById("reviews").scrollIntoView({ block: "nearest" });
    });
  });
  qs("[data-scroll-reviews]")?.addEventListener("click", (e) => {
    e.preventDefault();
    qsa(".tabbtn").find(b => b.dataset.tab === "reviews")?.click();
    document.querySelector(".tabs").scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- 3D viewer ---------- */
  const viewer = makeViewer(qs("#pdp-viewer"), {
    product: p, floorColor: "#efe9e0", accent: p.model.palette.accent
  });
  if (viewer) viewer.load(p);
  const badgeEl = qs("#pdp-badge");
  if (badgeEl) badgeEl.textContent = "LIVE 3D · " + p.short.toUpperCase();

  const anglesEl = qs("#angles");
  if (anglesEl) anglesEl.innerHTML = [
    ["three", "3 / 4 view"], ["front", "Front"], ["side", "Side"], ["label", "Reverse"], ["top", "Top"]
  ].map(([k, l], i) => `<button class="chipview ${i === 0 ? "is-active" : ""}" data-angle="${k}">${l}</button>`).join("")
    + `<button class="chipview" id="angle-spin" style="margin-left:auto">⏸ Pause spin</button>`;

  qsa("[data-angle]").forEach(b => {
    b.addEventListener("click", () => {
      qsa("[data-angle]").forEach(x => x.classList.toggle("is-active", x === b));
      viewer?.preset(b.dataset.angle);
      viewer?.setAutoRotate(false);
      qs("#btn-spin").classList.add("is-off");
      const spinLbl = qs("#angle-spin");
      if (spinLbl) spinLbl.textContent = "▶ Resume spin";
    });
  });
  qs("#angle-spin")?.addEventListener("click", () => {
    if (!viewer) return;
    const on = !viewer.controls.autoRotate;
    viewer.setAutoRotate(on);
    const lbl = qs("#angle-spin"); if (lbl) lbl.textContent = on ? "⏸ Pause spin" : "▶ Resume spin";
    qs("#btn-spin").classList.toggle("is-off", !on);
  });

  qs("#btn-spin")?.addEventListener("click", () => {
    if (!viewer) return;
    const on = !viewer.controls.autoRotate;
    viewer.setAutoRotate(on);
    qs("#btn-spin").classList.toggle("is-off", !on);
    const spinLbl = qs("#angle-spin");
    if (spinLbl) spinLbl.textContent = on ? "⏸ Pause spin" : "▶ Resume spin";
  });
  qs("#btn-zoomin")?.addEventListener("click", () => viewer?.zoomBy(0.84));
  qs("#btn-zoomout")?.addEventListener("click", () => viewer?.zoomBy(1.19));
  qs("#btn-reset")?.addEventListener("click", () => { viewer?.reset(); qs("#btn-spin")?.classList.remove("is-off"); });

  /* ---------- related ---------- */
  const rel = relatedProducts(p, 3);
  if (rel.length) {
    qs("#related-section").hidden = false;
    qs("#related").innerHTML = rel.map((r, i) => productCard(r, { delay: i + 1 })).join("");
    mountStages(qs("#related"));
    bindAddButtons(qs("#related"));
    mountReveal(qs("#related"));
  }

  qs("#pdp").hidden = false;
}

function estimateWeight(p) {
  const m = String(p.packSize).match(/([\d.]+)\s*(g|kg|ml)/i);
  if (!m) return (0.4 + (p.model.type === "bottle" ? 0.2 : 0)).toFixed(2);
  let g = parseFloat(m[1]) * (m[2].toLowerCase() === "kg" ? 1000 : 1);
  const mult = String(p.packSize).match(/(\d+)\s*(?:sachets|×|x)/i);
  if (mult) g *= parseInt(mult[1], 10);
  return ((g / 1000) + 0.15).toFixed(2);
}

function injectJsonLd(p, saving) {
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    sku: p.sku,
    description: p.shortDesc,
    brand: { "@type": "Brand", name: "DXN" },
    category: CATEGORIES.find(c => c.id === p.category)?.name || p.category,
    offers: {
      "@type": "Offer",
      priceCurrency: C.currency,
      price: p.price.toFixed(2),
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: C.legalName }
    },
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews }
  });
  document.head.appendChild(s);
}

/* keep 3D alive if the DOM changed after init */
mountStages(document);
