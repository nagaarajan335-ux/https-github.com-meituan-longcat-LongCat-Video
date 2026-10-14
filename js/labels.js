/* ============================================================
   LABELS — procedural packaging artwork
   ------------------------------------------------------------
   Draws every product's label onto a canvas at runtime and hands
   it back as a THREE.CanvasTexture. No image files to host,
   no copyright artwork, and re-colouring a product is one line
   of palette changes in js/products.js.
   ============================================================ */

import * as THREE from "three";

const FONT = `'Inter','Segoe UI','Helvetica Neue',Arial,sans-serif`;

/* ---------- colour helpers ---------- */
const shade = (hex, amt) => {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) + amt, g = ((n >> 8) & 0xff) + amt, b = (n & 0xff) + amt;
  r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `rgb(${r},${g},${b})`;
};
const isLight = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  const r = n >> 16, g = (n >> 8) & 0xff, b = n & 0xff;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 150;
};
const ink = (hex) => (isLight(hex) ? "#1b1b1e" : "#ffffff");

/* ---------- drawing primitives ---------- */
function rr(c, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function fitText(c, text, x, y, maxWidth, weight, basePx, family = FONT, color = null, tracking = 0) {
  let px = basePx;
  c.font = `${weight} ${px}px ${family}`;
  let w = c.measureText(text).width + Math.max(0, text.length - 1) * tracking;
  while (w > maxWidth && px > 8) {
    px -= 1;
    c.font = `${weight} ${px}px ${family}`;
    w = c.measureText(text).width + Math.max(0, text.length - 1) * tracking;
  }
  if (color) c.fillStyle = color;
  if (tracking) {
    let cx = x;
    for (const ch of text) {
      c.fillText(ch, cx, y);
      cx += c.measureText(ch).width + tracking;
    }
    return px;
  }
  c.textAlign = "left";
  c.fillText(text, x, y);
  return px;
}

function centerText(c, text, cx, y, maxWidth, weight, basePx, color, tracking = 0) {
  let px = basePx;
  c.font = `${weight} ${px}px ${FONT}`;
  while (c.measureText(text).width + tracking * text.length > maxWidth && px > 8) {
    px -= 1; c.font = `${weight} ${px}px ${FONT}`;
  }
  c.fillStyle = color;
  if (tracking) {
    const total = c.measureText(text).width + tracking * (text.length - 1);
    let x = cx - total / 2;
    for (const ch of text) { c.fillText(ch, x, y); x += c.measureText(ch).width + tracking; }
  } else {
    c.textAlign = "center";
    c.fillText(text, cx, y);
  }
  return px;
}

/* ---------- brand motifs ---------- */
function mushroom(c, cx, cy, s, col, cap = null) {
  c.save(); c.translate(cx, cy);
  // stem
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(-s * 0.10, s * 0.05);
  c.lineTo(-s * 0.16, s * 0.62);
  c.lineTo(s * 0.16, s * 0.62);
  c.lineTo(s * 0.10, s * 0.05);
  c.closePath(); c.fill();
  // cap
  c.fillStyle = cap || col;
  c.beginPath();
  c.ellipse(0, 0, s * 0.62, s * 0.40, 0, Math.PI, 0);
  c.closePath(); c.fill();
  c.beginPath(); c.ellipse(0, 0, s * 0.62, s * 0.11, 0, 0, Math.PI * 2); c.fill();
  c.restore();
}

function cup(c, cx, cy, s, col) {
  c.save(); c.translate(cx, cy); c.strokeStyle = col; c.fillStyle = col;
  c.lineWidth = s * 0.09; c.lineJoin = "round";
  c.beginPath();
  c.moveTo(-s * 0.5, -s * 0.18);
  c.lineTo(-s * 0.36, s * 0.42);
  c.lineTo(s * 0.36, s * 0.42);
  c.lineTo(s * 0.5, -s * 0.18);
  c.closePath(); c.stroke();
  c.beginPath(); c.arc(s * 0.55, s * 0.05, s * 0.2, -Math.PI / 2, Math.PI / 2); c.stroke();
  for (let i = -1; i <= 1; i++) {
    c.beginPath();
    c.moveTo(i * s * 0.22, -s * 0.34);
    c.bezierCurveTo(i * s * 0.22 + s * 0.09, -s * 0.5, i * s * 0.22 - s * 0.09, -s * 0.6, i * s * 0.22, -s * 0.78);
    c.lineWidth = s * 0.06; c.stroke();
  }
  c.restore();
}

function leaf(c, cx, cy, s, col) {
  c.save(); c.translate(cx, cy); c.rotate(-0.35);
  c.fillStyle = col;
  c.beginPath();
  c.moveTo(0, -s * 0.7);
  c.bezierCurveTo(s * 0.62, -s * 0.34, s * 0.42, s * 0.5, 0, s * 0.72);
  c.bezierCurveTo(-s * 0.42, s * 0.5, -s * 0.62, -s * 0.34, 0, -s * 0.7);
  c.closePath(); c.fill();
  c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = s * 0.05;
  c.beginPath(); c.moveTo(0, -s * 0.6); c.lineTo(0, s * 0.66); c.stroke();
  for (let i = 1; i <= 3; i++) {
    const y = -s * 0.34 + i * s * 0.26;
    c.beginPath(); c.moveTo(0, y); c.lineTo(s * 0.3, y + s * 0.14); c.stroke();
    c.beginPath(); c.moveTo(0, y); c.lineTo(-s * 0.3, y + s * 0.14); c.stroke();
  }
  c.restore();
}

function star(c, cx, cy, s, col) {
  c.save(); c.translate(cx, cy); c.fillStyle = col; c.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? s * 0.62 : s * 0.26;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    i ? c.lineTo(x, y) : c.moveTo(x, y);
  }
  c.closePath(); c.fill(); c.restore();
}

