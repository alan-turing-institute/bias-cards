'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { LifecycleStage } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ProjectLifecycleProps {
  onStageClick?: (stage: LifecycleStage) => void;
  selectedStage?: LifecycleStage;
  stageCounts?: Record<LifecycleStage, number>;
  className?: string;
}

export function ProjectLifecycle({
  onStageClick,
  selectedStage,
  stageCounts = {} as Record<LifecycleStage, number>,
  className,
}: ProjectLifecycleProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Removed hoveredStage state as it's not currently used
  const [isLoaded, setIsLoaded] = useState(false);

  const addInteractiveRegions = useCallback(
    (svg: SVGElement) => {
      // Debug: Check if namespaces are preserved for future use

      // Step 1: Make the entire text layer non-interactive
      const textLayer = svg.querySelector('#g15');
      if (textLayer) {
        (textLayer as SVGElement).style.pointerEvents = 'none';
      }

      // Step 2: Define the stage configuration
      const stages: {
        inkscapeId: string;
        stage: LifecycleStage;
        boundingBox: { x: number; y: number; width: number; height: number };
      }[] = [
        {
          inkscapeId: 'rect1',
          stage: 'project-planning',
          boundingBox: { x: 32, y: 68, width: 155, height: 75 },
        },
        {
          inkscapeId: 'rect2',
          stage: 'problem-formulation',
          boundingBox: { x: 32, y: 182, width: 155, height: 75 },
        },
        {
          inkscapeId: 'rect3',
          stage: 'data-extraction-procurement',
          boundingBox: { x: 221, y: 68, width: 155, height: 75 },
        },
        {
          inkscapeId: 'rect4',
          stage: 'data-analysis',
          boundingBox: { x: 221, y: 182, width: 155, height: 75 },
        },
        {
          inkscapeId: 'rect5',
          stage: 'preprocessing-feature-engineering',
          boundingBox: { x: 409, y: 68, width: 155, height: 75 },
        },
        {
          inkscapeId: 'rect6',
          stage: 'model-selection-training',
          boundingBox: { x: 409, y: 182, width: 155, height: 75 },
        },
        {
          inkscapeId: 'rect7',
          stage: 'model-testing-validation',
          boundingBox: { x: 598, y: 68, width: 155, height: 75 },
        },
        {
          inkscapeId: 'rect8',
          stage: 'model-reporting',
          boundingBox: { x: 598, y: 182, width: 155, height: 75 },
        },
        {
          inkscapeId: 'rect9',
          stage: 'system-implementation',
          boundingBox: { x: 786, y: 68, width: 155, height: 75 },
        },
        {
          inkscapeId: 'rect10',
          stage: 'user-training',
          boundingBox: { x: 786, y: 182, width: 155, height: 75 },
        },
        {
          inkscapeId: 'rect11',
          stage: 'system-use-monitoring',
          boundingBox: { x: 975, y: 68, width: 155, height: 75 },
        },
        {
          inkscapeId: 'rect12',
          stage: 'model-updating-deprovisioning',
          boundingBox: { x: 975, y: 182, width: 155, height: 75 },
        },
      ];

      // Step 3: Add interactive overlays and count badges
      for (const { stage, boundingBox } of stages) {
        const rect = document.createElementNS(
          'http://www.w3.org/2000/svg',
          'rect'
        );
        rect.setAttribute('x', boundingBox.x.toString());
        rect.setAttribute('y', boundingBox.y.toString());
        rect.setAttribute('width', boundingBox.width.toString());
        rect.setAttribute('height', boundingBox.height.toString());
        rect.setAttribute('fill', 'transparent');
        rect.setAttribute('data-overlay', 'true');
        rect.setAttribute('data-stage', stage);
        rect.style.cursor = 'pointer';
        rect.setAttribute('class', 'hover:fill-amber-500/10 transition-all');

        // Apply selected state if this stage is selected
        if (selectedStage === stage) {
          rect.setAttribute('fill', 'rgba(251, 191, 36, 0.2)');
          rect.setAttribute('stroke', 'rgb(251, 191, 36)');
          rect.setAttribute('stroke-width', '2');
        }

        // Add click handler
        rect.addEventListener('click', () => {
          if (onStageClick) {
            onStageClick(stage);
          }
        });

        // Add hover handlers
        rect.addEventListener('mouseenter', () => {
          if (selectedStage !== stage) {
            rect.setAttribute('fill', 'rgba(251, 191, 36, 0.1)');
          }
        });

        rect.addEventListener('mouseleave', () => {
          if (selectedStage !== stage) {
            rect.setAttribute('fill', 'transparent');
          }
        });

        svg.appendChild(rect);

        // Add count badge if there are cards assigned
        const count = stageCounts[stage] || 0;
        if (count > 0) {
          const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
          g.setAttribute('data-badge', 'true');
          g.setAttribute('data-stage', stage);

          // Badge background
          const circle = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'circle'
          );
          circle.setAttribute(
            'cx',
            (boundingBox.x + boundingBox.width - 15).toString()
          );
          circle.setAttribute('cy', (boundingBox.y + 15).toString());
          circle.setAttribute('r', '12');
          circle.setAttribute('fill', '#dc2626');
          circle.setAttribute('stroke', 'white');
          circle.setAttribute('stroke-width', '2');

          // Badge text
          const text = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'text'
          );
          text.setAttribute(
            'x',
            (boundingBox.x + boundingBox.width - 15).toString()
          );
          text.setAttribute('y', (boundingBox.y + 20).toString());
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('fill', 'white');
          text.setAttribute('font-size', '12');
          text.setAttribute('font-weight', 'bold');
          text.style.pointerEvents = 'none';
          text.textContent = count.toString();

          g.appendChild(circle);
          g.appendChild(text);
          svg.appendChild(g);
        }
      }
    },
    [onStageClick, selectedStage, stageCounts]
  );

  useEffect(() => {
    fetch('/project-lifecycle-updated.svg')
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

          // Clear container and append the SVG element
          containerRef.current.innerHTML = '';
          const importedSvg = document.importNode(
            svgElement,
            true
          ) as unknown as SVGElement;
          containerRef.current.appendChild(importedSvg);

          // Use setTimeout to ensure DOM is updated
          setTimeout(() => {
            const svg = containerRef.current?.querySelector('svg');
            if (svg) {
              // Set SVG to scale properly within viewport
              svg.setAttribute('width', '100%');
              svg.setAttribute('height', '100%');
              svg.style.maxWidth = '100%';
              svg.style.maxHeight = 'calc(100vh - 200px)'; // Account for header and padding
              svg.style.height = '100%';
              svg.style.objectFit = 'contain';

              // Add interactive regions
              addInteractiveRegions(svg);
              setIsLoaded(true);
            } else {
              // SVG not ready, will retry on next load
            }
          }, 100);
        } else {
          // Container ref not available, skip initialization
        }
      })
      .catch((_error) => {
        // Handle SVG loading error silently
      });
  }, [addInteractiveRegions]);

  // Helper to clear existing interactive elements
  const clearInteractiveElements = useCallback((svg: SVGSVGElement) => {
    const existingBadges = svg.querySelectorAll('g[data-badge="true"]');
    for (const badge of existingBadges) {
      badge.remove();
    }

    const existingOverlays = svg.querySelectorAll('rect[data-overlay="true"]');
    for (const overlay of existingOverlays) {
      overlay.remove();
    }

    return existingOverlays.length > 0;
  }, []);

  // Re-apply interactivity when selection or counts change (but not on initial load)
  useEffect(() => {
    if (!(isLoaded && containerRef.current)) {
      return;
    }

    const svg = containerRef.current.querySelector('svg');
    if (!svg) {
      return;
    }

    // Only clear and re-apply if overlays already exist (not initial load)
    const hadOverlays = clearInteractiveElements(svg);
    if (hadOverlays) {
      addInteractiveRegions(svg);
    }
  }, [isLoaded, addInteractiveRegions, clearInteractiveElements]);

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
