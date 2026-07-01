import { STAGES } from './stages.js';

const STORAGE_KEY = 'nurshahar_progress_v1';

export class Story {
  constructor() {
    this.completed = new Set(this._load());
    this.current = this._firstIncomplete();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.completed]));
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

  progressRatio() {
    return this.completed.size / STAGES.length;
  }

  markComplete(id) {
    if (this.completed.has(id)) return false;
    this.completed.add(id);
    this._save();
    if (id === this.current) {
      const next = STAGES.find((st) => st.id === id + 1);
      if (next) this.current = next.id;
    }
    return true;
  }

  setCurrent(id) {
    this.current = id;
  }

  reset() {
    this.completed.clear();
    this._save();
    this.current = 1;
  }
}
