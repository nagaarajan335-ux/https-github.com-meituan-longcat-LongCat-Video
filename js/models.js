/* ============================================================
   MODELS — procedural 3D product geometry
   ------------------------------------------------------------
   Every DXN product is built from Three.js primitives at runtime:
   cartons, foil pouches, capsule bottles, toothpaste tubes and
   pump bottles. Nothing to model, nothing to host.

   buildModel(product) -> THREE.Group   (already normalised:
   base sits on y = 0, centred on the origin, ~2.6 units tall)
   ============================================================ */

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { faceTexture, wrapTexture, sachetTexture, plastic } from "./labels.js";

/* ---------- shared helpers ---------- */
/** Corner smoothness for rounded boxes. Cards use fewer segments than the
    big hero viewer, so a page full of live products stays cheap to draw. */
let SEG = 3, CYL = 48;
const cache = new Map();               // texture cache keyed by product id + kind
const tex = (key, fn) => { if (!cache.has(key)) cache.set(key, fn()); return cache.get(key); };

/** Ellipse perimeter (Ramanujan) — used to keep wrap art undistorted. */
const perimeter = (a, b) => Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));

function matte(color, rough = 0.85) {
  return new THREE.MeshPhysicalMaterial({ color: new THREE.Color(color), roughness: rough, metalness: 0 });
}
function gloss(map, opts = {}) {
  return new THREE.MeshPhysicalMaterial({
    map,
    roughness: opts.roughness ?? 0.34,
    metalness: 0,
    clearcoat: opts.clearcoat ?? 0.75,
    clearcoatRoughness: opts.clearcoatRoughness ?? 0.18,
    envMapIntensity: 1.1
  });
}
function metal(color = "#c9ccd2", rough = 0.28) {
  return new THREE.MeshStandardMaterial({ color: new THREE.Color(color), metalness: 0.95, roughness: rough, envMapIntensity: 1.4 });
}

let _shadowTex = null;
/** Soft contact-shadow blob (procedural radial gradient on a plane). */
export function contactShadow(size = 2.6, opacity = 0.42) {
  if (_shadowTex) {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ map: _shadowTex, transparent: true, opacity, depthWrite: false, toneMapped: false })
    );
    m.rotation.x = -Math.PI / 2; m.position.y = 0.005; m.renderOrder = -1;
    return m;
  }
  const cv = document.createElement("canvas"); cv.width = cv.height = 256;
  const c = cv.getContext("2d");
  const g = c.createRadialGradient(128, 128, 4, 128, 128, 124);
  g.addColorStop(0, "rgba(0,0,0,0.95)");
  g.addColorStop(0.35, "rgba(0,0,0,0.5)");
  g.addColorStop(0.72, "rgba(0,0,0,0.12)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = g; c.fillRect(0, 0, 256, 256);
  const t = new THREE.CanvasTexture(cv);
  _shadowTex = t;
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ map: t, transparent: true, opacity, depthWrite: false, toneMapped: false })
  );
  m.rotation.x = -Math.PI / 2;
  m.position.y = 0.005;
  m.renderOrder = -1;
  return m;
}

/** A single loose sachet lying flat — used as set dressing. */
function sachet(spec, w = 0.92, h = 0.66) {
  const g = new THREE.Group();
  const map = tex(spec.id + ":sachet", () => sachetTexture(spec));
  const body = new THREE.Mesh(new RoundedBoxGeometry(w, 0.045, h, 2, 0.018), [
    matte(spec.palette.body, 0.6), matte(spec.palette.body, 0.6),
    matte(spec.palette.deep, 0.7), matte(spec.palette.deep, 0.7),
    gloss(map, { roughness: 0.42, clearcoat: 0.5 }), gloss(map, { roughness: 0.42, clearcoat: 0.5 })
  ]);
  g.add(body);
  // crimped ends
  const crimpMat = matte(spec.palette.deep, 0.9);
  [-1, 1].forEach(s => {
    const crimp = new THREE.Mesh(new RoundedBoxGeometry(w * 0.13, 0.038, h, 2, 0.012), crimpMat);
    crimp.position.set(s * (w / 2 + w * 0.055), 0, 0);
    g.add(crimp);
  });
  return g;
}

