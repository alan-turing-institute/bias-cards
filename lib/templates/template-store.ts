import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReportTemplate } from '@/lib/types/reports';
import { DEFAULT_REPORT_TEMPLATES } from './report-templates';

interface TemplateStore {
  // State
  templates: ReportTemplate[];
  customTemplates: ReportTemplate[];
  selectedTemplateId: string | null;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions - Template Management
  addCustomTemplate: (template: Omit<ReportTemplate, 'id'>) => string;
  updateTemplate: (id: string, updates: Partial<ReportTemplate>) => void;
  deleteCustomTemplate: (id: string) => void;
  duplicateTemplate: (id: string, newName: string) => string;

  // Actions - Template Selection
  selectTemplate: (id: string | null) => void;
  getSelectedTemplate: () => ReportTemplate | null;

  // Actions - Template Discovery
  getAllTemplates: () => ReportTemplate[];
  getTemplatesByDomain: (domain: string) => ReportTemplate[];
  searchTemplates: (query: string) => ReportTemplate[];

  // Actions - Template Usage
  incrementUsageCount: (id: string) => void;
  getMostUsedTemplates: (limit?: number) => ReportTemplate[];

  // Actions - Template Import/Export
  exportTemplate: (id: string) => string;
  importTemplate: (templateJson: string) => string;

  // Utility actions
  clearError: () => void;
  resetToDefaults: () => void;
}

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      // Initial state
      templates: DEFAULT_REPORT_TEMPLATES,
      customTemplates: [],
      selectedTemplateId: null,
      isLoading: false,
      error: null,

      // Template Management
      addCustomTemplate: (template) => {
        const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        const newTemplate: ReportTemplate = {
          ...template,
          id,
          metadata: {
            ...template.metadata,
            createdAt: now,
            lastModified: now,
            usageCount: 0,
          },
        };

        set((state) => ({
          customTemplates: [...state.customTemplates, newTemplate],
        }));

        return id;
      },

      updateTemplate: (id, updates) => {
        const now = new Date().toISOString();

        set((state) => {
          // Check if it's a custom template
          const customIndex = state.customTemplates.findIndex(
            (t) => t.id === id
          );
          if (customIndex !== -1) {
            const updatedTemplates = [...state.customTemplates];
            updatedTemplates[customIndex] = {
              ...updatedTemplates[customIndex],
              ...updates,
              metadata: {
                ...updatedTemplates[customIndex].metadata,
                ...updates.metadata,
                lastModified: now,
              },
            };
            return { customTemplates: updatedTemplates };
          }

          // Check if it's a default template (shouldn't be editable, but handle gracefully)
          const defaultIndex = state.templates.findIndex((t) => t.id === id);
          if (defaultIndex !== -1) {
            return {
              error: 'Cannot modify default templates. Please duplicate first.',
            };
          }

          return { error: 'Template not found' };
        });
      },

      deleteCustomTemplate: (id) => {
        set((state) => ({
          customTemplates: state.customTemplates.filter((t) => t.id !== id),
          selectedTemplateId:
            state.selectedTemplateId === id ? null : state.selectedTemplateId,
        }));
      },

      duplicateTemplate: (id, newName) => {
        const template = get()
          .getAllTemplates()
          .find((t) => t.id === id);
        if (!template) {
          set({ error: 'Template not found' });
          return '';
        }

        const duplicatedTemplate = {
          ...template,
          name: newName,
          metadata: {
            ...template.metadata,
            createdBy: 'user',
          },
        };

        return get().addCustomTemplate(duplicatedTemplate);
      },

      // Template Selection
      selectTemplate: (id) => {
        set({ selectedTemplateId: id });
      },

      getSelectedTemplate: () => {
        const id = get().selectedTemplateId;
        if (!id) {
          return null;
        }
        return (
          get()
            .getAllTemplates()
            .find((t) => t.id === id) || null
        );
      },

      // Template Discovery
      getAllTemplates: () => {
        const state = get();
        return [...state.templates, ...state.customTemplates];
      },

      getTemplatesByDomain: (domain) => {
        return get()
          .getAllTemplates()
          .filter(
            (t) => t.domain.toLowerCase() === domain.toLowerCase() && t.isActive
          );
      },

      searchTemplates: (query) => {
        const lowercaseQuery = query.toLowerCase();
        return get()
          .getAllTemplates()
          .filter(
            (t) =>
              t.name.toLowerCase().includes(lowercaseQuery) ||
              t.description.toLowerCase().includes(lowercaseQuery) ||
              t.domain.toLowerCase().includes(lowercaseQuery) ||
              t.metadata.tags.some((tag) =>
                tag.toLowerCase().includes(lowercaseQuery)
              )
          );
      },

      // Template Usage
      incrementUsageCount: (id) => {
        set((state) => {
          // Check custom templates
          const customIndex = state.customTemplates.findIndex(
            (t) => t.id === id
          );
          if (customIndex !== -1) {
            const updatedTemplates = [...state.customTemplates];
            updatedTemplates[customIndex] = {
              ...updatedTemplates[customIndex],
              metadata: {
                ...updatedTemplates[customIndex].metadata,
                usageCount:
                  updatedTemplates[customIndex].metadata.usageCount + 1,
                lastModified: new Date().toISOString(),
              },
            };
            return { customTemplates: updatedTemplates };
          }

          // Check default templates
          const defaultIndex = state.templates.findIndex((t) => t.id === id);
          if (defaultIndex !== -1) {
            const updatedTemplates = [...state.templates];
            updatedTemplates[defaultIndex] = {
              ...updatedTemplates[defaultIndex],
              metadata: {
                ...updatedTemplates[defaultIndex].metadata,
                usageCount:
                  updatedTemplates[defaultIndex].metadata.usageCount + 1,
                lastModified: new Date().toISOString(),
              },
            };
            return { templates: updatedTemplates };
          }

          return state;
        });
      },

      getMostUsedTemplates: (limit = 5) => {
        return get()
          .getAllTemplates()
          .sort((a, b) => b.metadata.usageCount - a.metadata.usageCount)
          .slice(0, limit);
      },

      // Template Import/Export
      exportTemplate: (id) => {
        const template = get()
          .getAllTemplates()
          .find((t) => t.id === id);
        if (!template) {
          throw new Error('Template not found');
        }

        // Remove usage count and dates for export
        const exportableTemplate = {
          ...template,
          id: undefined, // Remove ID so it gets regenerated on import
          metadata: {
            ...template.metadata,
            createdAt: undefined,
            lastModified: undefined,
            usageCount: 0,
          },
        };

        return JSON.stringify(exportableTemplate, null, 2);
      },

      importTemplate: (templateJson) => {
        try {
          const template = JSON.parse(templateJson);

          // Basic validation
          if (!(template.name && template.structure)) {
            throw new Error('Invalid template format');
          }

          // Add as custom template
          return get().addCustomTemplate(template);
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to import template',
          });
          return '';
        }
      },

      // Utility
      clearError: () => set({ error: null }),

      resetToDefaults: () => {
        set({
          templates: DEFAULT_REPORT_TEMPLATES,
          customTemplates: [],
          selectedTemplateId: null,
          error: null,
        });
      },
    }),
    {
      name: 'bias-cards-templates',
      partialize: (state) => ({
        customTemplates: state.customTemplates,
        templates: state.templates,
        // Don't persist selection or loading states
      }),
    }
  )
);
