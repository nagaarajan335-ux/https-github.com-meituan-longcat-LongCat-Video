#!/usr/bin/env python3
"""Generates MASTER-PACKAGE.md + per-episode upload kits from content.py + timings."""
import os, json, sys
ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
from content import VIDEOS, CHANNEL, POSTING_PLAN, RETENTION_RULES, SERIES_NOTE  # noqa
OUT = os.path.join(ROOT, "out")

MM = lambda s: f"{int(s//60)}:{s%60:04.1f}"

md = [f"# {CHANNEL} — Horror Shorts Master Package (5 episodes)",
      "", SERIES_NOTE, "",
      "Every episode below ships as: **finished MP4 (1080x1920, voiced, captioned, sound-designed)** + "
      "**2 thumbnails (9:16 & 16:9)** + **copy-paste upload kit** (title / caption / description / hashtags / tags / pinned comment).",
      "", "## Posting plan (Asia/Kuala_Lumpur)",
      "| Episode | Day | Time | Why |", "|---|---|---|---|"]
for e, d, t, w in POSTING_PLAN:
    md.append(f"| {e} | {d} | {t} | {w} |")
md += ["", "## Retention rules baked into these edits", ""] + [f"- {r}" for r in RETENTION_RULES]

for n, v in enumerate(VIDEOS, 1):
    tj = os.path.join(OUT, f"{v['id']}_timing.json")
    timing = json.load(open(tj)) if os.path.exists(tj) else None
    md += ["", "---", f"", f"## EPISODE {n} — {v['title']}", ""]
    if timing:
        md.append(f"**Runtime:** {MM(timing['total'])}  •  **File:** `out/{v['id']}_{v['slug']}.mp4`  •  "
                  f"**Thumbnails:** `out/thumb_{v['id']}_9x16.png`, `out/thumb_{v['id']}_16x9.png`")
    md += ["", f"### 🪝 Viral hook (first 1.5 s)",
           f"- **On screen (frame 1):** “{' / '.join(v['hook_on_screen'])}”",
           f"- **Spoken:** “{v['segments'][0]['narration']}”",
           "", "### 🎬 Script + on-screen text (with timings)"]
    for k, s in enumerate(v["segments"]):
        o = timing["offsets"][k] if timing else 0
        d = timing["durations"][k] if timing else 0
        md += ["", f"**[{MM(o)} → {MM(o+d)}] {s['key'].upper()}** — visual: `{s['image']}` ({s['move']})",
               f"- ON SCREEN: {s['on_screen'][0]}",
               f"- VO: {s['narration']}"]
    md += ["", "### 📱 Caption (post text)", f"> {v['caption']}",
           "", "### 📄 Description", "```", v["description"], "```",
           "", "### #️⃣ Hashtags", " ".join(v["hashtags"]),
           "", "### 🏷️ Tags (YouTube tag box)", v["tags"],
           "", "### 📌 Pinned comment", f"> {v['pinned_comment']}",
           "", "### 🔊 Sound design", f"- Hook SFX: `{v['sfx']['hook']}` • Bed: `{v['sfx']['bed']}` • "
                                       f"Accent: `{v['sfx']['accent']}` • End: `{v['sfx']['end']}`",
           "", "### 📚 Sources", ""] + [f"- {s}" for s in v["sources"]]
open(os.path.join(ROOT, "MASTER-PACKAGE.md"), "w").write("\n".join(md) + "\n")

for n, v in enumerate(VIDEOS, 1):
    kit = [f"{CHANNEL} — EPISODE {n} UPLOAD KIT", "=" * 46,
           f"TITLE: {v['title']}",
           f"VIDEO FILE: out/{v['id']}_{v['slug']}.mp4",
           f"THUMBNAIL (Shorts 9:16): out/thumb_{v['id']}_9x16.png",
           f"THUMBNAIL (standard 16:9): out/thumb_{v['id']}_16x9.png",
           "", "CAPTION:", v["caption"], "", "DESCRIPTION:", v["description"], "",
           "HASHTAGS:", " ".join(v["hashtags"]), "", "TAGS:", v["tags"], "",
           "PINNED COMMENT:", v["pinned_comment"], "",
           "POST WINDOW: see MASTER-PACKAGE.md posting plan"]
    open(os.path.join(OUT, f"EP{n}-upload-kit.txt"), "w").write("\n".join(kit) + "\n")
print("package written:", os.path.join(ROOT, "MASTER-PACKAGE.md"))
