// Nurshahar (Light City) renderer — a single persistent canvas scene that
// grows brighter and more alive as each of the 20 Arduino stages comes online.
// Pure Canvas2D, no assets, no build step. Includes a lightweight cinematic
// camera (pan/zoom focus on whatever system just activated), eased state
// transitions instead of instant snaps, and layered glow/atmosphere for a
// more premium look.

const W = 1000;
const H = 600;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function easeLerp(current, target, factor) {
  if (Math.abs(target - current) < 0.0005) return target;
  return lerp(current, target, factor);
}

export class City {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this._resize();
    window.addEventListener('resize', () => this._resize());

    this.t0 = performance.now();
    this.particles = []; // {x,y,vx,vy,life,maxLife,color,r,kind}

    this.camera = { x: 500, y: 300, zoom: 1 };
    this.cameraTarget = { x: 500, y: 300, zoom: 1 };
    this._focusTimer = null;

    this.clouds = Array.from({ length: 4 }, (_, i) => ({
      x: i * 320 + Math.random() * 200,
      y: 40 + Math.random() * 90,
      scale: 0.7 + Math.random() * 0.9,
      speed: 2.5 + Math.random() * 3,
    }));

    this.state = {
      controlKeyOn: false, // stage 1
      brightness: 0, // stage 2, 0..1
      autoLampsOn: false, // stage 3
      sirenOn: false, // stage 4
      trafficOn: false, // stage 5
      trafficPhase: 0, // 0 red,1 yellow,2 green
      bridgeOpen: 0, // stage 6, 0..1
      asteroidDistance: 1, // stage 7, 1 far .. 0 impact
      shieldOn: false, // stage 7
      securityOn: false, // stage 8
      weatherTemp: null, // stage 9
      lightningFlash: 0, // stage 9 transient
      quakeShake: 0, // stage 10 transient 0..1
      fireLevel: 1, // stage 11, 1 burning .. 0 extinguished
      gasClear: false, // stage 12
      fountainOn: false, // stage 13
      rainOn: false, // stage 14
      stadiumClosed: false, // stage 14
      vaultOpen: false, // stage 15
      radarAngle: -0.4, // stage 16, radians
      countdown: null, // stage 17, number or null
      launched: false, // stage 17
      remoteBlink: 0, // stage 18 transient
      coreKeyA: false, // stage 19
      coreKeyB: false, // stage 19
      reactorOpen: false, // stage 19
      finalVictory: false, // stage 20
      fireworks: 0, // stage 20 transient timer
      globalProgress: 0, // 0..1
    };

    // Smoothed mirrors: continuous values ease toward state, booleans fade as 0..1 glow.
    this.display = { brightness: 0, bridgeOpen: 0, radarAngle: this.state.radarAngle, asteroidDistance: 1, fireLevel: 1 };
    this.glow = {
      controlKeyOn: 0, autoLampsOn: 0, sirenOn: 0, trafficOn: 0, securityOn: 0,
      gasClear: 0, fountainOn: 0, rainOn: 0, vaultOpen: 0, reactorOpen: 0, shieldOn: 0,
    };

