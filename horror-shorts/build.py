#!/usr/bin/env python3
"""
DARK FREQUENCY — horror Shorts render pipeline.
Builds, for each episode: finished 1080x1920 MP4 (motion + grade + grain + captions
+ procedural horror sound design + AI voiceover), thumbnails (9:16 + 16:9),
and a copy-paste package .txt.  Requires: .venv (ffmpeg via imageio-ffmpeg, pillow, numpy).
Usage:  .venv/bin/python horror-shorts/build.py v1
"""
import os, sys, json, wave, math, subprocess, textwrap
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance

ROOT   = os.path.dirname(os.path.abspath(__file__))
REPO   = os.path.dirname(ROOT)
FF     = os.environ.get("FFMPEG_BIN", "/home/user/.venv/bin/ffmpeg")
ASSETS = os.path.join(ROOT, "assets")
AUDIO  = os.path.join(ROOT, "audio")
OUT    = os.path.join(ROOT, "out")
W, H, FPS = 1080, 1920, 30
SR = 44100
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

sys.path.insert(0, ROOT)
from content import VIDEOS, CHANNEL  # noqa: E402


def run(cmd, **kw):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stdout[-3000:]); print(r.stderr[-4000:])
        raise SystemExit(f"ffmpeg failed: {cmd[:6]}...")
    return r


# ------------------------------------------------------------------ audio utils
def decode(path):
    wav = path.rsplit(".", 1)[0] + ".wav"
    if not os.path.exists(wav):
        run([FF, "-y", "-loglevel", "error", "-i", path, "-ar", str(SR), "-ac", "1", wav])
    with wave.open(wav, "rb") as w:
        n = w.getnframes()
        data = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float64) / 32768.0
    return data, wav


