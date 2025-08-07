'use client';

import { BookOpen, Clock, Target, Users } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type ActivityTemplate,
  createWorkspaceFromTemplate,
  getTemplatesByCategory,
} from '@/lib/data/activity-templates';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';
import { cn } from '@/lib/utils';

interface ActivityTemplatesDialogProps {
  trigger: React.ReactNode;
}

const CATEGORY_INFO = {
  beginner: {
    label: 'Beginner',
    description: 'Introduction to ML bias concepts',
    icon: BookOpen,
    color: 'bg-green-50 text-green-700 border-green-200',
  },
  intermediate: {
    label: 'Intermediate',
    description: 'Deeper exploration of specific bias areas',
    icon: Target,
    color: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  advanced: {
    label: 'Advanced',
    description: 'Comprehensive bias auditing and mitigation',
    icon: Users,
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  specialized: {
    label: 'Specialized',
    description: 'Domain-specific bias considerations',
    icon: Clock,
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
};

export function ActivityTemplatesDialog({
  trigger,
}: ActivityTemplatesDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<ActivityTemplate | null>(null);
  const [activeCategory, setActiveCategory] =
    useState<ActivityTemplate['category']>('beginner');

  const workspaceStore = useWorkspaceStore();

  const handleLoadTemplate = (template: ActivityTemplate) => {
    try {
      // Create workspace data from template
      const templateWorkspace = createWorkspaceFromTemplate(template);

      // Reset the current workspace and apply template data
      workspaceStore.resetWorkspace();

      // Apply template data to the store
      if (templateWorkspace.name) {
        workspaceStore.updateWorkspaceName(templateWorkspace.name);
      }

      // Apply stage assignments
      if (templateWorkspace.stageAssignments) {
        for (const assignment of templateWorkspace.stageAssignments) {
          workspaceStore.assignCardToStage(
            assignment.cardId,
            assignment.stage,
            assignment.annotation
          );
        }
      }

      // Apply card pairs
      if (templateWorkspace.cardPairs) {
        for (const pair of templateWorkspace.cardPairs) {
          workspaceStore.createCardPair(
            pair.biasId,
            pair.mitigationId,
            pair.annotation,
            pair.effectivenessRating
          );
        }
      }

      setOpen(false);
      setSelectedTemplate(null);
    } catch (_error) {
      // Handle error silently
    }
  };

  const renderTemplateCard = (template: ActivityTemplate) => {
    const categoryInfo = CATEGORY_INFO[template.category];
    const IconComponent = categoryInfo.icon;

    return (
      <button
        className={cn(
          'w-full cursor-pointer rounded-lg border p-4 text-left transition-all hover:shadow-md',
          selectedTemplate?.id === template.id
            ? 'border-blue-500 bg-blue-50 shadow-md'
            : 'border-gray-200 hover:border-gray-300'
        )}
        key={template.id}
        onClick={() => setSelectedTemplate(template)}
        type="button"
      >
        <div className="flex items-start gap-3">
          <div className={cn('rounded-lg p-2', categoryInfo.color)}>
            <IconComponent className="h-4 w-4" />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{template.name}</h3>
              <Badge className="text-xs" variant="outline">
                {template.estimatedDuration}
              </Badge>
            </div>

            <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
              {template.description}
            </p>

            <div className="mt-3 flex items-center gap-4 text-muted-foreground text-xs">
              <span>{template.preAssignedCards.length} pre-assigned cards</span>
              <span>{template.prePairedCards.length} example pairs</span>
              <span>{template.learningObjectives.length} objectives</span>
            </div>
          </div>
        </div>
      </button>
    );
  };

  const renderTemplateDetails = (template: ActivityTemplate) => {
    const categoryInfo = CATEGORY_INFO[template.category];

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge
            className={cn('text-xs', categoryInfo.color)}
            variant="outline"
          >
            {categoryInfo.label}
          </Badge>
          <Badge className="text-xs" variant="secondary">
            {template.estimatedDuration}
          </Badge>
        </div>

        <div>
          <h4 className="font-medium text-sm">Learning Objectives</h4>
          <ul className="mt-2 space-y-1 text-muted-foreground text-xs">
            {template.learningObjectives.map((objective, index) => (
              <li
                className="flex items-start gap-2"
                key={`${template.id}-objective-${index}`}
              >
                <span className="mt-1 block h-1 w-1 flex-shrink-0 rounded-full bg-current" />
                {objective}
              </li>
            ))}
          </ul>
        </div>

        {template.instructions && (
          <div>
            <h4 className="font-medium text-sm">Instructions</h4>
            <ul className="mt-2 space-y-1 text-muted-foreground text-xs">
              {template.instructions.map((instruction, index) => (
                <li
                  className="flex items-start gap-2"
                  key={`${template.id}-instruction-${index}`}
                >
                  <span className="mt-1 block h-1 w-1 flex-shrink-0 rounded-full bg-current" />
                  {instruction}
                </li>
              ))}
            </ul>
          </div>
        )}

        {template.completionCriteria && (
          <div>
            <h4 className="font-medium text-sm">Completion Criteria</h4>
            <ul className="mt-2 space-y-1 text-muted-foreground text-xs">
              {template.completionCriteria.map((criteria, index) => (
                <li
                  className="flex items-start gap-2"
                  key={`${template.id}-instruction-${index}`}
                >
                  <span className="mt-1 block h-1 w-1 flex-shrink-0 rounded-full bg-current" />
                  {criteria}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-amber-800 text-xs">
            <strong>Note:</strong> Loading this template will replace your
            current workspace. Consider saving your current progress first.
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Activity Templates</DialogTitle>
          <DialogDescription>
            Start with a pre-configured activity designed for different learning
            goals and skill levels.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-6">
          {/* Left side - Template selection */}
          <div className="flex-1">
            <Tabs
              className="w-full"
              onValueChange={(value) =>
                setActiveCategory(value as ActivityTemplate['category'])
              }
              value={activeCategory}
            >
              <TabsList className="grid w-full grid-cols-4">
                {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                  <TabsTrigger className="text-xs" key={key} value={key}>
                    {info.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.keys(CATEGORY_INFO).map((category) => (
                <TabsContent key={category} value={category}>
                  <ScrollArea className="h-96 pr-4">
                    <div className="space-y-3">
                      {getTemplatesByCategory(
                        category as ActivityTemplate['category']
                      ).map(renderTemplateCard)}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Right side - Template details */}
          {selectedTemplate && (
            <>
              <Separator className="h-96" orientation="vertical" />
              <div className="w-80">
                <div className="mb-4">
                  <h3 className="font-semibold text-lg">
                    {selectedTemplate.name}
                  </h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {selectedTemplate.description}
                  </p>
                </div>

                <ScrollArea className="h-80">
                  {renderTemplateDetails(selectedTemplate)}
                </ScrollArea>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)} size="sm" variant="outline">
            Cancel
          </Button>

          <Button
            disabled={!selectedTemplate}
            onClick={() =>
              selectedTemplate && handleLoadTemplate(selectedTemplate)
            }
            size="sm"
          >
            Load Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