    this._raf = requestAnimationFrame((t) => this._tick(t));
  }

  _resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || W;
    const h = w * (H / W);
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.height = h + 'px';
    this.scale = w / W;
  }

  setProgress(p) {
    this.state.globalProgress = clamp(p, 0, 1);
  }

  spark(x, y, color, count = 18, spread = 3.2) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = (0.5 + Math.random() * 1.5) * spread;
      this.particles.push({
        x, y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed - 1,
        life: 0, maxLife: 40 + Math.random() * 40, color, r: 1.5 + Math.random() * 2.5, kind: 'spark',
      });
    }
  }

  // ---- public triggers called by stage handlers ----
  triggerLightning() { this.state.lightningFlash = 1; }
  triggerQuake() { this.state.quakeShake = 1; }
  triggerRemoteBlink() { this.state.remoteBlink = 1; }
  triggerFireworks() { this.state.fireworks = 1; }

  // Cinematic camera: smoothly push in on (x,y) at the given zoom, hold, then
  // ease back out to the full overview. Called when a stage comes online.
  focusOn(x, y, zoom = 1.9, holdMs = 2400) {
    this.cameraTarget = { x, y, zoom };
    clearTimeout(this._focusTimer);
    this._focusTimer = setTimeout(() => {
      this.cameraTarget = { x: 500, y: 300, zoom: 1 };
    }, holdMs);
  }

  _tick(now) {
    const dt = 16.7;
    const time = (now - this.t0) / 1000;
    this._update(time, dt);
    this._draw(time);
    this._raf = requestAnimationFrame((t) => this._tick(t));
  }

  _update(time, dt) {
    const s = this.state;

    // camera easing
    const camSpeed = this.cameraTarget.zoom > this.camera.zoom ? 0.07 : 0.045;
    this.camera.x = easeLerp(this.camera.x, this.cameraTarget.x, camSpeed);
    this.camera.y = easeLerp(this.camera.y, this.cameraTarget.y, camSpeed);
    this.camera.zoom = easeLerp(this.camera.zoom, this.cameraTarget.zoom, camSpeed);

    // continuous value smoothing
    this.display.brightness = easeLerp(this.display.brightness, s.brightness, 0.05);
    this.display.bridgeOpen = easeLerp(this.display.bridgeOpen, s.bridgeOpen, 0.06);
    this.display.radarAngle = easeLerp(this.display.radarAngle, s.radarAngle, 0.12);
    this.display.asteroidDistance = easeLerp(this.display.asteroidDistance, s.asteroidDistance, 0.05);
    this.display.fireLevel = easeLerp(this.display.fireLevel, s.fireLevel, 0.02);

    // boolean glow fades
    for (const key of Object.keys(this.glow)) {
      const target = s[key] ? 1 : 0;
      this.glow[key] = easeLerp(this.glow[key], target, 0.08);
    }

    if (s.lightningFlash > 0) s.lightningFlash = clamp(s.lightningFlash - dt / 260, 0, 1);
    if (s.quakeShake > 0) s.quakeShake = clamp(s.quakeShake - dt / 1400, 0, 1);
    if (s.remoteBlink > 0) s.remoteBlink = clamp(s.remoteBlink - dt / 900, 0, 1);
    if (s.fireworks > 0) {
      s.fireworks = clamp(s.fireworks - dt / 4500, 0, 1);
      if (Math.random() < 0.12) {
        const fx = 150 + Math.random() * 700;
        const fy = 80 + Math.random() * 140;
        const hue = Math.floor(Math.random() * 360);
        this.spark(fx, fy, `hsl(${hue},90%,60%)`, 26, 2.6);
      }
    }
    if (s.fountainOn && Math.random() < 0.3) {
      this.particles.push({
        x: 200 + (Math.random() - 0.5) * 6, y: 380, vx: (Math.random() - 0.5) * 0.6,
        vy: -3.2 - Math.random() * 1.2, life: 0, maxLife: 40, color: 'rgba(140,210,255,0.9)', r: 2, kind: 'water',
      });
    }
    if (s.rainOn && Math.random() < 0.8) {
      this.particles.push({
        x: Math.random() * W, y: -10, vx: -1, vy: 6 + Math.random() * 3,
        life: 0, maxLife: 200, color: 'rgba(160,200,255,0.5)', r: 1, kind: 'rain',
      });
    }
    if (!s.gasClear && Math.random() < 0.15) {
      this.particles.push({
        x: 745 + Math.random() * 10, y: 340, vx: (Math.random() - 0.5) * 0.4, vy: -0.6 - Math.random() * 0.3,
        life: 0, maxLife: 90, color: 'rgba(140,190,110,0.35)', r: 6 + Math.random() * 6, kind: 'smoke',
      });
    }
    for (const p of this.particles) {
      p.life += dt;
      p.x += p.vx;
      p.y += p.vy;
      if (p.kind === 'spark') p.vy += 0.04;
      if (p.kind === 'smoke') p.r += 0.03;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);

    for (const c of this.clouds) {
      c.x += c.speed * (dt / 1000);
      if (c.x > W + 200) c.x = -200;
    }
  }

  _glowDot(x, y, radius, color, alpha) {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
    g.addColorStop(0, color.replace('ALPHA', alpha.toFixed(3)));
    g.addColorStop(1, color.replace('ALPHA', '0'));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 7);
    ctx.fill();
  }

  _draw(time) {
    const ctx = this.ctx;
    const s = this.state;
    ctx.save();
    ctx.scale(this.dpr * this.scale, this.dpr * this.scale);

    // camera transform (pan/zoom)
    ctx.translate(W / 2, H / 2);
    ctx.scale(this.camera.zoom, this.camera.zoom);
    ctx.translate(-this.camera.x, -this.camera.y);

    let shakeX = 0, shakeY = 0;
    if (s.quakeShake > 0) {
      shakeX = (Math.random() - 0.5) * 10 * s.quakeShake;
      shakeY = (Math.random() - 0.5) * 8 * s.quakeShake;
    }
    ctx.translate(shakeX, shakeY);

    const night = 1 - clamp(s.globalProgress * 0.55 + this.display.brightness * 0.35, 0, 0.85);
    this._drawSky(time, night);
    this._drawClouds(night);
    this._drawAsteroids(time);
    this._drawGround(time);
    this._drawResidential(time);
    this._drawTower(time);
    this._drawRoad(time);
    this._drawBridge(time);
    this._drawWeatherStation(time);
    this._drawSirenTower(time);
    this._drawSecurityTower(time);
    this._drawFireBuilding(time);
    this._drawFactory(time);
    this._drawFountainPark(time);
    this._drawStadium(time);
    this._drawRadarHill(time);
    this._drawParticles();

    if (s.lightningFlash > 0) {
      ctx.fillStyle = `rgba(220,230,255,${0.5 * s.lightningFlash})`;
      ctx.fillRect(this.camera.x - W, this.camera.y - H, W * 2, H * 2);
    }
    if (s.quakeShake > 0) this._drawCracks(s.quakeShake);

    ctx.restore(); // end camera transform, back to screen space

    this._drawVignette();
    if (s.finalVictory) this._drawVictoryBanner(time);

    ctx.restore();
  }

  _drawClouds(night) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = 0.16 + night * 0.1;
    ctx.fillStyle = '#c9d4ea';
    for (const c of this.clouds) {
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, 60 * c.scale, 16 * c.scale, 0, 0, 7);
      ctx.ellipse(c.x + 30 * c.scale, c.y + 4, 40 * c.scale, 13 * c.scale, 0, 0, 7);
      ctx.fill();
    }
    ctx.restore();

    // rising moon, visible once the city has made some progress restoring power
    const moonProgress = clamp(this.state.globalProgress * 1.4, 0, 1);
    if (moonProgress > 0.02) {
      const mx = 880 - moonProgress * 60;
      const my = 90 - moonProgress * 40;
      ctx.save();
      ctx.globalAlpha = moonProgress;
      this._glowDot(mx, my, 46, 'rgba(230,235,255,ALPHA)', 0.35);
      ctx.fillStyle = '#eef1ff';
      ctx.beginPath();
      ctx.arc(mx, my, 16, 0, 7);
      ctx.fill();
      ctx.restore();
    }
  }

  _drawSky(time, night) {
    const ctx = this.ctx;
    const top = `rgb(${lerp(8, 100, 1 - night) | 0},${lerp(10, 140, 1 - night) | 0},${lerp(28, 190, 1 - night) | 0})`;
    const bot = `rgb(${lerp(30, 180, 1 - night) | 0},${lerp(20, 210, 1 - night) | 0},${lerp(60, 230, 1 - night) | 0})`;
    const g = ctx.createLinearGradient(0, 0, 0, 420);
    g.addColorStop(0, top);
    g.addColorStop(1, bot);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, 460);

    ctx.fillStyle = `rgba(255,255,255,${0.9 * night})`;
    for (let i = 0; i < 60; i++) {
      const x = (i * 137.5) % W;
      const y = (i * 61.3) % 340;
      const tw = 0.5 + 0.5 * Math.sin(time * 2 + i);
      ctx.globalAlpha = clamp(tw, 0.15, 1) * night;
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // warm restored-city glow on the horizon as progress rises
    if (this.state.globalProgress > 0.15) {
      const glowAlpha = clamp((this.state.globalProgress - 0.15) * 0.35, 0, 0.22);
      const hg = ctx.createLinearGradient(0, 300, 0, 460);
      hg.addColorStop(0, `rgba(255,190,120,0)`);
      hg.addColorStop(1, `rgba(255,170,90,${glowAlpha})`);
      ctx.fillStyle = hg;
      ctx.fillRect(0, 300, W, 160);
    }
  }

  _drawAsteroids(time) {
    const ctx = this.ctx;
    const s = this.state;
    if (s.finalVictory) return;
    const dist = clamp(this.display.asteroidDistance, 0, 1);
    if (dist >= 1 && this.glow.shieldOn < 0.02) return;
    const count = s.fireworks > 0 || dist < 0.35 ? 3 : 1;
    for (let i = 0; i < count; i++) {
      const seed = i * 71;
      const size = lerp(6, 34, 1 - dist);
      const x = 720 + i * 90 + Math.sin(time * 0.6 + seed) * 20;
      const y = lerp(30, 300, 1 - dist) + i * 24;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(time + seed);
      ctx.fillStyle = '#8b7d6b';
      ctx.beginPath();
      for (let a = 0; a < 8; a++) {
        const ang = (a / 8) * Math.PI * 2;
        const r = size * (0.7 + 0.3 * Math.sin(a * 3 + seed));
        ctx.lineTo(Math.cos(ang) * r, Math.sin(ang) * r);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // fiery trail with glow
      this._glowDot(x + 14, y - 14, size * 1.8, 'rgba(255,140,70,ALPHA)', 0.35);
      ctx.strokeStyle = 'rgba(255,150,90,0.4)';
      ctx.lineWidth = size * 0.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 40, y - 40);
      ctx.stroke();
    }
    if (this.glow.shieldOn > 0.01) {
      const pulse = 0.5 + 0.5 * Math.sin(time * 4);
      const a = this.glow.shieldOn;
      ctx.strokeStyle = `rgba(90,200,255,${(0.5 + pulse * 0.4) * a})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(520, 300, 230, Math.PI, 2 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = `rgba(90,200,255,${(0.06 + pulse * 0.05) * a})`;
      ctx.beginPath();
      ctx.arc(520, 300, 230, Math.PI, 2 * Math.PI);
      ctx.fill();
    }
  }

  _drawGround(time) {
    const ctx = this.ctx;
    ctx.fillStyle = '#0b0d14';
    ctx.fillRect(0, 460, W, H - 460);
  }

  _drawResidential(time) {
    const ctx = this.ctx;
    const s = this.state;
    const buildings = [
      { x: 40, y: 300, w: 60, h: 160 },
      { x: 110, y: 260, w: 50, h: 200 },
      { x: 170, y: 320, w: 46, h: 140 },
      { x: 225, y: 280, w: 40, h: 180 },
    ];
    const lit = this.glow.controlKeyOn;
    const bright = clamp(this.display.brightness, 0.06, 1) * lit;
    buildings.forEach((b, bi) => {
      ctx.fillStyle = '#171b26';
      ctx.fillRect(b.x, b.y, b.w, b.h);
      const cols = Math.floor(b.w / 12);
      const rows = Math.floor(b.h / 16);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const isLitWindow = bi !== 0 || (c + r) % 2 === 0 || bright > 0.3;
          const alpha = isLitWindow ? bright : 0;
          ctx.fillStyle = alpha > 0.02 ? `rgba(255,214,120,${alpha})` : 'rgba(255,255,255,0.03)';
          ctx.fillRect(b.x + 4 + c * 12, b.y + 6 + r * 16, 7, 9);
        }
      }
    });
    if (bright > 0.1) {
      this._glowDot(150, 380, 140 * bright, 'rgba(255,200,120,ALPHA)', 0.14);
    }
  }

  _drawTower(time) {
    const ctx = this.ctx;
    const s = this.state;
    ctx.fillStyle = '#141826';
    ctx.fillRect(480, 150, 80, 310);
    ctx.fillStyle = '#0e111a';
    ctx.beginPath();
    ctx.moveTo(475, 150);
    ctx.lineTo(520, 100);
    ctx.lineTo(565, 150);
    ctx.closePath();
    ctx.fill();

    // countdown board
    if (s.countdown !== null && !s.launched) {
      ctx.fillStyle = '#050708';
      ctx.fillRect(495, 175, 50, 26);
      ctx.fillStyle = '#ff5c5c';
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#ff5c5c';
      ctx.shadowBlur = 10;
      ctx.fillText(String(Math.max(0, s.countdown)).padStart(2, '0'), 520, 195);
      ctx.shadowBlur = 0;
    }
    if (s.launched) {
      const p = 1 - clamp(s.fireworks, 0, 1);
      ctx.fillStyle = '#e8e8f0';
      ctx.beginPath();
      ctx.moveTo(520, 120 - p * 260);
      ctx.lineTo(512, 150 - p * 260);
      ctx.lineTo(528, 150 - p * 260);
      ctx.closePath();
      ctx.fill();
      this._glowDot(520, 150 - p * 260, 14, 'rgba(255,200,120,ALPHA)', 0.5);
    }

    // reactor doors
    const openAmt = s.reactorOpen ? 1 : (s.coreKeyA || s.coreKeyB ? 0.15 : 0);
    ctx.fillStyle = '#05070c';
    ctx.fillRect(500, 400, 40, 60);
    ctx.fillStyle = '#2a3040';
    ctx.fillRect(500, 400, 20 * (1 - openAmt), 60);
    ctx.fillRect(540 - 20 * (1 - openAmt), 400, 20 * (1 - openAmt), 60);
    if (this.glow.reactorOpen > 0.01) {
      const glow = 0.5 + 0.5 * Math.sin(time * 3);
      this._glowDot(520, 430, 30, 'rgba(120,255,190,ALPHA)', 0.4 * this.glow.reactorOpen);
      ctx.fillStyle = `rgba(120,255,190,${(0.5 + glow * 0.4) * this.glow.reactorOpen})`;
      ctx.beginPath();
      ctx.arc(520, 430, 12, 0, 7);
      ctx.fill();
    }

    // vault door
    ctx.fillStyle = '#05070c';
    ctx.fillRect(430, 430, 30, 30);
    const vaultOpen = 22 * this.glow.vaultOpen;
    ctx.fillStyle = '#232838';
    ctx.fillRect(430, 430, 30 - vaultOpen, 30);

    // core glow overall (reflects global progress)
    const coreGlow = 0.15 + 0.55 * s.globalProgress;
    this._glowDot(520, 300, 110 * coreGlow, 'rgba(120,200,255,ALPHA)', 0.3);
  }

  _drawRoad(time) {
    const ctx = this.ctx;
    const s = this.state;
    ctx.fillStyle = '#181c24';
    ctx.fillRect(0, 480, 680, 40);
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.setLineDash([16, 14]);
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(680, 500);
    ctx.stroke();
    ctx.setLineDash([]);

    // streetlamps
    const lampOn = Math.max(this.glow.autoLampsOn, clamp((this.display.brightness - 0.5) * 2, 0, 1));
    for (let x = 60; x < 640; x += 140) {
      ctx.strokeStyle = '#2a2f3d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, 480);
      ctx.lineTo(x, 430);
      ctx.stroke();
      if (lampOn > 0.02) this._glowDot(x, 428, 22 * lampOn, 'rgba(255,221,136,ALPHA)', 0.5 * lampOn);
      ctx.fillStyle = `rgba(255,224,150,${0.15 + 0.75 * lampOn})`;
      ctx.beginPath();
      ctx.arc(x, 428, 6, 0, 7);
      ctx.fill();
    }

    // traffic light
    ctx.fillStyle = '#111';
    ctx.fillRect(335, 440, 12, 40);
    const colors = ['#ff4d4d', '#ffd23f', '#3fff7a'];
    for (let i = 0; i < 3; i++) {
      const active = s.trafficOn && s.trafficPhase === i;
      const a = active ? this.glow.trafficOn : 0;
      ctx.fillStyle = a > 0.02 ? colors[i] : 'rgba(255,255,255,0.08)';
      if (a > 0.02) this._glowDot(341, 448 + i * 10, 12, colors[i].startsWith('#') ? this._hexToRgbaTemplate(colors[i]) : colors[i], 0.6 * a);
      ctx.beginPath();
      ctx.arc(341, 448 + i * 10, 4, 0, 7);
      ctx.fill();
    }

    // cars
    if (this.glow.trafficOn > 0.3) {
      for (let i = 0; i < 3; i++) {
        const speed = s.trafficPhase === 2 ? 1 : 0.15;
        const x = ((time * 40 * speed + i * 220) % 760) - 40;
        ctx.fillStyle = ['#5cc8ff', '#ff8a5c', '#c4ff5c'][i];
        ctx.fillRect(x, 486 + i * 0, 26, 10);
      }
    }
  }

  _hexToRgbaTemplate(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r},${g},${b},ALPHA)`;
  }

  _drawBridge(time) {
    const ctx = this.ctx;
    const bridgeOpen = this.display.bridgeOpen;
    ctx.strokeStyle = '#232838';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(680, 486);
    ctx.lineTo(780, 486);
    ctx.stroke();

    ctx.save();
    ctx.translate(800, 486);
    ctx.rotate(-bridgeOpen * 0.9);
    ctx.fillStyle = '#3a4258';
    ctx.fillRect(0, -4, 90, 8);
    ctx.restore();

    ctx.strokeStyle = '#232838';
    ctx.beginPath();
    ctx.moveTo(890, 486);
    ctx.lineTo(980, 486);
    ctx.stroke();

    ctx.fillStyle = 'rgba(60,110,200,0.25)';
    ctx.fillRect(680, 494, 300, 6);
    // gentle water shimmer
    const shimmer = 0.15 + 0.1 * Math.sin(time * 1.4);
    ctx.fillStyle = `rgba(140,190,255,${shimmer})`;
    for (let x = 690; x < 970; x += 40) {
      ctx.fillRect(x + Math.sin(time + x) * 4, 497, 18, 1.5);
    }
  }

  _drawWeatherStation(time) {
    const ctx = this.ctx;
    const s = this.state;
    ctx.fillStyle = 'rgba(200,205,220,0.35)';
    [[650, 120], [700, 110], [670, 135]].forEach(([x, y]) => {
      ctx.beginPath();
      ctx.ellipse(x, y, 34, 16, 0, 0, 7);
      ctx.fill();
    });
    if (s.weatherTemp !== null) {
      ctx.fillStyle = '#dfe6ff';
      ctx.font = '12px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${s.weatherTemp.toFixed(1)}°C`, 640, 165);
    }
    if (s.lightningFlash > 0.05) {
      ctx.strokeStyle = '#fff7c0';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(680, 130);
      ctx.lineTo(668, 175);
      ctx.lineTo(682, 175);
      ctx.lineTo(662, 230);
      ctx.stroke();
      this._glowDot(672, 175, 60, 'rgba(255,247,192,ALPHA)', 0.5 * s.lightningFlash);
    }
  }

  _drawSirenTower(time) {
    const ctx = this.ctx;
    const a = this.glow.sirenOn;
    ctx.fillStyle = '#171b26';
    ctx.fillRect(292, 210, 16, 90);
    if (a > 0.02) this._glowDot(300, 204, 26, 'rgba(255,92,92,ALPHA)', 0.6 * a);
    ctx.fillStyle = a > 0.02 ? '#ff5c5c' : '#3a2c2c';
    ctx.beginPath();
    ctx.arc(300, 204, 8, 0, 7);
    ctx.fill();
    if (a > 0.05) {
      for (let i = 0; i < 2; i++) {
        const r = ((time * 60 + i * 30) % 60);
        ctx.strokeStyle = `rgba(255,92,92,${clamp(1 - r / 60, 0, 1) * 0.6 * a})`;
        ctx.beginPath();
        ctx.arc(300, 204, r, 0, 7);
        ctx.stroke();
      }
    }
  }

  _drawSecurityTower(time) {
    const ctx = this.ctx;
    const a = this.glow.securityOn;
    ctx.fillStyle = '#171b26';
    ctx.fillRect(144, 130, 14, 60);
    if (a > 0.02) {
      const sweep = Math.sin(time * 1.2) * 0.5;
      ctx.save();
      ctx.translate(151, 130);
      ctx.rotate(sweep);
      const g = ctx.createLinearGradient(0, 0, 0, 220);
      g.addColorStop(0, `rgba(180,230,255,${0.35 * a})`);
      g.addColorStop(1, 'rgba(180,230,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-40, 220);
      ctx.lineTo(40, 220);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  _drawFireBuilding(time) {
    const ctx = this.ctx;
    const level = this.display.fireLevel;
    ctx.fillStyle = '#171b26';
    ctx.fillRect(580, 300, 56, 160);
    if (level > 0.02) {
      this._glowDot(608, 285, 40 * level, 'rgba(255,140,60,ALPHA)', 0.35 * level);
      for (let i = 0; i < 4; i++) {
        const fx = 590 + i * 12;
        const flick = Math.sin(time * 8 + i) * 4;
        const h = 26 * level;
        const g = ctx.createLinearGradient(0, 300 - h, 0, 300);
        g.addColorStop(0, 'rgba(255,220,120,0)');
        g.addColorStop(1, `rgba(255,120,40,${0.8 * level})`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(fx, 300);
        ctx.quadraticCurveTo(fx + 6 + flick, 300 - h * 0.6, fx, 300 - h);
        ctx.quadraticCurveTo(fx - 6 - flick, 300 - h * 0.6, fx, 300);
        ctx.fill();
      }
    }
  }

  _drawFactory(time) {
    const ctx = this.ctx;
    const clear = this.glow.gasClear;
    ctx.fillStyle = '#171b26';
    ctx.fillRect(730, 340, 70, 120);
    const r = lerp(42, 58, clear), g = lerp(47, 161, clear), b = lerp(61, 92, clear);
    ctx.fillStyle = `rgb(${r | 0},${g | 0},${b | 0})`;
    ctx.fillRect(745, 330, 10, 14);
    ctx.fillRect(765, 325, 10, 19);
    if (clear > 0.5) this._glowDot(755, 335, 20, 'rgba(90,220,140,ALPHA)', 0.2);
  }

  _drawFountainPark(time) {
    const ctx = this.ctx;
    const a = this.glow.fountainOn;
    ctx.strokeStyle = '#233';
    ctx.fillStyle = 'rgba(40,60,50,0.6)';
    ctx.beginPath();
    ctx.ellipse(200, 400, 46, 14, 0, 0, 7);
    ctx.fill();
    if (a > 0.02) this._glowDot(200, 396, 40, 'rgba(90,170,220,ALPHA)', 0.4 * a);
    ctx.fillStyle = `rgba(90,170,220,${0.25 + 0.5 * a})`;
    ctx.beginPath();
    ctx.ellipse(200, 396, 24, 8, 0, 0, 7);
    ctx.fill();
  }

  _drawStadium(time) {
    const ctx = this.ctx;
    ctx.strokeStyle = '#2a2f3d';
    ctx.fillStyle = '#171b26';
    ctx.beginPath();
    ctx.ellipse(430, 360, 46, 24, 0, 0, 7);
    ctx.fill();
    const roof = 0.15 + 0.85 * this.glow.rainOn;
    ctx.fillStyle = 'rgba(120,140,170,0.5)';
    ctx.beginPath();
    ctx.ellipse(430, 356, 44 * roof + 4, 20 * roof + 2, 0, Math.PI, 2 * Math.PI);
    ctx.fill();
  }

  _drawRadarHill(time) {
    const ctx = this.ctx;
    ctx.fillStyle = '#141824';
    ctx.beginPath();
    ctx.ellipse(860, 300, 60, 26, 0, 0, Math.PI);
    ctx.fill();
    ctx.save();
    ctx.translate(860, 274);
    ctx.rotate(this.display.radarAngle);
    ctx.strokeStyle = '#5cc8ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -40);
    ctx.stroke();
    ctx.fillStyle = '#2a3345';
    ctx.beginPath();
    ctx.ellipse(0, -40, 16, 6, 0, 0, 7);
    ctx.fill();
    ctx.restore();
  }

  _drawParticles() {
    const ctx = this.ctx;
    for (const p of this.particles) {
      const a = clamp(1 - p.life / p.maxLife, 0, 1);
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  _drawCracks(strength) {
    const ctx = this.ctx;
    ctx.strokeStyle = `rgba(0,0,0,${0.4 * strength})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(200, 460);
    ctx.lineTo(230, 500);
    ctx.lineTo(210, 540);
    ctx.moveTo(600, 460);
    ctx.lineTo(580, 500);
    ctx.stroke();
  }

  _drawVignette() {
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.85);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  _drawVictoryBanner(time) {
    const ctx = this.ctx;
    const pulse = 0.5 + 0.5 * Math.sin(time * 3);
    ctx.fillStyle = 'rgba(6,10,18,0.3)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 36px sans-serif';
    ctx.shadowColor = '#ffd76a';
    ctx.shadowBlur = 16 + pulse * 14;
    ctx.fillText('SHAHAR QUTQARILDI!', W / 2, 60);
    ctx.shadowBlur = 0;
  }
}
