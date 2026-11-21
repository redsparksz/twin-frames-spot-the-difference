# twin-frames-spot-the-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/redsparksz/twin-frames-spot-the-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/redsparksz/twin-frames-spot-the-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

Twin Frames is a complete spot-the-difference game that runs offline in a
desktop browser from static files. Two near-identical pictures sit side by
side; seven tiny lies hide between them. Click a difference on either panel —
or hunt with the arrow keys and Enter — to ring it in gold on both pictures.
Four hand-painted scenes (Harbor Dawn, Enchanted Garden, The Old Library,
Night Market) raise the pressure as the clock shrinks, with hints, streak
bonuses, wrong-click penalties and a synthesized soundscape. No assets are
fetched: every scene is drawn procedurally on canvas and every sound is
synthesized with WebAudio.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. Or serve `game/` with
any static server and open `game/index.html`.

## How it plays

- **7 differences per scene, 4 scenes.** Find them all to unlock the next
  scene; clear all four to earn your rank, from Apprentice Spotter to Master
  Spotter.
- **Two panels, one truth.** The ORIGINAL and its TWIN are painted by the
  same code from the same seed — they differ only where a difference says so.
- **Mark with mouse or keyboard.** Click either picture, or move the
  crosshair with the arrow keys and press Enter / Space. `H` spends a hint
  (3 per scene, −50 pts), `M` toggles sound, `P` pauses, `R` restarts the
  scene.
- **Time pressure you can feel.** 180s, 150s, 120s, 120s per scene; a wrong
  click costs 25 points and 3 seconds; finishing fast pays a time bonus.
- **Feel.** A found difference pops a gold ring with its number on both
  panels, a chime, and a floating score; a miss flashes a red X and shakes
  the panel.

## Files

- `game/index.html` — layout, HUD and overlays
- `game/style.css` — the warm paper, ink and brass look
- `game/src/scenes.js` — the four scene painters and their 28 differences
- `game/src/engine.js` — state machine, timer, scoring, input, markers
- `game/src/audio.js` — synthesized sound effects (WebAudio, no files)
- `game/src/random.js` — seeded RNG so both panels paint identically
- `game/src/shots.js` — `?shot=` presets that drive the real engine for screenshots
- `game/src/main.js` — bootstrap
- `main.ts` — the make.fun entrypoint (Node 22, standard library only)
- `serve.ts` — a tiny static server for local play

## Screenshots

Real renders of the game's own code: the cover shows Harbor Dawn mid-hunt
with 3 differences found, 4 still unfound, and the counter reading "4 LEFT".

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
