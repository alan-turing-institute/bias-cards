'use client';

import { useState } from 'react';
import { LifecycleInstructions } from '@/components/lifecycle/lifecycle-instructions';
import { ProjectLifecycle } from '@/components/lifecycle/project-lifecycle';
import { StageDetailsContent } from '@/components/lifecycle/stage-details-content';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import { useIsDesktop } from '@/lib/hooks/use-media-query';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import type { LifecycleStage } from '@/lib/types';

export default function LifecyclePage() {
  const [selectedStage, setSelectedStage] = useState<LifecycleStage | null>(
    null
  );
  const { stageAssignments } = useWorkspaceStore();
  const isDesktop = useIsDesktop();

  // Calculate card counts for each stage
  const stageCounts = stageAssignments.reduce(
    (acc, assignment) => {
      acc[assignment.stage] = (acc[assignment.stage] || 0) + 1;
      return acc;
    },
    {} as Record<LifecycleStage, number>
  );

  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Bias Cards', href: '/' },
          { label: 'Project Lifecycle' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Desktop Layout: Two columns side by side */}
        {isDesktop ? (
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="mb-4">
              <h1 className="font-bold text-3xl">
                Project Lifecycle Framework
              </h1>
              <p className="mt-1 text-muted-foreground">
                A model to support structured reflection and deliberation when
                evaluating biases.
              </p>
            </div>

            {/* Two-column content with height constraint */}
            <div className="flex min-h-0 flex-1 gap-6">
              {/* Left: Lifecycle Visualization */}
              <Card className="flex-1 overflow-hidden p-6">
                <ProjectLifecycle
                  className="h-full"
                  onStageClick={setSelectedStage}
                  selectedStage={selectedStage || undefined}
                  stageCounts={stageCounts}
                />
              </Card>

              {/* Right: Persistent Details Panel - scrollable */}
              <Card className="w-full max-w-md overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="px-6 py-1">
                    {selectedStage ? (
                      <StageDetailsContent selectedStage={selectedStage} />
                    ) : (
                      <LifecycleInstructions />
                    )}
                  </div>
                </ScrollArea>
              </Card>
            </div>
          </div>
        ) : (
          /* Mobile Layout: Full width with Sheet drawer */
          <>
            <div className="flex h-full flex-col">
              <div className="mb-4">
                <h1 className="font-bold text-3xl">
                  Project Lifecycle Framework
                </h1>
                <p className="mt-1 text-muted-foreground">
                  A model to support structured reflection and deliberation when
                  evaluating biases. Tap on any stage in the diagram below to
                  view details.
                </p>
              </div>

              <Card className="flex-1 p-4 sm:p-6">
                <ProjectLifecycle
                  className="h-full"
                  onStageClick={setSelectedStage}
                  selectedStage={selectedStage || undefined}
                  stageCounts={stageCounts}
                />
              </Card>
            </div>

            {/* Mobile Sheet for Stage Details */}
            <Sheet
              onOpenChange={(open) => !open && setSelectedStage(null)}
              open={!!selectedStage}
            >
              <SheetContent className="w-full max-w-lg overflow-y-auto p-6">
                {selectedStage && (
                  <>
                    <SheetHeader className="space-y-4 pb-4">
                      <SheetTitle className="text-2xl">
                        {LIFECYCLE_STAGES[selectedStage].name}
                      </SheetTitle>
                      <SheetDescription className="text-base leading-relaxed">
                        {LIFECYCLE_STAGES[selectedStage].description}
                      </SheetDescription>
                    </SheetHeader>
                    <StageDetailsContent selectedStage={selectedStage} />
                  </>
                )}
              </SheetContent>
            </Sheet>
          </>
        )}
      </div>
    </>
  );
}
