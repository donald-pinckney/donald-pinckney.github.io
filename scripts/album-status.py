#!/usr/bin/env python3
"""Per-album numbers for the "Album status" table in PHOTOS.md.

Reads darktable's database read-only (safe while darktable is open, though
counts reflect only what darktable has saved) plus ~/Pictures/{Library,Exports}.

    python3 scripts/album-status.py

Columns (all counts exclude rejected photos unless noted):
  kept      photos not rejected          rej    rejected (to delete eventually)
  rated     1+ stars                     places with a places| tag
  art       app|art (minus pii|yes)      pii    pii|yes
  final     stage|final|* (finished edit: darktable or Lightroom)
  art-fin   art picks that are final
  dt-edit   edited in darktable (history differs from the auto-applied defaults)
  lr-xmp    Lightroom sidecars (IMG_1234.xmp) in the folder
  renders   image files in Exports/<album>, per sub-folder
"""
import os, sqlite3, collections

HOME = os.path.expanduser("~")
DT = f"{HOME}/.config/darktable"
EXPORTS = f"{HOME}/Pictures/Exports"
IMG_EXT = (".jpg", ".jpeg", ".tif", ".tiff", ".png", ".avif", ".heic")

db = sqlite3.connect(f"file:{DT}/library.db?mode=ro", uri=True)
db.execute(f"ATTACH 'file:{DT}/data.db?mode=ro' AS d")

def tagged(film, where):
    return {r[0] for r in db.execute(
        f"""SELECT ti.imgid FROM tagged_images ti JOIN d.tags t ON t.id = ti.tagid
            JOIN images i ON i.id = ti.imgid WHERE i.film_id = ? AND ({where})""", (film,))}

cols = ["album", "kept", "rej", "rated", "places", "art", "pii", "final", "art-fin", "dt-edit", "lr-xmp", "renders"]
rows = []
for film, folder in db.execute("SELECT id, folder FROM film_rolls ORDER BY folder"):
    if "/Pictures/Library/" not in folder:
        continue
    name = os.path.basename(folder)
    imgs = db.execute(
        """SELECT i.id, i.flags, h.basic_hash, h.auto_hash, h.current_hash
           FROM images i LEFT JOIN history_hash h ON h.imgid = i.id WHERE i.film_id = ?""",
        (film,)).fetchall()
    kept = {i for i, flags, *_ in imgs if not flags & 8}
    rated = sum(1 for i, flags, *_ in imgs if i in kept and flags & 7)
    edited = sum(1 for i, _, basic, auto, cur in imgs
                 if i in kept and cur is not None and cur not in (basic, auto))
    places = tagged(film, "t.name LIKE 'places|%'") & kept
    pii = tagged(film, "t.name LIKE 'pii|yes%'") & kept
    art = (tagged(film, "t.name = 'app|art'") & kept) - pii
    final = tagged(film, "t.name LIKE 'stage|final|%'") & kept
    files = os.listdir(folder) if os.path.isdir(folder) else []
    lr = sum(1 for f in files if f.lower().endswith(".xmp") and f.count(".") == 1)
    renders = collections.Counter()
    for root, _, fs in os.walk(f"{EXPORTS}/{name}"):
        n = sum(1 for f in fs if f.lower().endswith(IMG_EXT))
        if n:
            renders[os.path.relpath(root, f"{EXPORTS}/{name}")] += n
    rows.append([name, len(kept), len(imgs) - len(kept), rated, len(places), len(art),
                 len(pii), len(final), len(art & final), edited, lr, " ".join(f"{k}:{v}" for k, v in sorted(renders.items())) or "-"])

widths = [max(len(str(r[c])) for r in rows + [cols]) for c in range(len(cols))]
for r in [cols] + rows:
    print("  ".join(str(v).ljust(w) if c in (0, len(cols) - 1) else str(v).rjust(w)
                    for c, (v, w) in enumerate(zip(r, widths))))
