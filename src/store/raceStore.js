import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_PRE_RACE_ITEMS } from '../constants/equipment';

const DEFAULT_PRE_RACE_CHECKLIST = Object.fromEntries(
  ALL_PRE_RACE_ITEMS.map(i => [i.id, false])
);

export const useRaceStore = create((set, get) => ({
  races: [],
  debriefs: [],

  // --- Races ---
  addRace: async (race, defaultChecklist) => {
    const checklist = Object.fromEntries(
      Object.entries(defaultChecklist || {}).map(([k]) => [k, false])
    );
    const newRace = {
      ...race,
      id: Date.now().toString(),
      checklist,
      preRaceChecklist: { ...DEFAULT_PRE_RACE_CHECKLIST },
      reminders: [],
    };
    const races = [...get().races, newRace];
    set({ races });
    await AsyncStorage.setItem('races', JSON.stringify(races));
    return newRace;
  },

  updateRace: async (id, data) => {
    const races = get().races.map(r => r.id === id ? { ...r, ...data } : r);
    set({ races });
    await AsyncStorage.setItem('races', JSON.stringify(races));
  },

  deleteRace: async (id) => {
    const races = get().races.filter(r => r.id !== id);
    set({ races });
    await AsyncStorage.setItem('races', JSON.stringify(races));
  },

  getRace: (id) => get().races.find(r => r.id === id),

  // --- Checklist matériel ---
  toggleChecklistItem: async (raceId, itemId) => {
    const races = get().races.map(r => {
      if (r.id !== raceId) return r;
      return { ...r, checklist: { ...r.checklist, [itemId]: !r.checklist[itemId] } };
    });
    set({ races });
    await AsyncStorage.setItem('races', JSON.stringify(races));
  },

  resetChecklist: async (raceId) => {
    const race = get().races.find(r => r.id === raceId);
    if (!race) return;
    const reset = Object.fromEntries(Object.keys(race.checklist).map(k => [k, false]));
    const races = get().races.map(r =>
      r.id === raceId ? { ...r, checklist: reset } : r
    );
    set({ races });
    await AsyncStorage.setItem('races', JSON.stringify(races));
  },

  removeChecklistItem: async (raceId, itemId) => {
    const races = get().races.map(r => {
      if (r.id !== raceId) return r;
      const checklist = { ...r.checklist };
      delete checklist[itemId];
      return { ...r, checklist };
    });
    set({ races });
    await AsyncStorage.setItem('races', JSON.stringify(races));
  },

  getChecklistProgress: (raceId) => {
    const race = get().races.find(r => r.id === raceId);
    if (!race) return { done: 0, total: 0, percent: 0 };
    const items = Object.values(race.checklist || {});
    const total = items.length;
    const done = items.filter(Boolean).length;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  },

  // --- Checklist veille de course ---
  togglePreRaceItem: async (raceId, itemId) => {
    const races = get().races.map(r => {
      if (r.id !== raceId) return r;
      const preRaceChecklist = r.preRaceChecklist || { ...DEFAULT_PRE_RACE_CHECKLIST };
      return { ...r, preRaceChecklist: { ...preRaceChecklist, [itemId]: !preRaceChecklist[itemId] } };
    });
    set({ races });
    await AsyncStorage.setItem('races', JSON.stringify(races));
  },

  resetPreRaceChecklist: async (raceId) => {
    const races = get().races.map(r => {
      if (r.id !== raceId) return r;
      const reset = Object.fromEntries(
        Object.keys(r.preRaceChecklist || DEFAULT_PRE_RACE_CHECKLIST).map(k => [k, false])
      );
      return { ...r, preRaceChecklist: reset };
    });
    set({ races });
    await AsyncStorage.setItem('races', JSON.stringify(races));
  },

  getPreRaceProgress: (raceId) => {
    const race = get().races.find(r => r.id === raceId);
    if (!race) return { done: 0, total: 0, percent: 0 };
    const checklist = race.preRaceChecklist || DEFAULT_PRE_RACE_CHECKLIST;
    const items = Object.values(checklist);
    const total = items.length;
    const done = items.filter(Boolean).length;
    return { done, total, percent: total ? Math.round((done / total) * 100) : 0 };
  },

  // --- Reminders ---
  addReminder: async (raceId, reminder) => {
    const races = get().races.map(r => {
      if (r.id !== raceId) return r;
      return { ...r, reminders: [...(r.reminders || []), reminder] };
    });
    set({ races });
    await AsyncStorage.setItem('races', JSON.stringify(races));
  },

  clearReminders: async (raceId) => {
    const races = get().races.map(r =>
      r.id === raceId ? { ...r, reminders: [] } : r
    );
    set({ races });
    await AsyncStorage.setItem('races', JSON.stringify(races));
  },

  // --- Debriefs ---
  addDebrief: async (debrief) => {
    const newDebrief = { ...debrief, id: Date.now().toString(), date: new Date().toISOString() };
    const debriefs = [...get().debriefs, newDebrief];
    set({ debriefs });
    await AsyncStorage.setItem('debriefs', JSON.stringify(debriefs));
  },

  getDebrief: (raceId) => get().debriefs.find(d => d.raceId === raceId),

  // --- Helpers ---
  getUpcomingRaces: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().races
      .filter(r => new Date(r.date) >= today)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  },

  getPastRaces: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return get().races
      .filter(r => new Date(r.date) < today)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  loadFromStorage: async () => {
    const [r, d] = await Promise.all([
      AsyncStorage.getItem('races'),
      AsyncStorage.getItem('debriefs'),
    ]);
    if (r) set({ races: JSON.parse(r) });
    if (d) set({ debriefs: JSON.parse(d) });
  },
}));
