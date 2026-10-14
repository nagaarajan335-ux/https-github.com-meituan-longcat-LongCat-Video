/* ============================================================
   UI — shared shell (header, mini-cart, toasts, footer)
   Injected on every page so there is a single source of truth.
   ============================================================ */

import { cartLines, cartCount, setQty, removeFromCart, totals, money, addToCart, waLink, CONFIG as C } from "./store.js";
import { searchProducts } from "./store.js";
import { thumbHTML } from "./thumb.js";

/* ---------- brand mark (inline SVG, no image files) ---------- */
export const LOGO_SVG = (size = 42) => `
<svg width="${size}" height="${size}" viewBox="0 0 64 64" fill="none" aria-hidden="true">
  <defs>
    <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#E8262D"/><stop offset="1" stop-color="#98101A"/>
    </linearGradient>
  </defs>
  <rect x="2" y="2" width="60" height="60" rx="17" fill="url(#lg)"/>
  <rect x="2" y="2" width="60" height="60" rx="17" stroke="rgba(255,255,255,.28)" stroke-width="1.6"/>
  <path d="M32 14c8.6 0 15.6 5.2 15.6 11.6 0 1.5-.4 2.9-1.1 4.2H17.5c-.7-1.3-1.1-2.7-1.1-4.2C16.4 19.2 23.4 14 32 14Z" fill="#fff"/>
  <path d="M29.3 30.6h5.4l-1 17.2a1.7 1.7 0 0 1-3.4 0l-1-17.2Z" fill="#F6E7C8"/>
  <circle cx="26" cy="22" r="2.4" fill="#E8262D" opacity=".75"/>
  <circle cx="37" cy="20" r="1.8" fill="#E8262D" opacity=".55"/>
</svg>`;

const wordmark = () => `
<span class="brand">
  ${LOGO_SVG(40)}
  <span class="brand__text">
    <strong>DXN</strong>
    <small>${C.storeName.replace(/^DXN\s*/i, "") || "Wellness Store"}</small>
  </span>
</span>`;

const NAV = [
  { href: "index.html",     label: "Home",     page: "home" },
  { href: "catalogue.html", label: "Shop",     page: "shop" },
  { href: "about.html",     label: "About",    page: "about" },
  { href: "contact.html",   label: "Contact",  page: "contact" }
];

/* ============================================================
   HEADER
   ============================================================ */