/* ============================================================
   FOIL POUCH  (coffee / cereal bags)
   ============================================================ */
function buildFoilBag(spec) {
  const g = new THREE.Group();
  const p = spec.palette;
  const W = 1.42, H = 2.18, D = 0.66;
  const map = tex(spec.id + ":face", () => faceTexture(spec));

  const sideMat = matte(p.body, 0.62);
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, SEG, 0.10), [
    sideMat, sideMat,
    matte(p.deep, 0.7), matte(p.deep, 0.75),
    gloss(map, { roughness: 0.44, clearcoat: 0.45 }),   // front — satin foil
    gloss(map, { roughness: 0.44, clearcoat: 0.45 })    // back
  ]);
  body.position.y = H / 2;
  g.add(body);

  // top crimp seal with serration
  const crimp = new THREE.Group();
  const crimpBase = new THREE.Mesh(new RoundedBoxGeometry(W * 1.02, 0.16, D * 0.62, 2, 0.03), matte(p.deep, 0.95));
  crimp.add(crimpBase);
  const teeth = 18;
  for (let i = 0; i < teeth; i++) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(W / teeth * 0.45, 0.165, D * 0.66), matte(p.body, 0.9));
    t.position.x = -W / 2 + (W / teeth) * (i + 0.5);
    crimp.add(t);
  }
  crimp.position.y = H + 0.075;
  g.add(crimp);

  // bottom gusset line
  const gusset = new THREE.Mesh(new RoundedBoxGeometry(W * 0.94, 0.06, D * 1.02, 2, 0.02), matte(p.deep, 0.8));
  gusset.position.y = 0.035; g.add(gusset);

  // side gusset creases
  [-1, 1].forEach(s => {
    const crease = new THREE.Mesh(new THREE.BoxGeometry(0.012, H * 0.9, D * 0.5), matte(p.deep, 0.9));
    crease.position.set(s * (W / 2 - 0.012), H / 2, 0);
    g.add(crease);
  });

  // dressing: two sachets in front
  const s1 = sachet(spec, 0.86, 0.60);
  s1.position.set(-0.62, 0.03, 0.62); s1.rotation.y = 0.42; g.add(s1);
  const s2 = sachet(spec, 0.86, 0.60);
  s2.position.set(0.58, 0.03, 0.5); s2.rotation.y = -0.3; g.add(s2);

  return g;
}

/* ============================================================
   CARTON BOX  (tea / chocolate / bundles)
   ============================================================ */
function buildSachetBox(spec) {
  const g = new THREE.Group();
  const p = spec.palette;
  const W = 1.52, H = 2.22, D = 0.80;
  const map = tex(spec.id + ":face", () => faceTexture(spec));

  const sideMat = matte(p.deep, 0.7);
  const body = new THREE.Mesh(new RoundedBoxGeometry(W, H, D, SEG, 0.055), [
    sideMat, sideMat,
    matte(p.cap, 0.72), matte(p.deep, 0.8),
    gloss(map, { roughness: 0.52, clearcoat: 0.22 }),   // matte-print carton
    gloss(map, { roughness: 0.52, clearcoat: 0.22 })
  ]);
  body.position.y = H / 2; g.add(body);

  // top lid seam
  const seam = new THREE.Mesh(new THREE.BoxGeometry(W * 1.005, 0.014, D * 1.005), matte(p.trim, 0.5));
  seam.position.y = H - 0.30; g.add(seam);
  // lid panel
  const lid = new THREE.Mesh(new RoundedBoxGeometry(W * 0.98, 0.30, D * 0.98, SEG - 1, 0.05), matte(p.cap, 0.66));
  lid.position.y = H - 0.14; g.add(lid);

  // dressing: a couple of sachets leaning at the base
  const s1 = sachet(spec, 0.8, 0.56);
  s1.position.set(-0.72, 0.03, 0.44); s1.rotation.set(0, 0.55, 0.06); g.add(s1);
  const s2 = sachet(spec, 0.8, 0.56);
  s2.position.set(0.66, 0.30, 0.42); s2.rotation.set(-0.34, -0.42, 0.9); g.add(s2);

  return g;
}

