# -*- coding: utf-8 -*-
"""スマホ用に、データ・画像・CSS・JS をすべて埋め込んだ 1ファイルの HTML を作る。

使い方:  python StoneWiki/build_mobile.py   (build_wiki.py の最後でも自動で呼ばれる)
出力:    StoneWiki/dist/StoneWiki.html  … このファイル1つをスマホに送って開くだけで見られる
"""
import base64
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
GRAPHICS = os.path.join(ROOT, "Graphics")
OUT = os.path.join(HERE, "dist", "StoneWiki.html")

# 埋め込む画像フォルダ (Graphics/ からの相対)。app.js が使うものだけ
IMAGE_DIRS = ["Pokemon/Front", "Pokemon/Front shiny", "Pokemon/Icons", "Items"]


def read(name):
    with open(os.path.join(HERE, name), encoding="utf-8") as f:
        return f.read()


def collect_images():
    images = {}
    for rel_dir in IMAGE_DIRS:
        folder = os.path.join(GRAPHICS, *rel_dir.split("/"))
        if not os.path.isdir(folder):
            continue
        for name in sorted(os.listdir(folder)):
            if not name.lower().endswith(".png"):
                continue
            with open(os.path.join(folder, name), "rb") as f:
                b64 = base64.b64encode(f.read()).decode("ascii")
            images["%s/%s" % (rel_dir, name)] = "data:image/png;base64," + b64
    return images


def inline_script(code):
    # <script> の中で "</script>" が出ると閉じてしまうので逃がす
    return "<script>\n" + code.replace("</script", "<\\/script") + "\n</script>"


def main():
    html = read("index.html")
    images = collect_images()
    img_js = "window.WIKI_IMAGES=" + json.dumps(images, separators=(",", ":")) + ";"
    replacements = {
        '<link rel="stylesheet" href="style.css">': "<style>\n" + read("style.css") + "\n</style>",
        '<script src="data.js"></script>': inline_script(read("data.js")) + "\n" + inline_script(img_js),
        '<script src="app.js"></script>': inline_script(read("app.js")),
    }
    for old, new in replacements.items():
        if old not in html:
            sys.exit("index.html に %s が見つかりません" % old)
        html = html.replace(old, new)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote %s (%.1f MB, images %d)" % (OUT, os.path.getsize(OUT) / 1024 / 1024, len(images)))


if __name__ == "__main__":
    main()
