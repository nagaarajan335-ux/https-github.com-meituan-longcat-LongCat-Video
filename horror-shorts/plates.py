#!/usr/bin/env python3
"""
Procedural horror plates (analog / archival graphic style) for episodes 3-5.
Cohesive with the AI plates: high contrast, cold grades, bloom, heavy grain.
Run:  .venv/bin/python horror-shorts/plates.py
"""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance

W, H = 1080, 1920
OUT = "horror-shorts/assets/"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
rng = np.random.default_rng(11)


def vgrad(stops):
    ys = np.linspace(0, 1, H)
    arr = np.zeros((H, 3))
    for i in range(len(stops) - 1):
        p0, c0 = stops[i]; p1, c1 = stops[i + 1]
        m = (ys >= p0) & (ys <= p1 + 1e-9)
        t = np.clip((ys - p0) / max(1e-6, p1 - p0), 0, 1)[m][:, None]
        arr[m] = np.array(c0) * (1 - t) + np.array(c1) * t
    return Image.fromarray(np.repeat(arr[:, None, :], W, axis=1).astype(np.uint8))


def glow(im, cx, cy, rx, ry, color, alpha=1.0, blur=None):
    lay = Image.new("L", (W, H), 0)
    ImageDraw.Draw(lay).ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=int(255 * alpha))
    lay = lay.filter(ImageFilter.GaussianBlur(blur or max(8, rx * 0.6)))
    return Image.composite(Image.new("RGB", (W, H), color), im, lay)


def grain(im, amt=15, seed=1):
    a = np.asarray(im).astype(np.int16)
    n = np.random.default_rng(seed).normal(0, amt, a.shape[:2])[..., None]
    return Image.fromarray(np.clip(a + n, 0, 255).astype(np.uint8))


def vignette(im, s=0.85):
    yy, xx = np.mgrid[0:H, 0:W]
    r = np.sqrt(((xx - W / 2) / (W * 0.78)) ** 2 + ((yy - H / 2) / (H * 0.72)) ** 2)
    m = np.clip(1 - s * np.clip(r - 0.30, 0, 1) ** 1.4, 0, 1)[..., None]
    return Image.fromarray((np.asarray(im).astype(np.float32) * m).astype(np.uint8))


def scanlines(im, alpha=0.10, step=4):
    a = np.asarray(im).astype(np.float32)
    a[::step] *= (1 - alpha)
    return Image.fromarray(a.astype(np.uint8))


def person(d, cx, top, h, lw=None, arms="down"):
    lw = lw or max(6, int(h * 0.055))
    hr = h * 0.078
    d.ellipse([cx - hr, top, cx + hr, top + 2 * hr], fill="black")
    d.polygon([(cx - h * 0.11, top + 2 * hr), (cx + h * 0.11, top + 2 * hr),
               (cx + h * 0.085, top + h * 0.52), (cx - h * 0.085, top + h * 0.52)], fill="black")
    d.line([cx - h * 0.045, top + h * 0.5, cx - h * 0.06, top + h], fill="black", width=lw)
    d.line([cx + h * 0.045, top + h * 0.5, cx + h * 0.06, top + h], fill="black", width=lw)
    if arms == "down":
        d.line([cx - h * 0.10, top + 2.3 * hr, cx - h * 0.15, top + h * 0.52], fill="black", width=int(lw * 0.8))
        d.line([cx + h * 0.10, top + 2.3 * hr, cx + h * 0.15, top + h * 0.52], fill="black", width=int(lw * 0.8))
    else:  # out
        d.line([cx - h * 0.10, top + 2.3 * hr, cx - h * 0.30, top + h * 0.40], fill="black", width=int(lw * 0.8))
        d.line([cx + h * 0.10, top + 2.3 * hr, cx + h * 0.30, top + h * 0.40], fill="black", width=int(lw * 0.8))


def snow(im, n=2600, seed=5, alpha=160):
    lay = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(lay)
    r = np.random.default_rng(seed)
    for _ in range(n):
        x, y = r.integers(0, W), r.integers(0, H)
        s = r.integers(1, 4)
        d.ellipse([x, y, x + s, y + s], fill=int(r.integers(60, alpha)))
    lay = lay.filter(ImageFilter.GaussianBlur(0.7))
    return Image.composite(Image.new("RGB", (W, H), (235, 240, 245)), im, lay)


