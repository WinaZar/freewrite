"""Shrink Inter's vertical metrics so WebKit draws a shorter caret.

WebKit sizes the text caret from the font's ascent + descent (not from line-height),
and Inter's are tall (0.97em / 0.24em), so the caret towers over lowercase letters.
CSS ascent-override/descent-override would fix this, but WebKit ignores them.
Line spacing is unaffected because the editor sets an explicit line-height.

Usage (needs `pip install fonttools brotli`):
    npm install --no-save @fontsource-variable/inter
    python3 scripts/patch-font-metrics.py node_modules/@fontsource-variable/inter/files src/fonts
"""

import sys
from pathlib import Path

from fontTools.ttLib import TTFont

# Units per em is 2048. Caret then spans roughly cap height to descender bottom.
ASCENT = 1680  # was 1984
DESCENT = 390  # was 494

src_dir, dst_dir = Path(sys.argv[1]), Path(sys.argv[2])
dst_dir.mkdir(parents=True, exist_ok=True)
for src in sorted(src_dir.glob("inter-*-wght-normal.woff2")):
    font = TTFont(src)
    font["hhea"].ascent, font["hhea"].descent = ASCENT, -DESCENT
    font["OS/2"].sTypoAscender, font["OS/2"].sTypoDescender = ASCENT, -DESCENT
    font.flavor = "woff2"
    font.save(dst_dir / src.name)
    print(dst_dir / src.name)
