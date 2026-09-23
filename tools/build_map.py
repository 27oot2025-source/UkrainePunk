#!/usr/bin/env python3
"""Decode Natural Earth topojson, split the former Russian Federation, emit map paths."""
import json
import math
from collections import defaultdict
from pathlib import Path

from shapely.affinity import translate
from shapely.geometry import LineString, MultiPolygon, Polygon, box
from shapely.ops import unary_union
from shapely.validation import make_valid

ROOT = Path("/home/user/UkrainePunk")
TOPO = Path("/tmp/worldatlas/package/countries-110m.json")
ISO = json.loads(Path("/tmp/pkgs/iso/codes.json").read_text())
RU = json.loads(Path("/tmp/pkgs/iso/langs/ru.json").read_text())["countries"]

NUM_TO_A2 = {}
for a2, a3, num, _rest in ISO:
    NUM_TO_A2[num] = a2.lower()
    NUM_TO_A2[str(int(num))] = a2.lower()

W, H = 1000.0, 540.0
LAT_MIN, LAT_MAX = -56.0, 78.0


def merc_y(lat: float) -> float:
    lat = max(min(lat, 89.0), -89.0)
    r = math.radians(lat)
    return math.log(math.tan(math.pi / 4 + r / 2))


Y0 = merc_y(LAT_MAX)
Y1 = merc_y(LAT_MIN)


def project(lon: float, lat: float):
    x = (lon + 180.0) / 360.0 * W
    y = (Y0 - merc_y(lat)) / (Y0 - Y1) * H
    return x, y


def decode_arcs(topo):
    scale = topo["transform"]["scale"]
    trans = topo["transform"]["translate"]
    out = []
    for arc in topo["arcs"]:
        x = y = 0
        pts = []
        for dx, dy in arc:
            x += dx
            y += dy
            pts.append((x * scale[0] + trans[0], y * scale[1] + trans[1]))
        out.append(pts)
    return out


def ring_coords(arcs, indexes):
    pts = []
    for idx in indexes:
        if idx >= 0:
            seg = arcs[idx]
        else:
            seg = list(reversed(arcs[~idx]))
        if pts:
            seg = seg[1:]
        pts.extend(seg)
    if len(pts) >= 2 and pts[0] != pts[-1]:
        pts.append(pts[0])
    return pts


def split_dateline_ring(coords):
    """Break rings that hop the antimeridian so fills do not cross the Pacific."""
    if not coords or len(coords) < 4:
        return []
    ring = list(coords)
    if ring[0] == ring[-1]:
        ring = ring[:-1]
    n = len(ring)
    if n < 3:
        return []
    jumps = []
    for i in range(n):
        a = ring[i][0]
        b = ring[(i + 1) % n][0]
        if abs(a - b) > 180:
            jumps.append(i)
    if not jumps:
        return [ring + [ring[0]]]
    pieces = []
    nj = len(jumps)
    for k, i in enumerate(jumps):
        end_i = jumps[(k + 1) % nj]
        start_i = (i + 1) % n
        if start_i <= end_i:
            chain = ring[start_i:end_i + 1]
        else:
            chain = ring[start_i:] + ring[:end_i + 1]
        if len(chain) < 3:
            continue
        if chain[0] != chain[-1]:
            chain = chain + [chain[0]]
        pieces.append(chain)
    return pieces


def poly_from_rings(shell, holes):
    shells = split_dateline_ring(shell)
    if not shells:
        return None
    hole_rings = []
    for h in holes:
        hole_rings.extend(split_dateline_ring(h))
    polys = []
    for sh in shells:
        try:
            shell_poly = Polygon(sh)
        except Exception:
            continue
        if not shell_poly.is_valid:
            shell_poly = make_valid(shell_poly)
        if shell_poly.is_empty:
            continue
        used = []
        for hr in hole_rings:
            try:
                hc = Polygon(hr).representative_point()
            except Exception:
                continue
            try:
                if shell_poly.contains(hc):
                    used.append(hr)
            except Exception:
                continue
        try:
            poly = Polygon(sh, used) if used else shell_poly
        except Exception:
            poly = shell_poly
        if not poly.is_valid:
            poly = make_valid(poly)
        if poly.is_empty:
            continue
        minx, miny, maxx, maxy = poly.bounds
        # world-wrapping sliver: wide, short, and mostly ocean
        if (maxx - minx) > 220 and (maxy - miny) < 14 and poly.area > 40:
            continue
        polys.append(poly)
    if not polys:
        return None
    g = unary_union(polys)
    if not g.is_valid:
        g = make_valid(g)
    return g


