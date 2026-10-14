/* ============================================================
   APP — shared page bootstrap
   Every page calls init() with its own nav key, then adds its
   page-specific behaviour.
   ============================================================ */

import { Gallery, Viewer, supportsWebGL } from "./stage.js";
import { getProduct, CATEGORIES, PRODUCTS } from "./products.js";
import { money, cartCount, addToCart, totals, CONFIG as C } from "./store.js";
import { mountHeader, mountFooter, mountWhatsAppFab, mountReveal, mountCounters, bindAddButtons, stars } from "./ui.js";
import { thumbHTML } from "./thumb.js";

const HAS_GL = supportsWebGL();
let gallery = null;

export function init(active, opts = {}) {
  mountHeader(active);
  mountFooter();
  mountWhatsAppFab();

  if (opts.gallery !== false) {
    if (HAS_GL) {
      gallery = new Gallery({ z: 5 });
      window.__gallery = gallery;
    } else {
      // graceful 2D fallback for very old browsers / blocked WebGL
      document.body.classList.add("no-3d");
    }
    mountStages(document);
  }

  bindAddButtons();
  mountReveal();
  mountCounters();
  syncCartBadges();
  window.addEventListener("cart:updated", syncCartBadges);
  return gallery;
}

/** Update any inline [data-cart-count] / [data-cart-total] markers. */
export function syncCartBadges() {
  const n = cartCount();
  document.querySelectorAll("[data-cart-count]").forEach(e => {
    e.textContent = n; e.hidden = n === 0;
  });
  document.querySelectorAll("[data-cart-total]").forEach(e => { e.textContent = money(totals().total); });
}

/**
 * Mount live 3D into every [data-stage="<productId>"] element found in scope.
 * data-pad / data-spin tune the framing and idle rotation.
 */
export function mountStages(scope = document) {
  scope.querySelectorAll("[data-stage]").forEach(el => {
    if (el.dataset.mounted) return;
    const p = getProduct(el.dataset.stage);
    if (!p) return;
    el.dataset.mounted = "1";
    if (HAS_GL && gallery) {
      gallery.add(el, p, {
        padding: parseFloat(el.dataset.pad || "1.30"),
        spin: parseFloat(el.dataset.spin || "0.30"),
        shadowOpacity: parseFloat(el.dataset.shadow || "0.34"),
        pedestalColor: el.dataset.pedestal || "#ffffff"
      });
    } else {
      el.innerHTML = `<div class="stage__fallback">${thumbHTML(p, { size: "md" })}</div>`;
    }
  });
}

export function makeViewer(el, opts = {}) {
  if (!el) return null;
  if (!HAS_GL) {
    /* No WebGL: keep the element intact (page code still queries its children),
       swap the 3D controls for a static tile of the same product. */
    el.classList.add("no-webgl");
    el.querySelectorAll(".viewer__hud,.viewer__hint,.viewer__badge").forEach(n => n.remove());
    const p = opts.product || PRODUCTS[0];
    el.insertAdjacentHTML("afterbegin", `
      <div class="viewer__fallback">
        ${thumbHTML(p, { size: "lg" })}
        <p>Live 3D needs a WebGL-capable browser — here's the product artwork instead.</p>
      </div>`);
    return null;
  }
  return new Viewer(el, opts);
}

/* ============================================================
   SHARED MARKUP
   ============================================================ */

const CAT_NAME = (id) => CATEGORIES.find(c => c.id === id)?.name || id;

/** A product card with a live 3D stage. */
export function productCard(p, opts = {}) {
  const saving = p.compareAt && p.compareAt > p.price ? p.compareAt - p.price : 0;
  const pctOff = saving ? Math.round((saving / p.compareAt) * 100) : 0;
  const low = p.stock > 0 && p.stock <= 12;
  return `
  <article class="card" data-reveal ${opts.delay ? `data-delay="${opts.delay}"` : ""}>
    <div class="card__media">
      <div class="stage" data-stage="${p.id}" data-pad="${opts.pad ?? 1.32}" data-spin="${opts.spin ?? 0.30}"
           role="img" aria-label="Interactive 3D model of ${p.name}. Drag to rotate."></div>
      <div class="card__flags">
        ${p.badge ? `<span class="flag ${p.badge.toLowerCase().includes("save") || p.badge.toLowerCase().includes("value") ? "flag--sale" : ""}">${p.badge}</span>` : ""}
        ${saving ? `<span class="flag flag--sale">−${pctOff}%</span>` : ""}
        ${low ? `<span class="flag flag--low">Only ${p.stock} left</span>` : ""}
      </div>
      <a class="card__quick" href="product.html?id=${p.id}" title="Open ${p.name}" aria-label="Open ${p.name}">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </a>
      <div class="draghint">Drag to spin</div>
    </div>
    <div class="card__body">
      <div class="card__cat">${CAT_NAME(p.category)}</div>
      <h3 class="card__name" data-name-for="${p.id}"><a href="product.html?id=${p.id}">${p.name}</a></h3>
      <div class="card__rate">${stars(p.rating, p.reviews)}</div>
      <p class="card__desc">${p.shortDesc}</p>
      <div class="card__foot">
        <div>
          <div class="price">
            <b>${money(p.price)}</b>
            ${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ""}
            ${saving ? `<span class="save">You save ${money(saving)}</span>` : ""}
          </div>
          <div class="card__pack">${p.packSize}</div>
        </div>
        <button class="addbtn" data-add="${p.id}" aria-label="Add ${p.name} to cart" title="Add to cart">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      </div>
    </div>
  </article>`;
}