def write_wav(path, x):
    x = np.clip(x, -0.999, 0.999)
    with wave.open(path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def rms_env(x, hop=512):
    n = len(x) // hop
    return np.sqrt((x[: n * hop].reshape(n, hop) ** 2).mean(axis=1))


def silence_gaps(x, min_len=0.10, max_len=1.2):
    """midpoints (seconds) of quiet runs usable as caption boundaries"""
    env = rms_env(x)
    thr = max(0.004, 0.12 * np.percentile(env, 97))
    quiet = env < thr
    gaps = []
    i = 0
    while i < len(quiet):
        if quiet[i]:
            j = i
            while j < len(quiet) and quiet[j]:
                j += 1
            dur = (j - i) * 512 / SR
            if min_len <= dur <= max_len:
                gaps.append(((i + j) / 2) * 512 / SR)
            i = j
        else:
            i += 1
    return gaps


def chunk_narration(text, max_words=5):
    """split into caption chunks at punctuation, <= max_words words each"""
    parts, cur = [], ""
    for tok in text.replace("\n", " ").split(" "):
        cur = (cur + " " + tok).strip()
        if tok.endswith((",", ".", "!", "?", "...", "—")) or len(cur.split()) >= max_words:
            parts.append(cur.strip(" ,")); cur = ""
    if cur:
        parts.append(cur)
    return [p for p in parts if p]


def align_chunks(x, chunks, dur):
    """assign [start,end) seconds to each caption chunk, snapped to silence gaps"""
    total_chars = sum(len(c) for c in chunks) or 1
    gaps = silence_gaps(x)
    times, acc, t = [], 0, 0.06
    for k, c in enumerate(chunks):
        frac = len(c) / total_chars
        est_end = t + max(0.45, (dur - 0.12) * frac)
        # snap to nearest gap inside window
        cand = [g for g in gaps if t + 0.25 < g < est_end + 0.55]
        end = min(cand, key=lambda g: abs(g - est_end)) if cand else est_end
        end = min(end, dur - 0.02)
        times.append((round(t, 3), round(max(end, t + 0.4), 3)))
        t = max(end, t + 0.4)
    return times


# ------------------------------------------------------------------ sound design
def synth_bed(dur, sfx, boundaries, t_total):
    t = np.linspace(0, dur, int(dur * SR), endpoint=False)
    bed = np.zeros_like(t)
    kind = sfx.get("bed", "drone_low")
    # --- low drone -------------------------------------------------------------
    f0 = 41.0 if kind != "drone_radio" else 47.0
    bed += 0.30 * np.sin(2 * np.pi * f0 * t)
    bed += 0.18 * np.sin(2 * np.pi * (f0 * 1.333) * t + 0.7)
    rng = np.random.default_rng(7)
    brown = np.cumsum(rng.normal(0, 1, len(t)))
    brown = brown / (np.abs(brown).max() + 1e-9)
    bed += 0.22 * brown
    # slow breathing swell
    bed *= 0.75 + 0.25 * np.sin(2 * np.pi * 0.09 * t + 1.0)
    # --- accent layer ----------------------------------------------------------
    acc = sfx.get("accent", "heartbeat")
    if acc.startswith("heartbeat"):
        bpm = 46 if acc.endswith("slow") else 58
        beat = 60.0 / bpm
        k = 0
        while k * beat < dur:
            for off, amp in ((0.0, 1.0), (0.30, 0.55)):
                s = k * beat + off
                if s < dur - 0.2:
                    i0 = int(s * SR); n = int(0.22 * SR)
                    tt = np.arange(n) / SR
                    thump = amp * np.sin(2 * np.pi * 52 * tt) * np.exp(-tt * 22)
                    bed[i0:i0 + n] += 0.5 * thump
            k += 1
    elif acc == "hum":
        bed += 0.16 * np.sin(2 * np.pi * 63 * t) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.21 * t))
    elif acc == "geiger":
        clicks = rng.poisson(3.2, int(dur))
        pos = 0
        for c in clicks:
            pos += c * 0.11 + 0.05
            i0 = int(pos * SR)
            if i0 + 900 >= len(t): break
            bed[i0:i0 + 900] += 0.25 * rng.normal(0, 1, 900) * np.exp(-np.arange(900) / 180)
    # --- transition whooshes + hook impact + end riser --------------------------
    def whoosh(s, span=0.55):
        i0 = int(max(0, s) * SR); n = int(span * SR)
        if i0 + n >= len(t): return
        tt = np.arange(n) / SR
        nz = rng.normal(0, 1, n)
        sweep = np.sin(2 * np.pi * (220 + 900 * (tt / span) ** 2) * tt)
        env = np.sin(np.pi * tt / span) ** 2
        bed[i0:i0 + n] += 0.30 * env * (0.6 * nz + 0.4 * sweep) * (tt / span)
    for b in boundaries:
        whoosh(b - 0.18)
    def boom(s, f=52, dec=1.1, amp=0.85):
        i0 = int(s * SR); n = int(dec * SR)
        if i0 + n >= len(t): n = len(t) - i0
        tt = np.arange(n) / SR
        bed[i0:i0 + n] += amp * np.sin(2 * np.pi * f * tt * (1 - 0.25 * tt / dec)) * np.exp(-tt * 4.2)
        m = min(int(0.06 * SR), n)
        bed[i0:i0 + m] += 0.5 * rng.normal(0, 1, m) * np.exp(-np.arange(m) / 300)
    if sfx.get("hook") in ("boom", "boom_wind"):
        boom(0.02)
    elif sfx.get("hook") == "buzzer":
        i0 = 0; n = int(2.4 * SR)
        bed[:n] += 0.16 * np.sign(np.sin(2 * np.pi * 210 * t[:n])) * (0.7 + 0.3 * np.sin(2 * np.pi * 6 * t[:n]))
        boom(0.05)
    if sfx.get("bed") == "drone_wind":
        wind = rng.normal(0, 1, len(t))
        k = np.ones(int(1.5 * SR)) / (1.5 * SR)
        wind = np.convolve(wind, k, mode="same")
        bed += 0.5 * wind * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * t))
    n = int(1.6 * SR); i0 = len(t) - n - int(0.35 * SR)
    tt = np.arange(n) / SR
    riser = rng.normal(0, 1, n) * (tt / 1.6) ** 2.2
    bed[i0:i0 + n] += 0.55 * riser
    boom(t_total - 0.32, f=46, dec=1.4, amp=0.9)
    # fade edges
    f = int(0.25 * SR)
    bed[:f] *= np.linspace(0, 1, f); bed[-f:] *= np.linspace(1, 0, f)
    return bed / (np.abs(bed).max() + 1e-9) * 0.62


# ------------------------------------------------------------------ video pieces
def zoompan_expr(move, n_frames):
    N = max(1, n_frames)
    c = "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)'"
    if move == "push_in":       return f"z='1.0+0.10*on/{N}':{c}"
    if move == "push_in_fast":  return f"z='1.0+0.20*on/{N}':{c}"
    if move == "push_out":      return f"z='1.13-0.11*on/{N}':{c}"
    if move == "pan_up":        return f"z='1.12':x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*(1-on/{N})'"
    if move == "pan_down":      return f"z='1.12':x='iw/2-(iw/zoom/2)':y='(ih-ih/zoom)*(on/{N})'"
    return f"z='1.0+0.10*on/{N}':{c}"