def geom_from_topo(arcs, g):
    polys = []
    typ = g["type"]
    raw = g["arcs"]
    if typ == "Polygon":
        rings_sets = [raw]
    elif typ == "MultiPolygon":
        rings_sets = raw
    else:
        return None
    for rings in rings_sets:
        if not rings:
            continue
        shell = ring_coords(arcs, rings[0])
        holes = [ring_coords(arcs, r) for r in rings[1:]]
        if len(shell) < 4:
            continue
        fixed = poly_from_rings(shell, holes)
        if fixed is None or fixed.is_empty:
            continue
        polys.append(fixed)
    if not polys:
        return None
    g2 = unary_union(polys)
    if not g2.is_valid:
        g2 = make_valid(g2)
    return g2


def classify(lon, lat):
    if lon < 0:
        return "fr-pac"
    if lon < 26 and 53.4 <= lat <= 56.2:
        return "fr-kgd"
    if 32.2 <= lon <= 36.9 and 44.15 <= lat <= 46.35:
        return "crimea"
    if 32.0 <= lon < 49.5 and lat < 51.15:
        return "fr-don"
    if 33.0 <= lon <= 45.8 and 51.15 <= lat < 56.55:
        return "fr-mos"
    if lon < 50.0 and lat >= 56.55:
        return "fr-nov"
    if 45.8 < lon <= 60.0 and 49.5 <= lat <= 61.2:
        return "fr-vol"
    if 50.0 <= lon <= 68.0 and lat > 61.2:
        return "fr-ural"
    if 60.0 < lon <= 70.0:
        return "fr-ural"
    if 70.0 < lon <= 102.0:
        return "fr-sib"
    if 102.0 < lon <= 142.0:
        return "fr-yak"
    return "fr-pac"


FRACTURE_NAMES = {
    "fr-kgd": "Янтарный узел",
    "fr-nov": "Новгородский дата-анклав",
    "fr-mos": "Московская серая зона",
    "fr-vol": "Волжская лига",
    "fr-don": "Вольный Дон",
    "fr-ural": "Уральский промышленный пояс",
    "fr-sib": "Сибирская вольная республика",
    "fr-yak": "Якутский криополис",
    "fr-pac": "Тихоокеанский край",
}


def iter_polys(g):
    if g is None or g.is_empty:
        return
    if g.geom_type == "Polygon":
        yield g
    elif g.geom_type == "MultiPolygon":
        for p in g.geoms:
            yield p
    elif g.geom_type == "GeometryCollection":
        for p in g.geoms:
            yield from iter_polys(p)


def split_russia(russia):
    lines = []
    for lon in (26, 32.2, 33, 36.9, 45.8, 49.5, 50, 60, 68, 70, 102, 142):
        lines.append(LineString([(lon, 40.5), (lon, 82.5)]))
    for lat in (44.15, 46.35, 51.15, 56.55, 61.2):
        lines.append(LineString([(18, lat), (190, lat)]))
    # dateline-safe: also split near 180
    splitter = unary_union(lines)
    parts = []
    for poly in iter_polys(russia):
        try:
            pieces = split_poly(poly, splitter)
        except Exception:
            pieces = [poly]
        parts.extend(pieces)
    buckets = defaultdict(list)
    for poly in parts:
        if poly.is_empty or poly.area < 0.02:
            # keep tiny islands if they are real land (> ~0.01 deg^2 still small)
            if poly.area < 0.004:
                continue
        c = poly.representative_point()
        key = classify(c.x, c.y)
        buckets[key].append(poly)
    out = {}
    for key, geoms in buckets.items():
        merged = unary_union(geoms)
        if not merged.is_valid:
            merged = make_valid(merged)
        out[key] = merged
    return out


