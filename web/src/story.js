import { STAGES } from './stages.js';

const STORAGE_KEY = 'nurshahar_progress_v2';

export class Story {
  constructor() {
    const saved = this._load();
    this.completed = new Set(saved.completed);
    this.stars = saved.stars;
    this.current = this._firstIncomplete();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { completed: [], stars: {} };
      const parsed = JSON.parse(raw);
      return { completed: parsed.completed || [], stars: parsed.stars || {} };
    } catch (_) {
      return { completed: [], stars: {} };
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ completed: [...this.completed], stars: this.stars }));
    } catch (_) {}
  }

  _firstIncomplete() {
    const s = STAGES.find((st) => !this.completed.has(st.id));
    return s ? s.id : STAGES[STAGES.length - 1].id;
  }

  isUnlocked(id) {
    if (id === 1) return true;
    return this.completed.has(id - 1);
  }

  isCompleted(id) {
    return this.completed.has(id);
  }

  starsFor(id) {
    return this.stars[id] || 0;
  }

  totalStars() {
    return Object.values(this.stars).reduce((sum, v) => sum + v, 0);
  }

  progressRatio() {
    return this.completed.size / STAGES.length;
  }

  // Completes a stage and records how many stars (1-3) it earned. Returns
  // true the first time a stage is completed (used to gate one-shot
  // celebration effects); re-completing an already-done stage just updates
  // the star record if the new attempt was better.
  markComplete(id, stars = 3) {
    const firstTime = !this.completed.has(id);
    this.completed.add(id);
    this.stars[id] = Math.max(this.stars[id] || 0, stars);
    this._save();
    if (firstTime && id === this.current) {
      const next = STAGES.find((st) => st.id === id + 1);
      if (next) this.current = next.id;
    }
    return firstTime;
  }

  setCurrent(id) {
    this.current = id;
  }

  reset() {
    this.completed.clear();
    this.stars = {};
    this._save();
    this.current = 1;
  }
}
