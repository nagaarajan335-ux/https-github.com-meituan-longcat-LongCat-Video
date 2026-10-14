/* ============================================================
   STAGE — the 3D rendering engine
   ------------------------------------------------------------
   Two modes:

   1. Gallery  – ONE hidden WebGL canvas for the whole page.
                 Every product card registers a DOM placeholder;
                 the renderer draws each product into the matching
                 screen rectangle using scissor clipping.
                 => 40 live 3D products cost 1 WebGL context.

   2. Viewer   – a dedicated scene for a product page: real shadow
                 maps, studio environment, OrbitControls, hotspots.
   ============================================================ */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { buildModel, contactShadow, mushroomProp, capsuleScatter } from "./models.js";
import { STORE_CONFIG } from "./config.js";

const CFG = STORE_CONFIG || {};
const MAX_DPR = (() => {
  const pr = CFG.render?.pixelRatio;
  if (pr === "low") return 1;
  if (pr === "high") return 3;
  return Math.min(window.devicePixelRatio || 1, 2);
})();

/* ---------- one shared studio environment (PBR reflections) ---------- */
let _env = null, _envRenderer = null;
function studioEnvironment(renderer) {
  if (_env && _envRenderer === renderer) return _env;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  _env = pmrem.fromScene(new RoomEnvironment(), 0.035).texture;
  pmrem.dispose();
  _envRenderer = renderer;
  return _env;
}

function supportsWebGL() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl") || c.getContext("experimental-webgl"));
  } catch { return false; }
}

/* THREE.Clock is deprecated from r165+; a tiny timestamp delta is all we need. */
class Delta {
  constructor() { this.last = performance.now(); }
  get() { const now = performance.now(); const d = (now - this.last) / 1000; this.last = now; return Math.min(d, 0.05); }
}

/* Frame a camera so `box` fits with padding, whatever the aspect. */
function fitCamera(camera, box, padding = 1.22) {
  const size = new THREE.Vector3(); box.getSize(size);
  const center = new THREE.Vector3(); box.getCenter(center);
  const fov = (camera.fov * Math.PI) / 180;
  const aspect = camera.aspect || 1;
  const distV = (size.y / 2) / Math.tan(fov / 2);
  const hFov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
  const distH = (size.x / 2) / Math.tan(hFov / 2);
  const distD = (size.z / 2) / Math.tan(hFov / 2);
  const dist = Math.max(distV, distH, distD) * padding;
  return { center, dist };
}

/* ============================================================
   GALLERY — one overlay canvas, many products
   ============================================================ */
export class Gallery {
  constructor(opts = {}) {
    this.views = [];
    this.running = false;
    this.enabled = supportsWebGL();
    this.canvasZ = opts.z ?? 5;
    this.topOffset = opts.topOffset ?? 0;      // keep clear of a sticky header
    this.clock = new Delta();
    this.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!this.enabled) return;

    this.renderer = new THREE.WebGLRenderer({
      antialias: CFG.render?.antialias !== false,
      alpha: true,
      powerPreference: "high-performance"
    });
    this.renderer.setPixelRatio(MAX_DPR);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setClearColor(0x000000, 0);

    const cv = this.renderer.domElement;
    cv.style.cssText = `position:fixed;left:0;top:0;width:100%;height:100%;pointer-events:none;z-index:${this.canvasZ};`;
    cv.setAttribute("aria-hidden", "true");
    document.body.appendChild(cv);
    this.canvas = cv;
    this.env = studioEnvironment(this.renderer);