function drawMotif(c, kind, cx, cy, s, col) {
  if (kind === "cup") cup(c, cx, cy, s, col);
  else if (kind === "leaf") leaf(c, cx, cy, s, col);
  else if (kind === "star") star(c, cx, cy, s, col);
  else mushroom(c, cx, cy, s, col);
}

/* ---------- DXN wordmark block ---------- */
function brandBar(c, x, y, w, h, accent, onAccent) {
  c.save();
  rr(c, x, y, w, h, h * 0.22);
  c.fillStyle = accent; c.fill();
  c.fillStyle = onAccent;
  c.textAlign = "left"; c.textBaseline = "alphabetic";
  const pad = h * 0.28;
  // wordmark
  c.font = `900 ${h * 0.52}px ${FONT}`;
  c.fillText("DXN", x + pad, y + h * 0.68);
  const ww = c.measureText("DXN").width;
  // mushroom glyph on the right
  mushroom(c, x + w - pad - h * 0.22, y + h * 0.56, h * 0.26, onAccent);
  // thin separator
  c.fillRect(x + pad + ww + pad * 0.7, y + h * 0.26, h * 0.045, h * 0.48);
  c.font = `600 ${h * 0.2}px ${FONT}`;
  c.globalAlpha = 0.85;
  const tag = "GANODERMA";
  const avail = (x + w - pad - h * 0.6) - (x + pad + ww + pad * 1.2);
  if (avail > 40) {
    c.textAlign = "left";
    let px = h * 0.2; c.font = `700 ${px}px ${FONT}`;
    while (c.measureText(tag).width > avail && px > 6) { px -= 1; c.font = `700 ${px}px ${FONT}`; }
    c.fillText(tag, x + pad + ww + pad * 1.2, y + h * 0.60);
  }
  c.restore();
}

