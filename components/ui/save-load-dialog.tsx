'use client';

import { Download, Upload, X } from 'lucide-react';
import { useCallback, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  downloadWorkspaceAsFile,
  uploadWorkspaceFromFile,
} from '@/lib/persistence/file-operations';
import { useWorkspaceStore } from '@/lib/stores/workspace-store';

interface SaveLoadDialogProps {
  trigger: React.ReactNode;
}

export function SaveLoadDialog({ trigger }: SaveLoadDialogProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState('');
  const [description, setDescription] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const workspaceStore = useWorkspaceStore();
  const { stageAssignments, cardPairs, sessionId } = workspaceStore;

  const handleDownload = useCallback(async () => {
    const finalFileName =
      fileName.trim() ||
      `bias-cards-workspace-${new Date().toISOString().split('T')[0]}`;

    try {
      // Get the full workspace state excluding the store methods
      const workspace = {
        sessionId: workspaceStore.sessionId,
        name: workspaceStore.name,
        createdAt: workspaceStore.createdAt,
        lastModified: workspaceStore.lastModified,
        stageAssignments: workspaceStore.stageAssignments,
        cardPairs: workspaceStore.cardPairs,
        selectedCardIds: workspaceStore.selectedCardIds,
        customAnnotations: workspaceStore.customAnnotations,
        completedStages: workspaceStore.completedStages,
        activityProgress: workspaceStore.activityProgress,
        currentStage: workspaceStore.currentStage,
        // completedActivityStages: workspaceStore.completedActivityStages,
        biasRiskAssignments: workspaceStore.biasRiskAssignments,
      };

      await downloadWorkspaceAsFile(workspace, `${finalFileName}.json`);
      setOpen(false);

      // Reset form
      setFileName('');
      setDescription('');
    } catch (_error) {
      // Handle error silently
    }
  }, [fileName, workspaceStore]);

  const handleFileUpload = useCallback(async (file: File) => {
    try {
      setUploadError(null);
      const _workspace = await uploadWorkspaceFromFile(file);
      setOpen(false);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : 'Failed to load workspace'
      );
    }
  }, []);

  const handleFileInputChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        await handleFileUpload(file);
      }
    },
    [handleFileUpload]
  );

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      setDragOver(false);

      const files = event.dataTransfer.files;
      if (files.length > 0) {
        await handleFileUpload(files[0]);
      }
    },
    [handleFileUpload]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  }, []);

  const getWorkspaceStats = () => {
    const assignedCards = stageAssignments.length;
    const createdPairs = cardPairs.length;
    return { assignedCards, createdPairs };
  };

  const stats = getWorkspaceStats();

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Save & Load Workspace</DialogTitle>
          <DialogDescription>
            Export your current progress or load a previously saved workspace.
          </DialogDescription>
        </DialogHeader>

        <Tabs className="w-full" defaultValue="save">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="save">Save</TabsTrigger>
            <TabsTrigger value="load">Load</TabsTrigger>
          </TabsList>

          <TabsContent className="space-y-4" value="save">
            <div className="rounded-lg bg-gray-50 p-3">
              <h4 className="font-medium text-sm">Current Workspace</h4>
              <div className="mt-2 space-y-1 text-muted-foreground text-xs">
                <p>Session: {sessionId?.split('-')[1] || 'N/A'}</p>
                <p>Cards assigned: {stats.assignedCards}</p>
                <p>Pairs created: {stats.createdPairs}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileName">File Name</Label>
              <Input
                id="fileName"
                onChange={(e) => setFileName(e.target.value)}
                placeholder="workspace-name"
                value={fileName}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this workspace..."
                rows={2}
                value={description}
              />
            </div>

            <DialogFooter>
              <Button onClick={handleDownload} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download Workspace
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent className="space-y-4" value="load">
            <button
              aria-label="Drag and drop area for workspace file upload"
              className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                dragOver
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              type="button"
            >
              <Upload className="mx-auto h-8 w-8 text-gray-400" />
              <p className="mt-2 text-muted-foreground text-sm">
                Drag and drop a workspace file here, or click to browse
              </p>
              <Input
                accept=".json"
                className="mt-3"
                onChange={handleFileInputChange}
                type="file"
              />
            </button>

            {uploadError && (
              <div className="rounded-lg bg-red-50 p-3">
                <div className="flex items-start gap-2">
                  <X className="mt-0.5 h-4 w-4 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800 text-sm">
                      Upload Failed
                    </p>
                    <p className="text-red-700 text-xs">{uploadError}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="rounded-lg bg-amber-50 p-3">
              <p className="text-amber-800 text-xs">
                <strong>Note:</strong> Loading a workspace will replace your
                current progress. Consider saving your current work first.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
