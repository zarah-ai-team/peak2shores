"""
Foreground cut-outs for the Destinations story (src/components/destinations/PlaceStory.tsx).

Each country's photograph is drawn twice: whole, behind the country's name, and
again in front of the name as a cut-out of its foreground, the same picture with
its sky made transparent. So the name sits in the sky and the land, the town or
the sea cuts into its lower part. This script makes those cut-outs.

    python scripts/destination-cutouts.py                    # all three
    python scripts/destination-cutouts.py italy              # one
    python scripts/destination-cutouts.py --debug=<folder>   # also writes visual checks there

Writes public/images/destinations/<slug>-fg.webp: RGBA, the same pixel size as
the source photograph, so the page can lay both out with the same next/image
`fill`, object-fit and object-position and they always align. If a source
photograph is replaced, run this again (and check the skyline numbers it prints
against `skyline` in SCENES, src/components/destinations/story.ts).

How a cut-out is made (OpenCV, numpy, Pillow):
  1. GrabCut at a working size, seeded with what is certainly sky (the top of
     the frame) and certainly ground (the foot of the frame) for each photograph,
     plus a colour prior: pixels close to the sky's own colours are "probably sky".
     It starts from a fixed random state, so a photograph is always cut the
     same way, alone or with the others.
  2. The sky is the part of that result connected to the top edge; small specks
     of sky inside the land (gaps between leaves) are filled, specks of land in
     the sky (birds, haze) removed.
  3. At full size, a local colour matte across the edge: each edge pixel is
     placed between the local sky colour and the local ground colour, which
     follows the photograph's own anti-aliasing, then a guided filter snaps the
     matte to the image's edges. The edge is pulled half a pixel into the
     ground and feathered by one pixel, so no rim of sky is carried in front of
     the name.
  4. Edge pixels are decontaminated (their sky share is removed from their
     colour), so a part-transparent pixel never shows a pale fringe over the
     white name.
"""

from __future__ import annotations

import os
import sys

import cv2
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, 'public', 'images', 'destinations')

# The photographs, and what is certainly sky / certainly ground in each, as
# polygons in fractions of the frame (x, y). Everything between is decided by
# GrabCut. `sky_sample` is where the sky's colours are read from.
PHOTOS = {
    'switzerland': {
        'src': 'public/images/drive/switzerland-gstaad-meadow.jpg',
        'sky': [[(0, 0), (1, 0), (1, 0.33), (0, 0.33)]],
        'ground': [[(0, 0.565), (1, 0.565), (1, 1), (0, 1)]],
        'sky_sample': (0.0, 0.05, 1.0, 0.33),
    },
    'italy': {
        'src': 'public/images/ac-venice.jpg',
        'sky': [
            [(0.035, 0), (1, 0), (1, 0.22), (0.035, 0.22)],
            [(0.035, 0.22), (0.2, 0.22), (0.2, 0.27), (0.035, 0.27)],
            [(0.3, 0.22), (0.5, 0.22), (0.5, 0.45), (0.3, 0.45)],
        ],
        # The canal and its foot; the palazzo down the left edge (its facade
        # from under its roof, then the wider block below). Its roof and the
        # finials on it are left to GrabCut, for the sky between them.
        'ground': [
            [(0, 0.7), (1, 0.7), (1, 1), (0, 1)],
            [(0, 0.14), (0.018, 0.14), (0.022, 0.16), (0.022, 0.38), (0, 0.38)],
            [(0, 0.385), (0.165, 0.385), (0.165, 0.7), (0, 0.7)],
        ],
        'sky_sample': (0.25, 0.02, 1.0, 0.5),
    },
    'croatia': {
        'src': 'public/images/home/hotel-grand-park-rovinj-aerial.jpg',
        # Seen from the air, the name stands out at sea: the sky and the open
        # water up to the wooded island are the background, and the island's
        # tree line is the edge that cuts into the name. The open water is
        # read as one height field (the first land from the top of each
        # column), so the bays behind the nearer islands stay in front.
        # Background: the sky, the far coast on the horizon and the open water
        # down to just above the island.
        'sky': [
            [(0, 0), (1, 0), (1, 0.452), (0, 0.452)],
            [(0.02, 0.452), (0.17, 0.452), (0.17, 0.463), (0.02, 0.463)],
        ],
        'ground': [[(0, 0.6), (1, 0.6), (1, 1), (0, 1)]],
        'sky_sample': (0.0, 0.3, 1.0, 0.452),
        'heightfield': True,
    },
}