    this._onResize = () => this.resize();
    window.addEventListener("resize", this._onResize, { passive: true });
    window.addEventListener("scroll", () => { this._needsFrame = true; }, { passive: true });
    this.resize();
  }

  resize() {
    if (!this.enabled) return;
    const w = window.innerWidth, h = window.innerHeight;
    this.renderer.setSize(w, h, false);
    this._needsFrame = true;
  }

  /**
   * Mount a live product into a DOM element.
   * el must be position:relative (it only supplies a rectangle).
   */
  add(el, product, opts = {}) {
    if (!this.enabled || !el) return null;
    const scene = new THREE.Scene();
    scene.environment = this.env;

    const pivot = buildModel(product, { scaleTo: 2.6 });
    scene.add(pivot);

    const shadow = contactShadow(3.1, opts.shadowOpacity ?? 0.34);
    scene.add(shadow);

    // pedestal glow disc
    if (opts.pedestal !== false) {
      const disc = new THREE.Mesh(
        new THREE.CircleGeometry(1.55, 64),
        new THREE.MeshBasicMaterial({ color: new THREE.Color(opts.pedestalColor || "#ffffff"), transparent: true, opacity: 0.0, depthWrite: false })
      );
      disc.rotation.x = -Math.PI / 2; disc.position.y = 0.001;
      scene.add(disc);
    }

    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(3.4, 5.2, 4.0); scene.add(key);
    const fill = new THREE.DirectionalLight(0xdfe8ff, 0.85);
    fill.position.set(-4.2, 2.0, -2.6); scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffe6c9, 1.1);
    rim.position.set(-1.6, 3.0, -4.4); scene.add(rim);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8d8272, 0.55));

    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60);
    const box = new THREE.Box3().setFromObject(pivot);
    const { center, dist } = fitCamera(camera, box, opts.padding ?? 1.30);
    camera.position.set(center.x + dist * 0.42, center.y + dist * 0.16, dist);
    camera.lookAt(center);

    const view = {
      el, scene, camera, pivot, shadow,
      spin: this.reduce ? 0 : (opts.spin ?? 0.30),
      vel: 0,
      tiltX: 0, tiltTargetX: 0,
      hover: 0, hoverTarget: 0,
      dragging: false,
      baseDist: dist,
      center,
      visible: false,
      entered: false
    };

    /* pointer interaction (the overlay canvas ignores events, so we
       listen on the placeholder itself) */
    let lastX = 0, lastY = 0, pid = null;
    el.style.touchAction = "pan-y";
    el.addEventListener("pointerdown", (e) => {
      pid = e.pointerId; view.dragging = true; lastX = e.clientX; lastY = e.clientY;
      try { el.setPointerCapture(pid); } catch {}
      el.classList.add("is-dragging");
    });
    el.addEventListener("pointermove", (e) => {
      if (!view.dragging) {
        const r = el.getBoundingClientRect();
        view.tiltTargetX = ((e.clientY - r.top) / r.height - 0.5) * -0.22;
        return;
      }
      const dx = e.clientX - lastX, dy = e.clientY - lastY;
      lastX = e.clientX; lastY = e.clientY;
      view.vel = dx * 0.012;
      view.pivot.rotation.y += dx * 0.012;
      view.tiltTargetX = THREE.MathUtils.clamp(view.tiltTargetX + dy * 0.0016, -0.34, 0.34);
    });
    const end = (e) => {
      if (!view.dragging) return;
      view.dragging = false;
      el.classList.remove("is-dragging");
      try { el.releasePointerCapture(pid); } catch {}
    };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
    el.addEventListener("pointerleave", () => { view.hoverTarget = 0; view.tiltTargetX = 0; });
    el.addEventListener("pointerenter", () => { view.hoverTarget = 1; });

    this.views.push(view);
    this.start();
    return view;
  }

  start() {
    if (this.running || !this.enabled) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.frame();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { this.running = false; }
      else if (!this.running) { this.clock.last = performance.now(); this.start(); }
    });
  }

  stop() { this.running = false; }

  /** Release every mounted view (used when a filtered list re-renders). */
  clear() {
    for (const v of this.views) {
      v.scene.traverse(o => {
        if (o.isMesh) {
          o.geometry?.dispose();
          if (Array.isArray(o.material)) o.material.forEach(m => m.dispose());
          else o.material?.dispose();
        }
      });
      v.scene.clear();
      v.el.dataset.mounted = "";
    }
    this.views.length = 0;
  }

  frame() {
    if (!this.enabled) return;
    const dt = this.clock.get();
    const W = window.innerWidth, H = window.innerHeight;
    this.renderer.setScissorTest(true);
    let drew = false;

    for (const v of this.views) {
      const r = v.el.getBoundingClientRect();
      const bottom = r.bottom, top = Math.max(r.top, this.topOffset);
      const onScreen = r.width > 4 && r.height > 4 && bottom > top && bottom > 0 && top < H;
      v.visible = onScreen;
      if (!onScreen) continue;

      // reveal animation the first time it scrolls into view
      if (!v.entered) { v.entered = true; v.pivot.scale.setScalar(0.001); }

      // motion
      if (!v.dragging) {
        v.pivot.rotation.y += v.spin * dt + v.vel;
        v.vel *= 0.90;
        if (Math.abs(v.vel) < 0.0002) v.vel = 0;
      }
      v.hover += (v.hoverTarget - v.hover) * Math.min(1, dt * 8);
      v.tiltX += (v.tiltTargetX - v.tiltX) * Math.min(1, dt * 7);
      v.pivot.rotation.x = v.tiltX;

      const target = 1 + v.hover * 0.055;
      const s = v.pivot.scale.x + (target - v.pivot.scale.x) * Math.min(1, dt * 6);
      v.pivot.scale.setScalar(s);
      v.pivot.position.y = this.reduce ? 0 : Math.sin(performance.now() * 0.0011 + v.center.x) * 0.035 * (0.4 + v.hover);

      v.camera.fov = 32 - v.hover * 2.0;
      v.camera.updateProjectionMatrix();

      // draw
      const x = r.left, y = top;
      const w = r.width, h = bottom - top;
      const dpr = MAX_DPR;
      this.renderer.setViewport(x, H - y - h, w, h);
      this.renderer.setScissor(x, H - y - h, w, h);
      v.camera.aspect = w / h;
      void dpr;
      this.renderer.render(v.scene, v.camera);
      drew = true;
    }

    if (!drew) { this.renderer.setScissorTest(false); }
  }

  dispose() {
    this.running = false;
    if (!this.enabled) return;
    window.removeEventListener("resize", this._onResize);
    this.renderer.dispose();
    this.canvas?.remove();
  }
}

