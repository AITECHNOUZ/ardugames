// Small synthesized sound engine — no audio files, everything is generated
// with the Web Audio API so the project stays a pure static site. Must be
// unlocked by a user gesture (browsers block audio until then); call
// ensure() from a click handler before using anything else.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.muted = false;
    this._sirenNode = null;
  }

  ensure() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.45;
      this.master.connect(this.ctx.destination);
      this._startAmbient();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) this.master.gain.setTargetAtTime(muted ? 0 : 0.45, this.ctx.currentTime, 0.05);
  }

  _noiseBuffer(duration) {
    const ctx = this.ctx;
    const size = Math.max(1, Math.floor(ctx.sampleRate * duration));
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  _startAmbient() {
    const ctx = this.ctx;
    const drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = 55;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.05;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.07;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain);
    lfoGain.connect(droneGain.gain);
    drone.connect(droneGain);
    droneGain.connect(this.master);
    drone.start();
    lfo.start();
  }

  _tone({ freq = 440, type = 'sine', duration = 0.15, gain = 0.3, delay = 0, glideTo = null }) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (glideTo) osc.frequency.linearRampToValueAtTime(glideTo, t0 + duration);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  _noiseBurst({ duration = 0.3, gain = 0.4, filterFreq = 1200, delay = 0 }) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + delay;
    const src = ctx.createBufferSource();
    src.buffer = this._noiseBuffer(duration);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.master);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  }

  blip() {
    this.ensure();
    this._tone({ freq: 780, type: 'sine', duration: 0.08, gain: 0.14 });
  }

  success() {
    this.ensure();
    [523.25, 659.25, 783.99].forEach((f, i) => {
      this._tone({ freq: f, type: 'triangle', duration: 0.28, gain: 0.22, delay: i * 0.09 });
    });
  }

  thunder() {
    this.ensure();
    this._noiseBurst({ duration: 0.5, gain: 0.5, filterFreq: 800 });
    this._tone({ freq: 90, type: 'sine', duration: 0.6, gain: 0.3, delay: 0.05 });
  }

  quake() {
    this.ensure();
    this._noiseBurst({ duration: 1.1, gain: 0.35, filterFreq: 220 });
    this._tone({ freq: 45, type: 'sawtooth', duration: 1.1, gain: 0.2 });
  }

  launch() {
    this.ensure();
    this._noiseBurst({ duration: 1.6, gain: 0.3, filterFreq: 2200 });
    this._tone({ freq: 120, type: 'sawtooth', duration: 1.6, gain: 0.22, glideTo: 900 });
  }

  victory() {
    this.ensure();
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this._tone({ freq: f, type: 'triangle', duration: 0.5, gain: 0.24, delay: i * 0.12 });
    });
  }

  splash() {
    this.ensure();
    this._tone({ freq: 900, type: 'sine', duration: 0.12, gain: 0.15, glideTo: 400 });
  }

  siren(on) {
    this.ensure();
    if (on && !this._sirenNode) {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      const lfo = ctx.createOscillator();
      lfo.frequency.value = 1.4;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 220;
      osc.frequency.value = 650;
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      const g = ctx.createGain();
      g.gain.value = 0.12;
      osc.connect(g);
      g.connect(this.master);
      osc.start();
      lfo.start();
      this._sirenNode = { osc, lfo, g };
    } else if (!on && this._sirenNode) {
      const { osc, lfo, g } = this._sirenNode;
      g.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
      setTimeout(() => { osc.stop(); lfo.stop(); }, 300);
      this._sirenNode = null;
    }
  }
}
