/* ============================================================
   THUMB — lightweight 2D product tile
   Used for the mini-cart, search suggestions, and as the
   fallback wherever WebGL is unavailable. Mirrors the palette
   of the 3D label so the two always look like the same product.
   ============================================================ */

const MOTIFS = {
  mushroom: `<path d="M32 12c9 0 16.4 5.6 16.4 12.5 0 1.6-.4 3.1-1.2 4.5H14.8C14 27.6 13.6 26.1 13.6 24.5 13.6 17.6 23 12 32 12Z" fill="#fff" opacity=".95"/><path d="M29.2 29.4h5.6l-1 18.6a1.8 1.8 0 0 1-3.6 0l-1-18.6Z" fill="#F6E7C8"/>`,
  cup: `<g stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"><path d="M18 22h24l-3 22a4 4 0 0 1-4 3.4h-10a4 4 0 0 1-4-3.4Z"/><path d="M42 28h5a7 7 0 0 1 0 14h-3.6"/><path d="M25 15c3-3-1-5 2-8M33 15c3-3-1-5 2-8" opacity=".85"/></g>`,
  leaf: `<path d="M32 10c14 8 18 22 12 33-5 9-16 12-24 8 3-13 6-27 12-41Z" fill="#fff" opacity=".92"/><path d="M22 49C28 34 34 22 44 12" stroke="rgba(0,0,0,.25)" stroke-width="2.4" fill="none"/>`,
  star: `<path d="M32 9l7 14.4 15.9 2.3-11.5 11.2 2.7 15.8L32 45.3 17.9 52.7l2.7-15.8L9.1 25.7 25 23.4 32 9Z" fill="#fff" opacity=".95"/>`
};

/**
 * @param {object} product  entry from js/products.js
 * @param {object} opts     { size:'sm'|'md'|'lg', label:boolean }
 */
export function thumbHTML(product, opts = {}) {
  if (!product) return "";
  const p = product.model.palette;
  const L = product.model.label;
  const motif = MOTIFS[L.motif] || MOTIFS.mushroom;
  const size = opts.size || "md";
  return `
  <span class="thumb thumb--${size}" role="img" aria-label="${product.name}">
    <span class="thumb__bg" style="--a:${p.body};--b:${p.deep};--c:${p.accent}"></span>
    <svg class="thumb__art" viewBox="0 0 64 64" aria-hidden="true">${motif}</svg>
    ${opts.label === false ? "" : `<span class="thumb__tag">${product.short}</span>`}
  </span>`;
}

/** Fill every un-mounted [data-product] element inside `scope` with a 2D tile. */
export function fillThumbs(scope = document, size = "md") {
  scope.querySelectorAll("[data-product]").forEach(el => {
    if (el.dataset.thumbbed) return;
    el.dataset.thumbbed = "1";
    const id = el.dataset.product;
    import("./products.js").then(({ getProduct }) => {
      const p = getProduct(id);
      if (p) el.innerHTML = thumbHTML(p, { size, label: el.dataset.thumbLabel !== "false" ? false : false });
    });
  });
}
