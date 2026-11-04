# -*- coding: utf-8 -*-
"""PBS フォルダを読み込んで、攻略データベース用の Wiki/data.js を生成する。

使い方:  python Wiki/build_wiki.py
生成後に Wiki/index.html をブラウザで開く。
"""
import glob
import json
import os
import re
import shutil
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PBS = os.path.join(ROOT, "PBS")
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.js")

HEADER_RE = re.compile(r"^\[(.+?)\]")
KEYVAL_RE = re.compile(r"^(\s*)(\w+)\s*=\s*(.*?)\s*$")


def read_lines(path):
    with open(path, encoding="utf-8-sig") as f:
        for raw in f:
            line = raw.rstrip("\r\n")
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            yield line


def read_sections(path):
    """[header] ごとに (header, [(indented, key, value), ...]) を返す。"""
    sections = []
    cur = None
    for line in read_lines(path):
        m = HEADER_RE.match(line)
        if m:
            cur = (m.group(1).strip(), [])
            sections.append(cur)
            continue
        if cur is None:
            continue
        m = KEYVAL_RE.match(line)
        if m:
            cur[1].append((len(m.group(1)) > 0, m.group(2), m.group(3)))
    return sections


def pbs_files(base):
    """base.txt と base_*.txt (例: items_terastal.txt) をまとめて返す。"""
    files = [os.path.join(PBS, base + ".txt")]
    files += sorted(glob.glob(os.path.join(PBS, base + "_*.txt")))
    return [f for f in files if os.path.isfile(f)]


def csv(value):
    return [v.strip() for v in value.split(",")] if value else []


def to_int(value, default=0):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default


# ---------------------------------------------------------------- types
def build_types():
    types = {}
    for path in pbs_files("types"):
        for head, kvs in read_sections(path):
            d = {k: v for _, k, v in kvs}
            types[head] = {
                "id": head,
                "icon": to_int(d.get("IconPosition")),
                "weak": csv(d.get("Weaknesses")),
                "res": csv(d.get("Resistances")),
                "imm": csv(d.get("Immunities")),
                "special": d.get("IsSpecialType") == "true",
                "pseudo": d.get("IsPseudoType") == "true",
            }
    return types


# ---------------------------------------------------------------- moves
def build_moves():
    moves = {}
    for path in pbs_files("moves"):
        for head, kvs in read_sections(path):
            d = {k: v for _, k, v in kvs}
            moves[head] = {
                "n": d.get("Name", head),
                "t": d.get("Type", "NORMAL"),
                "c": d.get("Category", "Status"),
                "p": to_int(d.get("Power")),
                "a": to_int(d.get("Accuracy")),
                "pp": to_int(d.get("TotalPP")),
                "pr": to_int(d.get("Priority")),
                "tg": d.get("Target", ""),
                "ec": to_int(d.get("EffectChance")),
                "fl": csv(d.get("Flags")),
                "fc": d.get("FunctionCode", ""),
                "d": d.get("Description", ""),
            }
    return moves


# ---------------------------------------------------------------- abilities
def build_abilities():
    abilities = {}
    for path in pbs_files("abilities"):
        for head, kvs in read_sections(path):
            d = {k: v for _, k, v in kvs}
            abilities[head] = {
                "n": d.get("Name", head),
                "d": d.get("Description", d.get("Decription", "")),
                "fl": csv(d.get("Flags")),
            }
    return abilities


