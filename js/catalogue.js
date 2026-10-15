/* ============================================================
   CATALOGUE PAGE — filters, search, sort, live 3D grid
   ============================================================ */

import { init, mountStages, productCard, bindSpinButtons, qs, param, CATEGORIES, PRODUCTS, HAS_GL } from "./app.js";
import { searchProducts, waLink, getProduct } from "./store.js";
import { mountReveal, bindAddButtons } from "./ui.js";

const gallery = init("shop");

const state = {
  cat: param("cat") || "all",
  q: param("q") || "",
  sort: param("sort") || "popular"
};

/* ---------- filters ---------- */
function renderFilters() {
  const counts = (id) => id === "all"
    ? PRODUCTS.length
    : PRODUCTS.filter(p => p.category === id).length;
  const items = [{ id: "all", name: "All products" }, ...CATEGORIES];
  qs("#filters").innerHTML = items.map(c => `
    <button class="filter ${state.cat === c.id ? "is-active" : ""}" data-cat="${c.id}"
            role="tab" aria-selected="${state.cat === c.id}">${c.name}<b>${counts(c.id)}</b></button>`).join("");

  qs("#filters").querySelectorAll("[data-cat]").forEach(b => {
    b.addEventListener("click", () => { state.cat = b.dataset.cat; push(); render(); });
  });
}

/* ---------- heading ---------- */
function renderHeading() {
  const cat = CATEGORIES.find(c => c.id === state.cat);
  const title = state.q ? `Results for “${state.q}”` : (cat ? cat.name : "All products");
  const blurb = state.q
    ? `We searched the whole catalogue for “${state.q}”.`
    : (cat ? cat.blurb : "Every item is rendered live in 3D from its real packaging dimensions — drag to spin, then add to cart.");
  qs("#page-title").textContent = title;
  qs("#page-blurb").textContent = blurb;
  document.title = `${title} — DXN Wellness Store Malaysia`;
}

/* ---------- grid ---------- */
function render() {
  renderFilters();
  renderHeading();

  const list = searchProducts(state.q, state.cat, state.sort);
  const host = qs("#results");

  gallery?.clear();
  host.innerHTML = list.map((p, i) => productCard(p, { delay: (i % 4) + 1 })).join("");
  qs("#empty").hidden = list.length > 0;
  host.style.display = list.length ? "" : "none";
  qs("#count").textContent = list.length;

  mountStages(host);
  bindSpinButtons(host);
  bindAddButtons(host);
  mountReveal(host);
  push();
}

/* ---------- URL sync (shareable / bookmarkable) ---------- */
function push() {
  const u = new URL(location.href);
  u.searchParams.delete("cat"); u.searchParams.delete("q"); u.searchParams.delete("sort");
  if (state.cat !== "all") u.searchParams.set("cat", state.cat);
  if (state.q) u.searchParams.set("q", state.q);
  if (state.sort !== "popular") u.searchParams.set("sort", state.sort);
  history.replaceState(null, "", u);
}

/* ---------- controls ---------- */
qs("#sort").value = state.sort;
qs("#sort").addEventListener("change", (e) => { state.sort = e.target.value; render(); });

/* header search box keeps in sync with this page */
const hdrSearch = document.getElementById("hdr-search");
if (hdrSearch) {
  hdrSearch.value = state.q;
  hdrSearch.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && location.pathname.includes("catalogue")) {
      e.preventDefault();
      state.q = hdrSearch.value;
      render();
    }
  });
}

/* ---------- CTA ---------- */
qs("#cta-wa").href = waLink("Hi! I'm looking for a DXN product I couldn't find on your website. Can you help?");

/* ---------- deep links ---------- */
const catParam = param("cat");
if (catParam && catParam !== "all" && !getProduct(catParam) && !CATEGORIES.some(c => c.id === catParam)) {
  state.cat = "all";
}

render();
