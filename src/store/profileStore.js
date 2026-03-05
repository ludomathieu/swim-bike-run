import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_ITEMS } from '../constants/equipment';

const DEFAULT_CHECKLIST = Object.fromEntries(ALL_ITEMS.map(i => [i.id, false]));

export const useProfileStore = create((set, get) => ({
  name: 'Athlète',
  since: '2024',
  plan: 'free', // 'free' | 'premium'

  // Checklist par défaut : quels items sont activés pour chaque nouvelle course
  defaultChecklist: DEFAULT_CHECKLIST,

  // Équipement possédé
  ownedEquipment: {},

  // --- Actions ---
  updateProfile: async (data) => {
    set(data);
    await AsyncStorage.setItem('profile', JSON.stringify({ ...get(), ...data }));
  },

  toggleDefaultItem: async (id) => {
    const current = get().defaultChecklist;
    const updated = { ...current, [id]: !current[id] };
    set({ defaultChecklist: updated });
    await AsyncStorage.setItem('defaultChecklist', JSON.stringify(updated));
  },

  toggleOwnedEquipment: async (id) => {
    const current = get().ownedEquipment;
    const updated = { ...current, [id]: !current[id] };
    set({ ownedEquipment: updated });
    await AsyncStorage.setItem('ownedEquipment', JSON.stringify(updated));
  },

  loadFromStorage: async () => {
    const saved = await AsyncStorage.getItem('profile');
    if (saved) {
      const profile = JSON.parse(saved);
  
      // Migration : ajouter les nouveaux items manquants à false
      const currentIds = ALL_ITEMS.map(i => i.id);
      const savedIds = Object.keys(profile.defaultChecklist || {});
      const missingIds = currentIds.filter(id => !savedIds.includes(id));
  
      if (missingIds.length > 0) {
        missingIds.forEach(id => {
          profile.defaultChecklist[id] = false;
          profile.ownedEquipment[id] = false;
        });
        await AsyncStorage.setItem('profile', JSON.stringify(profile));
      }
  
      set(profile);
    }
  },

  getInitials: () => {
    const name = get().name;
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  },
}));
