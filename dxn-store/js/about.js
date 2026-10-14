/* ============================================================
   ABOUT PAGE
   ============================================================ */

import { init, makeViewer, qs, C, PRODUCTS } from "./app.js";
import { waLink, money } from "./store.js";

init("about", { gallery: false });

/* ---------- ganoderma facts ---------- */
const FACTS = [
  { t: "A very old remedy", d: "Lingzhi appears in the Shennong Ben Cao Jing, a Chinese herbal text roughly two thousand years old, where it was classed as a superior herb.",
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 4.5h9a4 4 0 0 1 4 4V21a3 3 0 0 0-3-3H5V4.5Z"/><path d="M8 8.5h6M8 12h6"/></svg>` },
  { t: "Grown, not gathered", d: "Wild ganoderma is rare and inconsistent. DXN cultivates it on organic substrate in Malaysia, controlling temperature, humidity and harvest timing.",
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21v-7"/><path d="M12 14c0-4 2.5-7 6-8-.3 4.2-2.6 7.4-6 8Z"/><path d="M12 14C12 10.5 9.8 8 6.5 7.2 6.8 11 9 13.6 12 14Z"/></svg>` },
  { t: "Every part is used", d: "Fruiting body, spores and mycelium are harvested at different stages and go into different formulas — RG, GL and Ganocelium respectively.",
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="9" r="4"/><circle cx="16" cy="9" r="4"/><circle cx="12" cy="16" r="4"/></svg>` },
  { t: "Bitter by nature", d: "Pure ganoderma is genuinely bitter, which is why DXN pairs it with coffee, tea and chocolate for daily use — and why concentrated capsules are taken before meals.",
    i: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z"/><path d="M16 10h1.6a2.4 2.4 0 0 1 0 4.8H16"/></svg>` }
];
qs("#ganoderma-facts").innerHTML = FACTS.map((f, i) => `
  <div class="feature" data-reveal data-delay="${i + 1}">
    <div class="feature__ico">${f.i}</div>
    <h3>${f.t}</h3><p>${f.d}</p>
  </div>`).join("");

/* ---------- formula comparison ---------- */
const FORMULAS = [
  { id: "rg-capsules", t: "RG — Reishi Gano", d: "The mature fruiting body, harvested at 90 days. The most recognisable DXN formula and the usual starting point.", c: "#D6161C" },
  { id: "gl-capsules", t: "GL — Ganolium", d: "Spore and mycelium. Traditionally paired with RG — many people take RG in the morning and GL in the evening.", c: "#0E7A5F" },
  { id: "ganocelium", t: "Ganocelium", d: "Concentrated mycelium. The strongest of the three, usually chosen after some time on RG and GL.", c: "#7B2E8C" }
];
qs("#formulas").innerHTML = FORMULAS.map((f, i) => {
  const p = PRODUCTS.find(x => x.id === f.id);
  return `
  <a class="feature" href="product.html?id=${f.id}" data-reveal data-delay="${i + 1}" style="display:block">
    <div class="feature__ico" style="background:linear-gradient(135deg,${f.c},${f.c}bb);box-shadow:0 10px 22px -10px ${f.c}aa">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4c4.4 0 8 2.6 8 5.8 0 .9-.3 1.7-.8 2.4H4.8A4.2 4.2 0 0 1 4 9.8C4 6.6 7.6 4 12 4Z"/><path d="M10.6 12.4h2.8l-.5 7.2a1 1 0 0 1-1.8 0l-.5-7.2Z"/></svg>
    </div>
    <h3>${f.t}</h3>
    <p>${f.d}</p>
    ${p ? `<p style="margin-top:12px;font-weight:800;color:${f.c};font-size:.85rem">${p.packSize} · ${money(p.price)} →</p>` : ""}
  </a>`;
}).join("");

/* ---------- timeline (edit these) ---------- */
const TIMELINE = [
  { y: "Year 1", t: "Started as a customer", d: "Bought a bag of Lingzhi Coffee for the family and never switched back." },
  { y: "Year 2", t: "Registered as a DXN member", d: "Learned the range properly — what RG, GL and Ganocelium actually are." },
  { y: "Year 3", t: "Began supplying friends & family", d: "Small orders, honest advice, and a lot of WhatsApp conversations." },
  { y: "Now", t: "Opened this 3D store", d: "So customers across Malaysia can inspect the real packaging before they buy." }
];
qs("#timeline").innerHTML = TIMELINE.map(s => `
  <div class="tl"><span>${s.y}</span><b>${s.t}</b><p>${s.d}</p></div>`).join("");

/* ---------- store details ---------- */
qs("#store-details").innerHTML = `
  <div class="infocard">
    <div class="infocard__ico">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 9h16v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9Z"/><path d="M3 9 5.5 4h13L21 9"/><path d="M9 13h6"/></svg>
    </div>
    <div><b>${C.legalName}</b><p>Independent DXN distributor storefront<br>Member code ${C.memberCode}</p></div>
  </div>
  <div class="infocard">
    <div class="infocard__ico">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11Z"/><circle cx="12" cy="10" r="2.6"/></svg>
    </div>
    <div><b>Where we ship from</b><p>${C.addressLines.join("<br>")}</p></div>
  </div>
  <div class="infocard">
    <div class="infocard__ico">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.2 2"/></svg>
    </div>
    <div><b>Working hours</b><p>${C.operatingHours}</p></div>
  </div>
  <div class="infocard">
    <div class="infocard__ico">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6l7-3Z"/><path d="m9 12 2.2 2.2L15.5 10"/></svg>
    </div>
    <div><b>What we promise</b><p>Genuine DXN stock · Halal-certified products · Honest advice · No disease claims, ever.</p></div>
  </div>`;

/* ---------- membership CTA ---------- */
qs("#member-wa").href = waLink("Hi! I'd like to understand DXN membership — pricing, what it involves, and whether it's worth it for me.");

/* ---------- 3D ---------- */
const viewer = makeViewer(qs("#about-viewer"), { floorColor: "#efe9e0", accent: "#0e7a5f", autoRotateSpeed: 0.9 });
const star = PRODUCTS.find(p => p.id === "starter-pack") || PRODUCTS[0];
if (viewer && star) viewer.load(star);