/* ============================================================
   CAPSULE / TABLET BOTTLE
   ============================================================ */
function buildBottle(spec) {
  const g = new THREE.Group();
  const p = spec.palette;
  const R = 0.66, H = Math.PI * R;                 // exact 2:1 wrap aspect
  const C = 2 * Math.PI * R;
  const map = tex(spec.id + ":wrap", () => wrapTexture(spec, { aspect: C / H }));

  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.985, H, CYL, 1, true), gloss(map));
  body.material.side = THREE.FrontSide;
  body.position.y = H / 2 + 0.06; g.add(body);

  // base + top discs so the cylinder is closed
  const discMat = matte(p.deep, 0.6);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.985, R * 0.93, 0.07, CYL), discMat);
  base.position.y = 0.035; g.add(base);
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.46, R, 0.22, CYL), matte(p.body, 0.42));
  shoulder.position.y = H + 0.06 + 0.11; g.add(shoulder);

  // neck
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.44, R * 0.46, 0.16, 48), matte(p.deep, 0.5));
  neck.position.y = H + 0.06 + 0.28; g.add(neck);

  // tamper ring
  const ring = new THREE.Mesh(new THREE.TorusGeometry(R * 0.455, 0.028, 12, 56), plastic(p.accent, { roughness: 0.4 }));
  ring.rotation.x = Math.PI / 2; ring.position.y = H + 0.06 + 0.22; g.add(ring);

  // screw cap with ribs
  const capG = new THREE.Group();
  const capR = R * 0.50, capH = 0.44;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(capR, capR, capH, 56), plastic(p.cap, { roughness: 0.28, clearcoat: 0.8 }));
  capG.add(cap);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(capR * 0.96, capR, 0.06, 56), plastic(p.cap, { roughness: 0.25 }));
  top.position.y = capH / 2 + 0.02; capG.add(top);
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.026, capH * 0.86, 0.05), plastic(p.cap, { roughness: 0.35 }));
    rib.position.set(Math.cos(a) * (capR + 0.004), 0, Math.sin(a) * (capR + 0.004));
    rib.rotation.y = -a;
    capG.add(rib);
  }
  capG.position.y = H + 0.06 + 0.36 + capH / 2 - 0.06;
  g.add(capG);

  return g;
}

/* ============================================================
   TOOTHPASTE TUBE
   ============================================================ */
