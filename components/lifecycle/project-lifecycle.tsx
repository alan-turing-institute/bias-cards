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
  const [_hoveredStage, setHoveredStage] = useState<LifecycleStage | null>(
    null
  );
  const [isLoaded, setIsLoaded] = useState(false);

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
            }
          }, 100);
        } else {
        }
      })
      .catch((_error) => {});
  }, []); // Empty deps - addInteractiveRegions will be defined below

  // Re-apply interactivity when selection or counts change (but not on initial load)
  useEffect(() => {
    if (isLoaded && containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        // Only clear and re-apply if overlays already exist (not initial load)
        const existingOverlays = svg.querySelectorAll(
          'rect[data-overlay="true"]'
        );
        if (existingOverlays.length > 0) {
          // Clear previous interactivity
          const existingBadges = svg.querySelectorAll('g[data-badge="true"]');
          existingBadges.forEach((badge) => badge.remove());

          // Clear previous overlays
          existingOverlays.forEach((overlay) => overlay.remove());

          // Re-apply interactivity
          addInteractiveRegions(svg);
        }
      }
    }
  }, [isLoaded, selectedStage, stageCounts, onStageClick]); // Dependencies for re-applying interactivity

  const addInteractiveRegions = (svg: SVGElement) => {
    // Debug: Check if namespaces are preserved
    const _hasInkscapeNS = svg.getAttribute('xmlns:inkscape') !== null;

    // Step 1: Make the entire text layer non-interactive
    const textLayer = svg.querySelector('#g15');
    if (textLayer) {
      (textLayer as SVGElement).style.pointerEvents = 'none';
    } else {
    }

    // Also make all text elements non-interactive as a fallback
    const allTextElements = svg.querySelectorAll('text, tspan');
    allTextElements.forEach((textEl) => {
      (textEl as SVGElement).style.pointerEvents = 'none';
    });

    // Step 2: Find the stage-bubbles group
    const stageBubblesGroup = svg.querySelector('#g16');
    if (!stageBubblesGroup) {
      // Debug: List all groups
      const allGroups = svg.querySelectorAll('g');
      allGroups.forEach((g, _i) => {
        if (g.id) {
        }
      });
      return;
    }

    // Map stage numbers to lifecycle stages
    const stageMapping: Record<string, LifecycleStage> = {
      'stage-1': 'project-planning',
      'stage-2': 'problem-formulation',
      'stage-3': 'data-extraction-procurement',
      'stage-4': 'data-analysis',
      'stage-5': 'preprocessing-feature-engineering',
      'stage-6': 'model-selection-training',
      'stage-7': 'model-testing-validation',
      'stage-8': 'model-reporting',
      'stage-9': 'system-implementation',
      'stage-10': 'user-training',
      'stage-11': 'system-use-monitoring',
      'stage-12': 'model-updating-deprovisioning',
    };

    // Step 3: Find and make each stage bubble interactive
    // Try multiple approaches to find the elements
    for (let i = 1; i <= 12; i++) {
      const stageLabel = `stage-${i}`;

      // Try different selectors
      let stageElement = stageBubblesGroup.querySelector(
        `[inkscape\\:label="${stageLabel}"]`
      );

      const pathElements = Array.from(
        stageBubblesGroup.querySelectorAll('path')
      );

      if (!stageElement) {
        // Try with namespace prefix
        stageElement =
          pathElements.find(
            (el) =>
              el.getAttributeNS(
                'http://www.inkscape.org/namespaces/inkscape',
                'label'
              ) === stageLabel
          ) || null;
      }

      if (!stageElement) {
        // Try without namespace
        stageElement =
          pathElements.find(
            (el) => el.getAttribute('inkscape:label') === stageLabel
          ) || null;
      }

      if (stageElement) {
        const lifecycleStage = stageMapping[stageLabel];

        if (lifecycleStage) {
          // Make the stage element itself interactive
          makeStageElementInteractive(
            stageElement as SVGElement,
            lifecycleStage
          );

          // Add count badge if there are cards assigned
          const count = stageCounts[lifecycleStage] || 0;
          if (count > 0) {
            addCountBadge(stageElement as SVGElement, count);
          }
        }
      } else {
        // Debug: Show what paths exist in the group
        const paths = stageBubblesGroup.querySelectorAll('path');
        if (i === 1) {
          paths.forEach((p, _idx) => {
            const label =
              p.getAttribute('inkscape:label') ||
              p.getAttributeNS(
                'http://www.inkscape.org/namespaces/inkscape',
                'label'
              );
            if (label) {
            }
          });
        }
      }
    }

    // Fallback: If we couldn't find the stage bubbles, try making the text clickable
    if (
      !stageBubblesGroup ||
      stageBubblesGroup.querySelectorAll('path').length === 0
    ) {
      const textGroup = svg.querySelector('#g15');
      if (textGroup) {
        // Map text labels to lifecycle stages
        const textMapping: Record<string, LifecycleStage> = {
          'text-1': 'project-planning',
          'text-2': 'problem-formulation',
          'text-3': 'data-extraction-procurement',
          'text-4': 'data-analysis',
          'text-5': 'preprocessing-feature-engineering',
          'text-6': 'model-selection-training',
          'text-7': 'model-testing-validation',
          'text-8': 'model-reporting',
          'text-9': 'system-implementation',
          'text-10': 'user-training',
          'text-11': 'system-use-monitoring',
          'text-12': 'model-updating-deprovisioning',
        };

        // Make text elements interactive
        Object.entries(textMapping).forEach(([textLabel, lifecycleStage]) => {
          const textElement =
            textGroup.querySelector(`[inkscape\\:label="${textLabel}"]`) ||
            textGroup.querySelector(`#${textLabel}`);

          if (textElement) {
            (textElement as SVGElement).style.pointerEvents = 'auto';
            (textElement as SVGElement).style.cursor = 'pointer';

            textElement.addEventListener('click', (e) => {
              e.stopPropagation();
              if (onStageClick) {
                onStageClick(lifecycleStage);
              }
            });

            // Add hover effect
            textElement.addEventListener('mouseenter', () => {
              (textElement as SVGElement).style.fill = '#F59E0B';
            });

            textElement.addEventListener('mouseleave', () => {
              (textElement as SVGElement).style.fill = '#5d6c7f';
            });
          }
        });
      }
    }

    return; // Skip the old logic
    // Map of label patterns to stage keys - more flexible matching
    const labelMappings: Array<{ pattern: RegExp; stage: LifecycleStage }> = [
      { pattern: /project\s*planning/i, stage: 'project-planning' },
      { pattern: /problem\s*formulation/i, stage: 'problem-formulation' },
      { pattern: /data\s*extraction/i, stage: 'data-extraction-procurement' },
      { pattern: /data\s*analysis/i, stage: 'data-analysis' },
      {
        pattern: /pre[\s-]*processing/i,
        stage: 'preprocessing-feature-engineering',
      },
      { pattern: /model\s*selection/i, stage: 'model-selection-training' },
      { pattern: /model\s*testing/i, stage: 'model-testing-validation' },
      {
        pattern: /model\s*(documentation|reporting)/i,
        stage: 'model-reporting',
      },
      { pattern: /system\s*implementation/i, stage: 'system-implementation' },
      { pattern: /system\s*use/i, stage: 'system-use-monitoring' },
      {
        pattern: /model\s*updating/i,
        stage: 'model-updating-deprovisioning',
      },
      { pattern: /user\s*training/i, stage: 'user-training' },
    ];

    // Find all groups with inkscape:label attributes
    const labeledGroups = svg.querySelectorAll('g[inkscape\\:label]');

    labeledGroups.forEach((group) => {
      const label = group.getAttribute('inkscape:label') || '';

      // Check if this label matches one of our stage patterns
      for (const mapping of labelMappings) {
        if (mapping.pattern.test(label)) {
          // Find the blue rounded rectangle label in this group
          const paths = group.querySelectorAll('path');
          const rects = group.querySelectorAll('rect');
          let labelElement: SVGElement | null = null;

          // First try to find a rounded rectangle (the label bubble)
          rects.forEach((rect) => {
            const rx = rect.getAttribute('rx');
            if (rx && Number.parseFloat(rx) > 0) {
              labelElement = rect;
            }
          });

          // If no rounded rect, look for rectangular paths (label backgrounds)
          if (!labelElement) {
            paths.forEach((path) => {
              try {
                const bbox = path.getBBox();
                const aspectRatio = bbox.width / bbox.height;

                // Look for rectangular shapes that could be label backgrounds
                if (
                  aspectRatio > 1.5 &&
                  aspectRatio < 4.0 &&
                  bbox.width > 100 &&
                  bbox.height > 30 &&
                  bbox.height < 80
                ) {
                  labelElement = path;
                }
              } catch (_e) {
                // Skip paths that can't be measured
              }
            });
          }

          if (labelElement) {
            // Create a visible interactive overlay on the label
            const bbox = (labelElement as SVGGraphicsElement).getBBox();
            createInteractiveOverlay(
              svg,
              bbox,
              mapping.stage,
              group as SVGGElement
            );
          } else {
            // Fallback: make the entire group clickable
            setupGroupInteractivity(group as SVGGElement, mapping.stage);
          }
          break; // Stop after first match
        }
      }
    });

    // Alternative approach: Find all paths that look like bubbles
    if (labeledGroups.length === 0) {
      // Find all paths with specific fill colors that indicate bubbles
      const allPaths = svg.querySelectorAll('path');
      const bubbleColors = [
        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '#rgb(59,130,246)',
        '#rgb(16,185,129)',
        '#rgb(245,158,11)',
      ];

      allPaths.forEach((path, _index) => {
        const fill = path.getAttribute('fill');
        if (
          fill &&
          bubbleColors.some((color) =>
            fill.toLowerCase().includes(color.toLowerCase())
          )
        ) {
          // For now, just make them all interactive as a fallback
          path.style.cursor = 'pointer';
          path.addEventListener('click', () => {});
        }
      });
    }
  };

  const _setupBubbleInteractivity = (
    bubblePath: SVGPathElement,
    stageKey: LifecycleStage
  ) => {
    // Make the bubble interactive
    bubblePath.style.cursor = 'pointer';

    // Store original styles
    const _originalFill = bubblePath.getAttribute('fill') || '';
    const originalStroke = bubblePath.getAttribute('stroke') || 'none';
    const originalStrokeWidth = bubblePath.getAttribute('stroke-width') || '0';

    // Apply selected state if this is the selected stage
    if (selectedStage === stageKey) {
      bubblePath.setAttribute('stroke', 'rgb(251, 146, 60)');
      bubblePath.setAttribute('stroke-width', '6');
    }

    // Add hover handlers
    bubblePath.addEventListener('mouseenter', () => {
      setHoveredStage(stageKey);
      if (selectedStage !== stageKey) {
        bubblePath.setAttribute('stroke', 'rgb(251, 146, 60)');
        bubblePath.setAttribute('stroke-width', '4');
      }
      bubblePath.style.opacity = '0.9';
    });

    bubblePath.addEventListener('mouseleave', () => {
      setHoveredStage(null);
      if (selectedStage !== stageKey) {
        bubblePath.setAttribute('stroke', originalStroke);
        bubblePath.setAttribute('stroke-width', originalStrokeWidth);
      }
      bubblePath.style.opacity = '1';
    });

    // Add click handler
    bubblePath.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onStageClick) {
        onStageClick(stageKey);
      }
    });

    // Add count badge if there are cards assigned
    const count = stageCounts[stageKey] || 0;
    if (count > 0) {
      const bbox = bubblePath.getBBox();

      // Create badge group
      const badgeGroup = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'g'
      );
      badgeGroup.setAttribute('data-badge', 'true');
      badgeGroup.style.pointerEvents = 'none';

      // Create badge circle
      const circle = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      );
      const badgeX = bbox.x + bbox.width - 30;
      const badgeY = bbox.y + 30;

      circle.setAttribute('cx', String(badgeX));
      circle.setAttribute('cy', String(badgeY));
      circle.setAttribute('r', '20');
      circle.setAttribute('fill', 'rgb(251, 146, 60)');
      circle.setAttribute('stroke', 'white');
      circle.setAttribute('stroke-width', '3');

      // Create badge text
      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', String(badgeX));
      text.setAttribute('y', String(badgeY + 7));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '24');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-family', 'sans-serif');
      text.textContent = String(count);

      badgeGroup.appendChild(circle);
      badgeGroup.appendChild(text);

      // Add badge to the same parent as the bubble
      if (bubblePath.parentElement) {
        bubblePath.parentElement.appendChild(badgeGroup);
      }
    }
  };

  const createInteractiveOverlay = useCallback(
    (
      svg: SVGElement,
      bbox: DOMRect,
      stageKey: LifecycleStage,
      _group: SVGGElement
    ) => {
      // Create a semi-transparent overlay rectangle that's perfectly aligned
      const overlay = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'rect'
      );

      // The bbox gives us coordinates in the SVG's coordinate system
      // For a blue bubble label, we need to create a smaller, more precise overlay
      // Based on the actual blue bubble size (they're much smaller than the full path)
      const bubbleWidth = Math.min(bbox.width, 150); // Limit to reasonable bubble width
      const bubbleHeight = Math.min(bbox.height, 50); // Limit to reasonable bubble height

      // Center the overlay on the path's bounding box
      const overlayX = bbox.x + (bbox.width - bubbleWidth) / 2;
      const overlayY = bbox.y + (bbox.height - bubbleHeight) / 2;

      // Position the overlay exactly over the blue bubble
      overlay.setAttribute('x', String(overlayX));
      overlay.setAttribute('y', String(overlayY));
      overlay.setAttribute('width', String(bubbleWidth));
      overlay.setAttribute('height', String(bubbleHeight));
      overlay.setAttribute('rx', '20'); // More rounded corners for bubble style
      overlay.setAttribute('ry', '20');

      // Style the overlay
      overlay.setAttribute('fill', 'rgba(251, 146, 60, 0.2)'); // Subtle amber overlay
      overlay.setAttribute('stroke', 'rgb(251, 146, 60)');
      overlay.setAttribute('stroke-width', '2');
      overlay.setAttribute('opacity', '0');
      overlay.style.cursor = 'pointer';
      overlay.style.transition = 'opacity 0.2s ease';

      // Add hover effects
      overlay.addEventListener('mouseenter', () => {
        setHoveredStage(stageKey);
        overlay.setAttribute('opacity', '1');
      });

      overlay.addEventListener('mouseleave', () => {
        setHoveredStage(null);
        overlay.setAttribute(
          'opacity',
          selectedStage === stageKey ? '0.5' : '0'
        );
      });

      // Add click handler
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onStageClick) {
          onStageClick(stageKey);
        }
      });

      // Show selected state
      if (selectedStage === stageKey) {
        overlay.setAttribute('opacity', '0.5');
        overlay.setAttribute('stroke-width', '3');
      }

      // Add the overlay to the SVG (at the end so it's on top)
      svg.appendChild(overlay);

      // Store reference for cleanup
      overlay.setAttribute('data-stage', stageKey);
      overlay.setAttribute('data-overlay', 'true');
    },
    [onStageClick, selectedStage]
  );

  const addCountBadge = (element: SVGElement, count: number) => {
    const bbox = (element as SVGGraphicsElement).getBBox();

    // Create badge group
    const badgeGroup = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'g'
    );
    badgeGroup.setAttribute('data-badge', 'true');
    badgeGroup.style.pointerEvents = 'none';

    // Create badge circle
    const circle = document.createElementNS(
      'http://www.w3.org/2000/svg',
      'circle'
    );
    const badgeX = bbox.x + bbox.width - 30;
    const badgeY = bbox.y + 30;

    circle.setAttribute('cx', String(badgeX));
    circle.setAttribute('cy', String(badgeY));
    circle.setAttribute('r', '20');
    circle.setAttribute('fill', 'rgb(251, 146, 60)');
    circle.setAttribute('stroke', 'white');
    circle.setAttribute('stroke-width', '3');

    // Create badge text
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(badgeX));
    text.setAttribute('y', String(badgeY + 7));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('fill', 'white');
    text.setAttribute('font-size', '24');
    text.setAttribute('font-weight', 'bold');
    text.setAttribute('font-family', 'sans-serif');
    text.textContent = String(count);

    badgeGroup.appendChild(circle);
    badgeGroup.appendChild(text);

    // Add badge to the same parent as the bubble
    if (element.parentElement) {
      element.parentElement.appendChild(badgeGroup);
    }
  };

  const makeStageElementInteractive = useCallback(
    (element: SVGElement, stageKey: LifecycleStage) => {
      // Set cursor to indicate it's clickable - important to use setAttribute for SVG
      element.setAttribute('cursor', 'pointer');
      element.style.cursor = 'pointer';

      // Make all text elements inside this stage non-interactive so they don't block clicks
      const textElements = element.querySelectorAll('text, tspan');
      textElements.forEach((textEl) => {
        (textEl as SVGElement).style.pointerEvents = 'none';
      });

      // Also check for any text elements that might be siblings (not children)
      // This handles cases where text is positioned over the stage element
      const parent = element.parentElement;
      if (parent) {
        const siblingTexts = parent.querySelectorAll('text, tspan');
        siblingTexts.forEach((textEl) => {
          // Check if this text element overlaps with our stage element
          const textBBox = (textEl as SVGGraphicsElement).getBBox?.();
          const elementBBox = (element as SVGGraphicsElement).getBBox?.();
          if (textBBox && elementBBox) {
            // Simple overlap check
            const overlaps = !(
              textBBox.x + textBBox.width < elementBBox.x ||
              elementBBox.x + elementBBox.width < textBBox.x ||
              textBBox.y + textBBox.height < elementBBox.y ||
              elementBBox.y + elementBBox.height < textBBox.y
            );
            if (overlaps) {
              (textEl as SVGElement).style.pointerEvents = 'none';
            }
          }
        });
      }

      // Store original styles for hover effects
      const originalStyle = element.getAttribute('style') || '';
      const originalFilter = element.getAttribute('filter') || '';
      const _originalOpacity = element.getAttribute('opacity') || '1';

      // Create a unique filter for drop shadow effect if it doesn't exist
      const svg = element.ownerSVGElement;
      if (svg) {
        let defs = svg.querySelector('defs');
        if (!defs) {
          defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
          svg.insertBefore(defs, svg.firstChild);
        }

        // Create hover filter if it doesn't exist
        if (!svg.querySelector('#hover-shadow')) {
          const filter = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'filter'
          );
          filter.setAttribute('id', 'hover-shadow');

          const dropShadow = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'feDropShadow'
          );
          dropShadow.setAttribute('dx', '0');
          dropShadow.setAttribute('dy', '2');
          dropShadow.setAttribute('stdDeviation', '4');
          dropShadow.setAttribute('flood-color', 'rgba(251, 146, 60, 0.3)');

          filter.appendChild(dropShadow);
          defs.appendChild(filter);
        }

        // Create selected filter if it doesn't exist
        if (!svg.querySelector('#selected-shadow')) {
          const filter = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'filter'
          );
          filter.setAttribute('id', 'selected-shadow');

          const dropShadow = document.createElementNS(
            'http://www.w3.org/2000/svg',
            'feDropShadow'
          );
          dropShadow.setAttribute('dx', '0');
          dropShadow.setAttribute('dy', '4');
          dropShadow.setAttribute('stdDeviation', '6');
          dropShadow.setAttribute('flood-color', 'rgba(251, 146, 60, 0.4)');

          filter.appendChild(dropShadow);
          defs.appendChild(filter);
        }

        // Skip overlay creation - the stroke effects are sufficient
        // The overlays were appearing misaligned in the top-left corner
      }

      // Helper function to update style attribute
      const updateStyle = (
        styleStr: string,
        updates: Record<string, string>
      ) => {
        const styles = styleStr.split(';').filter((s) => s.trim());
        const styleMap: Record<string, string> = {};

        // Parse existing styles
        styles.forEach((style) => {
          const [key, value] = style.split(':').map((s) => s.trim());
          if (key && value) {
            styleMap[key] = value;
          }
        });

        // Apply updates
        Object.assign(styleMap, updates);

        // Rebuild style string
        return Object.entries(styleMap)
          .map(([key, value]) => `${key}:${value}`)
          .join(';');
      };

      // Apply selected state if this is the selected stage
      if (selectedStage === stageKey) {
        const newStyle = updateStyle(originalStyle, {
          fill: '#fed7aa', // Amber-200
          stroke: '#fb923c', // Amber-400
          'stroke-width': '4',
        });
        element.setAttribute('style', newStyle);
        element.setAttribute('filter', 'url(#selected-shadow)');
      }

      // Add hover effects
      element.addEventListener('mouseenter', () => {
        setHoveredStage(stageKey);

        if (selectedStage !== stageKey) {
          // Change fill color to orange/amber on hover
          const newStyle = updateStyle(originalStyle, {
            fill: '#fbbf24', // Amber-400
            stroke: '#f59e0b', // Amber-500
            'stroke-width': '2',
          });
          element.setAttribute('style', newStyle);
          element.setAttribute('filter', 'url(#hover-shadow)');
        }
      });

      element.addEventListener('mouseleave', () => {
        setHoveredStage(null);

        if (selectedStage !== stageKey) {
          // Restore original style
          element.setAttribute('style', originalStyle);
          element.setAttribute('filter', originalFilter);
        }
      });

      // Add click handler
      element.addEventListener('click', (e) => {
        e.stopPropagation();
        if (onStageClick) {
          onStageClick(stageKey);
        }
      });
    },
    [onStageClick, selectedStage]
  );

  const setupGroupInteractivity = (
    group: SVGGElement,
    stageKey: LifecycleStage
  ) => {
    // Make the entire group interactive
    group.style.cursor = 'pointer';

    // Add hover handlers to the group
    group.addEventListener('mouseenter', () => {
      setHoveredStage(stageKey);
      // Add visual feedback to all paths in the group
      const paths = group.querySelectorAll('path');
      paths.forEach((path) => {
        path.setAttribute('stroke', 'rgb(251, 146, 60)');
        path.setAttribute('stroke-width', '4');
        (path as SVGPathElement).style.opacity = '0.9';
      });
    });

    group.addEventListener('mouseleave', () => {
      setHoveredStage(null);
      // Remove visual feedback
      const paths = group.querySelectorAll('path');
      paths.forEach((path) => {
        if (selectedStage !== stageKey) {
          path.setAttribute('stroke', 'none');
          path.setAttribute('stroke-width', '0');
        }
        (path as SVGPathElement).style.opacity = '1';
      });
    });

    // Add click handler to the group
    group.addEventListener('click', (e) => {
      e.stopPropagation();
      if (onStageClick) {
        onStageClick(stageKey);
      }
    });

    // Apply selected state if this is the selected stage
    if (selectedStage === stageKey) {
      const paths = group.querySelectorAll('path');
      paths.forEach((path) => {
        path.setAttribute('stroke', 'rgb(251, 146, 60)');
        path.setAttribute('stroke-width', '6');
      });
    }

    // Add count badge if there are cards assigned
    const count = stageCounts[stageKey] || 0;
    if (count > 0) {
      // Find the group's bounding box
      const bbox = group.getBBox();

      // Create badge group
      const badgeGroup = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'g'
      );
      badgeGroup.setAttribute('data-badge', 'true');
      badgeGroup.style.pointerEvents = 'none';

      // Create badge circle
      const circle = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'circle'
      );
      const badgeX = bbox.x + bbox.width - 30;
      const badgeY = bbox.y + 30;

      circle.setAttribute('cx', String(badgeX));
      circle.setAttribute('cy', String(badgeY));
      circle.setAttribute('r', '20');
      circle.setAttribute('fill', 'rgb(251, 146, 60)');
      circle.setAttribute('stroke', 'white');
      circle.setAttribute('stroke-width', '3');

      // Create badge text
      const text = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'text'
      );
      text.setAttribute('x', String(badgeX));
      text.setAttribute('y', String(badgeY + 7));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', 'white');
      text.setAttribute('font-size', '24');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-family', 'sans-serif');
      text.textContent = String(count);

      badgeGroup.appendChild(circle);
      badgeGroup.appendChild(text);

      // Add badge to the group
      group.appendChild(badgeGroup);
    }
  };

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
