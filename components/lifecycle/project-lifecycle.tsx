'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LifecycleStage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProjectLifecycleProps {
  onStageClick?: (stage: LifecycleStage) => void;
  selectedStage?: LifecycleStage;
  className?: string;
  stageCounts?: Record<LifecycleStage, number>;
}

// Color constants
const COLORS = {
  DEFAULT_FILL: '#bfcad8',
  ACTIVE_FILL: '#fde68a',
  ACTIVE_STROKE: '#f59e0b',
} as const;

// Define the stage configuration once
const STAGE_MAPPINGS: {
  inkscapeLabel: string;
  stage: LifecycleStage;
}[] = [
  { inkscapeLabel: 'stage-1', stage: 'project-planning' },
  { inkscapeLabel: 'stage-2', stage: 'problem-formulation' },
  { inkscapeLabel: 'stage-3', stage: 'data-extraction-procurement' },
  { inkscapeLabel: 'stage-4', stage: 'data-analysis' },
  {
    inkscapeLabel: 'stage-5',
    stage: 'preprocessing-feature-engineering',
  },
  { inkscapeLabel: 'stage-6', stage: 'model-selection-training' },
  { inkscapeLabel: 'stage-7', stage: 'model-testing-validation' },
  { inkscapeLabel: 'stage-8', stage: 'model-reporting' },
  { inkscapeLabel: 'stage-9', stage: 'system-implementation' },
  { inkscapeLabel: 'stage-10', stage: 'user-training' },
  { inkscapeLabel: 'stage-11', stage: 'system-use-monitoring' },
  { inkscapeLabel: 'stage-12', stage: 'model-updating-deprovisioning' },
];

// Helper function to find stage element with namespace handling
function findStageElement(
  svgElement: SVGElement,
  inkscapeLabel: string
): SVGPathElement | null {
  // Try namespace selector first
  let element = svgElement.querySelector(
    `[*|label="${inkscapeLabel}"]`
  ) as SVGPathElement;

  // Fallback to checking all path elements
  if (!element) {
    element = Array.from(svgElement.querySelectorAll('path')).find(
      (el) => el.getAttribute('inkscape:label') === inkscapeLabel
    ) as SVGPathElement;
  }

  return element || null;
}

export function ProjectLifecycle({
  onStageClick,
  selectedStage,
  className,
}: ProjectLifecycleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const addInteractiveRegions = useCallback(
    (svg: SVGElement) => {
      // Make the text layer non-interactive
      const textLayer = svg.querySelector('#g15');
      if (textLayer) {
        (textLayer as SVGElement).style.pointerEvents = 'none';
      }

      // Add interactivity to stage elements
      for (const { inkscapeLabel, stage } of STAGE_MAPPINGS) {
        const stageElement = findStageElement(svg, inkscapeLabel);

        if (!stageElement) {
          continue;
        }

        // Make the stage element interactive
        stageElement.style.cursor = 'pointer';
        stageElement.setAttribute('data-stage', stage);

        // Add click handler
        stageElement.addEventListener('click', () => {
          if (onStageClick) {
            onStageClick(stage);
          }
        });

        // Add hover handlers
        stageElement.addEventListener('mouseenter', function () {
          // Check if this element is currently selected by checking its current fill
          if (
            this.style.fill !== COLORS.ACTIVE_FILL ||
            this.style.stroke !== COLORS.ACTIVE_STROKE
          ) {
            this.style.fill = COLORS.ACTIVE_FILL;
          }
        });

        stageElement.addEventListener('mouseleave', function () {
          // Only revert if not selected (check by stroke presence)
          if (this.style.stroke !== COLORS.ACTIVE_STROKE) {
            this.style.fill = COLORS.DEFAULT_FILL;
          }
        });
      }
    },
    [onStageClick] // Removed selectedStage dependency
  );

  // Load and display the SVG
  useEffect(() => {
    fetch('/project-lifecycle.svg')
      .then((res) => res.text())
      .then((svgText) => {
        if (containerRef.current) {
          // Parse SVG as XML to preserve namespace attributes
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgText, 'application/xml');
          const svgElement = svgDoc.documentElement;

          // Check for parsing errors
          const parserError = svgDoc.querySelector('parsererror');
          if (parserError) {
            return;
          }

          // Clear container and append the SVG
          containerRef.current.innerHTML = '';
          const importedSvg = document.importNode(
            svgElement,
            true
          ) as unknown as SVGElement;
          containerRef.current.appendChild(importedSvg);

          // Use setTimeout to ensure DOM is ready
          setTimeout(() => {
            const svg = containerRef.current?.querySelector('svg');
            if (svg) {
              // Set SVG to scale properly
              svg.setAttribute('width', '100%');
              svg.setAttribute('height', '100%');
              svg.style.maxWidth = '100%';
              svg.style.maxHeight = 'calc(100vh - 200px)';
              svg.style.height = '100%';
              svg.style.objectFit = 'contain';

              // Add interactive regions
              addInteractiveRegions(svg);
              setIsLoaded(true);
            }
          }, 100);
        }
      })
      .catch(() => {
        // Handle SVG loading error silently
      });
  }, [addInteractiveRegions]);

  // Update colors when selection changes
  useEffect(() => {
    if (!(isLoaded && containerRef.current)) {
      return;
    }

    const svg = containerRef.current.querySelector('svg');
    if (!svg) {
      return;
    }

    // Update colors based on selection
    for (const { inkscapeLabel, stage } of STAGE_MAPPINGS) {
      const stageElement = findStageElement(svg, inkscapeLabel);

      if (stageElement) {
        if (selectedStage === stage) {
          stageElement.style.fill = COLORS.ACTIVE_FILL;
          stageElement.style.stroke = COLORS.ACTIVE_STROKE;
          stageElement.style.strokeWidth = '2';
        } else {
          stageElement.style.fill = COLORS.DEFAULT_FILL;
          stageElement.style.stroke = 'none';
        }
      }
    }
  }, [selectedStage, isLoaded]);

  return (
    <div className={cn('relative h-full w-full', className)}>
      {/* SVG Container */}
      <div
        className="flex h-full w-full items-center justify-center"
        ref={containerRef}
      />

      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-muted-foreground">
            Loading lifecycle diagram...
          </div>
        </div>
      )}
    </div>
  );
}
