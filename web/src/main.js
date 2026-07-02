import { City } from './city.js';
import { STAGES, STORY_TITLE, STORY_INTRO, getStage } from './stages.js';
import { SerialLink, parseEventLine } from './serial.js';
import { Story } from './story.js';
import { AudioEngine } from './audio.js';
import { renderCircuit } from './diagram.js';
import { CIRCUITS } from './circuits.js';
import { LiveDashboard } from './dashboard.js';
import { Mentor } from './mentor.js';

const canvas = document.getElementById('city-canvas');
const city = new City(canvas);
const story = new Story();
const audio = new AudioEngine();
const dashboard = new LiveDashboard(document.getElementById('live-dashboard'));
const mentor = new Mentor(document.getElementById('mentor'));

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
  challengeGoal: document.getElementById('challenge-goal'),
  challengeTimer: document.getElementById('challenge-timer'),
  challengeHold: document.getElementById('challenge-hold'),
  holdFill: document.getElementById('hold-fill'),
  holdLabel: document.getElementById('hold-label'),
  starsTotal: document.getElementById('stars-total'),
};

el.storyTitle.textContent = STORY_TITLE;
el.storyIntro.textContent = STORY_INTRO;

let link = null;
let muted = false;
const attemptStart = {}; // stageId -> ms timestamp when the stage panel was opened
const holdSince = {}; // stageId -> ms timestamp when a hold-mechanic condition started being true

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
function playStageBanner(stage, stars) {
  el.cinematicLayer.querySelectorAll('.cine-banner').forEach((n) => n.remove());
  const node = document.createElement('div');
  node.className = 'cine-banner';
  const starRow = '★'.repeat(stars) + '☆'.repeat(3 - stars);
  node.innerHTML = `
    <div class="cine-icon">${stage.icon}</div>
    <div class="cine-text">
      <div class="cine-kicker">Bosqich ${String(stage.id).padStart(2, '0')} tugallandi <span class="cine-stars">${starRow}</span></div>
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
    const starRow = completed ? '★'.repeat(story.starsFor(stage.id)) + '☆'.repeat(3 - story.starsFor(stage.id)) : '';
    item.innerHTML = `
      <span class="stage-icon">${unlocked ? stage.icon : '🔒'}</span>
      <span class="stage-num">${String(stage.id).padStart(2, '0')}</span>
      <span class="stage-name">${stage.title}</span>
      <span class="stage-mark">${completed ? `<span class="stage-stars">${starRow}</span>` : ''}</span>
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

  // Diagram + live dashboard + challenge timer only need a hard reset when
  // the selected stage actually changes — not on every renderAll() call
  // triggered by an incoming event.
  if (stage.id !== lastRenderedStageId) {
    const circuit = CIRCUITS[stage.id];
    if (circuit) renderCircuit(el.wiringDiagram, circuit);
    dashboard.reset(stage);
    attemptStart[stage.id] = Date.now();
    holdSince[stage.id] = null;
    lastRenderedStageId = stage.id;
    // Delayed so a just-played celebration line (stage auto-advanced after
    // completion) stays readable instead of being overwritten instantly.
    const tipStageId = stage.id;
    setTimeout(() => {
      if (story.current === tipStageId && !story.isCompleted(tipStageId) && stage.tip) mentor.tip(stage.tip);
    }, 2200);
  }
}