function buildTube(spec) {
  const g = new THREE.Group();
  const p = spec.palette;
  const Rx = 0.48, Rz = Rx * 0.60, H = 2.05;
  const C = perimeter(Rx, Rz);
  const map = tex(spec.id + ":wrap", () => wrapTexture(spec, { aspect: C / H }));

  // tapered oval body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(Rx * 0.86, Rx, H, CYL, 1, true),
    gloss(map, { roughness: 0.3, clearcoat: 0.85 })
  );
  body.scale.z = Rz / Rx;
  body.position.y = H / 2 + 0.10;
  g.add(body);

  // rounded top (shoulder toward the nozzle)
  const shoulder = new THREE.Mesh(new THREE.SphereGeometry(Rx * 0.86, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), plastic(p.body, { roughness: 0.3 }));
  shoulder.scale.set(1, 0.42, Rz / Rx);
  shoulder.position.y = H + 0.10; g.add(shoulder);

  // nozzle + screw cap
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(Rx * 0.30, Rx * 0.36, 0.16, 40), plastic(p.deep, { roughness: 0.4 }));
  nozzle.position.y = H + 0.10 + 0.20; g.add(nozzle);
  const capR = Rx * 0.44, capH = 0.40;
  const cap = new THREE.Group();
  const capBody = new THREE.Mesh(new THREE.CylinderGeometry(capR, capR * 0.96, capH, 44), plastic(p.cap, { roughness: 0.22, clearcoat: 0.9 }));
  cap.add(capBody);
  const capTop = new THREE.Mesh(new THREE.SphereGeometry(capR, 40, 20, 0, Math.PI * 2, 0, Math.PI / 2), plastic(p.cap, { roughness: 0.2 }));
  capTop.scale.y = 0.5; capTop.position.y = capH / 2; cap.add(capTop);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2;
    const rib = new THREE.Mesh(new THREE.BoxGeometry(0.022, capH * 0.7, 0.04), plastic(p.cap, { roughness: 0.35 }));
    rib.position.set(Math.cos(a) * (capR + 0.003), -capH * 0.05, Math.sin(a) * (capR + 0.003));
    rib.rotation.y = -a; cap.add(rib);
  }
  cap.scale.z = Rz / Rx * 1.06;
  cap.position.y = H + 0.10 + 0.26 + capH / 2 - 0.05;
  g.add(cap);

  // crimped flat bottom seal
  const crimp = new THREE.Mesh(new RoundedBoxGeometry(Rx * 2.0, 0.13, Rz * 1.75, 2, 0.03), matte(p.deep, 0.85));
  crimp.position.y = 0.07; g.add(crimp);
  for (let i = 0; i < 11; i++) {
    const t = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.135, Rz * 1.8), matte(p.body, 0.9));
    t.position.set(-Rx * 0.9 + i * (Rx * 0.18), 0.07, 0); g.add(t);
  }
  // hanging hole
  const hole = new THREE.Mesh(new THREE.RingGeometry(0.055, 0.085, 24), matte("#2a2a2e", 0.9));
  hole.rotation.x = -Math.PI / 2 + 0.001; hole.position.y = 0.138; g.add(hole);

  return g;
}

/* ============================================================
   PUMP BOTTLE  (shampoo / body wash)
   ============================================================ */
function buildPumpBottle(spec) {
  const g = new THREE.Group();
  const p = spec.palette;
  const R = 0.62, H = Math.PI * R;
  const C = 2 * Math.PI * R;
  const map = tex(spec.id + ":wrap", () => wrapTexture(spec, { aspect: C / H }));

  const body = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 0.96, H, CYL, 1, true), gloss(map, { roughness: 0.18, clearcoat: 1.0 }));
  body.position.y = H / 2 + 0.07; g.add(body);

  const base = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.96, R * 0.90, 0.07, CYL), matte(p.deep, 0.55));
  base.position.y = 0.035; g.add(base);

  // shoulder
  const shoulder = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.40, R, 0.30, CYL), gloss(map, { roughness: 0.2 }));
  shoulder.position.y = H + 0.07 + 0.15; g.add(shoulder);

  // collar (metallic)
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(R * 0.40, R * 0.42, 0.20, 48), metal("#d6d9de", 0.22));
  collar.position.y = H + 0.07 + 0.39; g.add(collar);
  const collarRing = new THREE.Mesh(new THREE.TorusGeometry(R * 0.415, 0.022, 12, 48), metal("#b9bec6", 0.3));
  collarRing.rotation.x = Math.PI / 2; collarRing.position.y = H + 0.07 + 0.31; g.add(collarRing);

  // pump stem + head + nozzle
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.42, 24), metal("#c3c7ce", 0.25));
  stem.position.y = H + 0.07 + 0.68; g.add(stem);
  const head = new THREE.Mesh(new RoundedBoxGeometry(0.30, 0.20, 0.42, SEG - 1, 0.07), plastic(p.cap, { roughness: 0.25, clearcoat: 0.9 }));
  head.position.set(0, H + 0.07 + 0.93, 0.06); g.add(head);
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, 0.34, 24), plastic(p.cap, { roughness: 0.25 }));
  nozzle.rotation.x = Math.PI / 2;
  nozzle.position.set(0, H + 0.07 + 0.88, 0.36); g.add(nozzle);
  const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.055, 0.06, 20), metal("#9aa0a8", 0.3));
  tip.rotation.x = Math.PI / 2; tip.position.set(0, H + 0.07 + 0.88, 0.54); g.add(tip);

  return g;
}

