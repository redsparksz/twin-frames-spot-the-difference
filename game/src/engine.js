// Twin Frames — the game engine: state machine, timer, scoring, input and
// the markers that celebrate (or punish) every click. It knows nothing about
// how a scene is painted; scenes.js owns that.
import { SCENES, PANEL_W, PANEL_H, paintScene } from './scenes.js';
import { SoundEngine } from './audio.js';

export const FIND_POINTS = 100;
export const STREAK_BONUS = 10;
export const MISS_POINTS = 25;
export const MISS_SECONDS = 3;
export const HINT_POINTS = 50;
export const HINTS_PER_LEVEL = 3;

const $ = (id) => document.getElementById(id);

export class TwinFramesGame {
  constructor() {
    this.sound = new SoundEngine();
    this.state = 'title';
    this.levelIndex = 0;
    this.found = new Set();
    this.foundAt = {};
    this.score = 0;
    this.totalScore = 0;
    this.streak = 0;
    this.clicks = 0;
    this.hits = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.timeLeft = SCENES[0].timeLimit;
    this.timerId = null;
    this.lastTickSecond = -1;
    this.hintTarget = null;
    this.hintUntil = 0;
    this.floaters = [];
    this.flashes = [];
    this.crosshair = { x: PANEL_W / 2, y: PANEL_H / 2, panel: 0, visible: false };
    this.levelStats = [];
    this.startedAt = 0;
    this.offscreen = [document.createElement('canvas'), document.createElement('canvas')];
    for (const c of this.offscreen) {
      c.width = PANEL_W;
      c.height = PANEL_H;
    }
    this.ctxLeft = $('canvasLeft').getContext('2d');
    this.ctxRight = $('canvasRight').getContext('2d');
    this.raf = 0;
  }

  get scene() {
    return SCENES[this.levelIndex];
  }

  get remaining() {
    return this.scene.differences.length - this.found.size;
  }

  // -- level setup -----------------------------------------------------------
  startLevel(index) {
    this.levelIndex = index;
    this.found = new Set();
    this.foundAt = {};
    this.streak = 0;
    this.hintsLeft = HINTS_PER_LEVEL;
    this.timeLeft = this.scene.timeLimit;
    this.hintTarget = null;
    this.floaters = [];
    this.flashes = [];
    this.lastTickSecond = -1;
    this.paintOffscreen();
    this.updateHud();
    this.renderDots();
  }

  startGame() {
    this.totalScore = 0;
    this.score = 0;
    this.clicks = 0;
    this.hits = 0;
    this.levelStats = [];
    this.startedAt = Date.now();
    $('titleScreen').classList.add('hidden');
    $('endScreen').classList.add('hidden');
    $('levelScreen').classList.add('hidden');
    this.startLevel(0);
    this.setState('playing');
    this.startTimer();
    this.sound.ensure();
    this.toast(`${this.scene.name} — find all ${this.scene.differences.length} differences!`);
  }

  paintOffscreen() {
    paintScene(this.offscreen[0].getContext('2d'), this.scene, 0);
    paintScene(this.offscreen[1].getContext('2d'), this.scene, 1);
  }

  // -- render loop -----------------------------------------------------------
  renderLoop = () => {
    this.renderFrame();
    this.raf = requestAnimationFrame(this.renderLoop);
  };

  renderFrame() {
    const now = performance.now();
    for (const [i, ctx] of [this.ctxLeft, this.ctxRight].entries()) {
      ctx.clearRect(0, 0, PANEL_W, PANEL_H);
      ctx.drawImage(this.offscreen[i], 0, 0);
      this.drawMarkers(ctx, now);
      this.drawFloaters(ctx, now);
      this.drawFlashes(ctx, now);
      if (this.hintTarget && now < this.hintUntil) {
        this.drawHintPulse(ctx, now);
      }
    }
  }