def make_flash(path):
    a = np.random.default_rng(3).integers(40, 235, (H // 2, W // 2), dtype=np.uint8)
    im = Image.fromarray(a, "L").resize((W, H), Image.NEAREST).convert("RGB")
    im.save(path)


def wrap2(line, maxlen=15):
    """balanced two-line break for the big hook card"""
    if len(line) <= maxlen:
        return line
    words = line.split()
    best, bestd = line.replace(" ", "\\N"), 1e9
    for i in range(1, len(words)):
        a, b = " ".join(words[:i]), " ".join(words[i:])
        dd = abs(len(a) - len(b)) + 0.2 * max(len(a), len(b))
        if dd < bestd:
            best, bestd = a + "\\N" + b, dd
    return best


def ass_time(s):
    s = max(0.0, s)
    return f"{int(s//3600)}:{int(s%3600//60):02d}:{s%60:05.2f}"


def build_ass(path, events):
    head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: {W}
PlayResY: {H}
ScaledBorderAndShadow: yes
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: HOOK,DejaVu Sans,86,&H00FFFFFF,&H000000FF,&H00000000,&H96000000,-1,0,0,0,100,100,2,0,1,8,5,5,70,70,0,1
Style: CHIP,DejaVu Sans,58,&H00FFFFFF,&H000000FF,&H002026E8,&HCC1418E8,-1,0,0,0,100,100,3,0,3,4,0,8,60,60,150,1
Style: CAP,DejaVu Sans,68,&H00FFFFFF,&H000000FF,&H00000000,&H96000000,-1,0,0,0,100,100,0,0,1,7,4,2,70,70,215,1
Style: CAPRED,DejaVu Sans,68,&H004545FF,&H000000FF,&H00000000,&H96000000,-1,0,0,0,100,100,0,0,1,7,4,2,70,70,215,1
[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    with open(path, "w") as f:
        f.write(head)
        for st, a, b, txt in events:
            f.write(f"Dialogue: 0,{ass_time(a)},{ass_time(b)},{st},,0,0,0,,{txt}\n")


# ------------------------------------------------------------------ thumbnail
def make_thumb(v, outdir):
    src = Image.open(os.path.join(ASSETS, v["segments"][0]["image"])).convert("RGB")
    def compose(w, h):
        im = src.copy()
        sc = max(w / im.width, h / im.height)
        im = im.resize((int(im.width * sc) + 2, int(im.height * sc) + 2), Image.LANCZOS)
        im = im.crop(((im.width - w) // 2, (im.height - h) // 2, (im.width + w) // 2, (im.height + h) // 2))
        im = ImageEnhance.Contrast(im).enhance(1.12)
        im = ImageEnhance.Color(im).enhance(0.75)
        d = ImageDraw.Draw(im, "RGBA")
        # top + bottom scrims for text legibility
        for y in range(int(h * 0.46)):
            d.line([(0, y), (w, y)], fill=(0, 0, 0, int(200 * (1 - y / (h * 0.46)) ** 1.4)))
        for y in range(int(h * 0.80), h):
            d.line([(0, y), (w, y)], fill=(0, 0, 0, int(190 * ((y - h * 0.80) / (h * 0.20)) ** 1.3)))
        lines = v["thumbnail_text"]
        fs = int(w * 0.155)
        f = ImageFont.truetype(FONT_B, fs)
        while max(d.textlength(l, font=f) for l in lines) > w * 0.88 and fs > int(w * 0.06):
            fs -= 4
            f = ImageFont.truetype(FONT_B, fs)
        y0 = int(h * 0.075)
        for i, line in enumerate(lines):
            col = (235, 30, 30) if i == len(lines) - 1 and len(lines) > 1 else (255, 255, 255)
            d.text((w * 0.06 + 6, y0 + 6), line, font=f, fill=(0, 0, 0, 235))
            d.text((w * 0.06, y0), line, font=f, fill=col, stroke_width=max(4, w // 140), stroke_fill=(0, 0, 0))
            y0 += int(fs * 1.12)
        # badge chip
        bf = ImageFont.truetype(FONT_B, int(w * 0.045))
        bt = v["thumbnail_badge"]
        bb = d.textbbox((0, 0), bt, font=bf)
        bw, bh = bb[2] - bb[0] + int(w * 0.05), bb[3] - bb[1] + int(w * 0.035)
        bx, by = w - bw - int(w * 0.05), int(h * 0.045)
        d.rounded_rectangle([bx, by, bx + bw, by + bh], radius=int(bh * 0.25), fill=(200, 25, 25, 235))
        d.text((bx + bw // 2, by + bh // 2), bt, font=bf, fill=(255, 255, 255), anchor="mm")
        # channel strap
        cf = ImageFont.truetype(FONT_B, int(w * 0.040))
        d.text((w * 0.06, h * 0.935), CHANNEL.upper(), font=cf, fill=(255, 255, 255, 210))
        return im
    compose(1080, 1920).save(os.path.join(outdir, f"thumb_{v['id']}_9x16.png"))
    compose(1280, 720).save(os.path.join(outdir, f"thumb_{v['id']}_16x9.png"))


# ------------------------------------------------------------------ main
def build(v):
    os.makedirs(OUT, exist_ok=True)
    segs = v["segments"]
    info = []
    full = os.path.join(AUDIO, f"{v['id']}_full.mp3")
    if all(os.path.exists(os.path.join(AUDIO, f"{v['id']}_{s['key']}.mp3")) for s in segs):
        for s in segs:
            x, wav = decode(os.path.join(AUDIO, f"{v['id']}_{s['key']}.mp3"))
            info.append(dict(key=s["key"], dur=len(x) / SR, x=x, wav=wav))
        pad = 0.30
        offs, t = [], 0.12
        for i in info:
            offs.append(t)
            t += i["dur"] + pad
        total = t + 0.55
        vo_src = None
    else:  # single-take narration: slice at detected pauses
        x, wav = decode(full)
        dur_full = len(x) / SR
        chars = [len(s["narration"]) for s in segs]
        tot = sum(chars)
        acc, expected = 0, []
        for c in chars[:-1]:
            acc += c
            expected.append(dur_full * acc / tot)
        gaps = [g for g in silence_gaps(x, min_len=0.18) if 0.5 < g < dur_full - 0.5]
        bounds, last = [], 0.0
        for e in expected:
            cand = [g for g in gaps if last + 1.0 < g < e + 1.6]
            b = min(cand, key=lambda g: abs(g - e)) if cand else e
            bounds.append(b); last = b
        edges = [0.0] + bounds + [dur_full]
        for k, s in enumerate(segs):
            a, b = edges[k], edges[k + 1]
            info.append(dict(key=s["key"], dur=b - a, x=x[int(a * SR):int(b * SR)], wav=wav))
        offs = list(edges)
        pad = 0.0
        total = dur_full + 0.7
        vo_src = wav
    boundaries = offs[1:]

    # ---- voice mix (exact offsets, loudness normalised)
    vo = os.path.join(OUT, f"{v['id']}_vo.wav")
    if vo_src:
        run([FF, "-y", "-loglevel", "error", "-i", vo_src, "-af",
             "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), vo])
    else:
        vo_raw = os.path.join(OUT, f"{v['id']}_vo_raw.wav")
        fc = []
        for i, (s, o) in enumerate(zip(info, offs)):
            fc.append(f"[{i}:a]adelay={int(o*1000)}|{int(o*1000)}[a{i}]")
        fc.append("".join(f"[a{i}]" for i in range(len(info))) +
                  f"amix=inputs={len(info)}:normalize=0:duration=longest[v]")
        run([FF, "-y", "-loglevel", "error"] + sum([["-i", s["wav"]] for s in info], []) +
            ["-filter_complex", ";".join(fc), "-map", "[v]", vo_raw])
        run([FF, "-y", "-loglevel", "error", "-i", vo_raw, "-af",
             "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), vo])

    # ---- bed
    bed = synth_bed(total, v["sfx"], boundaries, total)
    bedp = os.path.join(OUT, f"{v['id']}_bed.wav")
    write_wav(bedp, bed)

    # ---- per-segment video clips
    clips = []
    for s, i, o in zip(segs, info, offs):
        D = i["dur"] + pad
        n = int(D * FPS)
        img = os.path.join(ASSETS, s["image"])
        cp = os.path.join(OUT, f"{v['id']}_{s['key']}.mp4")
        vf = (f"scale=1296:2304:force_original_aspect_ratio=increase,crop=1296:2304,"
              f"zoompan={zoompan_expr(s['move'], n)}:d=1:s={W}x{H}:fps={FPS},"
              f"eq=contrast=1.07:saturation=0.80:brightness='0.010*sin(2*PI*11*t)+0.006*sin(2*PI*27*t+1.3)':eval=frame,"
              f"noise=alls=5:allf=t+u,vignette=PI/4.8,format=yuv420p")
        run([FF, "-y", "-loglevel", "error", "-loop", "1", "-framerate", str(FPS), "-t", f"{D:.3f}",
             "-i", img, "-vf", vf, "-t", f"{D:.3f}", "-c:v", "libx264", "-preset", "veryfast",
             "-crf", "18", "-pix_fmt", "yuv420p", cp])
        clips.append(cp)

    # ---- captions + on-screen text (ASS, global timeline)
    ev = []
    for s, i, o in zip(segs, info, offs):
        line = s["on_screen"][0]
        if line.startswith("#"):
            chip, rest = line.split(" ", 1)
            ev.append(("CHIP", o + 0.05, o + i["dur"] + pad - 0.05, f"{chip}  {rest}"))
        else:
            ev.append(("HOOK", o + 0.05, o + min(i["dur"], 2.6),
                       "{\\fad(140,140)\\t(0,220,\\fs96)}" + wrap2(line)))
        chunks = chunk_narration(s["narration"])
        times = align_chunks(i["x"], chunks, i["dur"])
        for (a, b), c in zip(times, chunks):
            style = "CAPRED" if (s["key"] == "hook" or c.rstrip(".").isdigit()) else "CAP"
            ev.append((style, o + a, o + b, "{\\fad(90,90)}" + c.upper()))
    ass = os.path.join(OUT, f"{v['id']}.ass")
    build_ass(ass, ev)

    # ---- concat + flash cuts + subs
    flash = os.path.join(OUT, "flash.png")
    if not os.path.exists(flash):
        make_flash(flash)
    ins, fc2 = [], []
    for i2, c in enumerate(clips):
        ins += ["-i", c]
    ins += ["-i", flash]
    fl = len(ins) // 2 - 1
    cur = "[0:v]"
    for k in range(1, len(clips)):
        nxt = f"[c{k}]"
        fc2.append(f"{cur}[{k}:v]concat=n=2:v=1:a=0{nxt}" if k == 1 else f"{cur}[{k}:v]concat=n=2:v=1:a=0{nxt}")
        cur = nxt
    fc2.append(f"[{fl}:v]format=rgba,colorchannelmixer=aa=0.32,split={len(boundaries)}" +
               "".join(f"[fl{k}]" for k in range(len(boundaries))))
    cur2 = cur
    for k, b in enumerate(boundaries):
        o = f"[f{k}]"
        fc2.append(f"{cur2}[fl{k}]overlay=enable='between(t,{b-0.09:.3f},{b+0.05:.3f})'{o}")
        cur2 = o
    fc2.append(f"{cur2}ass={ass}[vout]")
    vid = os.path.join(OUT, f"{v['id']}_video.mp4")
    run([FF, "-y", "-loglevel", "error"] + ins + ["-filter_complex", ";".join(fc2),
         "-map", "[vout]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "25",
         "-pix_fmt", "yuv420p", "-r", str(FPS), vid])

    # ---- final mux
    final = os.path.join(OUT, f"{v['id']}_{v['slug']}.mp4")
    run([FF, "-y", "-loglevel", "error", "-i", vid, "-i", vo, "-i", bedp,
         "-filter_complex", "[1:a]aformat=channel_layouts=mono[v];[2:a]aformat=channel_layouts=mono[b];"
                            "[v][b]amix=inputs=2:normalize=0:duration=first,alimiter=limit=0.95,aformat=channel_layouts=stereo[a]",
         "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k",
         "-t", f"{total:.3f}", "-movflags", "+faststart", final])
    make_thumb(v, OUT)
    with open(os.path.join(OUT, f"{v['id']}_timing.json"), "w") as f:
        json.dump(dict(offsets=offs, durations=[i["dur"] for i in info], total=total), f, indent=1)
    print(f"BUILT {final}  ({total:.1f}s)")


if __name__ == "__main__":
    for vid in sys.argv[1:]:
        build(next(v for v in VIDEOS if v["id"] == vid))
