import { loadWorkspace, saveWorkspace } from './storage.js';
import { uid } from './utils.js';

class Store {
  constructor() {
    this.workspace = 'demo';
    this.data = null;
    this.currentUserId = null;
    this.listeners = new Set();
  }

  init(workspace, userId) {
    this.workspace = workspace;
    this.data = loadWorkspace(workspace);
    this.currentUserId = userId;
  }

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  emit() { this.listeners.forEach(fn => fn()); }

  persist() {
    saveWorkspace(this.workspace, this.data);
    this.emit();
  }

  get currentUser() {
    return this.data.users.find(u => u.id === this.currentUserId) || this.data.users[0];
  }

  get activeCycle() {
    return this.data.cycles.find(c => c.id === this.data.activeCycleId) || this.data.cycles[0] || null;
  }

  setActiveCycle(cycleId) {
    this.data.activeCycleId = cycleId;
    this.persist();
  }

  // ---------- generic CRUD ----------
  add(collection, record, prefix) {
    const rec = { id: uid(prefix || collection.slice(0, 3)), createdAt: new Date().toISOString(), ...record };
    this.data[collection].push(rec);
    this.persist();
    return rec;
  }
  update(collection, id, patch) {
    const idx = this.data[collection].findIndex(r => r.id === id);
    if (idx === -1) return null;
    this.data[collection][idx] = { ...this.data[collection][idx], ...patch, updatedAt: new Date().toISOString() };
    this.persist();
    return this.data[collection][idx];
  }
  remove(collection, id) {
    this.data[collection] = this.data[collection].filter(r => r.id !== id);
    this.persist();
  }
  find(collection, id) {
    return this.data[collection].find(r => r.id === id) || null;
  }

  // ---------- domain-specific ----------
  objectivesForCycle(cycleId = this.data.activeCycleId) {
    return this.data.objectives.filter(o => o.cycleId === cycleId);
  }
  krsFor(objectiveId) {
    return this.data.keyResults.filter(k => k.objectiveId === objectiveId);
  }
  checkInsFor(keyResultId) {
    return this.data.checkIns
      .filter(c => c.keyResultId === keyResultId)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }
  teamById(id) { return this.data.teams.find(t => t.id === id); }
  userById(id) { return this.data.users.find(u => u.id === id); }
  childObjectives(objectiveId) {
    return this.data.objectives.filter(o => o.alignedTo === objectiveId);
  }
}

export const store = new Store();
