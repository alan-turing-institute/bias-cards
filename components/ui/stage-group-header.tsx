'use client';

import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import type { LifecycleStage } from '@/lib/types';
import { cn } from '@/lib/utils';

// Map stage to image file
const getStageImage = (stage: LifecycleStage): string => {
  const stageImages: Record<LifecycleStage, string> = {
    'project-planning': '/01_project planning.jpg',
    'problem-formulation': '/02_problem formulation.jpg',
    'data-extraction-procurement': '/03_Data extraction.jpg',
    'data-analysis': '/04_data analysis.jpg',
    'preprocessing-feature-engineering': '/05_preprocessing.jpg',
    'model-selection-training': '/06_Model selection and training.jpg',
    'model-testing-validation': '/07_model testing.jpg',
    'model-reporting': '/08_model reporting.jpg',
    'system-implementation': '/09_system implementation.jpg',
    'system-use-monitoring': '/11_System use & Monitoring.jpg',
    'model-updating-deprovisioning': '/12_Model Updating & Deprovisioning.jpg',
    'user-training': '/10_User training.jpg',
  };
  return stageImages[stage] || '';
};

// Risk category colors
const RISK_COLORS = {
  'high-risk': 'bg-red-100 border-red-300 text-red-800',
  'medium-risk': 'bg-amber-100 border-amber-300 text-amber-800',
  'low-risk': 'bg-green-100 border-green-300 text-green-800',
  'needs-discussion': 'bg-blue-100 border-blue-300 text-blue-800',
};

interface StageGroupHeaderProps {
  type: 'lifecycle' | 'risk';
  stage?: LifecycleStage;
  riskCategory?: string;
  itemCount: number;
  itemLabel?: string;
}

export function StageGroupHeader({
  type,
  stage,
  riskCategory,
  itemCount,
  itemLabel = 'cards',
}: StageGroupHeaderProps) {
  if (type === 'lifecycle' && stage) {
    return (
      <CardHeader>
        <CardTitle className="flex items-center gap-5">
          {/* biome-ignore lint/performance/noImgElement: Static export doesn't support next/image */}
          <img
            alt={`${LIFECYCLE_STAGES[stage].name} illustration`}
            className="h-20 w-20 rounded-lg object-cover shadow-sm"
            src={getStageImage(stage)}
          />
          <div className="flex flex-col gap-1">
            <span className="font-semibold text-xl">
              {LIFECYCLE_STAGES[stage].name}
            </span>
            <Badge className="w-fit text-xs" variant="secondary">
              {itemCount} {itemLabel}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
    );
  }

  if (type === 'risk' && riskCategory) {
    return (
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div
            className={cn(
              'h-4 w-4 rounded-full',
              riskCategory !== 'uncategorized' &&
                RISK_COLORS[riskCategory as keyof typeof RISK_COLORS]?.split(
                  ' '
                )[0]
            )}
          />
          {riskCategory.replace('-', ' ').charAt(0).toUpperCase() +
            riskCategory.replace('-', ' ').slice(1)}
          <Badge className="text-xs" variant="secondary">
            {itemCount} {itemLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
    );
  }

  // Fallback for unassigned stages
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-3">
        <span>Unassigned</span>
        <Badge className="text-xs" variant="secondary">
          {itemCount} {itemLabel}
        </Badge>
      </CardTitle>
    </CardHeader>
  );
}
