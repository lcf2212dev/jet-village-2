#!/usr/bin/env python3
"""Pack OpenAI warrior sheet → public/assets/sprites/warrior.{png,json}.

- Chroma-key light backdrop → alpha
- Strip near-white edge fringe (anti-alias dots)
- 8 directions: left sides = horizontal flip of right sides
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "public/assets/generated/character"
OUT_PNG = ROOT / "public/assets/sprites/warrior.png"
OUT_JSON = ROOT / "public/assets/sprites/warrior.json"

FW = FH = 72
NCOL = 14
DIRS = ["down", "down-left", "left", "up-left", "up", "up-right", "right", "down-right"]
STATES = [
    ("idle", 0, 3, 4, True),
    ("walk", 3, 3, 10, True),
    ("run", 6, 2, 12, True),
    ("attack", 8, 2, 12, False),
    ("sit", 10, 2, 4, True),
    ("death", 12, 2, 8, False),
]
# Source band indices in the generated 9-row sheet
BASE = {"down": 0, "up": 4, "right": 6, "up-right": 5, "down-right": 8}
MIRROR = {"left": "right", "up-left": "up-right", "down-left": "down-right"}
CORES = [54, 116, 190, 247, 306, 390, 453, 511, 580, 639, 720, 779, 855, 935]


def latest_src() -> Path:
    files = sorted(SRC.glob("warrior-full-*.png"))
    if not files:
        raise SystemExit(f"No warrior-full-*.png under {SRC}")
    return files[-1]


def is_bg(r: int, g: int, b: int) -> bool:
    lum = (r + g + b) / 3.0
    sat = max(r, g, b) - min(r, g, b)
    return (lum >= 200 and sat <= 35) or (r >= 220 and g >= 220 and b >= 220) or (
        lum >= 185 and sat <= 18
    )


def runs(flags: list[bool], min_gap_merge: int) -> list[list[int]]:
    raw: list[list[int]] = []
    st: int | None = None
    for i, v in enumerate(flags):
        if v and st is None:
            st = i
        if not v and st is not None:
            raw.append([st, i - 1])
            st = None
    if st is not None:
        raw.append([st, len(flags) - 1])
    merged: list[list[int]] = []
    for a, b in raw:
        if not merged:
            merged.append([a, b])
            continue
        if a - merged[-1][1] < min_gap_merge:
            merged[-1][1] = b
        else:
            merged.append([a, b])
    return merged


def near_white(r: int, g: int, b: int, a: int) -> bool:
    if a == 0:
        return False
    lum = (r + g + b) / 3.0
    sat = max(r, g, b) - min(r, g, b)
    return (lum >= 188 and sat <= 45) or (lum >= 200 and sat <= 55)


def clean_fringe(cell: Image.Image) -> Image.Image:
    cell = cell.copy()
    cp = cell.load()
    cw, ch = cell.size
    for _ in range(4):
        kill: list[tuple[int, int]] = []
        for y in range(ch):
            for x in range(cw):
                r, g, b, a = cp[x, y]
                if not near_white(r, g, b, a):
                    continue
                t = body = 0
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if dx == 0 and dy == 0:
                            continue
                        nx, ny = x + dx, y + dy
                        if nx < 0 or ny < 0 or nx >= cw or ny >= ch or cp[nx, ny][3] == 0:
                            t += 1
                        else:
                            nr, ng, nb, na = cp[nx, ny]
                            if not near_white(nr, ng, nb, na):
                                body += 1
                if t >= 1 or body <= 2:
                    kill.append((x, y))
        for x, y in kill:
            cp[x, y] = (0, 0, 0, 0)
    return cell


def face_blade_left_heavy(crop: Image.Image) -> bool:
    p = crop.load()
    cw, ch = crop.size
    blade_l = blade_r = 0
    for y in range(ch):
        for x in range(cw):
            r, g, b, a = p[x, y]
            if a < 20:
                continue
            if 150 <= r <= 230 and 150 <= g <= 230 and 150 <= b <= 230 and abs(r - g) < 25:
                if x < cw // 2:
                    blade_l += 1
                else:
                    blade_r += 1
    return blade_l > blade_r * 1.3


def fit_cell(crop: Image.Image, flip: bool) -> Image.Image:
    crop = clean_fringe(crop)
    if flip:
        crop = crop.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    crop = clean_fringe(crop)
    pad = 6
    max_w, max_h = FW - pad * 2, FH - pad * 2
    cw, ch = crop.size
    if cw < 1 or ch < 1:
        return Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
    scale = min(max_w / cw, max_h / ch, 1.5)
    nw = max(1, int(round(cw * scale)))
    nh = max(1, int(round(ch * scale)))
    crop = crop.resize((nw, nh), Image.Resampling.NEAREST)
    cell = Image.new("RGBA", (FW, FH), (0, 0, 0, 0))
    ox = (FW - nw) // 2
    oy = max(2, FH - pad - nh)
    cell.paste(crop, (ox, oy), crop)
    return clean_fringe(cell)


def clean_sheet(sheet: Image.Image) -> Image.Image:
    sheet = clean_fringe(sheet)
    px = sheet.load()
    w, h = sheet.size
    for _ in range(3):
        kill: list[tuple[int, int]] = []
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if not near_white(r, g, b, a):
                    continue
                t = body = 0
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        if dx == 0 and dy == 0:
                            continue
                        nx, ny = x + dx, y + dy
                        if nx < 0 or ny < 0 or nx >= w or ny >= h or px[nx, ny][3] == 0:
                            t += 1
                        else:
                            nr, ng, nb, na = px[nx, ny]
                            if not near_white(nr, ng, nb, na):
                                body += 1
                if t >= 1 or body <= 2:
                    kill.append((x, y))
        for x, y in kill:
            px[x, y] = (0, 0, 0, 0)
    # tiny white islands
    visited = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            if visited[y][x]:
                continue
            r, g, b, a = px[x, y]
            if not near_white(r, g, b, a):
                visited[y][x] = True
                continue
            stack = [(x, y)]
            comp: list[tuple[int, int]] = []
            visited[y][x] = True
            while stack:
                cx, cy = stack.pop()
                comp.append((cx, cy))
                for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
                    nx, ny = cx + dx, cy + dy
                    if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx]:
                        nr, ng, nb, na = px[nx, ny]
                        if near_white(nr, ng, nb, na):
                            visited[ny][nx] = True
                            stack.append((nx, ny))
                        else:
                            visited[ny][nx] = True
            if len(comp) <= 8:
                for cx, cy in comp:
                    px[cx, cy] = (0, 0, 0, 0)
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a == 0:
                continue
            lum = (r + g + b) / 3.0
            sat = max(r, g, b) - min(r, g, b)
            if lum >= 210 and sat <= 30:
                px[x, y] = (0, 0, 0, 0)
            elif lum >= 195 and sat <= 25:
                t = sum(
                    1
                    for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1))
                    if not (0 <= x + dx < w and 0 <= y + dy < h) or px[x + dx, y + dy][3] == 0
                )
                if t >= 1:
                    px[x, y] = (0, 0, 0, 0)
    return sheet


def main() -> None:
    src_path = latest_src()
    im = Image.open(src_path).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if is_bg(r, g, b):
                px[x, y] = (0, 0, 0, 0)

    row_has = [any(px[x, y][3] > 0 for x in range(w)) for y in range(h)]
    row_bands = runs(row_has, 12)
    if len(row_bands) < 9:
        raise SystemExit(f"expected ≥9 row bands, got {len(row_bands)}")

    bounds = [0] + [(CORES[i] + CORES[i + 1]) // 2 for i in range(len(CORES) - 1)] + [w]
    cols = [[bounds[i], bounds[i + 1] - 1] for i in range(len(CORES))]

    def content_bbox(rx0: int, ry0: int, rx1: int, ry1: int):
        minx, miny, maxx, maxy = rx1, ry1, rx0, ry0
        found = False
        for y in range(max(0, ry0), min(h, ry1 + 1)):
            for x in range(max(0, rx0), min(w, rx1 + 1)):
                if px[x, y][3] > 0:
                    found = True
                    minx = min(minx, x)
                    miny = min(miny, y)
                    maxx = max(maxx, x)
                    maxy = max(maxy, y)
        return (minx, miny, maxx, maxy) if found else None

    def extract_raw(src_row: int, col_i: int) -> Image.Image:
        ry0, ry1 = row_bands[src_row]
        if src_row > 0:
            ry0 = (row_bands[src_row - 1][1] + ry0) // 2
        if src_row < len(row_bands) - 1:
            ry1 = (ry1 + row_bands[src_row + 1][0]) // 2
        cx0, cx1 = cols[col_i]
        bb = content_bbox(cx0, ry0, cx1, ry1)
        if not bb:
            return Image.new("RGBA", (8, 8), (0, 0, 0, 0))
        minx, miny, maxx, maxy = bb
        minx = max(0, minx - 1)
        miny = max(0, miny - 1)
        maxx = min(w - 1, maxx + 1)
        maxy = min(h - 1, maxy + 1)
        return im.crop((minx, miny, maxx + 1, maxy + 1))

    preflip: dict[str, bool] = {}
    for d, ri in BASE.items():
        if d in ("down", "up"):
            preflip[d] = False
        else:
            preflip[d] = face_blade_left_heavy(extract_raw(ri, 0))

    frames: dict[tuple[str, int], Image.Image] = {}
    for d, src_row in BASE.items():
        for col in range(NCOL):
            frames[(d, col)] = fit_cell(extract_raw(src_row, col), flip=preflip[d])

    for dst, src in MIRROR.items():
        for col in range(NCOL):
            flipped = frames[(src, col)].transpose(Image.Transpose.FLIP_LEFT_RIGHT)
            frames[(dst, col)] = clean_fringe(flipped)

    sheet = Image.new("RGBA", (FW * NCOL, FH * len(DIRS)), (0, 0, 0, 0))
    for ri, d in enumerate(DIRS):
        for col in range(NCOL):
            sheet.paste(frames[(d, col)], (col * FW, ri * FH), frames[(d, col)])
    sheet = clean_sheet(sheet)

    OUT_PNG.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(OUT_PNG)

    anims = {}
    for ri, d in enumerate(DIRS):
        for name, start, nframes, fps, loop in STATES:
            anims[f"{name}-{d}"] = {
                "row": ri,
                "startFrame": start,
                "frames": nframes,
                "fps": fps,
                "loop": loop,
            }
    OUT_JSON.write_text(
        json.dumps(
            {
                "image": "warrior.png",
                "frameSize": {"w": FW, "h": FH},
                "pivot": {"x": FW // 2, "y": FH - 8},
                "animations": anims,
            },
            indent=2,
        )
        + "\n"
    )
    print(f"packed {OUT_PNG} from {src_path.name}")
    print(f"json   {OUT_JSON} clips={len(anims)}")


if __name__ == "__main__":
    main()
