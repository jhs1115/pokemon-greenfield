"""Read-only artwork QA for the 70 hand-reviewed stage marker centers.

Requires Pillow, like the existing asset preparation scripts. This never edits
the artwork: it catches accidentally pinning a stage onto grass, water or roofs.
"""
from pathlib import Path
import json
from PIL import Image

root = Path(__file__).resolve().parents[1]
regions = json.loads((root / 'assets/world/routes/layout.json').read_text(encoding='utf-8'))
checked = 0
for region in regions:
    image = Image.open(root / region['src']).convert('RGB')
    assert image.width / image.height >= 1.75
    for stage, (x, y) in enumerate(region['points'], 1):
        px, py = round(x * image.width / 100), round(y * image.height / 100)
        valid = 0
        for dy in range(-2, 3):
            for dx in range(-2, 3):
                rgb = image.getpixel((px + dx, py + dy))
                red, green, blue = rgb
                road = (red > 220 and green > 185 and blue > 120 and red >= green - 12)
                pavement = min(rgb) > 145 and max(rgb) - min(rgb) < 35
                deck = region['chapter'] == 5 and stage == 6 and red > 150 and green > 90 and blue > 60
                valid += road or pavement or deck
        assert valid >= 18, (region['chapter'], stage, 'Review the marker against its road', valid)
        checked += 1
print(f'{checked} stage centers verified on illustrated road, pavement or bridge pixels across 7 wide regions.')
