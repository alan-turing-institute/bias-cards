import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  Brain,
  BrainCircuit,
  Calendar,
  ChartBar,
  CheckCircle2,
  Clock,
  Cog,
  Compass,
  Database,
  Eye,
  FileSearch,
  FileText,
  Gauge,
  GitBranch,
  Lightbulb,
  LineChart,
  type LucideIcon,
  MessageSquare,
  Network,
  Package,
  RefreshCw,
  Scale,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Workflow,
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
  'automation-distrust-bias': Shield,
  'availability-bias': Eye,
  'confirmation-bias': Target,
  'decision-automation-bias': Cog,
  'law-of-the-instrument': AlertTriangle,
  'naive-realism': Compass,
  'optimism-bias': Lightbulb,
  'self-assessment-bias': Scale,

  // Social biases
  'annotation-bias': MessageSquare,
  'chronological-bias': Calendar,
  'de-agentification-bias': Users,
  'historical-bias': Clock,
  'implementation-bias': Workflow,
  'label-bias': FileText,
  'representation-bias': Network,
  'selection-bias': GitBranch,
  'status-quo-bias': Package,

  // Statistical biases
  'aggregation-bias': BarChart3,
  confounding: GitBranch,
  'evaluation-bias': ChartBar,
  'measurement-bias': LineChart,
  'missing-data-bias': Database,
  'training-serving-skew': TrendingUp,
  'wrong-sample-size-bias': Gauge,
};

// Icon mapping for mitigation cards
export const MITIGATION_CARD_ICONS: Record<string, LucideIcon> = {
  'additional-data-collection': Database,
  'data-augmentation': Sparkles,
  'diversify-evaluation-metrics': ChartBar,
  'double-diamond-methodology': Workflow,
  'employ-model-interpretability': BrainCircuit,
  'external-validation': CheckCircle2,
  'human-in-the-loop': Users,
  'identify-underrepresented-groups': FileSearch,
  'multiple-model-comparison': RefreshCw,
  'open-documentation': BookOpen,
  'participatory-design-workshops': MessageSquare,
  'peer-review': Users,
  'quality-control-procedures': Shield,
  'regular-auditing': FileSearch,
  'skills-and-training': Lightbulb,
  'stakeholder-engagement': MessageSquare,
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
