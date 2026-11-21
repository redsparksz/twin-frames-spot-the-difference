// Twin Frames — bootstrap. Builds the engine, paints the first scene behind
// the title screen, and applies any `?shot=` preset for screenshots.
import { TwinFramesGame } from './engine.js';
import { applyShot } from './shots.js';

const game = new TwinFramesGame();
game.boot();

// Exposed for playtests and screenshots: the live game object, never a mock.
window.__game = game;
window.__shotReady = false;

applyShot(game);