def split_poly(poly, splitter):
    from shapely.ops import split
    result = split(poly, splitter)
    geoms = []
    for g in result.geoms:
        if g.geom_type == "Polygon":
            geoms.append(g)
        elif g.geom_type == "MultiPolygon":
            geoms.extend(list(g.geoms))
        elif g.geom_type == "GeometryCollection":
            for gg in g.geoms:
                if gg.geom_type == "Polygon":
                    geoms.append(gg)
    return geoms or [poly]


CLIP = box(-180, LAT_MIN, 180, LAT_MAX)


def path_for(geom):
    geom = geom.intersection(CLIP)
    if geom.is_empty:
        return "", None
    if not geom.is_valid:
        geom = make_valid(geom)
    parts = []
    minx = miny = 1e9
    maxx = maxy = -1e9
    sx = sy = sa = 0.0
    for poly in iter_polys(geom):
        if poly.area < 1e-8:
            continue
        c = poly.centroid
        if c and not math.isnan(c.x):
            px, py = project(c.x, max(min(c.y, LAT_MAX), LAT_MIN))
            a = poly.area
            sx += px * a
            sy += py * a
            sa += a
        rings = [poly.exterior] + list(poly.interiors)
        for ring in rings:
            coords = list(ring.coords)
            if len(coords) < 4:
                continue
            cmds = []
            for i, (lon, lat) in enumerate(coords):
                lat = max(min(lat, LAT_MAX), LAT_MIN)
                x, y = project(lon, lat)
                minx, miny = min(minx, x), min(miny, y)
                maxx, maxy = max(maxx, x), max(maxy, y)
                cmds.append(f"{'M' if i == 0 else 'L'}{x:.2f} {y:.2f}")
            cmds.append("Z")
            parts.append("".join(cmds))
    if not parts or sa == 0:
        return "", None
    bbox = [round(minx, 2), round(miny, 2), round(maxx, 2), round(maxy, 2)]
    centroid = [round(sx / sa, 2), round(sy / sa, 2)]
    return "".join(parts), {"bbox": bbox, "centroid": centroid}


