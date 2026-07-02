import { City } from './city.js';
import { STAGES, STORY_TITLE, STORY_INTRO, getStage } from './stages.js';
import { SerialLink, parseEventLine } from './serial.js';
import { Story } from './story.js';
import { AudioEngine } from './audio.js';
import { renderCircuit } from './diagram.js';
import { CIRCUITS } from './circuits.js';
import { LiveDashboard } from './dashboard.js';

const canvas = document.getElementById('city-canvas');
const city = new City(canvas);
const story = new Story();
const audio = new AudioEngine();
const dashboard = new LiveDashboard(document.getElementById('live-dashboard'));

const el = {
  connectBtn: document.getElementById('connect-btn'),
  disconnectBtn: document.getElementById('disconnect-btn'),
  status: document.getElementById('conn-status'),
  stageList: document.getElementById('stage-list'),
  stageTitle: document.getElementById('stage-title'),
  stageSubtitle: document.getElementById('stage-subtitle'),
  stageComponents: document.getElementById('stage-components'),
  stageWiring: document.getElementById('stage-wiring'),
  stageIntro: document.getElementById('stage-intro'),
  simulateBtn: document.getElementById('simulate-btn'),
  toast: document.getElementById('toast'),
  progressBar: document.getElementById('progress-bar'),
  progressLabel: document.getElementById('progress-label'),
  log: document.getElementById('serial-log'),
  resetBtn: document.getElementById('reset-btn'),
  storyTitle: document.getElementById('story-title'),
  storyIntro: document.getElementById('story-intro'),
  muteBtn: document.getElementById('mute-btn'),
  splash: document.getElementById('splash'),
  splashStart: document.getElementById('splash-start'),
  cinematicLayer: document.getElementById('cinematic-layer'),
  wiringDiagram: document.getElementById('wiring-diagram'),
};

el.storyTitle.textContent = STORY_TITLE;
el.storyIntro.textContent = STORY_INTRO;

let link = null;
let muted = false;

function logLine(text) {
  const line = document.createElement('div');
  line.className = 'log-line';
  line.textContent = text;
  el.log.appendChild(line);
  el.log.scrollTop = el.log.scrollHeight;
  while (el.log.children.length > 200) el.log.removeChild(el.log.firstChild);
}

function toast(message, kind = 'info') {
  while (el.toast.children.length >= 4) el.toast.removeChild(el.toast.firstChild);
  const node = document.createElement('div');
  node.className = `toast-msg toast-${kind}`;
  node.textContent = message;
  el.toast.appendChild(node);
  requestAnimationFrame(() => node.classList.add('show'));
  setTimeout(() => {
    node.classList.remove('show');
    setTimeout(() => node.remove(), 400);
  }, 4200);
}

// Bigger, cinematic "stage complete" moment — plays over the city canvas
// itself, in sync with the camera pushing in on the system that just came online.
function playStageBanner(stage) {
  el.cinematicLayer.querySelectorAll('.cine-banner').forEach((n) => n.remove());
  const node = document.createElement('div');
  node.className = 'cine-banner';
  node.innerHTML = `
    <div class="cine-icon">${stage.icon}</div>
    <div class="cine-text">
      <div class="cine-kicker">Bosqich ${String(stage.id).padStart(2, '0')} tugallandi</div>
      <div class="cine-title">${stage.title}</div>
      <div class="cine-desc">${stage.story.complete}</div>
    </div>
  `;
  el.cinematicLayer.appendChild(node);
  requestAnimationFrame(() => node.classList.add('show'));
  setTimeout(() => {
    node.classList.remove('show');
    setTimeout(() => node.remove(), 500);
  }, 3400);
}

function renderStageList() {
  el.stageList.innerHTML = '';
  STAGES.forEach((stage) => {
    const unlocked = story.isUnlocked(stage.id);
    const completed = story.isCompleted(stage.id);
    const item = document.createElement('button');
    item.className = 'stage-item' +
      (completed ? ' is-complete' : '') +
      (unlocked ? '' : ' is-locked') +
      (stage.id === story.current ? ' is-current' : '');
    item.disabled = !unlocked;
    item.innerHTML = `
      <span class="stage-icon">${unlocked ? stage.icon : '🔒'}</span>
      <span class="stage-num">${String(stage.id).padStart(2, '0')}</span>
      <span class="stage-name">${stage.title}</span>
      <span class="stage-mark">${completed ? '✔' : ''}</span>
    `;
    item.addEventListener('click', () => {
      if (!unlocked) return;
      audio.blip();
      story.setCurrent(stage.id);
      renderAll();
    });
    el.stageList.appendChild(item);
  });
}

let lastRenderedStageId = null;

function renderStagePanel() {
  const stage = getStage(story.current);
  el.stageTitle.textContent = `${stage.icon} ${String(stage.id).padStart(2, '0')} · ${stage.title}`;
  el.stageSubtitle.textContent = stage.subtitle;
  el.stageComponents.innerHTML = stage.components.map((c) => `<li>${c}</li>`).join('');
  el.stageWiring.innerHTML = stage.wiring.map((w) => `<li>${w}</li>`).join('');
  el.stageIntro.textContent = story.isCompleted(stage.id) ? stage.story.complete : stage.story.intro;
  el.simulateBtn.textContent = `Simulyatsiya: bosqich ${stage.id} signalini yubor`;

  // Diagram + live dashboard only need a hard reset when the selected stage
  // actually changes — not on every renderAll() call triggered by an event.
  if (stage.id !== lastRenderedStageId) {
    const circuit = CIRCUITS[stage.id];
    if (circuit) renderCircuit(el.wiringDiagram, circuit);
    dashboard.reset(stage);
    lastRenderedStageId = stage.id;
  }
}