/* ============================================================
   PUBLIC API
   ============================================================ */
const BUILDERS = {
  foilbag: buildFoilBag,
  sachetbox: buildSachetBox,
  bottle: buildBottle,
  tube: buildTube,
  pumpbottle: buildPumpBottle
};

/**
 * Build + normalise a product model.
 * The returned group has its base on y=0 and is centred on x/z.
 */
export function buildModel(product, { scaleTo = 2.6, quality = "card" } = {}) {
  SEG = quality === "high" ? 5 : quality === "low" ? 2 : 3;
  CYL = quality === "high" ? 72 : quality === "low" ? 32 : 48;
  const spec = { id: product.id, palette: product.model.palette, label: product.model.label };
  const fn = BUILDERS[product.model.type] || buildSachetBox;
  const g = fn(spec);
  g.name = product.id;

  // enable shadows + normalise
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = false; } });

  const box = new THREE.Box3().setFromObject(g);
  const size = new THREE.Vector3(); box.getSize(size);
  const center = new THREE.Vector3(); box.getCenter(center);
  const k = scaleTo / Math.max(size.y, 0.001);
  g.scale.setScalar(k);
  g.position.set(-center.x * k, -box.min.y * k, -center.z * k);

  // wrap so the caller can rotate the pivot cleanly
  const pivot = new THREE.Group();
  pivot.add(g);
  pivot.userData.height = size.y * k;
  pivot.userData.width = size.x * k;
  pivot.userData.depth = size.z * k;
  pivot.userData.kind = product.model.type;
  return pivot;
}

/** Loose capsules for hero decoration */
export function capsuleScatter(count = 7, colors = ["#C8A24A", "#8C0E13", "#0E7A5F"]) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const col = colors[i % colors.length];
    const cap = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.16, 8, 20),
      new THREE.MeshPhysicalMaterial({ color: new THREE.Color(col), roughness: 0.22, clearcoat: 1, transmission: 0.12 }));
    const a = Math.random() * Math.PI * 2, r = 0.9 + Math.random() * 1.1;
    cap.position.set(Math.cos(a) * r, 0.09 + Math.random() * 0.02, Math.sin(a) * r * 0.75);
    cap.rotation.set(Math.PI / 2 * Math.random(), Math.random() * Math.PI, Math.random() * Math.PI);
    cap.castShadow = true;
    g.add(cap);
  }
  return g;
}

/** A ganoderma mushroom prop for the hero stage */
export function mushroomProp(scale = 1, capColor = "#8C2A16", stemColor = "#E8DCC6") {
  const g = new THREE.Group();
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.16, 0.72, 24),
    new THREE.MeshPhysicalMaterial({ color: new THREE.Color(stemColor), roughness: 0.72 }));
  stem.position.y = 0.36; g.add(stem);
  const cap = new THREE.Mesh(new THREE.SphereGeometry(0.42, 40, 24, 0, Math.PI * 2, 0, Math.PI * 0.52),
    new THREE.MeshPhysicalMaterial({ color: new THREE.Color(capColor), roughness: 0.34, clearcoat: 0.85 }));
  cap.scale.y = 0.46; cap.position.y = 0.70; g.add(cap);
  const under = new THREE.Mesh(new THREE.CircleGeometry(0.42, 40),
    new THREE.MeshStandardMaterial({ color: new THREE.Color("#D8C9A8"), roughness: 0.9, side: THREE.DoubleSide }));
  under.rotation.x = Math.PI / 2; under.position.y = 0.70; g.add(under);
  g.scale.setScalar(scale);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