export function mountHeader(active) {
  const host = document.getElementById("site-header");
  if (!host) return;
  host.innerHTML = `
  <a class="skip" href="#main">Skip to content</a>
  <div class="topbar">
    <div class="wrap topbar__in">
      <span>🚚 Free shipping over ${money(C.freeShippingThreshold)} · West Malaysia</span>
      <span class="topbar__right">
        <a href="tel:${C.phone.replace(/\s/g, "")}">${C.phone}</a>
        <em>·</em>
        <a href="${waLink("Hi! I would like to ask about DXN products.")}" target="_blank" rel="noopener">WhatsApp us</a>
      </span>
    </div>
  </div>
  <header class="hdr" id="hdr">
    <div class="wrap hdr__in">
      <a class="hdr__brand" href="index.html" aria-label="${C.storeName} home">${wordmark()}</a>

      <nav class="nav" aria-label="Main">
        ${NAV.map(n => `<a href="${n.href}" class="nav__a ${n.page === active ? "is-active" : ""}">${n.label}</a>`).join("")}
      </nav>

      <form class="search" role="search" action="catalogue.html" method="get">
        <input type="search" name="q" id="hdr-search" placeholder="Search RG, coffee, toothpaste…" autocomplete="off" aria-label="Search products">
        <div class="search__pop" id="search-pop" hidden></div>
        <button type="submit" aria-label="Search">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></svg>
        </button>
      </form>

      <div class="hdr__actions">
        <a class="iconbtn" href="${waLink("Hi! I want to place a DXN order.")}" target="_blank" rel="noopener" title="Order on WhatsApp" aria-label="Order on WhatsApp">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.53 3.75 1.44 5.3L2 22l4.98-1.6a9.8 9.8 0 0 0 5.06 1.4h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm0 17.98h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.1 1 .83-3.03-.2-.31a8.13 8.13 0 0 1-1.25-4.35c0-4.5 3.68-8.17 8.19-8.17a8.17 8.17 0 0 1 0 16.18Zm4.5-6.12c-.25-.13-1.46-.72-1.68-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-1.97-1.21 7.4 7.4 0 0 1-1.36-1.7c-.14-.25-.02-.38.11-.5.11-.12.25-.29.37-.44.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.17 1.72 2.62 4.16 3.68.58.25 1.04.4 1.39.51.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.11-.23-.17-.48-.29Z"/></svg>
        </a>
        <button class="iconbtn cartbtn" id="cart-open" aria-label="Open cart">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 7h12l1.2 12.1a1.5 1.5 0 0 1-1.5 1.6H6.3a1.5 1.5 0 0 1-1.5-1.6L6 7Z"/><path d="M9 10V6.8a3 3 0 0 1 6 0V10"/></svg>
          <span class="badge" id="cart-count" hidden>0</span>
        </button>
        <button class="iconbtn navtoggle" id="nav-toggle" aria-label="Menu" aria-expanded="false">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
    <div class="mnav" id="mnav" hidden>
      ${NAV.map(n => `<a href="${n.href}" class="${n.page === active ? "is-active" : ""}">${n.label}</a>`).join("")}
      <a class="mnav__cta" href="${waLink("Hi! I want to order DXN products.")}" target="_blank" rel="noopener">WhatsApp order</a>
    </div>
  </header>`;

  /* sticky shadow */
  const hdr = host.querySelector("#hdr");
  const onScroll = () => hdr.classList.toggle("is-stuck", window.scrollY > 8);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });

  /* mobile nav */
  const toggle = host.querySelector("#nav-toggle");
  const mnav = host.querySelector("#mnav");
  toggle.addEventListener("click", () => {
    const open = mnav.hidden;
    mnav.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.classList.toggle("is-open", open);
  });

  /* live search suggestions */
  const input = host.querySelector("#hdr-search");
  const pop = host.querySelector("#search-pop");
  let t;
  input.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      const q = input.value.trim();
      if (q.length < 2) { pop.hidden = true; pop.innerHTML = ""; return; }
      const hits = searchProducts(q, "all", "popular").slice(0, 5);
      if (!hits.length) {
        pop.innerHTML = `<div class="sp__empty">No match for “${q}”. <a href="contact.html">Ask us on WhatsApp</a></div>`;
      } else {
        pop.innerHTML = hits.map(p => `
          <a class="sp" href="product.html?id=${p.id}">
            <span class="sp__thumb">${thumbHTML(p, { size: "sm", label: false })}</span>
            <span class="sp__body">
              <strong>${p.name}</strong>
              <small>${p.packSize}</small>
            </span>
            <span class="sp__price">${money(p.price)}</span>
          </a>`).join("");
      }
      pop.hidden = false;
    }, 160);
  });
  input.addEventListener("focus", () => { if (input.value.trim().length >= 2) pop.hidden = false; });
  document.addEventListener("click", (e) => { if (!host.querySelector(".search").contains(e.target)) pop.hidden = true; });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { pop.hidden = true; input.blur(); }
  });

  /* cart button */
  host.querySelector("#cart-open").addEventListener("click", () => openMiniCart());

  updateCartBadge();
  window.addEventListener("cart:updated", updateCartBadge);
}

function updateCartBadge() {
  const b = document.getElementById("cart-count");
  if (!b) return;
  const n = cartCount();
  b.textContent = n;
  b.hidden = n === 0;
  b.animate?.([{ transform: "scale(1)" }, { transform: "scale(1.45)" }, { transform: "scale(1)" }], { duration: 320, easing: "ease-out" });
}

/* ============================================================
   MINI CART DRAWER
   ============================================================ */
let drawerEl = null;
export function openMiniCart() {
  if (!drawerEl) {
    drawerEl = document.createElement("div");
    drawerEl.className = "drawer-scrim";
    drawerEl.innerHTML = `
      <aside class="drawer" role="dialog" aria-modal="true" aria-label="Your cart">
        <header class="drawer__head">
          <h2>Your cart</h2>
          <button class="iconbtn" id="drawer-close" aria-label="Close cart">✕</button>
        </header>
        <div class="drawer__body" id="drawer-body"></div>
        <footer class="drawer__foot" id="drawer-foot"></footer>
      </aside>`;
    document.body.appendChild(drawerEl);
    drawerEl.addEventListener("click", (e) => { if (e.target === drawerEl) closeMiniCart(); });
    drawerEl.querySelector("#drawer-close").addEventListener("click", closeMiniCart);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMiniCart(); });
    window.addEventListener("cart:updated", () => { if (drawerEl.classList.contains("is-open")) renderDrawer(); });
  }
  renderDrawer();
  drawerEl.classList.add("is-open");
  document.body.classList.add("no-scroll");
  drawerEl.querySelector(".drawer").focus?.();
}
export function closeMiniCart() {
  if (!drawerEl) return;
  drawerEl.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
}

