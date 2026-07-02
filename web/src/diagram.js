// Reusable Canvas2D wiring-diagram renderer: a simplified Arduino Uno
// silhouette with a fixed pin map, a small library of component shapes, and
// a declarative renderer that draws colour-coded wires between them. Not
// pixel-accurate Fritzing art, but a real schematic instead of text alone.

const W = 480;
const H = 300;

const BOARD = { x: 130, y: 205, w: 300, h: 75 };
const DIGITAL_PINS = ['D2', 'D3', 'D4', 'D5', 'D6', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12', 'D13'];
const BOTTOM_PINS = ['5V', 'GND', 'A0', 'A1', 'A2', 'A3', 'A4', 'A5'];

const WIRE_COLORS = {
  power: '#ff5c5c',
  ground: '#5c6b8a',
  signal: '#5cc8ff',
  signal2: '#ffd76a',
  signal3: '#8effc1',
};

function pinPos(name) {
  const di = DIGITAL_PINS.indexOf(name);
  if (di >= 0) return { x: BOARD.x + 25 + di * 24, y: BOARD.y, side: 'top' };
  const bi = BOTTOM_PINS.indexOf(name);
  if (bi >= 0) return { x: BOARD.x + 22 + bi * 36, y: BOARD.y + BOARD.h, side: 'bottom' };
  return null;
}

function drawBoard(ctx, usedPins) {
  ctx.fillStyle = '#0e2a1f';
  ctx.strokeStyle = '#1d6b47';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(BOARD.x, BOARD.y, BOARD.w, BOARD.h, 8);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#8ee0b8';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('ARDUINO UNO', BOARD.x + BOARD.w / 2, BOARD.y + BOARD.h / 2 + 4);

  // USB port notch
  ctx.fillStyle = '#0a1a14';
  ctx.fillRect(BOARD.x - 14, BOARD.y + BOARD.h / 2 - 10, 16, 20);

  ctx.font = '9px monospace';
  DIGITAL_PINS.forEach((name) => {
    const p = pinPos(name);
    const on = usedPins.has(name);
    ctx.fillStyle = on ? '#ffffff' : '#2a3f36';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, 7);
    ctx.fill();
    ctx.fillStyle = on ? '#dfe6ff' : '#3d5348';
    ctx.save();
    ctx.translate(p.x, p.y - 8);
    ctx.rotate(-Math.PI / 2.4);
    ctx.textAlign = 'left';
    ctx.fillText(name, 0, 0);
    ctx.restore();
  });
  BOTTOM_PINS.forEach((name) => {
    const p = pinPos(name);
    const on = usedPins.has(name);
    ctx.fillStyle = on ? '#ffffff' : '#2a3f36';
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, 7);
    ctx.fill();
    ctx.fillStyle = on ? '#dfe6ff' : '#3d5348';
    ctx.textAlign = 'center';
    ctx.font = '9px monospace';
    ctx.fillText(name, p.x, p.y + 16);
  });
}

function drawWire(ctx, from, to, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const midY = Math.min(from.y, to.y) - 26 - Math.random() * 0;
  ctx.moveTo(from.x, from.y);
  ctx.bezierCurveTo(from.x, midY, to.x, midY, to.x, to.y);
  ctx.stroke();
  [from, to].forEach((p) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, 7);
    ctx.fill();
  });
}

