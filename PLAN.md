# 🎮 "The Temple of You" — Master Plan

## 1. Concept
A tile-based puzzle RPG in a forgotten temple. The player is a Seeker who must
restore four chambers by solving boulder-pushing puzzles — each chamber awakens
a crystal (a disc of memory) that is carried to a central altar (the Retro TV).
Once all four crystals are inserted, the temple opens and a short film plays:
the assembled story of the Seeker's journey, ending on a letter.

**Controls:** one-thumb — swipe or arrow keys to move, tap to interact.
**Total playtime:** ~10–15 min.
**Target:** mobile browser, portrait + landscape.

## 2. Core Loop

```
Enter chamber → push boulders onto glowing pads → all pads lit → crystal appears
→ walk into crystal to collect it → walk to altar (TV) → tap to insert crystal
→ door opens → fade to next chamber
```

Repeat across 4 chambers, then:

```
All 4 crystals inserted → altar full → tap to play the movie → letter revealed
```

## 3. Story / Discs

| Disc | Title | Theme |
|------|-------|-------|
| 1 | First Light | The beginning — light before names |
| 2 | The Silent Hall | Listening to what cannot be said |
| 3 | Ember Trial | Fire does not ask permission |
| 4 | The Hearth | The temple is finished — the light is yours |

Each disc carries a short verse and a color:
- D1: `#ffe9b0` (warm amber)
- D2: `#b9a7ff` (soft violet)
- D3: `#9fd8ff` (pale blue)
- D4: `#ffc1e0` (rose)

## 4. Chambers (Stages)

| Stage | Name | Layout | Boulders | Switches |
|-------|------|--------|----------|----------|
| 1 | First Light | Simple corridor | 1 | 1 |
| 2 | The Silent Hall | L-shaped open area | 2 | 2 |
| 3 | Ember Trial | Wider chamber | 3 | 3 |
| 4 | The Hearth | Final, leads to altar | 3 | 3 |

Each stage is a 20×12 tile room. The tilemap uses codes:
- `f` = floor, `w` = wall, `W` = wall-top
- `s` = switch (off), `S` = switch (on — lit by boulder)
- `b` = boulder
- `C` = crystal spawn
- `D` = locked door
- `T` = TV / altar position

## 5. Mechanics

### Tile Grid
- 20 cols × 12 rows, 64px tiles = 1280×768px room
- Walls block movement; floor is walkable

### Boulder Push
- Hero pushes one boulder at a time onto adjacent tile
- Cannot push boulder into wall or another boulder
- Boulder on switch tile → switch lights up (purple glow)

### Switch Logic
- All switches lit simultaneously → crystal appears (chime + pulsing glow)
- Hero walks onto crystal → collects it (disc shown floating above hero)

### TV / Altar
- Placed at fixed tile per stage (configurable)
- Tap while holding disc → insert, play disc's verse, increment progress
- Progress 4/4 → TV shows "▶ PLAY THE MOVIE"

### Door
- Opens with glow animation when disc is inserted
- Fade transition to next stage

### Finale
- Full TV, fireworks, credits text
- Tap anywhere → return to StartScreen (progress resets)

## 6. Tech Stack
- **Phaser 3** (vendored at `vendor/phaser.min.js`, CDN fallback)
- No build step — plain ES5 JS via `<script>` tags
- **Higgsfield assets** in `assets/higgsfield/` (12 PNGs)
- Audio: procedural chimes via Web Audio API; optional BGM + voice MP3
- Mobile-first: viewport locked, touch-action:none, scale FIT + center

## 7. File Structure
```
temple-game/
  index.html        # entry point
  PLAN.md           # this file
  vendor/
    phaser.min.js   # Phaser 3
  assets/
    higgsfield/
      hero.png, tv.png, tiles_floor.png, tiles_wall.png,
      torch.png, boulder.png, crystal_cyan.png, crystal_ruby.png,
      door_locked.png, door_open.png, room1.png, chest.png
  src/
    config.js       # STORY data, constants (TILE, ROOM_W/H, MOVE_DURATION)
    systems.js      # chime(), ensureBgm(), showVerse(), buildTilemap()
    main.js         # Phaser bootstrap, smoke test (?smoke), playMovie(), showLetter()
    entities/
      hero.js       # Hero class — grid movement, boulder push, crystal holding
      tv.js         # RetroTV class — tap handler, playDisc(), showFull()
    ui/
      start.js      # StartScreen — title + tap-to-begin
      finale.js     # Finale — garden, fireworks, credits
    scenes/
      boot.js       # Boot scene — load art, generate textures
      stage.js      # StageBase — tilemap, boulders, switches, crystal, door, TV
      stage1.js     # Chamber 1 — 1 boulder, 1 switch
      stage2.js     # Chamber 2 — 2 boulders, 2 switches
      stage3.js     # Chamber 3 — 3 boulders, 3 switches
      stage4.js     # Chamber 4 — 3 boulders, 3 switches, leads to finale
```

## 8. Scene Flow

```
Boot → StartScreen → Stage1 → Stage2 → Stage3 → Stage4 → Finale
```

- **Boot**: Loads PNGs, generates dot_glow/dot/disc textures, falls back if load fails
- **StartScreen**: Title card, opening verse, tap → Stage1
- **Stage1–4**: Push-boulder puzzle → crystal → TV insert → door → next
- **Finale**: Credits, fireworks, "▶ PLAY THE MOVIE" tap → playMovie() → showLetter()

## 9. Audio

### Chime (Web Audio API)
- `chime(freq)` — sine oscillator, exponential ramp, 0.5s duration
- Calls: switch lit (1200 Hz), crystal collect (1400 Hz), disc insert (1046 Hz), TV play (660–1200 Hz by disc ID)

### Hash Fallback (if no audio files)
- `hashFreq(str)` — deterministic hash of string → 330–770 Hz
- Useful for distinguishing events without loading samples

### BGM
- `ensureBgm()` — lazy-loads `assets/audio/bgm.mp3`, loops at 0.35 vol
- Triggered on first user interaction (pointerdown)

## 10. Smoke Test

Append `?smoke` to URL to auto-drive all stages headlessly:

```
http://localhost/temple-game/?smoke
```

The smoke driver:
1. Clicks through StartScreen
2. For each Stage1–4:
   - Marks all switches lit (simulates boulders on pads)
   - Triggers crystal collection
   - Inserts disc and advances
3. Sets `document.title = 'SMOKE_PASS_4'` on completion

Timer tick written to `document.title` for `--dump-dom` verification.

## 11. Mobile Checklist
- [x] thumb-reach tap targets
- [x] swipe-to-move + tap-to-interact
- [x] no scrolling, `overflow:hidden`
- [x] scale FIT + auto-center for all screen sizes
- [x] `user-select:none`, `touch-action:none`
- [x] orientation hint for portrait devices
- [ ] test on real phone (puzzle feel, tap accuracy)
- [ ] lazy-load videos/disc stills if clip assets land
- [ ] total download < 30MB

## 12. Future Enhancements
- Parallax backdrop layers per chamber
- Animated hero idle/walk (sprite sheet)
- Particle effects (torch flicker, crystal sparkle)
- Haptic feedback on switch press (navigator.vibrate)
- Save progress to localStorage
- Multiple endings based on exploration

## 13. Delivery
- Deploy to Vercel / Netlify (static)
- One-link share, mobile-first
- Playtime ~10–15 min

---

*Built with Phaser 3. Pattern: tile-based puzzle RPG, 4 chambers, 1 altar.*