function renderDrawer() {
  const body = drawerEl.querySelector("#drawer-body");
  const foot = drawerEl.querySelector("#drawer-foot");
  const lines = cartLines();
  if (!lines.length) {
    body.innerHTML = `
      <div class="drawer__empty">
        <div class="drawer__empty-ico">🛒</div>
        <p>Your cart is empty.</p>
        <a class="btn btn--primary" href="catalogue.html">Browse the catalogue</a>
      </div>`;
    foot.innerHTML = "";
    return;
  }
  body.innerHTML = lines.map(l => `
    <article class="dline">
      <div class="dline__thumb">${thumbHTML(l.product, { size: "sm", label: false })}</div>
      <div class="dline__body">
        <a href="product.html?id=${l.id}" class="dline__name">${l.product.name}</a>
        <div class="dline__meta">${l.product.packSize} · ${money(l.product.price)}</div>
        <div class="stepper" data-id="${l.id}">
          <button data-act="dec" aria-label="Decrease quantity">−</button>
          <span>${l.qty}</span>
          <button data-act="inc" aria-label="Increase quantity">+</button>
          <button class="dline__rm" data-act="rm" aria-label="Remove">Remove</button>
        </div>
      </div>
      <div class="dline__total">${money(l.total)}</div>
    </article>`).join("");

  const t = totals();
  foot.innerHTML = `
    ${t.freeShip ? `<div class="shipbar is-free">✓ Free shipping unlocked</div>`
      : `<div class="shipbar"><div class="shipbar__fill" style="width:${Math.min(100, (t.subtotal / C.freeShippingThreshold) * 100)}%"></div>
         <span>Add ${money(t.toFreeShip)} more for free shipping</span></div>`}
    <div class="drawer__sum">
      <div><span>Subtotal</span><strong>${money(t.subtotal)}</strong></div>
      <div class="muted"><span>Shipping</span><span>${t.ship === 0 ? "FREE" : money(t.ship)}</span></div>
      <div class="drawer__grand"><span>Total</span><strong>${money(t.total)}</strong></div>
    </div>
    <a class="btn btn--primary btn--block" href="cart.html">Checkout</a>
    <a class="btn btn--ghost btn--block" href="cart.html">View full cart</a>`;

  body.querySelectorAll(".stepper").forEach(s => {
    const id = s.dataset.id;
    const line = lines.find(l => l.id === id);
    s.addEventListener("click", (e) => {
      const act = e.target.dataset.act;
      if (act === "inc") setQty(id, line.qty + 1);
      else if (act === "dec") setQty(id, line.qty - 1);
      else if (act === "rm") { removeFromCart(id); toast("Removed from cart", "info"); }
    });
  });
}

/* ============================================================
   TOASTS
   ============================================================ */
let toastHost = null;
export function toast(message, kind = "success", opts = {}) {
  if (!toastHost) {
    toastHost = document.createElement("div");
    toastHost.className = "toasts";
    toastHost.setAttribute("aria-live", "polite");
    document.body.appendChild(toastHost);
  }
  const el = document.createElement("div");
  el.className = `toast toast--${kind}`;
  el.innerHTML = `
    <span class="toast__ico">${kind === "success" ? "✓" : kind === "error" ? "!" : "ℹ"}</span>
    <div class="toast__body">
      <strong>${message}</strong>
      ${opts.sub ? `<small>${opts.sub}</small>` : ""}
    </div>
    ${opts.action ? `<a class="toast__act" href="${opts.action.href}">${opts.action.label}</a>` : ""}
    <button class="toast__x" aria-label="Dismiss">✕</button>`;
  toastHost.appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-in"));
  const kill = () => { el.classList.remove("is-in"); setTimeout(() => el.remove(), 320); };
  el.querySelector(".toast__x").addEventListener("click", kill);
  setTimeout(kill, opts.ms ?? 3800);
}

/* ============================================================
   FLOATING WHATSAPP
   ============================================================ */