function labelBelow(ctx, x, y, text) {
  ctx.fillStyle = '#c7d0e8';
  ctx.font = '10px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

// ---- component library ---------------------------------------------------
// Each draw function returns a map of lead-name -> world {x,y} anchor point.

const components = {
  button(ctx, x, y, label) {
    ctx.fillStyle = '#2a2f3d';
    ctx.strokeStyle = '#4a5268';
    ctx.beginPath();
    ctx.roundRect(x - 14, y - 10, 28, 20, 3);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#8b93ab';
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 7);
    ctx.fill();
    labelBelow(ctx, x, y + 26, label || 'Tugma');
    return { pin: { x: x + 14, y }, gnd: { x: x - 14, y } };
  },
  led(ctx, x, y, label, color = '#ffd76a') {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, 7);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(x, y, 9, 0, 7);
    ctx.stroke();
    labelBelow(ctx, x, y + 24, label || 'LED');
    return { anode: { x: x + 8, y: y + 7 }, cathode: { x: x - 8, y: y + 7 } };
  },
  resistor(ctx, x, y, label) {
    ctx.strokeStyle = '#c7a86a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 16, y);
    const zig = [0.3, -0.6, 0.6, -0.6, 0.6, -0.3];
    let cx = x - 12;
    zig.forEach((dz, i) => {
      ctx.lineTo(cx, y + dz * 7);
      cx += 24 / zig.length;
    });
    ctx.lineTo(x + 16, y);
    ctx.stroke();
    labelBelow(ctx, x, y + 16, label || '220Ω');
    return { left: { x: x - 16, y }, right: { x: x + 16, y } };
  },
  potentiometer(ctx, x, y, label) {
    ctx.fillStyle = '#3a3f52';
    ctx.strokeStyle = '#5c6478';
    ctx.beginPath();
    ctx.arc(x, y, 14, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#dfe6ff';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 9, y - 9);
    ctx.stroke();
    labelBelow(ctx, x, y + 26, label || 'Potentsiometr');
    return { left: { x: x - 14, y: y + 10 }, wiper: { x, y: y + 14 }, right: { x: x + 14, y: y + 10 } };
  },
  buzzer(ctx, x, y, label) {
    ctx.fillStyle = '#4a4032';
    ctx.strokeStyle = '#8a7452';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, 7);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#ffd76a';
    for (let r = 4; r <= 10; r += 3) {
      ctx.beginPath();
      ctx.arc(x, y, r, -0.6, 0.6);
      ctx.stroke();
    }
    labelBelow(ctx, x, y + 24, label || 'Buzzer');
    return { pin: { x: x - 12, y: y + 8 }, gnd: { x: x + 12, y: y + 8 } };
  },
  servo(ctx, x, y, label) {
    ctx.fillStyle = '#3a4258';
    ctx.strokeStyle = '#5c6478';
    ctx.beginPath();
    ctx.roundRect(x - 16, y - 12, 32, 24, 3);
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = '#dfe6ff';
    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x + 14, y - 22);
    ctx.stroke();
    labelBelow(ctx, x, y + 24, label || 'Servo');
    return {
      signal: { x: x - 10, y: y + 12 },
      vcc: { x: x, y: y + 12 },
      gnd: { x: x + 10, y: y + 12 },
    };
  },
  rgbled(ctx, x, y, label) {
    ['#ff5c5c', '#4ee08b', '#5cc8ff'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(x - 8 + i * 8, y, 6, 0, 7);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    labelBelow(ctx, x, y + 22, label || 'RGB LED');
    return {
      r: { x: x - 8, y: y + 6 },
      g: { x: x, y: y + 6 },
      b: { x: x + 8, y: y + 6 },
      gnd: { x: x, y: y + 16 },
    };
  },
  reed(ctx, x, y, label) {
    ctx.strokeStyle = '#8b93ab';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 16, y);
    ctx.lineTo(x + 16, y);
    ctx.stroke();
    ctx.fillStyle = '#2a2f3d';
    ctx.beginPath();
    ctx.roundRect(x - 10, y - 6, 20, 12, 4);
    ctx.fill();
    ctx.fillStyle = '#8b7d6b';
    ctx.beginPath();
    ctx.roundRect(x + 22, y - 5, 14, 10, 2);
    ctx.fill();
    labelBelow(ctx, x, y + 20, label || 'Reed switch');
    ctx.font = '8px sans-serif';
    ctx.fillStyle = '#8b93ab';
    ctx.fillText('magnit', x + 29, y + 18);
    return { a: { x: x - 16, y }, b: { x: x + 16, y } };
  },
  // Generic small sensor board: rounded rect with N labelled leads along the bottom.
  sensorBoard(ctx, x, y, label, pins) {
    const w = Math.max(46, pins.length * 20);
    ctx.fillStyle = '#232838';
    ctx.strokeStyle = '#3f4a63';
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - 16, w, 26, 4);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#5cc8ff';
    ctx.beginPath();
    ctx.arc(x, y - 4, 5, 0, 7);
    ctx.fill();
    labelBelow(ctx, x, y + 24, label);
    const anchors = {};
    const startX = x - ((pins.length - 1) * 20) / 2;
    ctx.font = '8px monospace';
    ctx.fillStyle = '#8b93ab';
    pins.forEach((pname, i) => {
      const px = startX + i * 20;
      anchors[pname] = { x: px, y: y + 10 };
      ctx.textAlign = 'center';
      ctx.fillText(pname, px, y + 20 + 8);
    });
    return anchors;
  },
};

function circuitUsedPins(def) {
  const set = new Set();
  def.wires.forEach((w) => {
    [w.from, w.to].forEach((endpoint) => {
      if (!endpoint.includes('.')) set.add(endpoint);
    });
  });
  return set;
}

export function renderCircuit(canvas, def) {
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const cssW = rect.width || W;
  const cssH = cssW * (H / W);
  canvas.width = cssW * dpr;
  canvas.height = cssH * dpr;
  canvas.style.height = cssH + 'px';
  ctx.setTransform(dpr * (cssW / W), 0, 0, dpr * (cssW / W), 0, 0);
  ctx.clearRect(0, 0, W, H);

  drawBoard(ctx, circuitUsedPins(def));

  const anchors = {};
  def.components.forEach((c) => {
    const fn = components[c.type];
    if (!fn) return;
    anchors[c.id] = c.type === 'sensorBoard'
      ? fn(ctx, c.x, c.y, c.label, c.pins)
      : fn(ctx, c.x, c.y, c.label, c.color);
  });

  const resolve = (endpoint) => {
    if (endpoint.includes('.')) {
      const [compId, lead] = endpoint.split('.');
      return anchors[compId]?.[lead];
    }
    return pinPos(endpoint);
  };

  def.wires.forEach((w) => {
    const from = resolve(w.from);
    const to = resolve(w.to);
    if (from && to) drawWire(ctx, from, to, WIRE_COLORS[w.color] || WIRE_COLORS.signal);
  });
}
