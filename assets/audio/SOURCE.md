# Active audio (2026-11-02)

- Menus, story maps and shops: **Quiet Village**, restored from the previous menu music. Source: https://opengameart.org/content/quiet-village-collection (HoliznaCC0, CC0).
- All battles, including every gym and Team Rocket: **Pokémon Red / Blue / Yellow – Trainer Battle**. Downloaded local file `pokemon-trainer-battle.mp3`; source repository https://github.com/CTorresDex/pokemon-showdown-music, original file URL in `pokemon-battle-source.txt`. Original soundtrack rights remain with Nintendo / Creatures / GAME FREAK; this is not a CC0 track.
- **669 move-specific sound files** downloaded from the PRSFX resources shared by Pokémon Essentials Chasm: https://github.com/Pokemon-Tectonic-Team/Pokemon-Essentials-Chasm-Engine/tree/main/Audio/SE/Anim . Exact original paths are recorded in `move-sounds.json`, and the downloaded repository tree/commit is in `data/raw/Pokemon-Essentials-Chasm-Engine-tree.json`. These are existing Pokémon community/game audio resources, not newly synthesized effects. Multipart source sounds use one selected part. Moves without an exact filename use an existing same-type move sound.
- Growl additionally uses the existing file shared at https://github.com/Aditya-xcity/pokemon-battle-simulator/blob/main/battle/Sound/Attacks/Growl.mp3 (exact URL in the manifest).
- Button confirmation: Kenney Interface Sounds `confirmation_002.ogg`, CC0, https://kenney.nl/assets/interface-sounds . No oscillator-based chime, hover, typing, footsteps, cries or victory jingles are played.

Music defaults to 6% (internally attenuated further), effects 18%. One move sound at a time, peak attenuation, a limiter and short attack/release envelopes avoid overlapping harsh sounds and abrupt waveform cuts. Same battle music persists between gym scenes; music switches only between menu and battle. Hidden tabs pause; mute and volume preferences persist. Credits are available under **♪ → 음원 출처**.

The previous prototype tracks, sound packs and cry files below are retained as inactive source archives.

---

# Audio sources

All playback files are stored locally. No remote audio is streamed during play. Source pages and attribution are also available in-game under **♪ → 음원 출처**.

| Use | Track/source | Page | License |
|---|---|---|---|
| Peaceful menus / map / shop | Quiet Village (HoliznaCC0 collection) | https://opengameart.org/content/quiet-village-collection | CC0 |
| Normal battles | Short Battle Loop | https://opengameart.org/content/short-battle-loop | CC0 |
| Brock / rock gym | Heartfelt Battle (loop) | https://opengameart.org/content/heartfelt-battle-loopable-fantasy-stringspianohorn | CC0 |
| Misty / water gym | Flowerbed Fields (loop) | https://opengameart.org/content/flowerbed-fields-loop | CC0 |
| Lt. Surge / Rocket | Phantasy Boss Battle Encounter | https://opengameart.org/content/phantasy-boss-battle-encounter | CC0 |
| Erika / grass gym | Confrontation 1 | https://opengameart.org/content/confrontation-1 | CC0 |
| UI clicks, selection, dialogue, confirmation | Kenney Interface Sounds | https://kenney.nl/assets/interface-sounds | CC0 |
| Footsteps, swishes, coin / book sounds | Kenney RPG Audio | https://kenney.nl/assets/rpg-audio | CC0 |
| Elemental casts / impacts | Kenney Sci-Fi Sounds | https://kenney.nl/assets/sci-fi-sounds | CC0 |
| Level / victory / evolution jingles | Kenney Music Jingles | https://kenney.nl/assets/music-jingles | CC0 |
| 151 existing Pokémon cries | PokéAPI Cries | https://github.com/PokeAPI/cries | See bundled source license; original game audio rights remain with their owners |

The Kenney license files and the PokéAPI repository license are retained in `licenses/`. No claim of authorship is made for downloaded game audio. The first prototype's `peaceful-town.mp3` (haruta, CC0) came from https://opengameart.org/content/peaceful-town-1 and is retained as an unused source; current menu music is Quiet Village.

Defaults: music 7%, effects 45%. Effects receive their own bus, gain normalization, a compressor and limited concurrent voices. Music ducks further during casts, impacts and jingles; scene changes fade between local tracks. Playback starts after a click/key gesture, stops when the tab is hidden, and respects persistent mute/volume choices. Original cry sources occasionally contain MPEG data under an `.ogg` name; those files are copied with `.mp3` extensions in the runtime manifest.

Rebuild download assets with `scripts/prepare_audio.py`, `scripts/select_audio.py`, then `scripts/prepare_cries.py`. Full source archives and saved source-page HTML are kept for provenance, but the game only loads the selected files referenced in the manifest and the current scene music.

## Active evolution audio

- During evolution: `pokemon-evolution.ogg`, existing Pokémon evolution BGM from the Pokémon Essentials GSC kit: https://github.com/RZC2/pokemon-essentials-GSC/blob/9ea8cc8e6725db95f4cf56bbbc48bdd404d367ff/Audio/BGM/Evolution.ogg .
- Completion: `pokemon-evolution-success.ogg`, `Audio/ME/Evolution success.ogg` from Pokémon Essentials Chasm, commit `685d3f2234273faf116cf5a6a1b15227128aee37`. Exact raw source URLs are recorded alongside each file in `.source.txt`. Original game soundtrack rights remain with Nintendo / Creatures / GAME FREAK.
- These are downloaded game audio files, not generated imitations. Playback follows the 4.3-second evolution scene, uses the effects volume/mute settings, and temporarily lowers the existing background music. Closing the completion dialog stops the evolution voice and restores background volume.