/* ---------- shared background treatment ---------- */
function background(c, W, H, body, deep, trim) {
  const g = c.createLinearGradient(0, 0, W * 0.35, H);
  g.addColorStop(0, shade(body, 26));
  g.addColorStop(0.45, body);
  g.addColorStop(1, deep);
  c.fillStyle = g; c.fillRect(0, 0, W, H);

  // soft radial highlight, top-left
  const rg = c.createRadialGradient(W * 0.28, H * 0.22, 0, W * 0.28, H * 0.22, W * 0.75);
  rg.addColorStop(0, "rgba(255,255,255,.22)");
  rg.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = rg; c.fillRect(0, 0, W, H);

  // giant watermark motif
  c.save(); c.globalAlpha = 0.07;
  mushroom(c, W * 0.78, H * 0.72, H * 0.34, "#ffffff");
  c.restore();

  // gold hairline frame
  c.strokeStyle = trim; c.globalAlpha = 0.5; c.lineWidth = Math.max(2, W * 0.004);
  rr(c, W * 0.05, H * 0.045, W * 0.9, H * 0.91, W * 0.035); c.stroke();
  c.globalAlpha = 1;
}

function netPill(c, cx, y, text, accent, onAccent, px) {
  c.save();
  c.font = `800 ${px}px ${FONT}`;
  const w = c.measureText(text).width + px * 1.5;
  const h = px * 1.9;
  rr(c, cx - w / 2, y - h * 0.72, w, h, h / 2);
  c.fillStyle = accent; c.fill();
  c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = px * 0.06; c.stroke();
  c.fillStyle = onAccent; c.textAlign = "center"; c.textBaseline = "middle";
  c.fillText(text, cx, y + px * 0.06);
  c.restore();
}

/* ============================================================
   PUBLIC BUILDERS
   ============================================================ */

