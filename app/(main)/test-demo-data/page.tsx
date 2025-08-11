'use client';

import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { BiasActivity } from '@/lib/activities/bias-activity';
import { BiasDeck } from '@/lib/cards/decks/bias-deck';
import {
  createDemoActivities,
  createV2DemoExportFormat,
  exportDemoActivityToJSON,
} from '@/lib/data/demo-activities';
import {
  convertV2ToLegacyActivity,
  loadAllDemoActivitiesV2,
  loadDemoActivityV2,
} from '@/lib/data/demo-content';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  data?: Record<string, unknown>;
}

export default function TestDemoDataPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([
    { name: 'Initialize Deck', status: 'pending' },
    { name: 'Create Demo Activities', status: 'pending' },
    { name: 'Export to JSON', status: 'pending' },
    { name: 'Load from JSON Files', status: 'pending' },
    { name: 'Convert to Legacy Format', status: 'pending' },
    { name: 'Validate Data Integrity', status: 'pending' },
  ]);
  const [currentActivity, setCurrentActivity] = useState<BiasActivity | null>(
    null
  );

  const updateTestResult = (name: string, result: Partial<TestResult>) => {
    setTestResults((prev) =>
      prev.map((test) => (test.name === name ? { ...test, ...result } : test))
    );
  };

  const runTests = async () => {
    // Reset all tests
    setTestResults((prev) =>
      prev.map((test) => ({ ...test, status: 'pending' }))
    );

    try {
      // Test 1: Initialize Deck
      updateTestResult('Initialize Deck', { status: 'running' });
      const deck = await BiasDeck.getInstance();
      updateTestResult('Initialize Deck', {
        status: 'success',
        message: `Deck loaded with ${deck.size()} cards`,
      });

      // Test 2: Create Demo Activities
      updateTestResult('Create Demo Activities', { status: 'running' });
      const { aiRiskDemo, fairLendingDemo } = await createDemoActivities();
      setCurrentActivity(aiRiskDemo);
      updateTestResult('Create Demo Activities', {
        status: 'success',
        message: 'Created 2 demo activities',
        data: {
          aiRisk: aiRiskDemo.name,
          fairLending: fairLendingDemo.name,
        },
      });

      // Test 3: Export to JSON
      updateTestResult('Export to JSON', { status: 'running' });
      const aiRiskData = exportDemoActivityToJSON(aiRiskDemo);
      const fairLendingData = exportDemoActivityToJSON(fairLendingDemo);
      createV2DemoExportFormat(aiRiskData); // Test that export format works
      updateTestResult('Export to JSON', {
        status: 'success',
        message: 'Exported both activities to v2.0 format',
        data: {
          aiRiskBiases: Object.keys(aiRiskData.biases).length,
          fairLendingBiases: Object.keys(fairLendingData.biases).length,
        },
      });

      // Test 4: Load from JSON Files
      updateTestResult('Load from JSON Files', { status: 'running' });
      const loadedAiRisk = await loadDemoActivityV2('ai-risk-assessment');
      const loadedFairLending = await loadDemoActivityV2('fair-lending');

      if (!(loadedAiRisk && loadedFairLending)) {
        throw new Error('Failed to load demo activities from JSON files');
      }

      updateTestResult('Load from JSON Files', {
        status: 'success',
        message: 'Successfully loaded both demo activities from JSON',
        data: {
          aiRiskLoaded: loadedAiRisk !== null,
          fairLendingLoaded: loadedFairLending !== null,
        },
      });

      // Test 5: Convert to Legacy Format
      updateTestResult('Convert to Legacy Format', { status: 'running' });
      const legacyAiRisk = convertV2ToLegacyActivity(aiRiskDemo);
      const legacyFairLending = convertV2ToLegacyActivity(fairLendingDemo);
      updateTestResult('Convert to Legacy Format', {
        status: 'success',
        message: 'Converted to legacy format for backward compatibility',
        data: {
          aiRiskStages: Object.keys(legacyAiRisk.lifecycleStages || {}).length,
          fairLendingStages: Object.keys(
            legacyFairLending.lifecycleStages || {}
          ).length,
        },
      });

      // Test 6: Validate Data Integrity
      updateTestResult('Validate Data Integrity', { status: 'running' });
      const aiValidation = aiRiskDemo.validate();
      const fairValidation = fairLendingDemo.validate();
      const allValid = aiValidation.valid && fairValidation.valid;

      updateTestResult('Validate Data Integrity', {
        status: allValid ? 'success' : 'error',
        message: allValid
          ? 'All activities passed validation'
          : 'Validation errors found',
        data: {
          aiRiskErrors: aiValidation.errors,
          fairLendingErrors: fairValidation.errors,
        },
      });
    } catch (error) {
      // Test error logged internally
      // Mark remaining tests as error
      setTestResults((prev) =>
        prev.map((test) =>
          test.status === 'running' || test.status === 'pending'
            ? {
                ...test,
                status: 'error',
                message:
                  error instanceof Error ? error.message : 'Unknown error',
              }
            : test
        )
      );
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: Run only on mount
  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="font-bold text-3xl">Demo Data Test Page</h1>
        <p className="text-muted-foreground">
          Testing v2.0 demo data loading and conversion
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Test Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {testResults.map((test) => (
                  <div
                    className="flex items-start space-x-3 rounded-lg border p-3"
                    key={test.name}
                  >
                    {getStatusIcon(test.status)}
                    <div className="flex-1">
                      <div className="font-medium">{test.name}</div>
                      {test.message && (
                        <div className="text-muted-foreground text-sm">
                          {test.message}
                        </div>
                      )}
                      {test.data && (
                        <pre className="mt-2 text-xs">
                          <code>{JSON.stringify(test.data, null, 2)}</code>
                        </pre>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full" onClick={runTests}>
                Re-run Tests
              </Button>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Current Activity Details</CardTitle>
            </CardHeader>
            <CardContent>
              {currentActivity ? (
                <div className="space-y-3">
                  <div>
                    <div className="font-medium">Name</div>
                    <div className="text-muted-foreground text-sm">
                      {currentActivity.name}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Description</div>
                    <div className="text-muted-foreground text-sm">
                      {currentActivity.description}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Progress</div>
                    <div className="text-muted-foreground text-sm">
                      <pre className="text-xs">
                        <code>
                          {JSON.stringify(
                            currentActivity.getActivityProgress(),
                            null,
                            2
                          )}
                        </code>
                      </pre>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Biases</div>
                    <div className="text-muted-foreground text-sm">
                      {Object.keys(currentActivity.getBiases()).length} biases
                      tracked
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  No activity loaded
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Test File Loading</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={async () => {
                    const activity =
                      await loadDemoActivityV2('ai-risk-assessment');
                    if (activity) {
                      setCurrentActivity(activity);
                      alert('AI Risk Assessment demo loaded successfully!');
                    } else {
                      alert('Failed to load AI Risk Assessment demo');
                    }
                  }}
                >
                  Load AI Risk Assessment Demo
                </Button>
                <Button
                  className="w-full"
                  onClick={async () => {
                    const activity = await loadDemoActivityV2('fair-lending');
                    if (activity) {
                      setCurrentActivity(activity);
                      alert('Fair Lending demo loaded successfully!');
                    } else {
                      alert('Failed to load Fair Lending demo');
                    }
                  }}
                >
                  Load Fair Lending Demo
                </Button>
                <Button
                  className="w-full"
                  onClick={async () => {
                    const { aiRiskDemo, fairLendingDemo } =
                      await loadAllDemoActivitiesV2();
                    if (aiRiskDemo && fairLendingDemo) {
                      alert('Both demos loaded successfully!');
                      setCurrentActivity(aiRiskDemo);
                    } else {
                      alert('Failed to load all demos');
                    }
                  }}
                  variant="outline"
                >
                  Load All Demos
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
