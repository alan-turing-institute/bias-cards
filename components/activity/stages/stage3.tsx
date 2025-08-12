'use client';

import { Edit3, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StageNavigation } from '@/components/stage-navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RationaleEditModal } from '@/components/ui/rationale-edit-modal';
import { StageGroupHeader } from '@/components/ui/stage-group-header';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LIFECYCLE_STAGES } from '@/lib/data/lifecycle-constants';
import { useHashRouter } from '@/lib/routing/hash-router';
import { navigateToActivity } from '@/lib/routing/navigation';
import { useCardsStore } from '@/lib/stores/cards-store';
import { useUnifiedActivityStore } from '@/lib/stores/unified-activity-store';
import type { Card as BiasCard, LifecycleStage } from '@/lib/types';
import { cn } from '@/lib/utils';

// Risk category colors and order
const RISK_CATEGORY_ORDER = [
  'high-risk',
  'medium-risk',
  'low-risk',
  'needs-discussion',
  'uncategorized',
];
const RISK_COLORS = {
  'high-risk': 'bg-red-100 border-red-300 text-red-800',
  'medium-risk': 'bg-amber-100 border-amber-300 text-amber-800',
  'low-risk': 'bg-green-100 border-green-300 text-green-800',
  'needs-discussion': 'bg-blue-100 border-blue-300 text-blue-800',
};

interface StageAssignmentWithCard {
  id: string;
  cardId: string;
  stage: LifecycleStage;
  annotation?: string;
  timestamp: string;
  card: BiasCard;
  riskCategory?: string;
}

interface AssignmentCardProps {
  assignment: StageAssignmentWithCard;
  viewMode: 'lifecycle' | 'risk';
  showDescriptions: boolean;
  onStartEdit: (assignment: StageAssignmentWithCard) => void;
}

