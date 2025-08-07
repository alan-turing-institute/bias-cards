import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { WorkspaceSettings } from '@/lib/types';

interface ExtendedSettings extends WorkspaceSettings {
  autoSync?: boolean;
  syncOnSave?: boolean;
}

interface SettingsStoreState extends ExtendedSettings {
  settings?: ExtendedSettings;
  // Actions
  updateSettings: (settings: Partial<ExtendedSettings>) => void;
  toggleAutoSave: () => void;
  setAutoSaveInterval: (interval: number) => void;
  toggleTooltips: () => void;
  toggleConfirmationPrompts: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  resetSettings: () => void;
}

const defaultSettings: ExtendedSettings = {
  autoSaveEnabled: true,
  autoSaveInterval: 30, // 30 seconds
  showTooltips: true,
  confirmationPrompts: true,
  theme: 'system',
  autoSync: false,
  syncOnSave: false,
};

export const useSettingsStore = create<SettingsStoreState>()(
  devtools(
    persist(
      (set, _get) => ({
        ...defaultSettings,
        settings: defaultSettings,

        updateSettings: (settings) => {
          set((state) => ({
            ...state,
            ...settings,
            settings: { ...state.settings, ...settings },
          }));
        },

        toggleAutoSave: () => {
          set((state) => ({
            autoSaveEnabled: !state.autoSaveEnabled,
          }));
        },

        setAutoSaveInterval: (interval) => {
          // Ensure interval is between 10 seconds and 5 minutes
          const clampedInterval = Math.max(10, Math.min(300, interval));
          set({ autoSaveInterval: clampedInterval });
        },

        toggleTooltips: () => {
          set((state) => ({
            showTooltips: !state.showTooltips,
          }));
        },

        toggleConfirmationPrompts: () => {
          set((state) => ({
            confirmationPrompts: !state.confirmationPrompts,
          }));
        },

        setTheme: (theme) => {
          set({ theme });
        },

        resetSettings: () => {
          set(defaultSettings);
        },
      }),
      {
        name: 'settings-store',
      }
    ),
    { name: 'settings-store' }
  )
);