# ---------------------------------------------------------------- items
def build_items():
    items = {}
    for path in pbs_files("items"):
        for head, kvs in read_sections(path):
            d = {k: v for _, k, v in kvs}
            price = to_int(d.get("Price"))
            item = {
                "n": d.get("Name", head),
                "pk": to_int(d.get("Pocket"), 1),
                "pr": price,
                "sp": to_int(d.get("SellPrice"), price // 2),
                "bp": to_int(d.get("BPPrice")),
                "fl": csv(d.get("Flags")),
                "d": d.get("Description", ""),
            }
            if d.get("Move"):
                item["mv"] = d["Move"]
            if d.get("HeldDescription"):
                item["hd"] = d["HeldDescription"]
            items[head] = item
    return items


# ---------------------------------------------------------------- species
def parse_species_fields(kvs):
    d = {}
    for _, k, v in kvs:
        d[k] = v
    out = {}
    if "Name" in d:
        out["n"] = d["Name"]
    if "FormName" in d:
        out["fn"] = d["FormName"]
    if "Types" in d:
        out["t"] = csv(d["Types"])
    if "BaseStats" in d:
        out["bs"] = [to_int(x) for x in csv(d["BaseStats"])]
    if "Abilities" in d:
        out["ab"] = csv(d["Abilities"])
    if "HiddenAbilities" in d:
        out["ha"] = csv(d["HiddenAbilities"])
    if "Moves" in d:
        p = csv(d["Moves"])
        out["lm"] = [[to_int(p[i]), p[i + 1]] for i in range(0, len(p) - 1, 2)]
    if "TutorMoves" in d:
        out["tm"] = csv(d["TutorMoves"])
    if "EggMoves" in d:
        out["em"] = csv(d["EggMoves"])
    if "EggGroups" in d:
        out["eg"] = csv(d["EggGroups"])
    if "Evolutions" in d:
        p = csv(d["Evolutions"])
        out["evo"] = [p[i:i + 3] + [""] * (3 - len(p[i:i + 3]))
                      for i in range(0, len(p), 3)]
    if "EVs" in d:
        p = csv(d["EVs"])
        out["ev"] = [[p[i], to_int(p[i + 1])] for i in range(0, len(p) - 1, 2)]
    for key, short in (("Height", "ht"), ("Weight", "wt")):
        if key in d:
            out[short] = float(d[key]) if d[key] else 0
    for key, short in (("CatchRate", "cr"), ("BaseExp", "exp"),
                       ("HatchSteps", "hatch"), ("Happiness", "hap"),
                       ("Generation", "gen")):
        if key in d:
            out[short] = to_int(d[key])
    for key, short in (("Category", "cat"), ("Pokedex", "dex"),
                       ("GrowthRate", "gr"), ("GenderRatio", "gender"),
                       ("Color", "col"), ("Shape", "shape"),
                       ("Habitat", "hab"), ("MegaStone", "mega"),
                       ("MegaMove", "megamv"), ("GmaxMove", "gmax"),
                       ("WildItemCommon", "wic"), ("WildItemUncommon", "wiu"),
                       ("WildItemRare", "wir"), ("Incense", "inc")):
        if key in d:
            out[short] = d[key]
    if "Flags" in d:
        out["fl"] = csv(d["Flags"])
    if "Offspring" in d:
        out["off"] = csv(d["Offspring"])
    return out


def build_species():
    species = {}
    order = []
    for head, kvs in read_sections(os.path.join(PBS, "pokemon.txt")):
        data = parse_species_fields(kvs)
        data["sp"] = head
        data["f"] = 0
        species[head] = data
        order.append(head)

    forms_path = os.path.join(PBS, "pokemon_forms.txt")
    if os.path.isfile(forms_path):
        for head, kvs in read_sections(forms_path):
            parts = csv(head)
            base_id, form = parts[0], to_int(parts[1] if len(parts) > 1 else 0)
            base = species.get(base_id)
            if base is None or form == 0:
                continue
            data = {k: v for k, v in base.items() if k not in ("fn",)}
            own = parse_species_fields(kvs)
            # 形態固有の値で上書き (未指定はベースから継承)
            data.update(own)
            data["f"] = form
            data["sp"] = base_id
            fid = "%s_%d" % (base_id, form)
            species[fid] = data
            order.append(fid)
    return species, order


# ---------------------------------------------------------------- encounters
ENC_HEADER_RE = re.compile(r"^\[(\d+)(?:\s*,\s*(\d+))?\]\s*(?:#\s*(.*))?$")
ENC_TYPE_RE = re.compile(r"^([A-Za-z]+)\s*(?:,\s*(\d+))?\s*$")


def build_encounters():
    path = os.path.join(PBS, "encounters.txt")
    result = []
    cur = None
    etype = None
    with open(path, encoding="utf-8-sig") as f:
        for raw in f:
            line = raw.rstrip("\r\n")
            if not line.strip() or line.lstrip().startswith("#"):
                continue
            m = ENC_HEADER_RE.match(line.strip())
            if m:
                cur = {"map": int(m.group(1)), "ver": to_int(m.group(2)),
                       "c": (m.group(3) or "").strip(), "e": {}}
                result.append(cur)
                etype = None
                continue
            if cur is None:
                continue
            s = line.strip()
            m = ENC_TYPE_RE.match(s)
            if m and not s[0].isdigit():
                etype = m.group(1)
                cur["e"][etype] = {"rate": to_int(m.group(2)), "list": []}
                continue
            if etype:
                p = csv(s)
                if len(p) >= 3:
                    lo = to_int(p[2])
                    hi = to_int(p[3]) if len(p) > 3 else lo
                    cur["e"][etype]["list"].append([to_int(p[0]), p[1], lo, hi])
    return result


# ---------------------------------------------------------------- maps
def build_maps():
    maps = {}
    path = os.path.join(PBS, "map_metadata.txt")
    if os.path.isfile(path):
        with open(path, encoding="utf-8-sig") as f:
            cur = None
            for raw in f:
                line = raw.strip()
                m = re.match(r"^\[(\d+)\]\s*(?:#\s*(.*))?$", line)
                if m:
                    cur = int(m.group(1))
                    maps[cur] = {"c": (m.group(2) or "").strip()}
                    continue
                m = KEYVAL_RE.match(line)
                if cur is not None and m:
                    k, v = m.group(2), m.group(3)
                    if k == "Name":
                        maps[cur]["n"] = v
                    elif k == "Outdoor":
                        maps[cur]["out"] = v == "true"
                    elif k == "MapPosition":
                        maps[cur]["pos"] = [to_int(x) for x in csv(v)]
    return maps


def build_region():
    path = os.path.join(PBS, "town_map.txt")
    name = ""
    if os.path.isfile(path):
        for head, kvs in read_sections(path):
            for _, k, v in kvs:
                if k == "Name" and not name:
                    name = v
    return name


def build_regional_dex():
    path = os.path.join(PBS, "regional_dexes.txt")
    dexes = []
    if not os.path.isfile(path):
        return dexes
    cur = None
    for line in read_lines(path):
        m = HEADER_RE.match(line)
        if m:
            cur = []
            dexes.append(cur)
            continue
        if cur is not None:
            cur.extend(x for x in csv(line.strip()) if x)
    return dexes


# ---------------------------------------------------------------- plugins
def build_plugins():
    """ジョインアベニュー・大量発生の設定を dump_plugins.rb (Ruby) で読む。"""
    ruby = shutil.which("ruby")
    script = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dump_plugins.rb")
    if not ruby:
        print("warning: ruby が見つからないため ジョインアベニュー・大量発生 は省略")
        return {}
    res = subprocess.run([ruby, script], capture_output=True)
    if res.stderr:
        print(res.stderr.decode("utf-8", "replace").strip())
    if res.returncode != 0:
        print("warning: dump_plugins.rb が失敗したため ジョインアベニュー・大量発生 は省略")
        return {}
    return json.loads(res.stdout.decode("utf-8"))


def main():
    species, order = build_species()
    plugins = build_plugins()
    data = {
        "region": build_region(),
        "types": build_types(),
        "moves": build_moves(),
        "abilities": build_abilities(),
        "items": build_items(),
        "species": species,
        "order": order,
        "dex": build_regional_dex(),
        "encounters": build_encounters(),
        "maps": build_maps(),
        "avenue": plugins.get("avenue"),
        "outbreak": plugins.get("outbreak"),
    }
    js = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    with open(OUT, "w", encoding="utf-8") as f:
        f.write("// build_wiki.py で自動生成。直接編集しないこと。\n")
        f.write("window.WIKI_DATA=")
        f.write(js)
        f.write(";\n")
    print("wrote %s (%.1f KB)" % (OUT, os.path.getsize(OUT) / 1024))
    print("species %d / moves %d / abilities %d / items %d / encounter maps %d"
          % (len(species), len(data["moves"]), len(data["abilities"]),
             len(data["items"]), len(data["encounters"])))
    print("avenue %s / outbreak %d"
          % ("ok" if data["avenue"] else "none",
             len((data["outbreak"] or {}).get("list", []))))


if __name__ == "__main__":
    main()
    # スマホ用の 1ファイル版も作りなおす
    import build_mobile
    build_mobile.main()