def scratches(im, n=26, seed=9):
    a = np.asarray(im).astype(np.int16)
    r = np.random.default_rng(seed)
    for _ in range(n):
        x = r.integers(0, W); w = r.integers(1, 3); v = r.integers(-70, 90)
        a[:, x:x + w] = np.clip(a[:, x:x + w] + v, 0, 255)
    for _ in range(140):
        x, y = r.integers(0, W), r.integers(0, H); s = r.integers(2, 7)
        a[y:y + s, x:x + s] = np.clip(a[y:y + s, x:x + s] + r.integers(40, 120), 0, 255)
    return Image.fromarray(a.astype(np.uint8))


# ---------------------------------------------------------------- 3: insomnia
def p_insomnia():
    im = vgrad([(0, (4, 5, 8)), (0.55, (7, 8, 12)), (1, (2, 2, 3))])
    d = ImageDraw.Draw(im)
    # blind stripes of moonlight
    for i in range(9):
        y = 180 + i * 90
        d.polygon([(700, y), (1080, y - 60), (1080, y - 20), (700, y + 40)], fill=(16, 20, 30))
    # nightstand + clock body
    d.rectangle([120, 1180, 700, 1240], fill=(10, 10, 12))
    d.rectangle([170, 1240, 660, 1600], fill=(7, 7, 9))
    d.rounded_rectangle([250, 1300, 590, 1470], radius=26, fill=(3, 3, 4))
    im = glow(im, 420, 1385, 260, 150, (255, 26, 26), 0.55, blur=90)
    f = ImageFont.truetype(FONT_B, 150)
    d = ImageDraw.Draw(im)
    d.text((420, 1385), "3:33", font=f, fill=(255, 40, 40), anchor="mm")
    d.text((422, 1387), "3:33", font=f, fill=(255, 90, 90), anchor="mm")
    # reflection on floor
    ref = im.crop([200, 1290, 640, 1480]).transpose(Image.FLIP_TOP_BOTTOM)
    ref = ref.filter(ImageFilter.GaussianBlur(6)).point(lambda p: p * 0.35)
    im.paste(ref, (220, 1660))
    return vignette(grain(scanlines(im, 0.05), 16, 21), 0.9)


# ---------------------------------------------------------------- 3: the drop
def p_drop():
    im = vgrad([(0, (10, 16, 30)), (0.35, (5, 8, 16)), (1, (0, 0, 0))])
    im = glow(im, 540, 260, 210, 130, (150, 180, 230), 0.5, blur=110)
    d = ImageDraw.Draw(im)
    d.rectangle([470, 230, 620, 300], fill=(18, 22, 34))          # far bed
    d.rectangle([470, 230, 620, 258], fill=(60, 70, 95))
    # speed streaks
    lay = Image.new("L", (W, H), 0); dl = ImageDraw.Draw(lay)
    for _ in range(70):
        x = int(rng.integers(0, W)); y = int(rng.integers(300, H)); ln = int(rng.integers(120, 500))
        dl.line([x, y, x, y + ln], fill=int(rng.integers(8, 42)), width=int(rng.integers(1, 3)))
    im = Image.composite(Image.new("RGB", (W, H), (140, 170, 220)), im, lay.filter(ImageFilter.GaussianBlur(1.2)))
    # falling silhouette, slightly rotated
    sil = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ds = ImageDraw.Draw(sil)
    person(ds, 540, 900, 620, arms="out")
    sil = sil.rotate(-14, center=(540, 1200))
    im.paste(Image.new("RGB", (W, H), (0, 0, 0)), (0, 0), sil.split()[3])
    return vignette(grain(im, 15, 22), 0.8)