/** Category tile */
export function categoryCard(c, i) {
  const n = PRODUCTS.filter(p => p.category === c.id).length;
  const tones = {
    beverages:     { bg: "#FBEFDF", c: "#A9691C", ico: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z"/><path d="M16 10h1.6a2.4 2.4 0 0 1 0 4.8H16"/><path d="M8 4.6c.9-.9-.3-1.8.6-2.6M12 4.6c.9-.9-.3-1.8.6-2.6"/></svg>` },
    supplements:   { bg: "#FDECEC", c: "#D6161C", ico: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 4c4.4 0 8 2.6 8 5.8 0 .9-.3 1.7-.8 2.4H4.8A4.2 4.2 0 0 1 4 9.8C4 6.6 7.6 4 12 4Z"/><path d="M10.6 12.4h2.8l-.5 7.2a1 1 0 0 1-1.8 0l-.5-7.2Z"/></svg>` },
    "personal-care":{ bg: "#E4F3EE", c: "#0E7A5F", ico: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M12 3c5 3.6 6.6 8.6 4.4 12.6-1.8 3.2-5.8 4.3-8.6 2.9 1.1-4.7 2.2-9.7 4.2-15.5Z"/><path d="M7.8 18.5C10 13 12.4 8.6 16 4.6"/></svg>` },
    bundles:       { bg: "#F7EFDC", c: "#A87C22", ico: `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3.4 2.7 5.5 6 .9-4.35 4.2 1 6-5.35-2.8-5.35 2.8 1-6L3.3 9.8l6-.9L12 3.4Z"/></svg>` }
  };
  const t = tones[c.id] || tones.bundles;
  return `
  <a class="cat" href="catalogue.html?cat=${c.id}" style="--catbg:${t.bg};--catc:${t.c}" data-reveal data-delay="${(i % 4) + 1}">
    <div class="cat__ico">${t.ico}</div>
    <h3>${c.name}</h3>
    <p>${c.blurb}</p>
    <div class="cat__n">${n} products
      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
    </div>
  </a>`;
}

/* ---------- tiny utils used by page scripts ---------- */
export const qs = (s, r = document) => r.querySelector(s);
export const qsa = (s, r = document) => [...r.querySelectorAll(s)];
export const param = (k) => new URLSearchParams(location.search).get(k);

/** Wire a group of radio-style .opt cards */
export function bindOptions(name, onChange) {
  const boxes = qsa(`[data-opt-group="${name}"] .opt`);
  boxes.forEach(box => {
    box.addEventListener("click", (e) => {
      if (box.classList.contains("is-disabled")) return;
      const input = box.querySelector("input");
      if (e.target !== input) { input.checked = true; }
      boxes.forEach(b => b.classList.toggle("is-on", b === box));
      onChange?.(input.value, box);
    });
  });
  const checked = boxes.find(b => b.querySelector("input")?.checked);
  if (checked) checked.classList.add("is-on");
}

/** Accordion */
export function bindAccordions(scope = document) {
  scope.querySelectorAll(".acc").forEach(acc => {
    const q = acc.querySelector(".acc__q");
    const a = acc.querySelector(".acc__a");
    q.addEventListener("click", () => {
      const open = acc.classList.toggle("is-open");
      a.style.maxHeight = open ? a.scrollHeight + "px" : "0px";
      q.setAttribute("aria-expanded", String(open));
    });
  });
}

export { money, addToCart, getProduct, CATEGORIES, PRODUCTS, HAS_GL, gallery, C };