/** Flat face label — carton / box fronts. 1024×1024. */
export function faceTexture(spec) {
  const W = 1024, H = 1024;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const p = spec.palette, L = spec.label;
  background(c, W, H, p.body, p.deep, p.trim);
  const on = ink(p.body);

  brandBar(c, W * 0.10, H * 0.085, W * 0.80, H * 0.088, p.accent, ink(p.accent));

  // motif medallion
  c.save();
  c.beginPath(); c.arc(W / 2, H * 0.36, W * 0.145, 0, Math.PI * 2);
  c.fillStyle = "rgba(255,255,255,.14)"; c.fill();
  c.strokeStyle = p.trim; c.lineWidth = W * 0.006; c.globalAlpha = .8; c.stroke();
  c.restore();
  drawMotif(c, L.motif || "mushroom", W / 2, H * 0.375, W * 0.155, on);

  // product name
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  centerText(c, L.name, W / 2, H * 0.60, W * 0.84, 900, H * 0.088, on);
  centerText(c, L.sub, W / 2, H * 0.665, W * 0.8, 700, H * 0.036, p.trim, H * 0.006);

  // divider
  c.fillStyle = on; c.globalAlpha = .35;
  c.fillRect(W * 0.36, H * 0.705, W * 0.28, H * 0.004); c.globalAlpha = 1;

  netPill(c, W / 2, H * 0.79, L.net, p.cap, ink(p.cap), H * 0.036);

  c.font = `600 ${H * 0.021}px ${FONT}`; c.fillStyle = on; c.globalAlpha = .7;
  c.textAlign = "center";
  c.fillText("MADE IN MALAYSIA · HALAL", W / 2, H * 0.885);
  c.globalAlpha = 1;

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

/**
 * Cylindrical wrap label — bottles, tubes, pump bottles.
 * `opts.aspect` = circumference ÷ height of the surface it wraps,
 * so the artwork lands on the geometry without stretching.
 */
export function wrapTexture(spec, opts = {}) {
  const W = 2048;
  const H = Math.max(512, Math.min(2600, Math.round(W / (opts.aspect || 2))));
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const p = spec.palette, L = spec.label;
  const on = ink(p.body);

  // base
  const g = c.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, shade(p.body, -18));
  g.addColorStop(0.18, shade(p.body, 22));
  g.addColorStop(0.5, p.body);
  g.addColorStop(0.82, shade(p.body, 14));
  g.addColorStop(1, shade(p.body, -22));
  c.fillStyle = g; c.fillRect(0, 0, W, H);

  const rg = c.createRadialGradient(W * 0.5, H * 0.3, 0, W * 0.5, H * 0.3, W * 0.6);
  rg.addColorStop(0, "rgba(255,255,255,.20)"); rg.addColorStop(1, "rgba(255,255,255,0)");
  c.fillStyle = rg; c.fillRect(0, 0, W, H);

  // top accent band
  c.fillStyle = p.accent; c.fillRect(0, 0, W, H * 0.17);
  c.fillStyle = p.trim; c.fillRect(0, H * 0.17, W, H * 0.012);
  c.fillStyle = p.trim; c.globalAlpha = .9; c.fillRect(0, H * 0.86, W, H * 0.012); c.globalAlpha = 1;
  c.fillStyle = shade(p.body, -30); c.fillRect(0, H * 0.872, W, H * 0.128);

  // repeating brand marks around the band (visible from any angle)
  c.textBaseline = "alphabetic";
  for (let i = 0; i < 4; i++) {
    const x = W * 0.06 + i * (W * 0.25);
    c.font = `900 ${H * 0.085}px ${FONT}`; c.fillStyle = ink(p.accent); c.textAlign = "left";
    c.fillText("DXN", x, H * 0.118);
    const ww = c.measureText("DXN").width;
    mushroom(c, x + ww + H * 0.05, H * 0.088, H * 0.042, ink(p.accent));
  }

  // watermark motif
  c.save(); c.globalAlpha = .08;
  drawMotif(c, L.motif || "mushroom", W * 0.5, H * 0.52, H * 0.42, "#ffffff");
  c.restore();

  // main artwork, centred front
  c.textAlign = "center";
  drawMotif(c, L.motif || "mushroom", W * 0.5, H * 0.335, H * 0.155, on);
  centerText(c, L.name, W / 2, H * 0.545, W * 0.62, 900, H * 0.115, on);
  centerText(c, L.sub, W / 2, H * 0.615, W * 0.58, 700, H * 0.042, p.trim, H * 0.008);
  netPill(c, W / 2, H * 0.72, L.net, p.cap, ink(p.cap), H * 0.045);

  // side panels: small info repeated so it reads from any rotation
  [W * 0.09, W * 0.91].forEach(x => {
    c.textAlign = "center";
    c.font = `700 ${H * 0.028}px ${FONT}`; c.fillStyle = on; c.globalAlpha = .65;
    c.fillText(opts.sideText || "GANODERMA LUCIDUM", x, H * 0.46);
    c.font = `600 ${H * 0.022}px ${FONT}`;
    c.fillText("MADE IN MALAYSIA", x, H * 0.51);
    c.globalAlpha = 1;
  });

  c.textAlign = "center";
  c.font = `600 ${H * 0.026}px ${FONT}`; c.fillStyle = on; c.globalAlpha = .8;
  c.fillText("HALAL · KEEP IN A COOL DRY PLACE", W / 2, H * 0.945);
  c.globalAlpha = 1;

  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  t.wrapS = THREE.RepeatWrapping;
  return t;
}

/** Tiny sachet artwork — used for the loose sachet beside a coffee bag. 512×512 */
export function sachetTexture(spec) {
  const W = 512, H = 512;
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const p = spec.palette, L = spec.label;
  background(c, W, H, p.body, p.deep, p.trim);
  const on = ink(p.body);
  c.textAlign = "center"; c.textBaseline = "alphabetic";
  brandBar(c, W * 0.12, H * 0.10, W * 0.76, H * 0.09, p.accent, ink(p.accent));
  drawMotif(c, L.motif || "cup", W / 2, H * 0.42, W * 0.16, on);
  centerText(c, L.name, W / 2, H * 0.63, W * 0.82, 900, H * 0.075, on);
  centerText(c, L.sub, W / 2, H * 0.70, W * 0.78, 700, H * 0.035, p.trim, 2);
  netPill(c, W / 2, H * 0.82, "21g", p.cap, ink(p.cap), H * 0.038);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

/** Plain coloured cap / plastic material helper */
export function plastic(color, opts = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    roughness: opts.roughness ?? 0.32,
    metalness: opts.metalness ?? 0.0,
    clearcoat: opts.clearcoat ?? 0.6,
    clearcoatRoughness: 0.25,
    sheen: 0.2,
    ...opts.extra
  });
}
