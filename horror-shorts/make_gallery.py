#!/usr/bin/env python3
"""Writes horror-shorts/index.html — the in-browser preview studio for the series."""
import os, sys, json, html
ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ROOT)
from content import VIDEOS, CHANNEL, POSTING_PLAN  # noqa
OUT = os.path.join(ROOT, "out")

cards = []
for n, v in enumerate(VIDEOS, 1):
    mp4 = f"out/{v['id']}_{v['slug']}.mp4"
    have = os.path.exists(os.path.join(ROOT, mp4))
    tj = os.path.join(OUT, f"{v['id']}_timing.json")
    rt = f"{json.load(open(tj))['total']:.0f}s" if os.path.exists(tj) else "—"
    esc = html.escape
    payload = json.dumps(dict(title=v["title"], caption=v["caption"], description=v["description"],
                              hashtags=" ".join(v["hashtags"]), tags=v["tags"], pinned=v["pinned_comment"]))
    cards.append(f"""
  <article class="ep" data-kit='{payload}'>
    <div class="thumbwrap">
      <img src="out/thumb_{v['id']}_9x16.png" alt="thumb ep{n}">
      <span class="rt">{rt}</span><span class="badge">EP {n}</span>
    </div>
    <div class="meta">
      <h3>{esc(v['title'])}</h3>
      <p class="hook">🪝 {esc(' / '.join(v['hook_on_screen']))}</p>
      {('<video controls preload="metadata" src="' + mp4 + '" poster="out/thumb_' + v['id'] + '_9x16.png"></video>') if have else '<div class="soon">RENDER QUEUED — reply in chat to render</div>'}
      <div class="btns">
        <button data-k="title">Title</button><button data-k="caption">Caption</button>
        <button data-k="description">Description</button><button data-k="hashtags">Hashtags</button>
        <button data-k="tags">Tags</button><button data-k="pinned">Pinned</button>
      </div>
      <div class="dl">
        <a href="{mp4}" download>⬇ MP4</a>
        <a href="out/thumb_{v['id']}_9x16.png" download>⬇ 9:16</a>
        <a href="out/thumb_{v['id']}_16x9.png" download>⬇ 16:9</a>
        <a href="out/EP{n}-upload-kit.txt" download>⬇ kit.txt</a>
      </div>
    </div>
  </article>""")

plan = "".join(f"<li><b>{e}</b> — {d} {t} <span>{w}</span></li>" for e, d, t, w in POSTING_PLAN)

html_doc = f"""<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{CHANNEL} — Shorts Studio</title><style>
:root{{--bg:#0a0a0c;--card:#141419;--red:#e01818;--txt:#e8e8ea;--dim:#8a8a94}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--txt);font:15px/1.5 system-ui,Segoe UI,sans-serif}}
header{{padding:26px 22px 10px;border-bottom:1px solid #222}}
h1{{margin:0;font-size:26px;letter-spacing:2px}}h1 span{{color:var(--red)}}
header p{{color:var(--dim);margin:6px 0 0}}
.plan{{display:flex;gap:14px;flex-wrap:wrap;padding:14px 22px;color:var(--dim);font-size:13px}}
.plan li{{list-style:none;background:#17171d;padding:8px 12px;border-radius:8px;border:1px solid #26262e}}
.plan b{{color:var(--txt)}} .plan span{{display:block;font-size:12px}}
main{{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:20px;padding:20px 22px 60px}}
.ep{{background:var(--card);border:1px solid #26262e;border-radius:14px;overflow:hidden}}
.thumbwrap{{position:relative}}.thumbwrap img{{width:100%;display:block;aspect-ratio:9/16;object-fit:cover;filter:saturate(.85)}}
.rt{{position:absolute;right:8px;bottom:8px;background:#000c;padding:2px 8px;border-radius:6px;font-size:12px}}
.badge{{position:absolute;left:8px;top:8px;background:var(--red);padding:3px 10px;border-radius:6px;font-weight:700;font-size:12px}}
.meta{{padding:14px}}h3{{margin:0 0 6px;font-size:16px}}.hook{{color:var(--dim);font-size:13px;margin:0 0 10px}}
video{{width:100%;border-radius:10px;background:#000;aspect-ratio:9/16}}
.soon{{aspect-ratio:9/16;display:grid;place-items:center;color:var(--dim);border:1px dashed #333;border-radius:10px}}
.btns{{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}}
button{{background:#1d1d25;color:var(--txt);border:1px solid #30303a;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:12px}}
button:hover{{border-color:var(--red)}}
.dl a{{color:var(--dim);text-decoration:none;font-size:12px;margin-right:10px}}.dl a:hover{{color:var(--red)}}
#toast{{position:fixed;bottom:18px;left:50%;transform:translateX(-50%);background:var(--red);color:#fff;padding:8px 16px;border-radius:8px;opacity:0;transition:.3s}}
</style></head><body>
<header><h1>{CHANNEL.upper()} <span>// SHORTS STUDIO</span></h1>
<p>5 finished horror Shorts — watch, then copy the exact title / caption / description / hashtags / tags for upload.</p></header>
<ul class="plan">{plan}</ul>
<main>{''.join(cards)}</main>
<div id="toast">Copied ✓</div>
<script>
document.querySelectorAll('.ep').forEach(ep=>{{
  const kit=JSON.parse(ep.dataset.kit);
  ep.querySelectorAll('button').forEach(b=>b.onclick=()=>{{
    navigator.clipboard.writeText(kit[b.dataset.k]).then(()=>{{
      const t=document.getElementById('toast');t.style.opacity=1;
      t.textContent=(b.dataset.k+' copied ✓');setTimeout(()=>t.style.opacity=0,1400);}});}});
}});
</script></body></html>"""
open(os.path.join(ROOT, "index.html"), "w").write(html_doc)
print("gallery written")
