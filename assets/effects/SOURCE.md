# Existing Pokemon Emerald battle-effect sprites

Source project: https://github.com/pret/pokeemerald

PNG directory: https://github.com/pret/pokeemerald/tree/master/graphics/battle_anims/sprites

Original source files are retained in `source/`. Downloaded PNGs contain existing Pokemon Emerald battle graphics. `strips/` contains the same pixels with GBA palette index zero made transparent and frames packed horizontally. No new effect artwork was generated or painted. See `manifest.json` for frame dimensions and counts.

55 PNG sheets, 210 frames, downloaded 2026-11-01. Reproduce with `python scripts/collect_effect_sprites.py` (Pillow required).

The 28 top-down move compositions, positioning, timing, scaling and rotation in `sprite-effects.js` are adaptations for this game. They do not reproduce every original Emerald animation script. Some graphics are shared across techniques, as in the source game, but each move has a separate composition.

The initially considered Mystery Dungeon sheets on The Spriters Resource could not be downloaded through the available direct access (HTTP 403); those sheets were not included. No claim is made that these graphics are Mystery Dungeon graphics.

Pokemon artwork rights remain with their original owners. This file records provenance; it does not grant additional rights to the original graphics.
