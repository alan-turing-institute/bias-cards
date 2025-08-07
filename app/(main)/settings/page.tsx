'use client';

import { Cloud, Moon, Save, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { PageHeader } from '@/components/page-header';
import { DriveFileManager } from '@/components/storage/drive-file-manager';
import { DriveSyncButton } from '@/components/storage/drive-sync-button';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { syncManager } from '@/lib/services/sync-manager';
import { useAuthStore, useSettingsStore } from '@/lib/stores';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { settings, updateSettings } = useSettingsStore();
  const [autoSync, setAutoSync] = useState(false);
  const [syncOnSave, setSyncOnSave] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>(
    'idle'
  );

  useEffect(() => {
    // Load settings from store
    setAutoSync(settings?.autoSync ?? false);
    setSyncOnSave(settings?.syncOnSave ?? false);
  }, [settings]);

  const handleSaveSettings = () => {
    setSaveStatus('saving');

    updateSettings({
      autoSync,
      syncOnSave,
    });

    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 500);
  };

  const handleManualSync = async () => {
    if (!user?.accessToken) {
      return;
    }

    const _result = await syncManager.syncToGoogleDrive(user.accessToken);
  };

  return (
    <div className="flex-1 space-y-6 p-8">
      <PageHeader
        description="Manage your account and application preferences"
        title="Settings"
      />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account
            </CardTitle>
            <CardDescription>
              Manage your Google account connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAuthenticated && user ? (
              <>
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {user.email}
                    </p>
                  </div>
                </div>
                <Separator />
                <Button className="w-full" onClick={logout} variant="outline">
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  Sign in with Google to enable cloud storage and sync
                </p>
                <GoogleLoginButton className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the application appearance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme">Dark Mode</Label>
                <p className="text-muted-foreground text-sm">
                  Toggle between light and dark themes
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                id="theme"
                onCheckedChange={(checked) =>
                  setTheme(checked ? 'dark' : 'light')
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Sync Settings */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Google Drive Sync
            </CardTitle>
            <CardDescription>
              Configure automatic sync with Google Drive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isAuthenticated ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-sync">Auto Sync</Label>
                    <p className="text-muted-foreground text-sm">
                      Automatically sync data every 5 minutes
                    </p>
                  </div>
                  <Switch
                    checked={autoSync}
                    id="auto-sync"
                    onCheckedChange={setAutoSync}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="sync-on-save">Sync on Save</Label>
                    <p className="text-muted-foreground text-sm">
                      Sync to Google Drive whenever you save changes
                    </p>
                  </div>
                  <Switch
                    checked={syncOnSave}
                    id="sync-on-save"
                    onCheckedChange={setSyncOnSave}
                  />
                </div>

                <Separator />

                <div className="flex gap-2">
                  <DriveSyncButton
                    onSync={handleManualSync}
                    size="default"
                    variant="outline"
                  />
                  <DriveFileManager />
                </div>
              </>
            ) : (
              <div className="py-8 text-center">
                <p className="mb-4 text-muted-foreground">
                  Sign in to enable Google Drive sync
                </p>
                <GoogleLoginButton />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Save Settings Button */}
      {isAuthenticated && (
        <div className="flex justify-end">
          <Button
            disabled={saveStatus === 'saving'}
            onClick={handleSaveSettings}
          >
            {(() => {
              if (saveStatus === 'saving') {
                return 'Saving...';
              }
              if (saveStatus === 'saved') {
                return 'Saved!';
              }
              return (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              );
            })()}
          </Button>
        </div>
      )}
    </div>
  );
}
