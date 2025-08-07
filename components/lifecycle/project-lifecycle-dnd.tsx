'use client';

import { useDroppable } from '@dnd-kit/core';
import { useEffect, useRef, useState } from 'react';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import type { LifecycleStage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StageDropZoneProps {
  stage: LifecycleStage;
  position: { x: number; y: number };
  isSelected: boolean;
  count: number;
  onStageClick: (stage: LifecycleStage) => void;
}

function StageDropZone({
  stage,
  position,
  isSelected,
  count,
  onStageClick,
}: StageDropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `stage-${stage}`,
    data: {
      stage,
      type: 'stage',
    },
  });

  return (
    <div
      className={cn(
        '-translate-x-1/2 -translate-y-1/2 absolute h-20 w-32 cursor-pointer rounded-lg border-2 border-transparent transition-all',
        'hover:border-primary/20 hover:bg-primary/10',
        isOver && 'scale-105 border-primary bg-primary/20',
        isSelected && 'ring-2 ring-primary ring-offset-2'
      )}
      onClick={() => onStageClick(stage)}
      ref={setNodeRef}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
      }}
    >
      {count > 0 && (
        <div className="-top-2 -right-2 absolute flex h-6 w-6 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground text-xs">
          {count}
        </div>
      )}
    </div>
  );
}

interface ProjectLifecycleDndProps {
  onStageClick?: (stage: LifecycleStage) => void;
  selectedStage?: LifecycleStage;
  stageCounts?: Record<LifecycleStage, number>;
  className?: string;
}

export function ProjectLifecycleDnd({
  onStageClick,
  selectedStage,
  stageCounts = {} as Record<LifecycleStage, number>,
  className,
}: ProjectLifecycleDndProps) {
  const svgRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredStage, _setHoveredStage] = useState<LifecycleStage | null>(
    null
  );

  // Define stage positions based on circular layout
  const stagePositions: Record<LifecycleStage, { x: number; y: number }> = {
    // Project Design (top-right quadrant)
    'project-planning': { x: 70, y: 20 },
    'problem-formulation': { x: 85, y: 35 },
    'data-extraction-procurement': { x: 85, y: 55 },
    'data-analysis': { x: 70, y: 70 },

    // Model Development (bottom quadrant)
    'preprocessing-feature-engineering': { x: 50, y: 80 },
    'model-selection-training': { x: 30, y: 80 },
    'model-testing-validation': { x: 15, y: 70 },
    'model-reporting': { x: 15, y: 55 },

    // System Deployment (top-left quadrant)
    'system-implementation': { x: 15, y: 35 },
    'system-use-monitoring': { x: 15, y: 20 },
    'model-updating-deprovisioning': { x: 30, y: 10 },
    'user-training': { x: 50, y: 10 },
  };

  useEffect(() => {
    // Load and prepare the SVG
    fetch('/project-lifecycle.svg')
      .then((res) => res.text())
      .then((svgText) => {
        if (svgRef.current) {
          svgRef.current.innerHTML = svgText;

          const svg = svgRef.current.querySelector('svg');
          if (svg) {
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.style.maxWidth = '100%';
            svg.style.height = 'auto';
          }

          setIsLoaded(true);
        }
      })
      .catch((_error) => {});
  }, []);

  return (
    <div
      className={cn('relative h-full w-full', className)}
      data-testid="lifecycle-diagram"
    >
      {/* SVG Container */}
      <div
        className="flex h-full w-full items-center justify-center"
        ref={svgRef}
      />

      {/* Drop Zones Overlay */}
      {isLoaded && (
        <div className="pointer-events-none absolute inset-0">
          <div className="pointer-events-auto relative h-full w-full">
            {(Object.keys(LIFECYCLE_STAGES) as LifecycleStage[]).map(
              (stage) => (
                <StageDropZone
                  count={stageCounts[stage] || 0}
                  isSelected={selectedStage === stage}
                  key={stage}
                  onStageClick={onStageClick || (() => {})}
                  position={stagePositions[stage]}
                  stage={stage}
                />
              )
            )}
          </div>
        </div>
      )}

      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">
            Loading lifecycle diagram...
          </div>
        </div>
      )}

      {/* Hover tooltip */}
      {hoveredStage && (
        <div className="pointer-events-none absolute right-4 bottom-4 left-4 rounded-lg border bg-background p-3 shadow-lg">
          <h4 className="font-semibold text-sm">
            {LIFECYCLE_STAGES[hoveredStage].name}
          </h4>
          <p className="mt-1 text-muted-foreground text-xs">
            {LIFECYCLE_STAGES[hoveredStage].description}
          </p>
          {stageCounts[hoveredStage] > 0 && (
            <p className="mt-1 text-amber-600 text-xs dark:text-amber-400">
              {stageCounts[hoveredStage]} card
              {stageCounts[hoveredStage] !== 1 ? 's' : ''} assigned
            </p>
          )}
        </div>
      )}
    </div>
  );
}
