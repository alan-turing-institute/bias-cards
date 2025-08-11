'use client';

import { AlertCircle, CheckCircle, Info, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ValidationResult } from '@/lib/activities/activity';
import type { BiasActivity } from '@/lib/activities/bias-activity';
import { BiasDeck } from '@/lib/cards/decks/bias-deck';
import { createDemoActivities } from '@/lib/data/demo-activities';
import { BiasActivityValidator } from '@/lib/validation/bias-activity-validation';

interface ValidationTest {
  name: string;
  result: 'pending' | 'pass' | 'fail' | 'warning';
  message?: string;
  details?: Record<string, unknown> | unknown[];
}

export default function TestValidationPage() {
  const [activity, setActivity] = useState<BiasActivity | null>(null);
  const [deck, setDeck] = useState<BiasDeck | null>(null);
  const [loading, setLoading] = useState(true);
  const [validationResults, setValidationResults] =
    useState<ValidationResult | null>(null);
  const [tests, setTests] = useState<ValidationTest[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<
    'ai-risk' | 'fair-lending'
  >('ai-risk');

  // biome-ignore lint/correctness/useExhaustiveDependencies: selectedActivity is intentionally used to trigger reload
  useEffect(() => {
    loadActivity();
  }, [selectedActivity]);

  const loadActivity = async () => {
    setLoading(true);
    try {
      const loadedDeck = await BiasDeck.getInstance();
      setDeck(loadedDeck);

      const { aiRiskDemo, fairLendingDemo } = await createDemoActivities();
      const currentActivity =
        selectedActivity === 'ai-risk' ? aiRiskDemo : fairLendingDemo;
      setActivity(currentActivity);

      // Run initial validation
      runValidation(currentActivity, loadedDeck);
    } catch (_error) {
      // Error loading activity
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Comprehensive validation test suite
  const runValidation = (
    activityToValidate: BiasActivity,
    deckToUse: BiasDeck
  ) => {
    const testResults: ValidationTest[] = [];

    // Test 1: Basic validation
    const basicValidation = activityToValidate.validate();
    testResults.push({
      name: 'Basic Validation',
      result: basicValidation.valid ? 'pass' : 'fail',
      message: basicValidation.valid
        ? 'All basic validation checks passed'
        : 'Basic validation failed',
      details: basicValidation.errors,
    });

    // Test 2: Strict validation
    const strictValidation = activityToValidate.validate(true);
    testResults.push({
      name: 'Strict Validation',
      result: strictValidation.valid ? 'pass' : 'fail',
      message: strictValidation.valid
        ? 'All strict validation checks passed'
        : 'Strict validation found issues',
      details: strictValidation.errors,
    });

    // Test 3: Stage progression
    const canAdvance = activityToValidate.canAdvanceStage();
    testResults.push({
      name: 'Can Advance Stage',
      result: canAdvance ? 'pass' : 'warning',
      message: canAdvance
        ? `Can advance from stage ${activityToValidate.getCurrentStage()}`
        : `Cannot advance from stage ${activityToValidate.getCurrentStage()}`,
    });

    // Test 4: Stage warnings
    const warnings = activityToValidate.getStageWarnings();
    testResults.push({
      name: 'Stage Warnings',
      result: warnings.length === 0 ? 'pass' : 'warning',
      message:
        warnings.length === 0
          ? 'No warnings for current stage'
          : `${warnings.length} warning(s) found`,
      details: warnings,
    });

    // Test 5: Completion status
    const completionStatus = activityToValidate.getCompletionStatus();
    testResults.push({
      name: 'Completion Status',
      result: 'pass',
      message: `Overall progress: ${Math.round(completionStatus.overallProgress * 100)}%`,
      details: { ...completionStatus },
    });

    // Test 6: Progress metrics
    const progressMetrics = activityToValidate.getProgressMetrics();
    testResults.push({
      name: 'Progress Metrics',
      result: 'pass',
      message: `${progressMetrics.assessedBiases}/${progressMetrics.totalBiases} biases assessed`,
      details: { ...progressMetrics },
    });

    // Test 7: Validator advanced features
    const validator = new BiasActivityValidator(activityToValidate, deckToUse, {
      strict: true,
      completionCriteria: {
        stage1: { minBiases: 3, allMustHaveRisk: true },
        stage2: { minLifecycleAssignments: 2, requireAllBiasesAssigned: true },
        stage3: { requireRationaleForAll: true, minRationaleLength: 20 },
        stage4: {
          requireMitigationsForHighRisk: true,
          minMitigationsPerBias: 1,
        },
        stage5: { requireImplementationNotes: true, minEffectivenessRating: 3 },
      },
    });

    const advancedValidation = validator.validate();
    testResults.push({
      name: 'Advanced Validation (Custom Criteria)',
      result: advancedValidation.valid ? 'pass' : 'fail',
      message: advancedValidation.valid
        ? 'Passes custom completion criteria'
        : 'Does not meet custom criteria',
      details: advancedValidation.errors,
    });

    setTests(testResults);
    setValidationResults(basicValidation);
  };

  const getTestIcon = (result: ValidationTest['result']) => {
    switch (result) {
      case 'pass':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto flex min-h-[400px] items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!(activity && deck)) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-muted-foreground">
          Failed to load activity or deck
        </div>
      </div>
    );
  }

  const completionStatus = activity.getCompletionStatus();
  const progressMetrics = activity.getProgressMetrics();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="font-bold text-3xl">Validation System Test</h1>
        <p className="text-muted-foreground">
          Testing BiasActivityValidator with demo activities
        </p>
      </div>

      <div className="mb-6">
        <Tabs
          onValueChange={(v) =>
            setSelectedActivity(v as 'ai-risk' | 'fair-lending')
          }
          value={selectedActivity}
        >
          <TabsList>
            <TabsTrigger value="ai-risk">AI Risk Assessment</TabsTrigger>
            <TabsTrigger value="fair-lending">Fair Lending</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Activity Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-1 font-medium">Name</div>
                <div className="text-muted-foreground text-sm">
                  {activity.name}
                </div>
              </div>

              <div>
                <div className="mb-1 font-medium">Current Stage</div>
                <div className="text-muted-foreground text-sm">
                  Stage {activity.getCurrentStage()}
                </div>
              </div>

              <div>
                <div className="mb-1 font-medium">Overall Progress</div>
                <Progress
                  className="mb-2"
                  value={completionStatus.overallProgress * 100}
                />
                <div className="text-muted-foreground text-sm">
                  {Math.round(completionStatus.overallProgress * 100)}% complete
                </div>
              </div>

              <div>
                <div className="mb-2 font-medium">Stage Completion</div>
                <div className="space-y-1">
                  {Object.entries(completionStatus.stages).map(
                    ([stage, complete]) => (
                      <div
                        className="flex items-center justify-between text-sm"
                        key={stage}
                      >
                        <span className="capitalize">
                          {stage.replace('stage', 'Stage ')}
                        </span>
                        {complete ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-gray-300" />
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 font-medium">Progress Metrics</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Total Biases</span>
                    <span className="font-medium">
                      {progressMetrics.totalBiases}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assessed</span>
                    <span className="font-medium">
                      {progressMetrics.assessedBiases}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Assigned to Lifecycle</span>
                    <span className="font-medium">
                      {progressMetrics.assignedBiases}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>With Rationale</span>
                    <span className="font-medium">
                      {progressMetrics.biasesWithRationale}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>With Mitigations</span>
                    <span className="font-medium">
                      {progressMetrics.biasesWithMitigations}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Implemented</span>
                    <span className="font-medium">
                      {progressMetrics.implementedMitigations}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Validation Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tests.map((test) => (
                  <div className="rounded-lg border p-3" key={test.name}>
                    <div className="flex items-start space-x-3">
                      {getTestIcon(test.result)}
                      <div className="flex-1">
                        <div className="font-medium">{test.name}</div>
                        {test.message && (
                          <div className="mt-1 text-muted-foreground text-sm">
                            {test.message}
                          </div>
                        )}
                        {test.details && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-blue-500 text-sm">
                              View Details
                            </summary>
                            <pre className="mt-2 overflow-auto rounded bg-gray-50 p-2 text-xs dark:bg-gray-900">
                              {test.details
                                ? JSON.stringify(test.details, null, 2)
                                : ''}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 space-y-2">
                <Button
                  className="w-full"
                  onClick={() => {
                    if (activity && deck) {
                      runValidation(activity, deck);
                    }
                  }}
                >
                  Re-run Validation
                </Button>

                <Button
                  className="w-full"
                  disabled={!activity?.canAdvanceStage()}
                  onClick={() => {
                    if (activity?.canAdvanceStage()) {
                      // Test stage advancement
                      activity.advanceStage();
                      runValidation(activity, deck);
                    }
                  }}
                  variant="outline"
                >
                  Advance to Next Stage
                </Button>
              </div>
            </CardContent>
          </Card>

          {validationResults && !validationResults.valid && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-red-600">
                  Validation Errors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {validationResults.errors?.map((error) => (
                    <div
                      className="text-sm"
                      key={`${error.type}-${error.message}`}
                    >
                      <span className="font-medium text-red-600">
                        {error.type}:
                      </span>{' '}
                      {error.message}
                      {error.biasId && (
                        <span className="text-gray-500">
                          {' '}
                          (Bias: {error.biasId})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {activity.getStageWarnings().length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-yellow-600">
                  Stage Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {activity.getStageWarnings().map((warning) => (
                    <div
                      className="flex items-start space-x-2 text-sm"
                      key={warning}
                    >
                      <Info className="mt-0.5 h-4 w-4 text-yellow-500" />
                      <span>{warning}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