# ---------------------------------------------------------------- 4: tent night
def _tent_scene(archival=False):
    sky = (26, 30, 40) if not archival else (150, 142, 128)
    gnd = (150, 158, 168) if not archival else (196, 188, 172)
    im = vgrad([(0, (4, 6, 10)), (0.45, sky), (0.62, (60, 66, 78)), (1, (10, 12, 16))])
    d = ImageDraw.Draw(im)
    d.polygon([(0, 1210), (W, 1080), (W, H), (0, H)], fill=gnd)          # snow slope
    d.polygon([(0, 1210), (W, 1080), (W, 1130), (0, 1260)], fill=(gnd[0] - 25,) * 3)
    # tent
    d.polygon([(300, 1290), (560, 1010), (830, 1290)], fill=(14, 15, 18))
    d.line([(560, 1010), (600, 1290)], fill=(200, 205, 215), width=10)   # the slash
    im = glow(im, 600, 1180, 60, 130, (230, 235, 245), 0.5, blur=40)
    if not archival:
        cone = Image.new("L", (W, H), 0)
        ImageDraw.Draw(cone).polygon([(0, 1040), (820, 1170), (820, 1340), (0, 1310)], fill=110)
        cone = cone.filter(ImageFilter.GaussianBlur(70))
        im = Image.composite(Image.new("RGB", (W, H), (215, 228, 248)), im, cone)
        im = glow(im, 40, 1180, 180, 130, (235, 242, 255), 0.75, blur=70)
        d = ImageDraw.Draw(im)
        d.ellipse([-200, 1500, 700, 1900], fill=(126, 134, 146))              # foreground drift
        d.ellipse([500, 1600, 1300, 2000], fill=(118, 126, 138))
        im = snow(im, 3200, 6, 190)
        im = grain(im, 15, 31)
    else:
        im = snow(im, 1500, 7, 120)
        im = ImageEnhance.Color(im).enhance(0.05)
        im = scratches(grain(im, 22, 32), 34, 8)
        d = ImageDraw.Draw(im)
        d.rectangle([0, 0, W, 26], fill=(10, 10, 10)); d.rectangle([0, H - 26, W, H], fill=(10, 10, 10))
    return vignette(im, 0.95)


def p_tent():
    return _tent_scene(False)


def p_dyatlov():
    im = _tent_scene(True).rotate(-1.4, fillcolor=(8, 8, 8), resample=Image.BICUBIC)
    return im


# ---------------------------------------------------------------- 4: yuba car
def p_yuba():
    im = vgrad([(0, (2, 3, 5)), (0.5, (8, 11, 17)), (0.72, (26, 32, 42)), (1, (12, 15, 20))])
    d = ImageDraw.Draw(im)
    # treeline
    for x in range(0, W, 26):
        hgt = int(rng.integers(180, 420))
        d.polygon([(x, 1120), (x + 13, 1120 - hgt), (x + 26, 1120)], fill=(3, 4, 6))
    d.polygon([(0, 1120), (W, 1100), (W, H), (0, H)], fill=(96, 104, 116))
    im = snow(im, 2400, 12, 170)
    d = ImageDraw.Draw(im)
    # car silhouette + open door
    d.polygon([(250, 1330), (330, 1240), (640, 1235), (760, 1320), (790, 1420), (240, 1420)], fill=(6, 7, 9))
    d.ellipse([300, 1390, 400, 1470], fill=(4, 4, 5)); d.ellipse([640, 1390, 740, 1470], fill=(4, 4, 5))
    d.polygon([(330, 1250), (250, 1150), (300, 1140), (380, 1245)], fill=(7, 8, 10))   # open door
    im = glow(im, 470, 1245, 90, 60, (255, 214, 150), 0.75, blur=50)                   # dome light
    im = glow(im, 470, 1330, 240, 130, (255, 200, 130), 0.22, blur=90)
    return vignette(grain(im, 15, 33), 0.92)


# ---------------------------------------------------------------- 4: bennington
def p_bennington():
    im = vgrad([(0, (150, 154, 158)), (0.5, (120, 124, 130)), (1, (58, 60, 64))])
    tr = Image.new("L", (W, H), 0); d = ImageDraw.Draw(tr)
    for x, wdt, al in [(80, 60, 200), (250, 40, 160), (430, 90, 220), (700, 50, 170),
                       (880, 110, 230), (1010, 40, 150), (560, 30, 120)]:
        d.polygon([(x, H), (x + wdt * 0.7, 0), (x + wdt * 1.3, 0), (x + wdt, H)], fill=al)
    tr = tr.filter(ImageFilter.GaussianBlur(9))
    im = Image.composite(Image.new("RGB", (W, H), (24, 26, 30)), im, tr)
    fig = Image.new("L", (W, H), 0); df = ImageDraw.Draw(fig)
    person(df, 620, 950, 420, lw=16)
    fig = fig.filter(ImageFilter.GaussianBlur(7)).point(lambda p: p * 0.42)
    im = Image.composite(Image.new("RGB", (W, H), (30, 32, 36)), im, fig)
    d = ImageDraw.Draw(im)
    d.polygon([(0, 1600), (W, 1560), (W, H), (0, H)], fill=(40, 40, 42))
    im = Image.blend(im, Image.new("RGB", (W, H), (150, 154, 158)), 0.10)   # fog lift
    return vignette(grain(im, 13, 34), 0.85)