WORK = 1600  # long side for GrabCut


def load(path: str) -> np.ndarray:
    img = cv2.imdecode(np.fromfile(os.path.join(ROOT, path), dtype=np.uint8), cv2.IMREAD_COLOR)
    if img is None:
        raise SystemExit(f'cannot read {path}')
    return img


def poly_mask(shape, polys) -> np.ndarray:
    h, w = shape[:2]
    m = np.zeros((h, w), np.uint8)
    for poly in polys:
        pts = np.array([[round(x * (w - 1)), round(y * (h - 1))] for x, y in poly], np.int32)
        cv2.fillPoly(m, [pts], 1)
    return m.astype(bool)


def sky_likeness(lab: np.ndarray, sample: np.ndarray) -> np.ndarray:
    """Mahalanobis distance of each pixel's Lab colour to the nearest of the sky sample's colour clusters (three)."""
    pts = sample.reshape(-1, 3).astype(np.float32)
    if len(pts) > 60000:
        pts = pts[np.random.default_rng(1).choice(len(pts), 60000, replace=False)]
    crit = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 30, 0.5)
    _, labels, centers = cv2.kmeans(pts, 3, None, crit, 3, cv2.KMEANS_PP_CENTERS)
    best = np.full(lab.shape[:2], np.inf, np.float32)
    flat = lab.reshape(-1, 3).astype(np.float32)
    for k in range(len(centers)):
        cl = pts[labels.ravel() == k]
        if len(cl) < 50:
            continue
        cov = np.cov(cl.T) + np.eye(3) * 4.0
        inv = np.linalg.inv(cov)
        d = flat - centers[k]
        md = np.sqrt(np.einsum('ij,jk,ik->i', d, inv, d)).reshape(lab.shape[:2])
        best = np.minimum(best, md)
    return best


def grabcut(img: np.ndarray, cfg: dict) -> np.ndarray:
    """Binary sky mask (True = sky) at working size."""
    # k-means and GrabCut start from OpenCV's random state, and the cut follows
    # where they start (a bank of cloud can go either way). Fixed here, so a
    # photograph is always cut the same way, whichever photographs run with it.
    cv2.setRNGSeed(2)
    h, w = img.shape[:2]
    s = WORK / max(h, w)
    small = cv2.resize(img, (round(w * s), round(h * s)), interpolation=cv2.INTER_AREA)
    sh, sw = small.shape[:2]
    lab = cv2.cvtColor(small, cv2.COLOR_BGR2LAB)
    x0, y0, x1, y1 = cfg['sky_sample']
    sample = lab[int(y0 * sh) : int(y1 * sh), int(x0 * sw) : int(x1 * sw)]
    dist = sky_likeness(lab, sample)

    sky = poly_mask(small.shape, cfg['sky'])
    ground = poly_mask(small.shape, cfg['ground'])
    mask = np.full((sh, sw), cv2.GC_PR_FGD, np.uint8)
    mask[dist < 3.0] = cv2.GC_PR_BGD
    mask[sky] = cv2.GC_BGD
    mask[ground] = cv2.GC_FGD
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(small, mask, None, bgd, fgd, 8, cv2.GC_INIT_WITH_MASK)
    is_sky = (mask == cv2.GC_BGD) | (mask == cv2.GC_PR_BGD)
    sky_mask = clean(is_sky, top_connected=True)
    if cfg.get('heightfield'):
        sky_mask = heightfield(sky_mask)
    return sky_mask


def heightfield(sky: np.ndarray, run: int = 8) -> np.ndarray:
    """Background is only what lies above the first solid ground in each column."""
    h, w = sky.shape
    ground = (~sky).astype(np.uint8)
    # A column's ground starts where `run` ground pixels follow one another.
    solid = cv2.erode(ground, np.ones((run, 1), np.uint8), anchor=(0, 0)).astype(bool)
    first = np.where(solid.any(axis=0), np.argmax(solid, axis=0), h)
    # Smooth single-column spikes (a mast, a gull) without rounding real shapes.
    first = cv2.medianBlur(first.astype(np.float32).reshape(1, -1), 5).ravel().astype(int)
    rows = np.arange(h)[:, None]
    return rows < first[None, :]