def main():
    topo = json.loads(TOPO.read_text())
    arcs = decode_arcs(topo)
    geoms = topo["objects"]["countries"]["geometries"]
    regions = []
    skipped = []
    for g in geoms:
        name_en = g["properties"]["name"]
        if name_en in ("Antarctica", "Fr. S. Antarctic Lands"):
            continue
        geom = geom_from_topo(arcs, g)
        if geom is None:
            skipped.append(name_en)
            continue
        gid = str(g.get("id") or "")
        if name_en == "Russia" or gid in ("643", "643"):
            pieces = split_russia(geom)
            crimea = pieces.pop("crimea", None)
            # stash crimea to union into Ukraine later
            globals()["CRIMEA"] = crimea
            for key, piece in pieces.items():
                pth, meta = path_for(piece)
                if not pth:
                    continue
                regions.append({
                    "id": key,
                    "iso2": None,
                    "flag": key,
                    "name": FRACTURE_NAMES[key],
                    "nameEn": key,
                    "former": True,
                    "path": pth,
                    **meta,
                })
            continue
        iso2 = NUM_TO_A2.get(gid) or NUM_TO_A2.get(gid.zfill(3))
        # world-atlas ids are numeric without padding sometimes
        if iso2 is None and gid.isdigit():
            iso2 = NUM_TO_A2.get(f"{int(gid):03d}")
        ru_name = RU.get(iso2.upper(), name_en) if iso2 else name_en
        if isinstance(ru_name, list):
            ru_name = ru_name[0]
        if not isinstance(ru_name, str):
            ru_name = name_en
        # Kosovo etc.
        special = {
            "Kosovo": ("xk", "Косово"),
            "N. Cyprus": ("ncy", "Турецкая республика Северного Кипра"),
            "Somaliland": ("sol", "Сомалиленд"),
            "Palestine": ("ps", "Палестина"),
            "W. Sahara": ("eh", "Западная Сахара"),
            "eSwatini": ("sz", "Эсватини"),
            "Bosnia and Herz.": ("ba", "Босния и Герцеговина"),
            "Central African Rep.": ("cf", "Центральноафриканская Республика"),
            "Dem. Rep. Congo": ("cd", "ДР Конго"),
            "Dominican Rep.": ("do", "Доминиканская Республика"),
            "Eq. Guinea": ("gq", "Экваториальная Гвинея"),
            "S. Sudan": ("ss", "Южный Судан"),
            "Solomon Is.": ("sb", "Соломоновы Острова"),
        }
        if name_en in special:
            iso2, ru_name = special[name_en]
        pth, meta = path_for(geom)
        if not pth:
            skipped.append(name_en)
            continue
        regions.append({
            "id": iso2 or name_en.lower().replace(" ", "-"),
            "iso2": iso2,
            "flag": iso2,
            "name": ru_name,
            "nameEn": name_en,
            "former": False,
            "path": pth,
            **meta,
        })

    crimea = globals().get("CRIMEA")
    if crimea is not None and not crimea.is_empty:
        for r in regions:
            if r["id"] == "ua":
                # rebuild ukraine path with crimea — need original geom. We'll union via stored? not stored.
                pass
    # Union crimea into Ukraine if we still have geometry. Re-read Ukraine from regions is paths only.
    # Handle below by re-decoding Ukraine if crimea exists.
    if crimea is not None and not getattr(crimea, "is_empty", True):
        for g in geoms:
            if g["properties"]["name"] == "Ukraine":
                ua = geom_from_topo(arcs, g)
                ua2 = unary_union([ua, crimea])
                pth, meta = path_for(ua2)
                for r in regions:
                    if r["id"] == "ua":
                        r["path"] = pth
                        r.update(meta)
                break

    # sanity
    ids = [r["id"] for r in regions]
    dup = {i for i in ids if ids.count(i) > 1}
    print("regions", len(regions), "skipped", skipped, "dups", dup)
    print("fracture:")
    for r in regions:
        if r["former"]:
            print(f"  {r['id']:10} area-bbox {r['bbox']} centroid {r['centroid']}")
    missing_flags = []
    flag_dir = ROOT / "assets" / "flags"
    for r in regions:
        if r["former"]:
            continue
        f = flag_dir / f"{r['flag']}.svg"
        if not f.exists():
            missing_flags.append((r["id"], r["name"], r["flag"]))
    print("missing flags", missing_flags)

    out = {"w": W, "h": H, "regions": regions}
    dest = ROOT / "data" / "map.json"
    dest.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print("wrote", dest, "bytes", dest.stat().st_size)

    # preview svg
    colors = {
        "fr-kgd": "#e6a322",
        "fr-nov": "#3d8bfd",
        "fr-mos": "#8d93a3",
        "fr-vol": "#2fbf8f",
        "fr-don": "#e23b4a",
        "fr-ural": "#c46b2c",
        "fr-sib": "#3d9a62",
        "fr-yak": "#b9e7ff",
        "fr-pac": "#7a6cff",
    }
    svg = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="1200" height="648">']
    svg.append('<rect width="100%" height="100%" fill="#0c1424"/>')
    for r in regions:
        fill = colors.get(r["id"], "#e8c45c" if r["id"] == "ua" else "#1d3358")
        svg.append(f'<path d="{r["path"]}" fill="{fill}" stroke="#081018" stroke-width="0.4"/>')
    svg.append("</svg>")
    prev = Path("/tmp/map-preview.svg")
    prev.write_text("".join(svg))
    print("preview", prev)


if __name__ == "__main__":
    main()
