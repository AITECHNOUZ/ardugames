// A small floating mentor character — an animated avatar with a speech
// bubble that greets the player, hands out a practical tip when a stage
// opens, and celebrates (or gently encourages) on completion. Pure DOM/CSS,
// no assets.

import { MASCOT_SVG } from './brand.js';

const CELEBRATIONS_GREAT = [
  "Zo'r ish, muhandis! ★★★",
  'Ajoyib tezlik! Nurshahar senga tayanadi.',
  "Mukammal! Xuddi shunday davom et.",
  'Bu sxema mislsiz chiqdi!',
];

const CELEBRATIONS_GOOD = [
  'Bajarildi! Keyingi safar biroz tezroq harakat qilib ko\'r.',
  "Ishladi! Sxemani qayta yig'ib, tezligingizni oshirib ko'ring.",
  "Yaxshi ish — shahar yana bir qadam yorug'likka yaqinlashdi.",
];

const LOCKED_LINES = [
  "Bu tizim hali qulflangan — avval oldingi bosqichni tugating.",
  "Sabr qiling, muhandis — navbat bilan boraylik.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export class Mentor {
  constructor(container) {
    this.container = container;
    this.minimized = false;
    container.innerHTML = `
      <button id="mentor-avatar" class="mentor-avatar" title="Robo — yordamchi">${MASCOT_SVG}</button>
      <div id="mentor-bubble" class="mentor-bubble">
        <p id="mentor-text"></p>
      </div>
    `;
    this.avatarEl = container.querySelector('#mentor-avatar');
    this.bubbleEl = container.querySelector('#mentor-bubble');
    this.textEl = container.querySelector('#mentor-text');
    this.avatarEl.addEventListener('click', () => {
      this.minimized = !this.minimized;
      this.bubbleEl.classList.toggle('mentor-hidden', this.minimized);
    });
  }

  say(text, mood = 'default') {
    this.textEl.textContent = text;
    this.bubbleEl.classList.remove('mentor-pop');
    void this.bubbleEl.offsetWidth;
    this.bubbleEl.classList.add('mentor-pop');
    this.avatarEl.classList.remove('mentor-happy', 'mentor-alert');
    if (mood === 'happy') this.avatarEl.classList.add('mentor-happy');
    if (mood === 'alert') this.avatarEl.classList.add('mentor-alert');
    if (this.minimized) {
      this.minimized = false;
      this.bubbleEl.classList.remove('mentor-hidden');
    }
  }

  greet(text) {
    this.say(text, 'default');
  }

  tip(text) {
    this.say(`💡 ${text}`, 'default');
  }

  celebrate(stars) {
    this.say(stars >= 3 ? pick(CELEBRATIONS_GREAT) : pick(CELEBRATIONS_GOOD), 'happy');
  }

  scold() {
    this.say(pick(LOCKED_LINES), 'alert');
  }
}