/* ============================================================
   VIEWER — one big interactive product scene
   ============================================================ */
export class Viewer {
  constructor(el, opts = {}) {
    this.el = el;
    this.opts = opts;
    this.enabled = supportsWebGL();
    if (!this.enabled) { el.classList.add("no-webgl"); return; }

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(MAX_DPR);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = opts.exposure ?? 1.08;
    if (CFG.render?.shadows !== false) {
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    el.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.cssText = "width:100%;height:100%;display:block;touch-action:pan-y;";

    this.scene = new THREE.Scene();
    this.env = studioEnvironment(this.renderer);
    this.scene.environment = this.env;

    this.camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    this.camera.position.set(3.1, 2.3, 6.4);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.065;
    this.controls.enablePan = false;
    this.controls.minDistance = 3.4;
    this.controls.maxDistance = 11;
    this.controls.minPolarAngle = 0.32;
    this.controls.maxPolarAngle = Math.PI * 0.52;
    this.controls.autoRotate = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.controls.autoRotateSpeed = opts.autoRotateSpeed ?? 1.15;
    this.controls.target.set(0, 1.25, 0);

    /* --- lights --- */
    const key = new THREE.DirectionalLight(0xffffff, 2.35);
    key.position.set(4.5, 7.5, 5.0);
    if (this.renderer.shadowMap.enabled) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.camera.near = 1; key.shadow.camera.far = 22;
      key.shadow.camera.left = -5; key.shadow.camera.right = 5;
      key.shadow.camera.top = 6; key.shadow.camera.bottom = -2;
      key.shadow.bias = -0.0012;
      key.shadow.radius = 4;
    }
    this.scene.add(key);
    const fill = new THREE.DirectionalLight(0xdce6ff, 1.0); fill.position.set(-6, 3, -3); this.scene.add(fill);
    const rim = new THREE.SpotLight(0xffd9b0, 26, 22, 0.7, 0.6, 1.6); rim.position.set(-3.4, 5.4, -5.2); this.scene.add(rim);
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9a8f7d, 0.6));

    /* --- studio floor --- */
    this.floorGroup = new THREE.Group();
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(9, 72),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(opts.floorColor || "#e9e4dc"), roughness: 0.42, metalness: 0.05 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = this.renderer.shadowMap.enabled;
    this.floorGroup.add(floor);

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(2.0, 4.4, 72),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(opts.accent || "#d6161c"), transparent: true, opacity: 0.10, side: THREE.DoubleSide, depthWrite: false })
    );
    halo.rotation.x = -Math.PI / 2; halo.position.y = 0.004;
    this.floorGroup.add(halo);
    this.scene.add(this.floorGroup);

    /* --- backdrop gradient (drawn in CSS behind the canvas) --- */
    this.product = null;
    this.props = new THREE.Group();
    this.scene.add(this.props);

    this.clock = new Delta();
    this._loop = this._loop.bind(this);
    this._resizeObs = new ResizeObserver(() => this.resize());
    this._resizeObs.observe(el);
    this.resize();
    this._loop();
    document.addEventListener("visibilitychange", () => { if (!document.hidden) this.clock.get(); });
  }

  resize() {
    if (!this.enabled) return;
    const w = this.el.clientWidth || 1, h = this.el.clientHeight || 1;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  /** Load a product (replaces any previous one). */
  load(product, opts = {}) {
    if (!this.enabled) return;
    if (this.product) {
      this.scene.remove(this.product);
      this.product.traverse(o => {
        if (o.isMesh) { o.geometry?.dispose(); if (Array.isArray(o.material)) o.material.forEach(m => m.dispose()); else o.material?.dispose(); }
      });
    }
    const pivot = buildModel(product, { scaleTo: opts.scaleTo ?? 2.9, quality: "high" });
    // entrance animation
    pivot.scale.setScalar(0.001);
    pivot.userData._targetScale = 1;
    this.scene.add(pivot);
    this.product = pivot;

    const box = new THREE.Box3().setFromObject(pivot);
    const { center } = fitCamera(this.camera, box, 1.15);
    this.controls.target.copy(center);

    // dressing props
    this.props.clear();
    if (opts.props !== false) {
      const m = mushroomProp(0.85);
      m.position.set(-2.15, 0, -0.5); m.rotation.y = 0.6; this.props.add(m);
      const m2 = mushroomProp(0.55, "#B03A1C");
      m2.position.set(-1.62, 0, -1.35); m2.rotation.y = -0.3; this.props.add(m2);
      this.props.add(capsuleScatter(6));
    }
  }

  setAutoRotate(on) { if (this.controls) this.controls.autoRotate = !!on; }

  /** Snap to a preset angle */
  preset(name) {
    if (!this.enabled) return;
    const t = this.controls.target;
    const map = {
      front: [0, t.y + 0.15, 7.0],
      three: [3.4, t.y + 1.1, 6.0],
      top:   [0.4, t.y + 6.2, 3.0],
      side:  [7.0, t.y + 0.2, 0.3],
      label: [-3.2, t.y + 0.6, 6.0]
    };
    const p = map[name] || map.three;
    this._camTarget = new THREE.Vector3(p[0], p[1], p[2]);
  }

  zoomBy(f) {
    if (!this.enabled) return;
    const dir = this.camera.position.clone().sub(this.controls.target);
    const len = THREE.MathUtils.clamp(dir.length() * f, this.controls.minDistance, this.controls.maxDistance);
    this.camera.position.copy(this.controls.target).add(dir.setLength(len));
  }

  reset() { this.preset("three"); this.setAutoRotate(true); }

  _loop() {
    if (!this.enabled) return;
    requestAnimationFrame(this._loop);
    if (document.hidden) return;
    const dt = this.clock.get();

    if (this.product) {
      const s = this.product.scale.x + (this.product.userData._targetScale - this.product.scale.x) * Math.min(1, dt * 5.5);
      this.product.scale.setScalar(s);
      if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        this.product.position.y = Math.sin(performance.now() * 0.0009) * 0.03;
    }
    if (this._camTarget) {
      this.camera.position.lerp(this._camTarget, Math.min(1, dt * 4));
      if (this.camera.position.distanceTo(this._camTarget) < 0.02) this._camTarget = null;
    }
    this.props.rotation.y += dt * 0.05;
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    if (!this.enabled) return;
    this._resizeObs?.disconnect();
    this.controls?.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}

export { supportsWebGL };