def clean(is_sky: np.ndarray, top_connected: bool) -> np.ndarray:
    h, w = is_sky.shape
    sky = is_sky.astype(np.uint8)
    # The sky is what is connected to the top edge.
    n, lab, stats, _ = cv2.connectedComponentsWithStats(sky, connectivity=4)
    keep = np.zeros(n, bool)
    if top_connected:
        keep[np.unique(lab[0, :])] = True
        keep[0] = False
    out = keep[lab]
    # Specks of land floating in the sky (birds, haze) are sky: any small
    # ground component that touches neither the foot of the frame nor a side
    # below the top 40% of it.
    ground = (~out).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(ground, connectivity=4)
    area_min = h * w * 0.0004
    for k in range(1, n):
        x, y, bw, bh, area = stats[k]
        touches = (y + bh >= h - 1) or ((x == 0 or x + bw >= w - 1) and y + bh > h * 0.4)
        if not touches and area < area_min * 6:
            out[lab == k] = True
    return out


def box(a: np.ndarray, r: int) -> np.ndarray:
    return cv2.boxFilter(a, -1, (2 * r + 1, 2 * r + 1), normalize=True, borderType=cv2.BORDER_REFLECT)


def guided(guide: np.ndarray, src: np.ndarray, r: int, eps: float) -> np.ndarray:
    """He et al.'s guided filter with a colour guide (float32, 0..1)."""
    I = guide
    p = src
    mean_p = box(p, r)
    mean_I = [box(I[..., c], r) for c in range(3)]
    cov_Ip = [box(I[..., c] * p, r) - mean_I[c] * mean_p for c in range(3)]
    var = np.empty(I.shape[:2] + (3, 3), np.float32)
    for i in range(3):
        for j in range(i, 3):
            v = box(I[..., i] * I[..., j], r) - mean_I[i] * mean_I[j]
            var[..., i, j] = v
            var[..., j, i] = v
    var += np.eye(3, dtype=np.float32) * eps
    inv = np.linalg.inv(var)
    cov = np.stack(cov_Ip, -1)[..., None]
    a = (inv @ cov)[..., 0]
    b = mean_p - (a * np.stack(mean_I, -1)).sum(-1)
    mean_a = np.stack([box(a[..., c], r) for c in range(3)], -1)
    mean_b = box(b, r)
    return (mean_a * I).sum(-1) + mean_b


