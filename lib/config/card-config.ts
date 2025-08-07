import {
  ArchiveX,
  BetweenHorizonalStart,
  BookOpenText,
  Boxes,
  Brain,
  BrainCircuit,
  Calendar1,
  ChartLine,
  CircleCheck,
  CircleQuestionMark,
  ClipboardList,
  DatabaseBackup,
  Dumbbell,
  Eye,
  FileClock,
  Frown,
  Gem,
  Grid2x2Plus,
  Grid2x2X,
  Hammer,
  Handshake,
  Landmark,
  type LucideIcon,
  MapPinned,
  MountainSnow,
  Network,
  Palette,
  PencilLine,
  PencilRuler,
  Repeat,
  RulerDimensionLine,
  Shield,
  ShieldCheck,
  Shrink,
  Sigma,
  SmilePlus,
  SquareDashedMousePointer,
  SwitchCamera,
  Tags,
  Unplug,
  UserCheck,
  UserCog,
  UserRoundX,
} from 'lucide-react';
import type { BiasCard, MitigationCard } from '@/lib/types/cards';

export interface CategoryConfig {
  bg: string;
  text: string;
  lightBg: string;
  border: string;
}

export interface CardConfig {
  icon: LucideIcon;
  categoryColors?: CategoryConfig;
}

// Category colors configuration
export const CATEGORY_COLORS: Record<string, CategoryConfig> = {
  'cognitive-bias': {
    bg: 'bg-[#FFC84B]',
    text: 'text-[#FFC84B]',
    lightBg: 'bg-[#FFC84B]/10',
    border: 'border-[#FFC84B]',
  },
  'social-bias': {
    bg: 'bg-[#2BA760]',
    text: 'text-[#2BA760]',
    lightBg: 'bg-[#2BA760]/10',
    border: 'border-[#2BA760]',
  },
  'statistical-bias': {
    bg: 'bg-[#E96B5A]',
    text: 'text-[#E96B5A]',
    lightBg: 'bg-[#E96B5A]/10',
    border: 'border-[#E96B5A]',
  },
  'mitigation-technique': {
    bg: 'bg-[#8294A6]',
    text: 'text-[#8294A6]',
    lightBg: 'bg-[#8294A6]/10',
    border: 'border-[#8294A6]',
  },
};

// Icon mapping for bias cards
export const BIAS_CARD_ICONS: Record<string, LucideIcon> = {
  // Cognitive biases
  'automation-distrust-bias': Frown,
  'availability-bias': Boxes,
  'confirmation-bias': CircleCheck,
  'decision-automation-bias': UserCog,
  'law-of-the-instrument': Hammer,
  'naive-realism': MountainSnow,
  'optimism-bias': SmilePlus,
  'self-assessment-bias': SwitchCamera,

  // Social biases
  'annotation-bias': PencilLine,
  'chronological-bias': Calendar1,
  'de-agentification-bias': UserRoundX,
  'historical-bias': Landmark,
  'implementation-bias': Unplug,
  'label-bias': Tags,
  'representation-bias': Palette,
  'selection-bias': SquareDashedMousePointer,
  'status-quo-bias': MapPinned,

  // Statistical biases
  'aggregation-bias': Sigma,
  confounding: Network,
  'evaluation-bias': ClipboardList,
  'measurement-bias': PencilRuler,
  'missing-data-bias': Grid2x2X,
  'training-serving-skew': ChartLine,
  'wrong-sample-size-bias': ArchiveX,
};

// Icon mapping for mitigation cards
export const MITIGATION_CARD_ICONS: Record<string, LucideIcon> = {
  'additional-data-collection': DatabaseBackup,
  'data-augmentation': BetweenHorizonalStart,
  'diversify-evaluation-metrics': RulerDimensionLine,
  'double-diamond-methodology': Gem,
  'employ-model-interpretability': BrainCircuit,
  'external-validation': UserCheck,
  'human-in-the-loop': Repeat,
  'identify-underrepresented-groups': Grid2x2Plus,
  'multiple-model-comparison': CircleQuestionMark,
  'open-documentation': BookOpenText,
  'participatory-design-workshops': Shrink,
  'peer-review': Eye,
  'quality-control-procedures': ShieldCheck,
  'regular-auditing': FileClock,
  'skills-and-training': Dumbbell,
  'stakeholder-engagement': Handshake,
};

// Helper function to get icon for a card
export function getCardIcon(card: BiasCard | MitigationCard): LucideIcon {
  const title = card.title || card.name.toLowerCase().replace(/\s+/g, '-');

  if (card.category === 'mitigation-technique') {
    return MITIGATION_CARD_ICONS[title] || Shield;
  }

  return BIAS_CARD_ICONS[title] || Brain;
}

// Helper function to get category colors
export function getCategoryColors(category: string): CategoryConfig {
  return (
    CATEGORY_COLORS[category] || {
      bg: 'bg-gray-500',
      text: 'text-gray-600',
      lightBg: 'bg-gray-50',
      border: 'border-gray-500',
    }
  );
}

// Helper function to get card number (for display)
export function getCardNumber(
  cardId: string,
  cards: Array<BiasCard | MitigationCard>
): string {
  const index = cards.findIndex((c) => c.id === cardId);
  return String(index + 1).padStart(2, '0');
}