// Component for rendering assignment cards
const AssignmentCard = ({
  assignment,
  viewMode,
  showDescriptions,
  onStartEdit,
}: AssignmentCardProps) => (
  <Card className="transition-all" key={assignment.id}>
    <CardContent className="p-4">
      <div className="space-y-3">
        {/* Card header */}
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h4 className="font-semibold text-lg">{assignment.card.name}</h4>
            {/* Conditional badge based on view mode */}
            {viewMode === 'lifecycle' && assignment.riskCategory && (
              <Badge
                className={cn(
                  'text-xs',
                  RISK_COLORS[
                    assignment.riskCategory as keyof typeof RISK_COLORS
                  ]
                )}
              >
                {assignment.riskCategory.replace('-', ' ')}
              </Badge>
            )}
            {viewMode === 'risk' && (
              <Badge className="text-xs" variant="secondary">
                {LIFECYCLE_STAGES[assignment.stage].name}
              </Badge>
            )}
          </div>
          {showDescriptions && (
            <p className="text-muted-foreground text-sm">
              {assignment.card.description}
            </p>
          )}
        </div>

        {/* Rationale section */}
        {assignment.annotation && assignment.annotation.trim().length > 0 ? (
          <div className="space-y-2">
            <h5 className="font-semibold text-sm">Rationale:</h5>
            <p className="text-sm leading-relaxed">{assignment.annotation}</p>
          </div>
        ) : (
          <div className="rounded-md border border-muted-foreground/30 border-dashed p-4 text-center">
            <p className="text-muted-foreground text-sm">
              No rationale provided yet. Click "Add Rationale" to document why
              this bias is relevant to this stage.
            </p>
          </div>
        )}

        {/* Edit/Add Rationale button positioned at bottom right */}
        <div className="flex justify-end">
          <Button
            onClick={() => onStartEdit(assignment)}
            size="sm"
            variant="outline"
          >
            <Edit3 className="mr-2 h-4 w-4" />
            {assignment.annotation && assignment.annotation.trim().length > 0
              ? 'Edit'
              : 'Add Rationale'}
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function Stage3Client() {
  const { currentRoute } = useHashRouter();

  const { currentActivity, setRationale, completeStage, isHydrated } =
    useUnifiedActivityStore();

  const activityId = currentRoute.activityId || currentActivity?.id;

  const { biasCards, loadCards } = useCardsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [_currentTab, setCurrentTab] = useState<'lifecycle' | 'risk'>(
    'lifecycle'
  );
  const [showOnlyNeedingRationale, setShowOnlyNeedingRationale] =
    useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] =
    useState<StageAssignmentWithCard | null>(null);
  const [showDescriptions, setShowDescriptions] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);

  // Get stage assignments from current activity
  const getStageAssignments = (): StageAssignmentWithCard[] => {
    if (!currentActivity) return [];

    const assignments: StageAssignmentWithCard[] = [];
    const biases = currentActivity.getBiases();

    Object.entries(biases).forEach(([biasId, bias]) => {
      bias.lifecycleAssignments.forEach((stage) => {
        const card = biasCards.find((c) => c.id === biasId);
        if (card) {
          assignments.push({
            id: `${biasId}-${stage}`,
            cardId: biasId,
            stage,
            annotation: bias.rationale[stage],
            timestamp: new Date().toISOString(),
            card,
            riskCategory: bias.riskCategory || undefined,
          });
        }
      });
    });

    return assignments;
  };

  // Load cards on mount
  useEffect(() => {
    loadCards();
    setIsInitializing(false);
  }, [loadCards]);

  // Check client-side rendering
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show loading state during hydration to prevent mismatch
  if (!isClient || isInitializing || !isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="font-semibold text-gray-900 text-lg">Loading...</h2>
          <p className="text-gray-600 text-sm">Preparing Stage 3</p>
        </div>
      </div>
    );
  }

  // Get enriched assignments from current activity
  const enrichedAssignments = getStageAssignments();

  // Filter assignments based on search term and rationale filter
  const filteredAssignments = enrichedAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.card.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      LIFECYCLE_STAGES[assignment.stage].name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const hasRationale =
      assignment.annotation && assignment.annotation.trim().length > 0;
    const matchesRationaleFilter = showOnlyNeedingRationale
      ? !hasRationale
      : true;

    return matchesSearch && matchesRationaleFilter;
  });

  // Group assignments by lifecycle stage
  const assignmentsByStage = filteredAssignments.reduce(
    (acc, assignment) => {
      if (!acc[assignment.stage]) {
        acc[assignment.stage] = [];
      }
      acc[assignment.stage].push(assignment);
      return acc;
    },
    {} as Record<LifecycleStage, StageAssignmentWithCard[]>
  );

  // Group assignments by risk category
  const assignmentsByRisk = filteredAssignments.reduce(
    (acc, assignment) => {
      const category = assignment.riskCategory || 'uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(assignment);
      return acc;
    },
    {} as Record<string, StageAssignmentWithCard[]>
  );

  // Check completion status
  const assignmentsWithRationale = enrichedAssignments.filter(
    (a) => a.annotation && a.annotation.trim().length > 0
  );
  const completionRate =
    enrichedAssignments.length > 0
      ? assignmentsWithRationale.length / enrichedAssignments.length
      : 0;
  const isStageComplete = completionRate >= 0.6; // 60% of assignments need rationale

  const handleCompleteStage = () => {
    if (activityId) {
      completeStage(3);
      navigateToActivity(activityId, 4);
    }
  };

  const handleStartEdit = (assignment: StageAssignmentWithCard) => {
    setEditingAssignment(assignment);
    setIsModalOpen(true);
  };

  const handleSaveRationale = (rationale: string) => {
    if (editingAssignment && currentActivity) {
      setRationale(
        editingAssignment.cardId,
        editingAssignment.stage,
        rationale
      );
    }
    setEditingAssignment(null);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <StageNavigation
        actions={
          <div className="flex items-center gap-4">
            <div className="relative">
              <Input
                className="w-64"
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search assignments..."
                value={searchTerm}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label
                  className="font-medium text-sm"
                  htmlFor="rationale-filter"
                >
                  Need Rationale
                </Label>
                <Switch
                  checked={showOnlyNeedingRationale}
                  id="rationale-filter"
                  onCheckedChange={setShowOnlyNeedingRationale}
                />
              </div>
              <div className="flex items-center gap-2">
                <Label
                  className="font-medium text-sm"
                  htmlFor="description-toggle"
                >
                  Show Descriptions
                </Label>
                <Switch
                  checked={showDescriptions}
                  id="description-toggle"
                  onCheckedChange={setShowDescriptions}
                />
              </div>
            </div>
          </div>
        }
        activityId={activityId || ''}
        canComplete={isStageComplete}
        completionLabel="Complete Stage 3"
        currentStage={3}
        instructions="Add rationale and reasoning for why specific biases were assigned to each lifecycle stage. This helps justify your decisions and provides context for mitigation planning."
        onCompleteStage={handleCompleteStage}
        progress={{
          current: assignmentsWithRationale.length,
          total: enrichedAssignments.length,
          label: `${assignmentsWithRationale.length}/${enrichedAssignments.length} biases have rationale provided for them`,
        }}
        title="Stage 3: Rationale Documentation"
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {enrichedAssignments.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-2 font-semibold text-lg">
                No assignments to document
              </h3>
              <p className="text-muted-foreground">
                Complete Stage 2 first by assigning bias cards to lifecycle
                stages.
              </p>
            </div>
          </div>
        ) : (
          <Tabs
            className="w-full"
            defaultValue="lifecycle"
            onValueChange={(value) =>
              setCurrentTab(value as 'lifecycle' | 'risk')
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lifecycle">By Lifecycle Stage</TabsTrigger>
              <TabsTrigger value="risk">By Risk Category</TabsTrigger>
            </TabsList>

            <TabsContent className="mt-6" value="lifecycle">
              <div className="space-y-6">
                {Object.entries(assignmentsByStage).map(
                  ([stage, assignments]) => (
                    <Card key={stage}>
                      <StageGroupHeader
                        itemCount={assignments.length}
                        itemLabel="cards"
                        stage={stage as LifecycleStage}
                        type="lifecycle"
                      />
                      <CardContent>
                        <div className="space-y-4">
                          {assignments.map((assignment) => (
                            <AssignmentCard
                              assignment={assignment}
                              key={assignment.id}
                              onStartEdit={handleStartEdit}
                              showDescriptions={showDescriptions}
                              viewMode="lifecycle"
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )
                )}
              </div>
            </TabsContent>

            <TabsContent className="mt-6" value="risk">
              <div className="space-y-6">
                {RISK_CATEGORY_ORDER.filter(
                  (category) => assignmentsByRisk[category]?.length > 0
                ).map((category) => {
                  const assignments = assignmentsByRisk[category];
                  return (
                    <Card key={category}>
                      <StageGroupHeader
                        itemCount={assignments.length}
                        itemLabel="cards"
                        riskCategory={category}
                        type="risk"
                      />
                      <CardContent>
                        <div className="space-y-4">
                          {assignments.map((assignment) => (
                            <AssignmentCard
                              assignment={assignment}
                              key={assignment.id}
                              onStartEdit={handleStartEdit}
                              showDescriptions={showDescriptions}
                              viewMode="risk"
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Rationale Edit Modal */}
      <RationaleEditModal
        cardName={editingAssignment?.card.name || ''}
        initialValue={editingAssignment?.annotation || ''}
        onOpenChange={setIsModalOpen}
        onSave={handleSaveRationale}
        open={isModalOpen}
        stageName={
          editingAssignment
            ? LIFECYCLE_STAGES[editingAssignment.stage].name
            : ''
        }
      />
    </div>
  );
}