def refine(img: np.ndarray, sky_small: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Full-size alpha (1 = ground) and decontaminated colours."""
    h, w = img.shape[:2]
    ground = cv2.resize((~sky_small).astype(np.float32), (w, h), interpolation=cv2.INTER_LINEAR) > 0.5

    # The band either side of the edge in which the matte is worked out.
    band_r = max(6, round(max(h, w) / WORK * 3))
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * band_r + 1, 2 * band_r + 1))
    g8 = ground.astype(np.uint8)
    inner_full = cv2.erode(g8, k).astype(bool)  # certainly ground
    outer_full = ~cv2.dilate(g8, k).astype(bool)  # certainly sky
    band_full = ~(inner_full | outer_full)

    # Work only on the rows the edge crosses (with room for the filters).
    rr = band_r * 3
    rows = np.where(band_full.any(axis=1))[0]
    top = max(0, int(rows.min()) - 4 * rr)
    bot = min(h, int(rows.max()) + 4 * rr + 1)
    alpha_full = np.where(ground, 1.0, 0.0).astype(np.float32)
    rgb_full = img.copy()
    a_crop, rgb_crop = matte(img[top:bot], inner_full[top:bot], outer_full[top:bot], ground[top:bot], rr)
    alpha_full[top:bot] = a_crop
    rgb_full[top:bot] = rgb_crop
    return alpha_full, rgb_full


def matte(img: np.ndarray, inner: np.ndarray, outer: np.ndarray, ground: np.ndarray, rr: int):
    f = img.astype(np.float32) / 255.0

    def local_mean(sel: np.ndarray) -> np.ndarray:
        wsel = sel.astype(np.float32)
        num = np.stack([cv2.GaussianBlur(f[..., c] * wsel, (0, 0), rr) for c in range(3)], -1)
        den = cv2.GaussianBlur(wsel, (0, 0), rr)[..., None]
        return num / np.maximum(den, 1e-4)

    F = local_mean(inner)
    S = local_mean(outer)
    d = F - S
    denom = (d * d).sum(-1)
    a = ((f - S) * d).sum(-1) / np.maximum(denom, 1e-4)
    a = np.clip(a, 0, 1)
    # Where ground and sky are too alike in colour, trust the segmentation.
    weak = denom < 0.004
    a[weak] = ground[weak].astype(np.float32)
    alpha = np.where(inner, 1.0, np.where(outer, 0.0, a)).astype(np.float32)

    # Snap to the image's edges, then keep the edge to about a pixel.
    alpha = guided(f, alpha, r=2, eps=1e-4)
    alpha = np.clip(alpha, 0, 1)
    # Pull the edge half a pixel into the ground, then a 1px feather.
    alpha = np.clip((alpha - 0.5) * 2.2 + 0.5 - 0.12, 0, 1)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.6)
    alpha[inner] = 1.0
    alpha[outer] = 0.0

    # Decontaminate: remove the sky's share from part-transparent pixels.
    A = alpha[..., None]
    pure = np.where(A > 0.25, (f - (1 - A) * S) / np.maximum(A, 1e-3), F)
    pure = np.clip(pure, 0, 1)
    rgb = np.where((A > 0.0) & (A < 0.995), pure, f)
    # Below fully transparent pixels, carry the ground colour outward so no
    # resampler can pull sky into the edge.
    rgb = np.where(A <= 0.0, F, rgb)
    return alpha, (rgb * 255 + 0.5).astype(np.uint8)


def skyline(alpha: np.ndarray, x0=0.0, x1=1.0) -> dict:
    h, w = alpha.shape
    cols = alpha[:, int(x0 * w) : int(x1 * w)] > 0.5
    first = np.argmax(cols, axis=0).astype(np.float32)
    first[~cols.any(axis=0)] = h
    y = first / h
    return {
        'median': round(float(np.median(y)), 4),
        'min': round(float(y.min()), 4),
        'p90': round(float(np.percentile(y, 90)), 4),
        'max': round(float(y.max()), 4),
    }


def debug_views(slug: str, img: np.ndarray, alpha: np.ndarray, rgb: np.ndarray, DEBUG_DIR: str) -> None:
    os.makedirs(DEBUG_DIR, exist_ok=True)
    h, w = img.shape[:2]
    # 1. The edge drawn on the photograph.
    edge = cv2.Canny((alpha > 0.5).astype(np.uint8) * 255, 50, 150)
    over = img.copy()
    over[cv2.dilate(edge, np.ones((3, 3), np.uint8)) > 0] = (0, 0, 255)
    s = 1600 / max(h, w)
    cv2.imencode('.jpg', cv2.resize(over, (round(w * s), round(h * s)), interpolation=cv2.INTER_AREA))[1].tofile(
        os.path.join(DEBUG_DIR, f'{slug}-edge.jpg')
    )
    # 2. The cut-out over white and over a saturated red, to show any halo.
    for name, col in (('white', (255, 255, 255)), ('red', (40, 40, 220))):
        bg = np.empty_like(img)
        bg[:] = col
        comp = (rgb.astype(np.float32) * alpha[..., None] + bg.astype(np.float32) * (1 - alpha[..., None])).astype(np.uint8)
        cv2.imencode('.jpg', cv2.resize(comp, (round(w * s), round(h * s)), interpolation=cv2.INTER_AREA))[1].tofile(
            os.path.join(DEBUG_DIR, f'{slug}-on-{name}.jpg')
        )


def run(slug: str, debug: str | None) -> None:
    cfg = PHOTOS[slug]
    img = load(cfg['src'])
    h, w = img.shape[:2]
    sky_small = grabcut(img, cfg)
    alpha, rgb = refine(img, sky_small)
    rgba = np.dstack([cv2.cvtColor(rgb, cv2.COLOR_BGR2RGB), (alpha * 255 + 0.5).astype(np.uint8)])
    os.makedirs(OUT_DIR, exist_ok=True)
    out = os.path.join(OUT_DIR, f'{slug}-fg.webp')
    Image.fromarray(rgba, 'RGBA').save(out, 'WEBP', quality=86, method=6, alpha_quality=100)
    size = os.path.getsize(out)
    lines = {
        'whole': skyline(alpha),
        'centre': skyline(alpha, 0.2, 0.8),
        'middle': skyline(alpha, 0.33, 0.67),
    }
    print(f'{slug}: {w}x{h} -> {os.path.relpath(out, ROOT)} ({size // 1024} KB)')
    for k, v in lines.items():
        print(f'  skyline {k:6s} {v}')
    if debug:
        debug_views(slug, img, alpha, rgb, debug)


if __name__ == '__main__':
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    dbg = next((a.split('=', 1)[1] for a in sys.argv[1:] if a.startswith('--debug=')), None)
    for name in args or list(PHOTOS):
        run(name, dbg)
