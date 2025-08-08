import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target?: string; // CSS selector for highlighting
  placement?: 'top' | 'bottom' | 'left' | 'right';
  action?: 'click' | 'hover' | 'none';
  route?: string; // Required route for this step
}

export interface OnboardingState {
  isOnboardingActive: boolean;
  currentStep: number;
  completedSteps: string[];
  hasCompletedOnboarding: boolean;
  showWelcomeDialog: boolean;
  hasSeenWelcome: boolean;

  // Actions
  startOnboarding: () => void;
  completeOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  skipOnboarding: () => void;
  markStepCompleted: (stepId: string) => void;
  setShowWelcomeDialog: (show: boolean) => void;
  resetOnboarding: () => void;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'bias-cards',
    title: 'Bias Cards',
    description:
      'Explore our comprehensive library of bias cards organised into three categories: cognitive, social, and statistical.\n\n These resources help you learn about potential biases before starting an activity.',
    target: '[data-onboarding="bias-cards-nav"]',
    placement: 'right',
    route: '/cards',
  },
  {
    id: 'mitigation-strategies',
    title: 'Mitigation Strategies',
    description:
      "Our mitigation strategy cards are designed to help you address and mitigate the risks associated with the biases identified in your project.\n\n You'll use these during activities to create effective countermeasures.",
    target: '[data-onboarding="mitigation-nav"]',
    placement: 'right',
    route: '/mitigation',
  },
  {
    id: 'project-lifecycle',
    title: 'Project Lifecycle',
    description:
      'The project lifecycle model is a scaffolding framework that allows you to group and organise biases according to the potential impact they have on different project stages.\n\n You can click through the interactive diagram on this page to learn more about each stage.',
    target: '[data-onboarding="lifecycle-nav"]',
    placement: 'right',
    route: '/lifecycle',
  },
  {
    id: 'tutorial',
    title: 'Tutorial',
    description:
      'If you ever need a refresher on how this app and activity work, here you will find a tutorial that provides detailed guidance on using the application.',
    target: '[data-onboarding="tutorial-nav"]',
    placement: 'right',
    route: '/tutorial',
  },
  {
    id: 'dashboards-activities',
    title: 'Activities Dashboard',
    description:
      'Here, you can start a new activity, continue an existing one, or load an in-progress activity from a colleague.\n\n Each activity consists of 5 stages to complete.',
    target: '[data-onboarding="dashboards-nav"]',
    placement: 'right',
    route: '/activities',
  },
  {
    id: 'dashboards-reports',
    title: 'Reports Dashboard',
    description:
      'Once an activity is completed, you can export it to a stand-alone report in a variety of file formats (e.g. PDF, Markdown, etc.).\n\n You can also view existing reports from here.',
    target: '[data-onboarding="reports-nav"]',
    placement: 'right',
    route: '/reports',
  },
  {
    id: 'workspace',
    title: 'Workspace',
    description: 'Jump straight back into your most recent or active activity.',
    target: '[data-onboarding="workspace-nav"]',
    placement: 'right',
    route: '/workspace',
  },
  {
    id: 'profile',
    title: 'Profile & Authentication',
    description:
      'This web app uses local storage to save your progress, but you can also sign in with Google to enable persistent data storage via Google Drive.\n\n You can also toggle between light and dark modes from your profile menu.',
    target: '[data-onboarding="profile-nav"]',
    placement: 'top',
    route: '/',
  },
  {
    id: 'about',
    title: 'About',
    description:
      'Here, you can learn more about the Bias Cards project specifically, and the Turing Commons project more generally.\n\n You will also be able to access our privacy policy, development information, and additional information.',
    target: '[data-onboarding="about-nav"]',
    placement: 'right',
    route: '/about',
  },
  {
    id: 'sidebar-collapse',
    title: 'Sidebar Collapse',
    description:
      'This button will allow you to hide or show the sidebar to get extra screen space when working.',
    target: '[data-onboarding="sidebar-trigger"]',
    placement: 'right',
    route: '/',
  },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      isOnboardingActive: false,
      currentStep: 0,
      completedSteps: [],
      hasCompletedOnboarding: false,
      showWelcomeDialog: false,
      hasSeenWelcome: false,

      startOnboarding: () => {
        set({
          isOnboardingActive: true,
          currentStep: 0,
          showWelcomeDialog: false,
          hasSeenWelcome: true,
        });
      },

      completeOnboarding: () => {
        set({
          isOnboardingActive: false,
          hasCompletedOnboarding: true,
          currentStep: 0,
        });
      },

      nextStep: () => {
        const { currentStep } = get();
        const nextStepIndex = currentStep + 1;

        if (nextStepIndex >= ONBOARDING_STEPS.length) {
          get().completeOnboarding();
        } else {
          set({ currentStep: nextStepIndex });
        }
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep > 0) {
          set({ currentStep: currentStep - 1 });
        }
      },

      skipOnboarding: () => {
        set({
          isOnboardingActive: false,
          hasCompletedOnboarding: true,
          currentStep: 0,
          hasSeenWelcome: true,
        });
      },

      markStepCompleted: (stepId: string) => {
        const { completedSteps } = get();
        if (!completedSteps.includes(stepId)) {
          set({
            completedSteps: [...completedSteps, stepId],
          });
        }
      },

      setShowWelcomeDialog: (show: boolean) => {
        set({ showWelcomeDialog: show });
      },

      resetOnboarding: () => {
        set({
          isOnboardingActive: false,
          currentStep: 0,
          completedSteps: [],
          hasCompletedOnboarding: false,
          showWelcomeDialog: false,
          hasSeenWelcome: false,
        });
      },
    }),
    {
      name: 'onboarding-store',
      version: 1,
    }
  )
);

export { ONBOARDING_STEPS };
export function getCurrentStep(store: OnboardingState): OnboardingStep | null {
  if (!store.isOnboardingActive) {
    return null;
  }
  return ONBOARDING_STEPS[store.currentStep] || null;
}

export function isStepCompleted(
  store: OnboardingState,
  stepId: string
): boolean {
  return store.completedSteps.includes(stepId);
}
