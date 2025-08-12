'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useUnifiedActivityStore } from '@/lib/stores/unified-activity-store';
import {
  cleanupBackup,
  migrateToV2,
  needsMigration,
  restoreFromBackup,
} from '@/lib/utils/migrate-to-v2';

export default function TestV2MigrationPage() {
  const [migrationStatus, setMigrationStatus] = useState<string>('Checking...');
  const [oldData, setOldData] = useState<any>(null);
  const [newData, setNewData] = useState<any>(null);
  const [needsMigrationFlag, setNeedsMigrationFlag] = useState(false);

  const {
    currentActivityData,
    activities,
    initialize,
    isHydrated,
    isLoading,
    error,
  } = useUnifiedActivityStore();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = () => {
    // Check if migration is needed
    const migrationNeeded = needsMigration();
    setNeedsMigrationFlag(migrationNeeded);

    // Get old data if it exists
    const oldWorkspace = localStorage.getItem('workspace-store');
    const oldActivity = localStorage.getItem('activity-store');

    if (oldWorkspace || oldActivity) {
      setOldData({
        workspace: oldWorkspace ? JSON.parse(oldWorkspace) : null,
        activity: oldActivity ? JSON.parse(oldActivity) : null,
      });
    }

    // Get new data if it exists
    const newStore = localStorage.getItem('bias-cards-store');
    if (newStore) {
      setNewData(JSON.parse(newStore));
    }

    if (migrationNeeded) {
      setMigrationStatus('Migration needed - old data detected');
    } else if (newStore) {
      setMigrationStatus('Already on v2');
    } else {
      setMigrationStatus('No data found');
    }
  };

  const handleMigrate = async () => {
    setMigrationStatus('Migrating...');
    const result = await migrateToV2();

    if (result.success) {
      setMigrationStatus(`Migration successful! ${result.message}`);
      // Refresh the data display
      checkStatus();
      // Initialize the new store
      await initialize();
    } else {
      setMigrationStatus(`Migration failed: ${result.message}`);
    }
  };

  const handleRestore = () => {
    const restored = restoreFromBackup();
    if (restored) {
      setMigrationStatus('Restored from backup');
      checkStatus();
    } else {
      setMigrationStatus('No backup found');
    }
  };

  const handleCleanup = () => {
    cleanupBackup();
    setMigrationStatus('Backup cleaned up');
  };

  const handleClearAll = () => {
    if (confirm('This will clear ALL localStorage data. Are you sure?')) {
      localStorage.clear();
      setOldData(null);
      setNewData(null);
      setMigrationStatus('All data cleared');
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto space-y-6 p-6">
      <h1 className="font-bold text-3xl">V2 Migration Test Page</h1>

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
              onClick={handleMigrate}
              variant={needsMigrationFlag ? 'default' : 'secondary'}
            >
              Migrate to v2
            </Button>
            <Button onClick={handleRestore} variant="outline">
              Restore from Backup
            </Button>
            <Button onClick={handleCleanup} variant="outline">
              Clean Up Backup
            </Button>
            <Button onClick={checkStatus} variant="outline">
              Refresh Status
            </Button>
            <Button onClick={handleClearAll} variant="destructive">
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>

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
                            oldData.workspace.state.activityState.state
                              ?.currentStage
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
                    {oldData.activity?.state?.activities ? (
                      <div>
                        <p>
                          Activities: {oldData.activity.state.activities.length}
                        </p>
                        <ul className="mt-2 space-y-1">
                          {oldData.activity.state.activities.map((a: any) => (
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
                  <p>Version: {newData.version}</p>
                  <p>Hydrated: {isHydrated ? 'Yes' : 'No'}</p>
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