export function mountWhatsAppFab() {
  if (document.getElementById("wa-fab")) return;
  const a = document.createElement("a");
  a.id = "wa-fab";
  a.className = "wa-fab";
  a.target = "_blank"; a.rel = "noopener";
  a.href = waLink("Hi! I'm browsing your DXN store and have a question.");
  a.setAttribute("aria-label", "Chat with us on WhatsApp");
  a.innerHTML = `
    <svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M12.04 2C6.6 2 2.2 6.4 2.2 11.84c0 1.94.53 3.75 1.44 5.3L2 22l4.98-1.6a9.8 9.8 0 0 0 5.06 1.4h.01c5.43 0 9.84-4.4 9.84-9.84C21.89 6.4 17.48 2 12.04 2Zm0 17.98h-.01a8.2 8.2 0 0 1-4.16-1.14l-.3-.18-3.1 1 .83-3.03-.2-.31a8.13 8.13 0 0 1-1.25-4.35c0-4.5 3.68-8.17 8.19-8.17a8.17 8.17 0 0 1 0 16.18Zm4.5-6.12c-.25-.13-1.46-.72-1.68-.8-.23-.09-.39-.13-.56.12-.16.25-.64.8-.78.97-.14.16-.29.18-.54.06a6.7 6.7 0 0 1-1.97-1.21 7.4 7.4 0 0 1-1.36-1.7c-.14-.25-.02-.38.11-.5.11-.12.25-.29.37-.44.13-.15.17-.25.25-.42.09-.16.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.16 0-.43.06-.65.31-.22.25-.85.83-.85 2.03s.87 2.35.99 2.51c.12.17 1.72 2.62 4.16 3.68.58.25 1.04.4 1.39.51.59.19 1.13.16 1.55.1.47-.07 1.46-.6 1.66-1.17.21-.58.21-1.07.15-1.17-.06-.11-.23-.17-.48-.29Z"/></svg>
    <span class="wa-fab__tip">Chat with us</span>`;
  document.body.appendChild(a);
}

/* ============================================================
   FOOTER
   ============================================================ */
export function mountFooter() {
  const host = document.getElementById("site-footer");
  if (!host) return;
  const year = new Date().getFullYear();
  host.innerHTML = `
  <footer class="ftr">
    <div class="wrap ftr__grid">
      <div class="ftr__col ftr__brand">
        <a href="index.html" class="ftr__logo">${LOGO_SVG(46)}<span>DXN<small>${C.storeName.replace(/^DXN\s*/i, "")}</small></span></a>
        <p>${C.tagline}. Genuine DXN products, stocked and shipped from ${C.addressLines[C.addressLines.length - 1]?.split(",").slice(-2).join(",").trim() || "Malaysia"}.</p>
        <div class="ftr__social">
          ${[["facebook", "Facebook", "M13.5 21v-7h2.4l.4-2.9h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.2c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.2H8v2.9h2.5V21h3Z"],
             ["instagram", "Instagram", "M12 8.6A3.4 3.4 0 1 0 12 15.4 3.4 3.4 0 0 0 12 8.6Zm0 5.6a2.2 2.2 0 1 1 0-4.4 2.2 2.2 0 0 1 0 4.4ZM16.4 4H7.6A3.6 3.6 0 0 0 4 7.6v8.8A3.6 3.6 0 0 0 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6A3.6 3.6 0 0 0 16.4 4Zm2 12.4a2 2 0 0 1-2 2H7.6a2 2 0 0 1-2-2V7.6a2 2 0 0 1 2-2h8.8a2 2 0 0 1 2 2v8.8Zm-.7-10.9a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0Z"],
             ["tiktok", "TikTok", "M16.5 3h-2.6v11.3a2 2 0 1 1-1.5-1.9V9.7a4.6 4.6 0 1 0 4.1 4.6V8.9c.8.7 1.9 1.1 3 1.1V7.4a3.6 3.6 0 0 1-3-4.4Z"],
             ["youtube", "YouTube", "M21.6 7.2s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C16.9 4.1 12 4.1 12 4.1h-.01s-4.9 0-6.7.2c-.4 0-1.3.1-2.1.9-.6.6-.8 2-.8 2S2.2 8.8 2.2 10.5v1.5c0 1.6.2 3.3.2 3.3s.2 1.4.8 2c.8.8 1.8.8 2.2.9 1.6.1 6.6.2 6.6.2s4.9 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2 .8-2s.2-1.6.2-3.3v-1.5c0-1.6-.2-3.3-.2-3.3ZM10 14.4V8.9l5.2 2.8-5.2 2.7Z"]]
            .map(([k, label, d]) => `
            <a href="${C.social?.[k] || "#"}" target="_blank" rel="noopener" aria-label="${label}" title="${label}">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="${d}"/></svg>
            </a>`).join("")}
        </div>
      </div>

      <div class="ftr__col">
        <h4>Shop</h4>
        <a href="catalogue.html?cat=beverages">Coffee & Drinks</a>
        <a href="catalogue.html?cat=supplements">Health Supplements</a>
        <a href="catalogue.html?cat=personal-care">Personal Care</a>
        <a href="catalogue.html?cat=bundles">Value Bundles</a>
        <a href="catalogue.html">All products</a>
      </div>

      <div class="ftr__col">
        <h4>Help</h4>
        <a href="cart.html">Cart & checkout</a>
        <a href="contact.html#delivery">Shipping & delivery</a>
        <a href="contact.html#faq">FAQ</a>
        <a href="contact.html">Contact us</a>
        <a href="about.html#membership">Become a DXN member</a>
      </div>

      <div class="ftr__col">
        <h4>Get in touch</h4>
        <p class="ftr__addr">${C.addressLines.join("<br>")}</p>
        <p><a href="tel:${C.phone.replace(/\s/g, "")}">${C.phone}</a><br>
        <a href="mailto:${C.email}">${C.email}</a></p>
        <p class="ftr__hours">${C.operatingHours}</p>
        <a class="btn btn--ghost btn--sm" href="${waLink("Hi! I'd like to ask about DXN products.")}" target="_blank" rel="noopener">WhatsApp us</a>
      </div>
    </div>

    <div class="wrap ftr__pay">
      <div class="payrow" aria-label="Accepted payment methods">
        <span class="pay">Visa</span><span class="pay">Mastercard</span><span class="pay">FPX</span>
        <span class="pay">DuitNow</span><span class="pay">TnG eWallet</span><span class="pay">COD</span>
        <span class="pay">Bank transfer</span>
      </div>
      <div class="trustrow">
        <span>✓ Genuine DXN stock</span><span>✓ Halal certified</span><span>✓ Member ${C.memberCode}</span>
      </div>
    </div>

    <div class="ftr__legal">
      <div class="wrap">
        <p class="disclaimer">
          <strong>Disclaimer:</strong> These statements have not been evaluated by the Ministry of Health Malaysia.
          These products are not intended to diagnose, treat, cure or prevent any disease. Always consult a
          healthcare professional before starting any supplement, especially if you are pregnant, nursing or taking medication.
          DXN and product names are trademarks of DXN Holdings Bhd. This is an independent distributor storefront.
        </p>
        <p>© ${year} ${C.legalName}. All rights reserved. · <a href="about.html">About</a> · <a href="contact.html">Contact</a></p>
      </div>
    </div>
  </footer>`;
}

