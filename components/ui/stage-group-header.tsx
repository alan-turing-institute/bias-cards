'use client';

import { Badge } from '@/components/ui/badge';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import type { LifecycleStage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { getAssetPath } from '@/lib/utils/asset-path';

// Map stage to image file
const getStageImage = (stage: LifecycleStage): string => {
  const stageImages: Record<LifecycleStage, string> = {
    'project-planning': getAssetPath('/01-project-planning.jpg'),
    'problem-formulation': getAssetPath('/02-problem-formulation.jpg'),
    'data-extraction-procurement': getAssetPath('/03-data-extraction.jpg'),
    'data-analysis': getAssetPath('/04-data-analysis.jpg'),
    'preprocessing-feature-engineering': getAssetPath('/05-preprocessing.jpg'),
    'model-selection-training': getAssetPath(
      '/06-model-selection-and-training.jpg'
    ),
    'model-testing-validation': getAssetPath('/07-model-testing.jpg'),
    'model-reporting': getAssetPath('/08-model-reporting.jpg'),
    'system-implementation': getAssetPath('/09-system-implementation.jpg'),
    'system-use-monitoring': getAssetPath('/11-system-use-and-monitoring.jpg'),
    'model-updating-deprovisioning': getAssetPath(
      '/12-model-updating-and-deprovisioning.jpg'
    ),
    'user-training': getAssetPath('/10-user-training.jpg'),
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
