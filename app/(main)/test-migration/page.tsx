'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { BiasActivity } from '@/lib/activities/bias-activity';
import { BiasDeck } from '@/lib/cards/decks/bias-deck';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

export default function TestMigrationPage() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testActivity, setTestActivity] = useState<BiasActivity | null>(null);
  const [deck, setDeck] = useState<BiasDeck | null>(null);

  const { initialize, assignBiasRisk, getBiasRiskAssignments } =
    useWorkspaceStore();

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'passed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      case 'running':
        return 'animate-pulse bg-yellow-500';
      default:
        return 'bg-gray-300';
    }
  };

  const getTextColor = (status: TestResult['status']) => {
    switch (status) {
      case 'failed':
        return 'text-red-600';
      case 'passed':
        return 'text-green-600';
      default:
        return 'text-muted-foreground';
    }
  };

  const updateTest = (name: string, updates: Partial<TestResult>) => {
    setTests((prev) =>
      prev.map((test) => (test.name === name ? { ...test, ...updates } : test))
    );
  };

  const runTest = async (
    testName: string,
    testFn: () => void | Promise<void>
  ) => {
    updateTest(testName, { status: 'running' });
    const startTime = Date.now();

    try {
      await testFn();
      const duration = Date.now() - startTime;
      updateTest(testName, {
        status: 'passed',
        message: 'Test passed successfully',
        duration,
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      updateTest(testName, {
        status: 'failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        duration,
      });
    }
  };

  const runAllTests = async () => {
    if (isRunning) {
      return;
    }

    setIsRunning(true);

    // Test 1: Load BiasDeck
    await runTest('Load BiasDeck', async () => {
      const deckInstance = await BiasDeck.getInstance();
      if (!deckInstance || deckInstance.size() === 0) {
        throw new Error('Failed to load deck or deck is empty');
      }
      setDeck(deckInstance);
    });

    // Test 2: Workspace Store Initialize
    await runTest('Workspace Store Initialize', async () => {
      await initialize('Test Activity');
      const state = useWorkspaceStore.getState();
      if (!(state.currentActivity && state.currentDeck)) {
        throw new Error(
          'Failed to initialize workspace with activity and deck'
        );
      }
      setTestActivity(state.currentActivity);
    });

    // Test 3: Activity-based Bias Risk Assignment
    await runTest('Activity-based Bias Risk Assignment', () => {
      if (!deck) {
        throw new Error('Deck not loaded');
      }

      const biasCards = deck.getBiasCards();
      if (biasCards.length === 0) {
        throw new Error('No bias cards available');
      }

      // Test assigning a bias risk
      assignBiasRisk(biasCards[0].id, 'high-risk', 'Test annotation');

      // Verify the assignment
      const assignments = getBiasRiskAssignments();
      const hasAssignment = assignments.some(
        (a) => a.cardId === biasCards[0].id && a.riskCategory === 'high-risk'
      );

      if (!hasAssignment) {
        throw new Error('Bias risk assignment not found in store');
      }
    });

    setIsRunning(false);
  };

  const initializeTests = useCallback(() => {
    const testList: TestResult[] = [
      { name: 'Load BiasDeck', status: 'pending', message: 'Not started' },
      {
        name: 'Workspace Store Initialize',
        status: 'pending',
        message: 'Not started',
      },
      {
        name: 'Activity-based Bias Risk Assignment',
        status: 'pending',
        message: 'Not started',
      },
    ];

    setTests(testList);
  }, []);

  useEffect(() => {
    initializeTests();
  }, [initializeTests]);

  const passedTests = tests.filter((t) => t.status === 'passed').length;
  const failedTests = tests.filter((t) => t.status === 'failed').length;
  const totalTests = tests.length;

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <div className="space-y-6">
        <div>
          <h1 className="font-bold text-3xl">Activity-Based Migration Tests</h1>
          <p className="mt-2 text-muted-foreground">
            Integration tests to verify the activity-based workspace store
            refactoring.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button disabled={isRunning} onClick={runAllTests}>
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>

          <div className="text-muted-foreground text-sm">
            {passedTests}/{totalTests} tests passed{' '}
            {failedTests > 0 && `(${failedTests} failed)`}
          </div>
        </div>

        <div className="grid gap-4">
          {tests.map((test, index) => (
            <Card className="p-4" key={test.name}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${getStatusColor(
                      test.status
                    )}`}
                  />
                  <div>
                    <h3 className="font-medium">
                      {index + 1}. {test.name}
                    </h3>
                    <p className={`text-sm ${getTextColor(test.status)}`}>
                      {test.message}
                    </p>
                  </div>
                </div>
                {test.duration && (
                  <div className="text-muted-foreground text-xs">
                    {test.duration}ms
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {testActivity && (
          <Card className="p-4">
            <h3 className="mb-2 font-medium">Test Activity Details</h3>
            <div className="space-y-1 text-muted-foreground text-sm">
              <p>ID: {testActivity.id}</p>
              <p>Name: {testActivity.name}</p>
              <p>Current Stage: {testActivity.getCurrentStage()}</p>
              <p>Biases: {Object.keys(testActivity.getBiases()).length}</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