# ---------------------------------------------------------------- 5: prion
def p_prion():
    im = vgrad([(0, (2, 4, 3)), (0.5, (4, 8, 6)), (1, (1, 2, 2))])
    lay = Image.new("RGB", (W, H), (0, 0, 0)); d = ImageDraw.Draw(lay)
    for _ in range(46):
        cx, cy = int(rng.integers(60, W - 60)), int(rng.integers(200, H - 200))
        r0 = int(rng.integers(30, 150)); pts = []
        for k in range(int(rng.integers(5, 8))):
            a = 2 * math.pi * k / 6 + rng.uniform(-0.3, 0.3)
            pts.append((cx + r0 * math.cos(a) * rng.uniform(0.6, 1.3),
                        cy + r0 * math.sin(a) * rng.uniform(0.6, 1.3)))
        c = int(rng.integers(60, 190))
        d.polygon(pts, outline=(c, 255, c), fill=(c // 6, c // 3, c // 6), width=3)
    lay = lay.filter(ImageFilter.GaussianBlur(1.1))
    bloom = lay.filter(ImageFilter.GaussianBlur(26))
    im = Image.blend(im, bloom, 0.55)
    im = Image.blend(im, lay, 0.85)
    return vignette(grain(scanlines(im, 0.04), 14, 35), 0.8)


# ---------------------------------------------------------------- 5: lab door
def p_lab():
    im = vgrad([(0, (6, 8, 10)), (0.6, (14, 17, 21)), (1, (5, 6, 8))])
    d = ImageDraw.Draw(im)
    d.polygon([(0, H), (330, 900), (330, 700), (0, 300)], fill=(10, 12, 15))   # corridor walls
    d.polygon([(W, H), (750, 900), (750, 700), (W, 300)], fill=(9, 11, 14))
    d.rectangle([330, 700, 750, 1500], fill=(16, 19, 24))                     # far wall
    d.rounded_rectangle([420, 820, 660, 1420], radius=30, fill=(24, 28, 34))  # autoclave door
    for i, y in enumerate(range(880, 1400, 90)):                               # warning stripes
        d.polygon([(430, y), (650, y), (650, y + 26), (430, y + 26)],
                  fill=(60, 55, 20) if i % 2 else (30, 30, 32))
    d.rectangle([536, 830, 548, 1410], fill=(235, 245, 255))                  # light leak
    im = glow(im, 542, 1120, 60, 330, (220, 240, 255), 0.85, blur=45)
    im = glow(im, 542, 1500, 260, 120, (200, 220, 240), 0.25, blur=90)
    st = Image.new("L", (W, H), 0); ds = ImageDraw.Draw(st)
    for _ in range(26):
        x, y = int(rng.integers(380, 700)), int(rng.integers(1300, 1700))
        r0 = int(rng.integers(30, 90))
        ds.ellipse([x - r0, y - r0, x + r0, y + r0], fill=int(rng.integers(20, 60)))
    im = Image.composite(Image.new("RGB", (W, H), (210, 225, 240)), im,
                         st.filter(ImageFilter.GaussianBlur(30)))
    d = ImageDraw.Draw(im)
    d.rectangle([0, 240, W, 268], fill=(70, 76, 84))                          # flickering tube
    im = glow(im, 540, 254, 500, 40, (190, 205, 220), 0.5, blur=40)
    return vignette(grain(scanlines(im, 0.06), 15, 36), 0.9)


# ---------------------------------------------------------------- 5: rabies alley
def p_rabies():
    im = vgrad([(0, (3, 3, 4)), (0.55, (10, 9, 8)), (0.8, (24, 20, 15)), (1, (6, 6, 6))])
    d = ImageDraw.Draw(im)
    d.polygon([(0, 0), (300, 300), (300, 1500), (0, H)], fill=(7, 7, 8))
    d.polygon([(W, 0), (780, 300), (780, 1500), (W, H)], fill=(6, 6, 7))
    im = glow(im, 540, 620, 150, 110, (255, 176, 80), 0.65, blur=90)          # street lamp
    d = ImageDraw.Draw(im)
    d.ellipse([500, 590, 580, 640], fill=(255, 210, 140))
    d.polygon([(300, 1500), (780, 1500), (W, H), (0, H)], fill=(13, 13, 14))  # wet ground
    for _ in range(40):                                                       # reflections
        x = int(rng.integers(320, 760)); y = int(rng.integers(1520, H - 40))
        d.line([x, y, x + int(rng.integers(-14, 14)), y + int(rng.integers(6, 26))],
               fill=(60, 48, 30), width=2)
    # dog silhouette with rim light
    dog = Image.new("RGBA", (W, H), (0, 0, 0, 0)); dd = ImageDraw.Draw(dog)
    dd.ellipse([430, 1180, 660, 1300], fill=(0, 0, 0, 255))                   # body
    dd.ellipse([620, 1100, 700, 1180], fill=(0, 0, 0, 255))                   # head
    dd.polygon([(640, 1105), (652, 1060), (668, 1105)], fill=(0, 0, 0, 255))  # ears
    dd.polygon([(676, 1105), (688, 1062), (700, 1108)], fill=(0, 0, 0, 255))
    for lx in (450, 500, 610, 650):
        dd.line([lx, 1290, lx - 6, 1420], fill=(0, 0, 0, 255), width=16)
    dd.line([430, 1210, 360, 1260], fill=(0, 0, 0, 255), width=14)            # tail
    rim = dog.split()[3].filter(ImageFilter.GaussianBlur(2))
    im.paste(Image.new("RGB", (W, H), (255, 190, 110)), (3, -3), rim.point(lambda p: p * 0.5))
    im.paste(Image.new("RGB", (W, H), (0, 0, 0)), (0, 0), dog.split()[3])
    dd = ImageDraw.Draw(im)
    dd.ellipse([652, 1128, 664, 1140], fill=(220, 225, 210))                  # eye glint
    dd.ellipse([682, 1128, 694, 1140], fill=(220, 225, 210))
    return vignette(grain(im, 15, 37), 0.92)


# ---------------------------------------------------------------- 5: cotard mirror
def p_cotard():
    im = vgrad([(0, (5, 6, 8)), (0.5, (12, 14, 18)), (1, (4, 4, 6))])
    d = ImageDraw.Draw(im)
    d.polygon([(760, 300), (1040, 380), (1040, 1300), (760, 1180)], fill=(26, 30, 38))  # window light
    # mirror frame + interior (empty room, stool only)
    d.rounded_rectangle([560, 520, 900, 1500], radius=40, fill=(30, 26, 22))
    d.rounded_rectangle([590, 560, 870, 1460], radius=30, fill=(16, 18, 24))
    d.rectangle([690, 1180, 790, 1210], fill=(9, 10, 13))                    # stool in mirror
    d.line([700, 1210, 696, 1330], fill=(9, 10, 13), width=8)
    d.line([780, 1210, 784, 1330], fill=(9, 10, 13), width=8)
    im = glow(im, 730, 1000, 120, 300, (120, 140, 170), 0.18, blur=80)
    # person sitting, back to us, left of mirror
    sil = Image.new("RGBA", (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sil)
    ds.ellipse([250, 900, 380, 1030], fill=(0, 0, 0, 255))                   # head
    ds.polygon([(230, 1020), (400, 1020), (430, 1330), (200, 1330)], fill=(0, 0, 0, 255))
    ds.rectangle([200, 1320, 440, 1400], fill=(0, 0, 0, 255))
    ds.line([250, 1400, 246, 1560], fill=(0, 0, 0, 255), width=20)
    ds.line([390, 1400, 394, 1560], fill=(0, 0, 0, 255), width=20)
    rim = sil.split()[3].filter(ImageFilter.GaussianBlur(2))
    im.paste(Image.new("RGB", (W, H), (90, 110, 140)), (4, -2), rim.point(lambda p: p * 0.35))
    im.paste(Image.new("RGB", (W, H), (0, 0, 0)), (0, 0), sil.split()[3])
    return vignette(grain(im, 14, 38), 0.9)


PLATES = {
    "v3_03_insomnia.png": p_insomnia, "v3_04_drop.png": p_drop,
    "v4_01_hook_tent.png": p_tent, "v4_02_dyatlov.png": p_dyatlov,
    "v4_03_yuba.png": p_yuba, "v4_04_bennington.png": p_bennington,
    "v5_01_hook_prion.png": p_prion, "v5_02_lab.png": p_lab,
    "v5_03_rabies.png": p_rabies, "v5_04_cotard.png": p_cotard,
}

if __name__ == "__main__":
    for name, fn in PLATES.items():
        fn().save(OUT + name)
        print("plate", name)