function renderProgress() {
  const ratio = story.progressRatio();
  city.setProgress(ratio);
  el.progressBar.style.width = `${Math.round(ratio * 100)}%`;
  el.progressLabel.textContent = `${story.completed.size}/${STAGES.length} bosqich tugallandi`;
  el.starsTotal.textContent = `★ ${story.totalStars()}/${STAGES.length * 3}`;
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

// Awards 1-3 stars based on how quickly the goal was reached relative to the
// stage's soft time target. Never blocks completion — a slow attempt still
// finishes the stage, just with fewer stars. Story dictates first-time-only
// celebration effects (banner/camera/audio) so revisiting a finished stage
// via the stage list never re-triggers them.
function starsFor(stage, elapsedSec) {
  const limit = stage.challenge?.timeLimit;
  if (!limit) return 3;
  if (elapsedSec <= limit * 0.6) return 3;
  if (elapsedSec <= limit) return 2;
  return 1;
}

function completeStage(stage, elapsedSec) {
  const stars = starsFor(stage, elapsedSec);
  const firstTime = story.markComplete(stage.id, stars);
  if (firstTime) {
    audio.success();
    city.focusOn(stage.focus.x, stage.focus.y, stage.focus.zoom);
    playStageBanner(stage, stars);
    mentor.celebrate(stars);
    if (stage.id === STAGES.length) {
      setTimeout(() => toast('Barcha 20 bosqich tugallandi. Nurshahar butunlay tiklandi!', 'success'), 1200);
    }
  }
  renderAll();
}

function updateChallengeUI() {
  const stage = getStage(story.current);
  const challenge = stage?.challenge;
  if (!challenge) {
    el.challengeGoal.textContent = '';
    el.challengeTimer.textContent = '';
    el.challengeHold.hidden = true;
    return;
  }
  el.challengeGoal.textContent = `🎯 ${challenge.goal}`;

  if (story.isCompleted(stage.id)) {
    const stars = story.starsFor(stage.id);
    el.challengeTimer.innerHTML = `<span class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</span> tugallandi`;
    el.challengeTimer.classList.remove('challenge-timer-warn');
    el.challengeHold.hidden = true;
    return;
  }

  const elapsedSec = (Date.now() - (attemptStart[stage.id] || Date.now())) / 1000;
  if (challenge.timeLimit) {
    const remain = Math.max(0, challenge.timeLimit - elapsedSec);
    el.challengeTimer.textContent = `⏱ ${Math.ceil(remain)}s`;
    el.challengeTimer.classList.toggle('challenge-timer-warn', remain <= challenge.timeLimit * 0.3);
  } else {
    el.challengeTimer.textContent = `⏱ ${Math.floor(elapsedSec)}s`;
    el.challengeTimer.classList.remove('challenge-timer-warn');
  }

  if (challenge.holdSec) {
    el.challengeHold.hidden = false;
    const since = holdSince[stage.id];
    const heldMs = since ? Date.now() - since : 0;
    const ratio = Math.min(1, heldMs / (challenge.holdSec * 1000));
    el.holdFill.style.width = `${ratio * 100}%`;
    el.holdLabel.textContent = since ? `Ushlab turing... ${Math.round(ratio * 100)}%` : 'Maqsad zonasiga o\'ting';
  } else {
    el.challengeHold.hidden = true;
  }
}

// Single source of truth for "has the current stage's goal been reached
// long enough to count". Runs on an interval instead of only inside
// handleEvent so hold-mechanic stages (2, 16) complete the instant the
// required duration elapses, even if no new serial line has arrived yet.
function tickChallenge() {
  const stage = getStage(story.current);
  if (!stage || story.isCompleted(stage.id)) {
    updateChallengeUI();
    return;
  }
  const conditionMet = stage.isComplete(city.state);
  const challenge = stage.challenge;

  if (challenge?.holdSec) {
    if (conditionMet) {
      if (holdSince[stage.id] == null) holdSince[stage.id] = Date.now();
      const heldMs = Date.now() - holdSince[stage.id];
      if (heldMs >= challenge.holdSec * 1000) {
        const elapsedSec = (Date.now() - (attemptStart[stage.id] || Date.now())) / 1000;
        completeStage(stage, elapsedSec);
      }
    } else {
      holdSince[stage.id] = null;
    }
  } else if (conditionMet) {
    const elapsedSec = (Date.now() - (attemptStart[stage.id] || Date.now())) / 1000;
    completeStage(stage, elapsedSec);
  }

  updateChallengeUI();
}

function handleEvent(id, payload) {
  const stage = getStage(id);
  if (!stage) return;
  if (!story.isUnlocked(id)) {
    logLine(`(qulflangan bosqich ${id} signali e'tiborga olinmadi)`);
    mentor.scold();
    return;
  }
  stage.parse(payload, city);
  audio.blip();
  playSpecialSfx(stage, payload);
  dashboard.push(stage, payload);
  if (stage.id === story.current) tickChallenge();
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
  Object.keys(attemptStart).forEach((k) => delete attemptStart[k]);
  Object.keys(holdSince).forEach((k) => delete holdSince[k]);
  lastRenderedStageId = null;
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
  mentor.greet("Salom, muhandis! Men senga yordam beraman. Birinchi sxemadan boshlaylik.");
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

setInterval(tickChallenge, 200);
renderAll();