/* ============================================================
   HELPERS
   ============================================================ */
/** Wire every [data-add] button on the page to the cart. */
export function bindAddButtons(scope = document) {
  scope.querySelectorAll("[data-add]").forEach(btn => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const id = btn.dataset.add;
      const qty = parseInt(btn.dataset.qty || "1", 10);
      if (addToCart(id, qty)) {
        const name = document.querySelector(`[data-name-for="${id}"]`)?.textContent || id;
        toast(`Added to cart`, "success", { sub: `${qty} × ${name}`, action: { href: "cart.html", label: "Checkout" } });
        btn.classList.add("is-added");
        setTimeout(() => btn.classList.remove("is-added"), 900);
      }
    });
  });
}

/** Reveal-on-scroll */
export function mountReveal(scope = document) {
  const els = scope.querySelectorAll("[data-reveal]");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  els.forEach(e => io.observe(e));
}

/** Count-up numbers */
export function mountCounters(scope = document) {
  const els = scope.querySelectorAll("[data-count]");
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      const el = en.target;
      const to = parseFloat(el.dataset.count);
      const dur = 1100, t0 = performance.now();
      const suffix = el.dataset.suffix || "";
      const step = (t) => {
        const k = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(to * eased).toLocaleString("en-MY") + suffix;
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  els.forEach(e => io.observe(e));
}

/** Star rating markup */
export const stars = (r, reviews) => `
  <span class="stars" role="img" aria-label="Rated ${r} out of 5">
    ${[1, 2, 3, 4, 5].map(i => `<svg viewBox="0 0 24 24" width="14" height="14" fill="${i <= Math.round(r) ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8"><path d="m12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8L3.6 9.7l5.8-.8L12 3.6Z"/></svg>`).join("")}
  </span>
  ${reviews != null ? `<span class="stars__n">(${reviews})</span>` : ""}`;
