// Live sensor dashboard: renders the raw signal coming off the current
// stage's Arduino sketch as a real instrument reading (gauge + sparkline for
// analog values, a status pill for booleans, lit dots for enums, or a chip
// trail for one-off events) instead of just a scrolling text log.

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export class LiveDashboard {
  constructor(container) {
    this.container = container;
    this.history = [];
    this.currentStageId = null;
  }

  reset(stage) {
    this.currentStageId = stage.id;
    this.history = [];
    const d = stage.dashboard;
    if (!d) {
      this.container.innerHTML = '<p class="dash-empty">Bu bosqich uchun signal ko\'rsatkichi yo\'q.</p>';
      return;
    }
    if (d.type === 'analog') {
      this.container.innerHTML = `
        <div class="dash-analog">
          <div class="dash-readout"><span id="dash-value">--</span><span class="dash-unit">${d.unit}</span></div>
          <canvas id="dash-spark" width="280" height="46"></canvas>
          <div class="dash-range">
            <div class="dash-range-track"><div id="dash-range-fill" class="dash-range-fill"></div><div id="dash-range-marker" class="dash-range-marker"></div></div>
            <div class="dash-range-labels"><span>${d.min}${d.unit}</span><span>${d.label}</span><span>${d.max}${d.unit}</span></div>
          </div>
        </div>`;
      this.sparkCtx = this.container.querySelector('#dash-spark').getContext('2d');
    } else if (d.type === 'boolean') {
      this.container.innerHTML = `
        <div class="dash-bool">
          <div id="dash-pill" class="dash-pill dash-pill-off">${d.offLabel}</div>
        </div>`;
    } else if (d.type === 'enum') {
      this.container.innerHTML = `
        <div class="dash-enum">
          ${d.labels.map((l, i) => `<div class="dash-enum-dot" id="dash-enum-${i}" style="--dot-color:${d.colors[i]}"><span></span>${l}</div>`).join('')}
        </div>`;
    } else if (d.type === 'event') {
      this.container.innerHTML = `
        <div class="dash-event">
          <div id="dash-pulse" class="dash-pulse">${d.label}</div>
          <div id="dash-chips" class="dash-chips"></div>
        </div>`;
    }
  }

  push(stage, payload) {
    if (stage.id !== this.currentStageId) return;
    const d = stage.dashboard;
    if (!d) return;

    if (d.type === 'analog') {
      const v = Number(payload);
      if (Number.isNaN(v)) return;
      this.history.push(v);
      if (this.history.length > 60) this.history.shift();
      const valueEl = this.container.querySelector('#dash-value');
      const fillEl = this.container.querySelector('#dash-range-fill');
      const markerEl = this.container.querySelector('#dash-range-marker');
      if (valueEl) valueEl.textContent = d.decimals ? v.toFixed(d.decimals) : Math.round(v);
      const ratio = clamp((v - d.min) / (d.max - d.min), 0, 1);
      if (fillEl) fillEl.style.width = `${ratio * 100}%`;
      if (markerEl) markerEl.style.left = `${ratio * 100}%`;
      const danger = d.dangerZone ? d.dangerZone(v) : false;
      if (fillEl) fillEl.style.background = danger
        ? 'linear-gradient(90deg,#ff5c5c,#ff8a5c)'
        : 'linear-gradient(90deg,#5cc8ff,#4ee08b)';
      this._drawSpark(danger);
    } else if (d.type === 'boolean') {
      const on = payload === '1';
      const pill = this.container.querySelector('#dash-pill');
      if (pill) {
        pill.textContent = on ? d.onLabel : d.offLabel;
        const danger = on && d.dangerWhenOn;
        pill.className = `dash-pill ${on ? (danger ? 'dash-pill-danger' : 'dash-pill-on') : 'dash-pill-off'}`;
      }
    } else if (d.type === 'enum') {
      const idx = clamp(Number(payload), 0, d.labels.length - 1);
      d.labels.forEach((_, i) => {
        const dot = this.container.querySelector(`#dash-enum-${i}`);
        if (dot) dot.classList.toggle('active', i === idx);
      });
    } else if (d.type === 'event') {
      const pulse = this.container.querySelector('#dash-pulse');
      const chips = this.container.querySelector('#dash-chips');
      if (pulse) {
        pulse.classList.remove('pulse-anim');
        void pulse.offsetWidth; // restart animation
        pulse.classList.add('pulse-anim');
      }
      if (chips) {
        const chip = document.createElement('span');
        chip.className = 'dash-chip';
        chip.textContent = payload;
        chips.appendChild(chip);
        while (chips.children.length > 6) chips.removeChild(chips.firstChild);
      }
    }
  }

  _drawSpark(danger) {
    const ctx = this.sparkCtx;
    if (!ctx) return;
    const w = 280, h = 46;
    ctx.clearRect(0, 0, w, h);
    if (this.history.length < 2) return;
    const min = Math.min(...this.history);
    const max = Math.max(...this.history);
    const span = max - min || 1;
    ctx.beginPath();
    this.history.forEach((v, i) => {
      const x = (i / (this.history.length - 1)) * w;
      const y = h - ((v - min) / span) * (h - 6) - 3;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = danger ? '#ff5c5c' : '#5cc8ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    const last = this.history[this.history.length - 1];
    const lx = w;
    const ly = h - ((last - min) / span) * (h - 6) - 3;
    ctx.fillStyle = danger ? '#ff5c5c' : '#5cc8ff';
    ctx.beginPath();
    ctx.arc(lx - 2, ly, 3, 0, 7);
    ctx.fill();
  }
}
