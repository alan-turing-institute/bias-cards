'use client';

import { ArrowLeft, ArrowRight, BookOpen, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  getCurrentStep,
  type OnboardingStep,
  useOnboardingStore,
} from '@/lib/stores/onboarding-store';

export function OnboardingOverlay() {
  const router = useRouter();
  const [highlightElement, setHighlightElement] = useState<HTMLElement | null>(
    null
  );
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const {
    isOnboardingActive,
    currentStep,
    nextStep,
    previousStep,
    skipOnboarding,
    markStepCompleted,
  } = useOnboardingStore();

  const step = getCurrentStep(useOnboardingStore.getState());
  const totalSteps = 10; // Total number of onboarding steps
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const updateTooltipPosition = useCallback(
    (element: HTMLElement, step: OnboardingStep) => {
      const rect = element.getBoundingClientRect();
      const tooltipWidth = 320; // Width of the tooltip card (w-80 = 20rem = 320px)
      const tooltipHeight = 280; // Approximate height of tooltip
      const spacing = 30; // Space between highlight and tooltip
      const padding = 20; // Minimum distance from viewport edges

      let x = 0;
      let y = 0;

      // Calculate position based on placement
      switch (step.placement) {
        case 'top':
          x = rect.left + rect.width / 2;
          y = rect.top - spacing - tooltipHeight / 2;
          break;
        case 'bottom':
          x = rect.left + rect.width / 2;
          y = rect.bottom + spacing + tooltipHeight / 2;
          break;
        case 'left':
          x = rect.left - spacing - tooltipWidth / 2;
          y = rect.top + rect.height / 2;
          break;
        case 'right':
          // Most common case for sidebar items
          x = rect.right + spacing + tooltipWidth / 2;
          y = rect.top + rect.height / 2;
          break;
        default:
          // Center of element
          x = rect.left + rect.width / 2;
          y = rect.top + rect.height / 2;
      }

      // Adjust if tooltip would go off-screen
      // Check right edge
      if (x + tooltipWidth / 2 > window.innerWidth - padding) {
        // If placement is right and would overflow, position to the left instead
        if (step.placement === 'right') {
          x = rect.left - spacing - tooltipWidth / 2;
        } else {
          x = window.innerWidth - tooltipWidth / 2 - padding;
        }
      }

      // Check left edge
      if (x - tooltipWidth / 2 < padding) {
        x = tooltipWidth / 2 + padding;
      }

      // Check bottom edge
      if (y + tooltipHeight / 2 > window.innerHeight - padding) {
        y = window.innerHeight - tooltipHeight / 2 - padding;
      }

      // Check top edge
      if (y - tooltipHeight / 2 < padding) {
        y = tooltipHeight / 2 + padding;
      }

      setTooltipPosition({ x, y });
    },
    []
  );

  useEffect(() => {
    if (!(isOnboardingActive && step)) {
      setHighlightElement(null);
      return;
    }

    // Navigate to required route if needed
    if (step.route && window.location.pathname !== step.route) {
      router.push(step.route);
    }

    // Find and highlight target element
    if (step.target) {
      const findElement = () => {
        const element = document.querySelector(step.target!) as HTMLElement;
        if (element) {
          setHighlightElement(element);
          updateTooltipPosition(element, step);
          markStepCompleted(step.id);
        } else {
          // Retry after a short delay (element might not be mounted yet)
          setTimeout(findElement, 500);
        }
      };

      findElement();
    } else {
      // No target element, center the tooltip
      setHighlightElement(null);
      setTooltipPosition({
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }
  }, [
    isOnboardingActive,
    step,
    router,
    markStepCompleted,
    updateTooltipPosition,
  ]);

  const handleNext = () => {
    nextStep();
  };

  const handlePrevious = () => {
    previousStep();
  };

  const handleSkip = () => {
    skipOnboarding();
  };

  if (!(isOnboardingActive && step)) {
    return null;
  }

  return (
    <>
      {/* Overlay backdrop */}
      <div className="pointer-events-none fixed inset-0 z-50 bg-black/30" />

      {/* Highlight circle */}
      {highlightElement && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border-2 border-amber-500 transition-all duration-300"
          style={{
            left: highlightElement.getBoundingClientRect().left - 4,
            top: highlightElement.getBoundingClientRect().top - 4,
            width: highlightElement.getBoundingClientRect().width + 8,
            height: highlightElement.getBoundingClientRect().height + 8,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.3)',
          }}
        />
      )}

      {/* Tooltip */}
      <Card
        className="fixed z-50 w-80 p-4 shadow-xl"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-sm">{step.title}</h3>
              <p className="mt-1 whitespace-pre-line text-muted-foreground text-xs leading-relaxed">
                {step.description}
              </p>
            </div>
            <Button
              className="h-6 w-6 p-0"
              onClick={handleSkip}
              size="sm"
              variant="ghost"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-muted-foreground text-xs">
              <span>
                Step {currentStep + 1} of {totalSteps}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress className="h-2" value={progress} />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              disabled={currentStep === 0}
              onClick={handlePrevious}
              size="sm"
              variant="outline"
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Previous
            </Button>

            <div className="flex gap-2">
              {currentStep === totalSteps - 1 ? (
                <>
                  <Button
                    asChild
                    className="text-muted-foreground"
                    size="sm"
                    variant="ghost"
                  >
                    <Link href="/tutorial">
                      <BookOpen className="mr-1 h-3 w-3" />
                      View Tutorial
                    </Link>
                  </Button>
                  <Button onClick={handleNext} size="sm">
                    Finish
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="text-muted-foreground"
                    onClick={handleSkip}
                    size="sm"
                    variant="ghost"
                  >
                    Skip Tour
                  </Button>
                  <Button onClick={handleNext} size="sm">
                    Next
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </>
  );
}