  drawMarkers(ctx, now) {
    this.scene.differences.forEach((diff, index) => {
      if (!this.found.has(diff.id)) return;
      const age = now - (this.foundAt?.[diff.id] ?? now);
      const pop = age < 220 ? 0.6 + (age / 220) * 0.4 : 1;
      const r = diff.r * 0.92 * pop;
      ctx.save();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#e9b949';
      ctx.shadowColor = 'rgba(233,185,73,0.9)';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#2b2118';
      ctx.beginPath();
      ctx.arc(diff.x, diff.y, r - 4, 0, Math.PI * 2);
      ctx.stroke();
      // Number badge on the ring.
      circle(ctx, diff.x + r * 0.7, diff.y - r * 0.7, 11, '#e9b949');
      ctx.fillStyle = '#2b2118';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(index + 1), diff.x + r * 0.7, diff.y - r * 0.7 + 0.5);
      ctx.restore();
    });
  }

  drawFloaters(ctx, now) {
    this.floaters = this.floaters.filter((f) => now - f.t0 < 1100);
    for (const f of this.floaters) {
      const age = now - f.t0;
      const y = f.y - age * 0.045;
      ctx.save();
      ctx.globalAlpha = 1 - age / 1100;
      ctx.font = 'bold 20px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(43,33,24,0.85)';
      ctx.strokeText(f.text, f.x, y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, y);
      ctx.restore();
    }
  }

  drawFlashes(ctx, now) {
    this.flashes = this.flashes.filter((f) => now - f.t0 < 450);
    for (const f of this.flashes) {
      const age = now - f.t0;
      ctx.save();
      ctx.globalAlpha = 1 - age / 450;
      ctx.strokeStyle = '#b3402e';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const s = 12;
      ctx.beginPath();
      ctx.moveTo(f.x - s, f.y - s);
      ctx.lineTo(f.x + s, f.y + s);
      ctx.moveTo(f.x + s, f.y - s);
      ctx.lineTo(f.x - s, f.y + s);
      ctx.stroke();
      ctx.restore();
    }
  }

  drawHintPulse(ctx, now) {
    const d = this.hintTarget;
    const pulse = 1 + Math.sin(now / 130) * 0.18;
    ctx.save();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#b3402e';
    ctx.setLineDash([10, 7]);
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  // -- clicking --------------------------------------------------------------
  markAt(panelIndex, x, y) {
    if (this.state !== 'playing') return 'idle';
    this.clicks += 1;
    const diff = this.scene.differences.find(
      (d) => !this.found.has(d.id) && Math.hypot(d.x - x, d.y - y) <= d.r,
    );
    if (diff) {
      this.found.add(diff.id);
      this.foundAt[diff.id] = performance.now();
      this.hits += 1;
      this.streak += 1;
      const gained = FIND_POINTS + (this.streak - 1) * STREAK_BONUS;
      this.score += gained;
      this.floaters.push({ x: diff.x, y: diff.y - diff.r - 8, text: `+${gained}`, color: '#e9b949', t0: performance.now() });
      this.sound.found();
      if (this.hintTarget?.id === diff.id) this.hintTarget = null;
      this.updateHud();
      this.renderDots();
      if (this.found.size === this.scene.differences.length) {
        this.completeLevel();
      } else {
        this.toast(`Found: ${diff.name} — ${this.remaining} left`);
      }
      return 'found';
    }
    // Wrong click: lose points and time, break the streak.
    this.streak = 0;
    this.score = Math.max(0, this.score - MISS_POINTS);
    this.timeLeft = Math.max(0, this.timeLeft - MISS_SECONDS);
    this.flashes.push({ x, y, t0: performance.now() });
    this.sound.miss();
    this.updateHud();
    this.shakePanel(panelIndex);
    this.toast(`Not there — −${MISS_POINTS} pts, −${MISS_SECONDS}s`);
    return 'miss';
  }

  shakePanel(panelIndex) {
    const el = panelIndex === 0 ? $('canvasLeft') : $('canvasRight');
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
  }

  useHint() {
    if (this.state !== 'playing') return false;
    if (this.hintsLeft <= 0) {
      this.toast('No hints left in this scene');
      return false;
    }
    const remaining = this.scene.differences.filter((d) => !this.found.has(d.id));
    if (remaining.length === 0) return false;
    this.hintsLeft -= 1;
    this.score = Math.max(0, this.score - HINT_POINTS);
    this.hintTarget = remaining[Math.floor(Math.random() * remaining.length)];
    this.hintUntil = performance.now() + 2500;
    this.sound.hint();
    this.updateHud();
    this.toast(`Hint: ${this.hintTarget.hint} (−${HINT_POINTS} pts)`);
    return true;
  }

  // -- timer -----------------------------------------------------------------
  startTimer() {
    this.stopTimer();
    this.timerId = setInterval(() => {
      if (this.state !== 'playing') return;
      this.timeLeft = Math.max(0, this.timeLeft - 0.25);
      const whole = Math.ceil(this.timeLeft);
      if (whole <= 10 && whole !== this.lastTickSecond) {
        this.lastTickSecond = whole;
        this.sound.tick();
      }
      if (this.timeLeft <= 0) {
        this.timeUp();
      }
      this.updateHud();
    }, 250);
  }

  stopTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  timeUp() {
    this.stopTimer();
    this.setState('timeUp');
    this.sound.miss();
    $('levelEyebrow').textContent = 'TIME UP';
    $('levelTitle').textContent = this.scene.name;
    $('levelSummary').textContent =
      `The clock beat you — ${this.found.size} of ${this.scene.differences.length} differences found.`;
    $('levelStats').innerHTML = this.statRows([
      ['Found', `${this.found.size} / ${this.scene.differences.length}`],
      ['Score kept', String(this.score)],
    ]);
    $('nextBtn').textContent = '↻  RETRY SCENE';
    $('levelScreen').classList.remove('hidden');
  }

  completeLevel() {
    this.stopTimer();
    const timeBonus = Math.round(this.timeLeft) * 2;
    const accuracy = this.clicks === 0 ? 100 : Math.round((this.hits / this.clicks) * 100);
    const levelTotal = this.score + timeBonus;
    this.levelStats.push({
      name: this.scene.name,
      found: this.found.size,
      total: this.scene.differences.length,
      score: this.score,
      timeBonus,
      levelTotal,
      accuracy,
    });
    this.totalScore += levelTotal;
    this.sound.win();
    $('levelEyebrow').textContent = this.levelIndex === SCENES.length - 1 ? 'FINAL SCENE CLEAR' : 'SCENE COMPLETE';
    $('levelTitle').textContent = this.scene.name;
    $('levelSummary').textContent =
      `All ${this.scene.differences.length} differences found — ${accuracy}% accuracy.`;
    $('levelStats').innerHTML = this.statRows([
      ['Scene score', String(this.score)],
      ['Time bonus', `+${timeBonus}`],
      ['Accuracy', `${accuracy}%`],
      ['Scene total', String(levelTotal)],
    ], true);
    $('nextBtn').textContent = this.levelIndex === SCENES.length - 1
      ? 'SEE FINAL RESULTS →'
      : 'NEXT SCENE →';
    this.setState('levelDone');
    $('levelScreen').classList.remove('hidden');
  }

  nextLevel() {
    $('levelScreen').classList.add('hidden');
    if (this.state === 'timeUp') {
      this.score = Math.max(0, this.score - 0);
      this.startLevel(this.levelIndex);
      this.setState('playing');
      this.startTimer();
      return;
    }
    if (this.levelIndex + 1 >= SCENES.length) {
      this.finishGame();
      return;
    }
    this.score = 0;
    this.startLevel(this.levelIndex + 1);
    this.setState('playing');
    this.startTimer();
    this.toast(`${this.scene.name} — find all ${this.scene.differences.length} differences!`);
  }

  finishGame() {
    this.setState('gameOver');
    this.sound.fanfare();
    const totalTime = Math.round((Date.now() - this.startedAt) / 1000);
    const accuracy = this.clicks === 0 ? 100 : Math.round((this.hits / this.clicks) * 100);
    const rank = this.totalScore >= 3400 ? 'Master Spotter!'
      : this.totalScore >= 2600 ? 'Eagle Eye!'
      : this.totalScore >= 1800 ? 'Sharp Shooter'
      : 'Apprentice Spotter';
    $('endTitle').textContent = rank;
    $('endSummary').textContent =
      `You cleared all ${SCENES.length} scenes in ${Math.floor(totalTime / 60)}:${String(totalTime % 60).padStart(2, '0')} with ${accuracy}% accuracy.`;
    $('endStats').innerHTML = this.statRows([
      ...this.levelStats.map((s) => [`${s.name}`, String(s.levelTotal)]),
      ['TOTAL SCORE', String(this.totalScore)],
    ], true);
    $('endScreen').classList.remove('hidden');
  }

  // -- state and HUD ---------------------------------------------------------
  setState(state) {
    this.state = state;
    $('pauseScreen').classList.toggle('hidden', state !== 'paused');
  }

  togglePause() {
    if (this.state === 'playing') {
      this.setState('paused');
      this.toast('Paused');
    } else if (this.state === 'paused') {
      this.setState('playing');
    }
  }

  toggleMute() {
    this.sound.ensure();
    this.sound.setMuted(!this.sound.muted);
    $('muteBtn').textContent = this.sound.muted ? 'SOUND OFF' : 'SOUND ON';
  }

  formatTime(seconds) {
    const s = Math.max(0, Math.ceil(seconds));
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  }

  updateHud() {
    $('levelName').textContent = `${this.levelIndex + 1} · ${this.scene.name}`;
    $('foundCount').textContent = `${this.found.size} / ${this.scene.differences.length}`;
    $('remainCount').textContent = `${this.remaining} LEFT`;
    $('timeLeft').textContent = this.formatTime(this.timeLeft);
    $('score').textContent = String(this.score + this.totalScore);
    $('hintCount').textContent = String(this.hintsLeft);
    $('hintBtn').disabled = this.hintsLeft <= 0 || this.state !== 'playing';
    const timeStat = $('timeLeft').parentElement;
    timeStat.classList.toggle('low', this.timeLeft <= 15 && this.state === 'playing');
    timeStat.classList.toggle('highlight', this.timeLeft <= 15 && this.state === 'playing');
    $('levelDots').innerHTML = SCENES.map((s, i) =>
      `<i class="${i < this.levelIndex ? 'done' : i === this.levelIndex ? 'now' : ''}" title="${s.name}"></i>`,
    ).join('');
    document.querySelectorAll('.scene-chip').forEach((chip, i) => {
      chip.classList.toggle('done', i < this.levelStats.length);
      chip.classList.toggle('now', i === this.levelIndex && this.state !== 'gameOver');
      chip.classList.toggle('locked', i > this.levelIndex);
    });
  }

  renderDots() {
    $('diffDots').innerHTML = this.scene.differences.map((d, i) => {
      const found = this.found.has(d.id);
      const hinted = this.hintTarget?.id === d.id;
      return `<i class="${found ? 'found' : ''} ${hinted ? 'hinted' : ''}">${found ? '✓' : i + 1}</i>`;
    }).join('');
  }

  statRows(rows, total = false) {
    return rows.map(([label, value], i) => {
      const isTotal = total && i === rows.length - 1;
      return `<div class="row${isTotal ? ' total' : ''}"><span>${label}</span><b>${value}</b></div>`;
    }).join('');
  }

  toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  // -- crosshair (keyboard play) ---------------------------------------------
  moveCrosshair(dx, dy) {
    const c = this.crosshair;
    c.x = Math.min(PANEL_W - 4, Math.max(4, c.x + dx));
    c.y = Math.min(PANEL_H - 4, Math.max(4, c.y + dy));
    c.visible = true;
    this.positionCrosshair();
  }

  positionCrosshair() {
    const el = $('crosshair');
    if (!this.crosshair.visible) {
      el.style.display = 'none';
      return;
    }
    const canvas = this.crosshair.panel === 0 ? $('canvasLeft') : $('canvasRight');
    const stage = $('stage').getBoundingClientRect();
    const rect = canvas.getBoundingClientRect();
    const scale = rect.width / PANEL_W;
    el.style.display = 'block';
    el.style.left = `${rect.left - stage.left + this.crosshair.x * scale}px`;
    el.style.top = `${rect.top - stage.top + this.crosshair.y * scale}px`;
  }

  canvasPoint(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * PANEL_W,
      y: ((clientY - rect.top) / rect.height) * PANEL_H,
    };
  }

  // -- wiring ----------------------------------------------------------------
  bindInput() {
    const left = $('canvasLeft');
    const right = $('canvasRight');
    for (const [index, canvas] of [left, right].entries()) {
      canvas.addEventListener('click', (event) => {
        this.sound.ensure();
        const p = this.canvasPoint(canvas, event.clientX, event.clientY);
        this.crosshair = { x: p.x, y: p.y, panel: index, visible: true };
        this.positionCrosshair();
        this.markAt(index, p.x, p.y);
      });
      canvas.addEventListener('mousemove', (event) => {
        const p = this.canvasPoint(canvas, event.clientX, event.clientY);
        this.crosshair = { x: p.x, y: p.y, panel: index, visible: true };
        this.positionCrosshair();
      });
    }
    document.addEventListener('keydown', (event) => {
      if (event.target && ['INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
      const step = event.shiftKey ? 40 : 12;
      switch (event.key) {
        case 'ArrowLeft': this.moveCrosshair(-step, 0); event.preventDefault(); break;
        case 'ArrowRight': this.moveCrosshair(step, 0); event.preventDefault(); break;
        case 'ArrowUp': this.moveCrosshair(0, -step); event.preventDefault(); break;
        case 'ArrowDown': this.moveCrosshair(0, step); event.preventDefault(); break;
        case 'Enter':
        case ' ': {
          event.preventDefault();
          if (this.state === 'title') { this.startGame(); return; }
          if (this.state === 'playing') {
            this.sound.ensure();
            this.markAt(this.crosshair.panel, this.crosshair.x, this.crosshair.y);
          }
          break;
        }
        case 'h':
        case 'H': this.useHint(); break;
        case 'm':
        case 'M': this.toggleMute(); break;
        case 'p':
        case 'P':
        case 'Escape': this.togglePause(); break;
        case 'r':
        case 'R':
          if (this.state === 'playing' || this.state === 'paused') {
            this.startLevel(this.levelIndex);
            this.setState('playing');
            this.startTimer();
          }
          break;
        default: break;
      }
    });
    window.addEventListener('resize', () => this.positionCrosshair());
    $('hintBtn').addEventListener('click', () => this.useHint());
    $('muteBtn').addEventListener('click', () => this.toggleMute());
    $('pauseBtn').addEventListener('click', () => this.togglePause());
    $('playBtn').addEventListener('click', () => this.startGame());
    $('nextBtn').addEventListener('click', () => this.nextLevel());
    $('againBtn').addEventListener('click', () => {
      $('endScreen').classList.add('hidden');
      $('titleScreen').classList.remove('hidden');
      this.setState('title');
      this.startLevel(0);
      this.updateHud();
    });
    $('resumeBtn').addEventListener('click', () => this.togglePause());
  }

  // -- boot ------------------------------------------------------------------
  boot() {
    this.startLevel(0);
    this.setState('title');
    this.bindInput();
    this.raf = requestAnimationFrame(this.renderLoop);
    // Keep the title screen's pictures painted behind the overlay.
    this.updateHud();
  }
}

function circle(ctx, x, y, r, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}