function renderProgress() {
  const ratio = story.progressRatio();
  city.setProgress(ratio);
  el.progressBar.style.width = `${Math.round(ratio * 100)}%`;
  el.progressLabel.textContent = `${story.completed.size}/${STAGES.length} bosqich tugallandi`;
}

function renderAll() {
  renderStageList();
  renderStagePanel();
  renderProgress();
}

function playSpecialSfx(stage, payload) {
  switch (stage.id) {
    case 4:
      audio.siren(payload === '1');
      break;
    case 9:
      if (city.state.lightningFlash > 0.9) audio.thunder();
      break;
    case 10:
      if (payload === '1') audio.quake();
      break;
    case 13:
    case 14:
      if (payload === '1') audio.splash();
      break;
    case 17:
      if (payload === 'LAUNCH') audio.launch();
      break;
    case 20:
      if (payload === 'SIREN') audio.siren(true);
      if (payload === 'VICTORY') { audio.siren(false); audio.victory(); }
      break;
    default:
      break;
  }
}

function handleEvent(id, payload) {
  const stage = getStage(id);
  if (!stage) return;
  if (!story.isUnlocked(id)) {
    logLine(`(qulflangan bosqich ${id} signali e'tiborga olinmadi)`);
    return;
  }
  stage.parse(payload, city);
  audio.blip();
  playSpecialSfx(stage, payload);
  dashboard.push(stage, payload);

  if (stage.isComplete(city.state) && !story.isCompleted(id)) {
    story.markComplete(id);
    audio.success();
    city.focusOn(stage.focus.x, stage.focus.y, stage.focus.zoom);
    playStageBanner(stage);
    if (id === STAGES.length) {
      setTimeout(() => toast('Barcha 20 bosqich tugallandi. Nurshahar butunlay tiklandi!', 'success'), 1200);
    }
  }
  renderAll();
}

el.connectBtn.addEventListener('click', async () => {
  audio.ensure();
  if (!SerialLink.isSupported()) {
    toast('Bu brauzer Web Serial ni qo\'llab-quvvatlamaydi. Google Chrome yoki Microsoft Edge dan foydalaning.', 'error');
    return;
  }
  link = new SerialLink({
    onLine: (line) => {
      logLine(`> ${line}`);
      const evt = parseEventLine(line);
      if (evt) handleEvent(evt.id, evt.payload);
    },
    onStatus: (status) => {
      el.status.textContent = status === 'connected' ? 'Ulandi' : status === 'disconnected' ? 'Uzildi' : 'Xatolik';
      el.status.className = `status status-${status}`;
      el.connectBtn.disabled = status === 'connected';
      el.disconnectBtn.disabled = status !== 'connected';
    },
  });
  try {
    await link.connect();
    toast('Arduino ulandi. Sxemani yig\'ib, signalni kuting.', 'success');
  } catch (err) {
    toast(err.message || String(err), 'error');
  }
});

el.disconnectBtn.addEventListener('click', async () => {
  await link?.disconnect();
});

el.simulateBtn.addEventListener('click', () => {
  audio.ensure();
  const stage = getStage(story.current);
  const sample = SIMULATED_PAYLOADS[stage.id];
  logLine(`(simulyatsiya) EVT:${stage.id}:${sample}`);
  handleEvent(stage.id, sample);
});

el.resetBtn.addEventListener('click', () => {
  if (!confirm('Butun progress tozalansinmi?')) return;
  story.reset();
  renderAll();
});

el.muteBtn.addEventListener('click', () => {
  muted = !muted;
  audio.setMuted(muted);
  el.muteBtn.textContent = muted ? '🔇' : '🔊';
});

el.splashStart.addEventListener('click', () => {
  audio.ensure();
  audio.blip();
  el.splash.classList.add('hidden');
  setTimeout(() => el.splash.remove(), 700);
});

// Representative "next" payload for the simulate button, so the story can be
// demoed / tested without physical hardware connected.
const SIMULATED_PAYLOADS = {
  1: '1', 2: '255', 3: '1', 4: '1', 5: '2', 6: '180', 7: '10', 8: '1',
  9: '32.5', 10: '1', 11: '0', 12: '120', 13: '1', 14: '1', 15: '1',
  16: '70', 17: 'LAUNCH', 18: 'PLAY', 19: 'A1', 20: 'VICTORY',
};

// Stage 19 needs both keys — simulate button sends both in sequence for a
// satisfying demo of the dual-key mechanic.
const originalHandle19 = STAGES.find((s) => s.id === 19).parse;
STAGES.find((s) => s.id === 19).parse = function (payload, cityRef) {
  originalHandle19('A1', cityRef);
  originalHandle19('B1', cityRef);
  return true;
};

renderAll();
