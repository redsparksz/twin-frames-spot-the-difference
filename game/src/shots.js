// Screenshot presets, driven by `?shot=<name>`.
// The presets drive the real engine (real clicks through markAt, real level
// flow), so every screenshot is a genuine render of the game's own code —
// never a mock. `window.__shotReady` flips true once the frame is settled.
import { SCENES } from './scenes.js';

function quietToast(game) {
  clearTimeout(game.toastTimer);
  document.getElementById('toast').classList.remove('show');
  game.crosshair.visible = false;
  game.positionCrosshair();
}

function freezeClock(game, seconds) {
  game.stopTimer();
  game.timeLeft = seconds;
  game.updateHud();
}

function markDiffs(game, indexes) {
  for (const i of indexes) {
    const d = game.scene.differences[i];
    game.markAt(0, d.x, d.y);
  }
}

export function applyShot(game) {
  const shot = new URLSearchParams(window.location.search).get('shot');
  if (!shot) {
    window.__shotReady = true;
    return;
  }

  if (shot === 'title') {
    // Title screen over the painted harbor, as a first-time player sees it.
    game.startLevel(0);
    game.setState('title');
    quietToast(game);
  } else if (shot === 'cover') {
    // The cover: mid-hunt on Harbor Dawn, 3 differences found (gold rings on
    // both panels), 4 still unfound, counter reading "4 LEFT", clock at 2:31.
    game.startGame();
    markDiffs(game, [0, 1, 3]);
    freezeClock(game, 151);
    quietToast(game);
  } else if (shot === 'garden') {
    // Scene 2 mid-hunt: 2 found, 5 left, and a hint pulse ringing one more.
    game.startGame();
    game.nextLevel();
    markDiffs(game, [0, 2]);
    game.hintsLeft = 2;
    game.hintTarget = game.scene.differences[4];
    game.hintUntil = performance.now() + 60000;
    game.score = Math.max(0, game.score - 50);
    freezeClock(game, 122);
    game.updateHud();
    game.renderDots();
    quietToast(game);
  } else if (shot === 'complete') {
    // The final results screen after clearing all four scenes.
    game.startGame();
    for (let level = 0; level < SCENES.length; level++) {
      const diffs = game.scene.differences;
      for (let i = 0; i < diffs.length; i++) {
        game.markAt(0, diffs[i].x, diffs[i].y);
      }
      game.nextLevel();
    }
    quietToast(game);
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      window.__shotReady = true;
    });
  });
}
