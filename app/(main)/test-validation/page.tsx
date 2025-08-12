'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnifiedActivityStore } from '@/lib/stores/unified-activity-store';
import {
  cleanupBackup,
  migrateToV2,
  needsMigration,
  restoreFromBackup,
} from '@/lib/utils/migrate-to-v2';

// Migration Status Card Component
interface MigrationStatusCardProps {
  migrationStatus: string;
  needsMigrationFlag: boolean;
  onMigrate: () => void;
  onRestore: () => void;
  onCleanup: () => void;
  onRefresh: () => void;
  onClearAll: () => void;
}

function MigrationStatusCard({
  migrationStatus,
  needsMigrationFlag,
  onMigrate,
  onRestore,
  onCleanup,
  onRefresh,
  onClearAll,
}: MigrationStatusCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Migration Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded bg-muted p-4">
          <p className="font-mono">{migrationStatus}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            disabled={!needsMigrationFlag}
            onClick={onMigrate}
            variant={needsMigrationFlag ? 'default' : 'secondary'}
          >
            Migrate to v2
          </Button>
          <Button onClick={onRestore} variant="outline">
            Restore from Backup
          </Button>
          <Button onClick={onCleanup} variant="outline">
            Clean Up Backup
          </Button>
          <Button onClick={onRefresh} variant="outline">
            Refresh Status
          </Button>
          <Button onClick={onClearAll} variant="destructive">
            Clear All Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Type for legacy activity data structure
interface LegacyActivityData {
  workspace?: {
    state?: {
      activityState?: {
        name?: string;
        biases?: Record<string, unknown>;
        state?: {
          currentStage?: number;
        };
      };
    };
  };
  activity?: {
    state?: {
      activities?: Array<{
        id: string;
        title?: string;
        name?: string;
      }>;
    };
  };
}

interface NewActivityData {
  version?: string;
}

export default function TestV2MigrationPage() {
  return <TestV2MigrationPageContent />;
}

function TestV2MigrationPageContent() {
  return <TestV2MigrationPageWithState />;
}

function TestV2MigrationPageWithState() {
  const [migrationStatus, setMigrationStatus] = useState<string>('Checking...');
  const [oldData, setOldData] = useState<LegacyActivityData | null>(null);
  const [newData, setNewData] = useState<NewActivityData | null>(null);
  const [needsMigrationFlag, setNeedsMigrationFlag] = useState(false);

  const { currentActivityData, activities, initialize, isLoading, error } =
    useUnifiedActivityStore();

  const loadOldData = useCallback((): LegacyActivityData | null => {
    const oldWorkspace = localStorage.getItem('workspace-store');
    const oldActivity = localStorage.getItem('activity-store');

    if (oldWorkspace || oldActivity) {
      return {
        workspace: oldWorkspace ? JSON.parse(oldWorkspace) : null,
        activity: oldActivity ? JSON.parse(oldActivity) : null,
      };
    }
    return null;
  }, []);

  const loadNewData = useCallback((): NewActivityData | null => {
    const newStore = localStorage.getItem('bias-cards-store');
    return newStore ? JSON.parse(newStore) : null;
  }, []);

  const determineMigrationStatus = useCallback(
    (
      migrationNeeded: boolean,
      activityData: NewActivityData | null
    ): string => {
      if (migrationNeeded) {
        return 'Migration needed - old data detected';
      }
      if (activityData) {
        return 'Already on v2';
      }
      return 'No data found';
    },
    []
  );

  const checkStatus = useCallback(() => {
    const migrationNeeded = needsMigration();
    setNeedsMigrationFlag(migrationNeeded);

    const loadedOldData = loadOldData();
    if (loadedOldData) {
      setOldData(loadedOldData);
    }

    const loadedNewData = loadNewData();
    if (loadedNewData) {
      setNewData(loadedNewData);
    }

    setMigrationStatus(
      determineMigrationStatus(migrationNeeded, loadedNewData)
    );
  }, [determineMigrationStatus, loadNewData, loadOldData]);

  const handleMigrate = useCallback(async () => {
    setMigrationStatus('Migrating...');
    const result = await migrateToV2();

    if (result.success) {
      setMigrationStatus(`Migration successful! ${result.message}`);
      checkStatus();
      await initialize();
    } else {
      setMigrationStatus(`Migration failed: ${result.message}`);
    }
  }, [checkStatus, initialize]);

  const handleRestore = useCallback(() => {
    const restored = restoreFromBackup();
    const status = restored ? 'Restored from backup' : 'No backup found';
    setMigrationStatus(status);
    if (restored) {
      checkStatus();
    }
  }, [checkStatus]);

  const handleCleanup = useCallback(() => {
    cleanupBackup();
    setMigrationStatus('Backup cleaned up');
  }, []);

  const handleClearAll = useCallback(() => {
    if (confirm('This will clear ALL localStorage data. Are you sure?')) {
      localStorage.clear();
      setOldData(null);
      setNewData(null);
      setMigrationStatus('All data cleared');
      window.location.reload();
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return (
    <div className="container mx-auto space-y-6 p-6">
      <h1 className="font-bold text-3xl">V2 Migration Test Page</h1>

      <MigrationStatusCard
        migrationStatus={migrationStatus}
        needsMigrationFlag={needsMigrationFlag}
        onCleanup={handleCleanup}
        onClearAll={handleClearAll}
        onMigrate={handleMigrate}
        onRefresh={checkStatus}
        onRestore={handleRestore}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Old Data (v1)</CardTitle>
          </CardHeader>
          <CardContent>
            {oldData ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Workspace Store:</h3>
                  <div className="mt-2 max-h-64 overflow-y-auto rounded bg-muted p-2">
                    {oldData.workspace?.state?.activityState ? (
                      <div>
                        <p>
                          Activity: {oldData.workspace.state.activityState.name}
                        </p>
                        <p>
                          Biases:{' '}
                          {
                            Object.keys(
                              oldData.workspace.state.activityState.biases || {}
                            ).length
                          }
                        </p>
                        <p>
                          Stage:{' '}
                          {
                            (
                              oldData.workspace.state
                                .activityState as unknown as {
                                state?: { currentStage?: number };
                              }
                            ).state?.currentStage
                          }
                        </p>
                        <details>
                          <summary className="cursor-pointer text-muted-foreground text-sm">
                            View raw
                          </summary>
                          <pre className="mt-2 whitespace-pre-wrap break-all text-xs">
                            {JSON.stringify(
                              oldData.workspace.state.activityState,
                              null,
                              2
                            )}
                          </pre>
                        </details>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No activity data</p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold">Activity Store:</h3>
                  <div className="mt-2 max-h-64 overflow-y-auto rounded bg-muted p-2">
                    {oldData?.activity?.state?.activities ? (
                      <div>
                        <p>
                          Activities:{' '}
                          {oldData?.activity?.state?.activities?.length || 0}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {oldData?.activity?.state?.activities?.map((a) => (
                            <li className="text-sm" key={a.id}>
                              • {a.title || a.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No activities</p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No old data found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>New Data (v2)</CardTitle>
          </CardHeader>
          <CardContent>
            {newData ? (
              <div className="space-y-4">
                <div>
                  <p>Version: {newData?.version || 'unknown'}</p>
                  <p>Hydrated: Unknown</p>
                  <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
                  {error && <p className="text-red-500">Error: {error}</p>}
                </div>

                {currentActivityData && (
                  <div>
                    <h3 className="font-semibold">Current Activity:</h3>
                    <div className="mt-2 rounded bg-muted p-2">
                      <p>Name: {currentActivityData.name}</p>
                      <p>ID: {currentActivityData.id}</p>
                      <p>
                        Biases: {Object.keys(currentActivityData.biases).length}
                      </p>
                      <p>
                        Current Stage: {currentActivityData.state.currentStage}
                      </p>
                      <p>
                        Completed Stages:{' '}
                        {currentActivityData.state.completedStages.join(', ') ||
                          'None'}
                      </p>
                    </div>
                  </div>
                )}

                {activities.length > 0 && (
                  <div>
                    <h3 className="font-semibold">Activities List:</h3>
                    <ul className="mt-2 space-y-1">
                      {activities.map((a) => (
                        <li className="rounded bg-muted p-2 text-sm" key={a.id}>
                          <p>• {a.name}</p>
                          <p className="ml-2 text-muted-foreground text-xs">
                            Stage {a.currentStage} | {a.biasCount} biases |{' '}
                            {a.mitigationCount} mitigations
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <details>
                  <summary className="cursor-pointer text-muted-foreground text-sm">
                    View raw v2 data
                  </summary>
                  <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap break-all text-xs">
                    {JSON.stringify(newData, null, 2)}
                  </pre>
                </details>
              </div>
            ) : (
              <p className="text-muted-foreground">No v2 data found</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Import/Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            After migration, test that you can export the current activity and
            re-import it successfully.
          </p>
          <div className="flex gap-2">
            <Button
              disabled={!currentActivityData}
              onClick={() => {
                if (currentActivityData) {
                  const blob = new Blob(
                    [JSON.stringify(currentActivityData, null, 2)],
                    {
                      type: 'application/json',
                    }
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `test-export-${Date.now()}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                }
              }}
            >
              Export Current Activity
            </Button>

            <Button variant="outline">
              <label className="cursor-pointer" htmlFor="import-file">
                Import Activity
                <input
                  accept=".json"
                  className="hidden"
                  id="import-file"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const store = useUnifiedActivityStore.getState();
                      const result = await store.importActivity(file);
                      alert(result.message);
                      if (result.success) {
                        checkStatus();
                      }
                    }
                  }}
                  type="file"
                />
              </label>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
