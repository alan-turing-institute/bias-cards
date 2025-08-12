'use client';

import { FileText, Folder, RefreshCw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { googleDriveService } from '@/lib/services/google-drive';
import { useAuthStore } from '@/lib/stores';
import { cn } from '@/lib/utils';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime: string;
  size?: string;
}

interface DriveFileManagerProps {
  onFileSelect?: (file: DriveFile) => void;
  onFileDelete?: (fileId: string) => void;
  className?: string;
}

export function DriveFileManager({
  onFileSelect,
  onFileDelete,
  className,
}: DriveFileManagerProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<DriveFile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.accessToken) {
      googleDriveService.setAccessToken(user.accessToken);
    }
  }, [isAuthenticated, user]);

  const loadFiles = async () => {
    if (!(isAuthenticated && user?.accessToken)) {
      setError('Please sign in to view your files');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const fileList = await googleDriveService.listFiles();
      setFiles(fileList);
    } catch (_err) {
      setError('Failed to load files from Google Drive');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!(isAuthenticated && user?.accessToken)) {
      return;
    }

    try {
      await googleDriveService.deleteFile(fileId);
      setFiles(files.filter((f) => f.id !== fileId));
      onFileDelete?.(fileId);
    } catch (_err) {
      setError('Failed to delete file');
    }
  };

  const handleSelectFile = (file: DriveFile) => {
    setSelectedFile(file);
    onFileSelect?.(file);
  };

  const formatFileSize = (bytes?: string) => {
    if (!bytes) {
      return 'N/A';
    }
    const size = Number.parseInt(bytes, 10);
    if (size < 1024) {
      return `${size} B`;
    }
    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('folder')) {
      return <Folder className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => {
            setDialogOpen(true);
            loadFiles();
          }}
          variant="outline"
        >
          <Folder className="mr-2 h-4 w-4" />
          Manage Drive Files
        </Button>
      </DialogTrigger>
      <DialogContent className={cn('max-w-4xl', className)}>
        <DialogHeader>
          <DialogTitle>Google Drive Files</DialogTitle>
          <DialogDescription>
            Manage your BiasCards files stored in Google Drive
          </DialogDescription>
        </DialogHeader>

        <div className="mb-4 flex justify-end">
          <Button
            disabled={loading}
            onClick={loadFiles}
            size="sm"
            variant="ghost"
          >
            <RefreshCw
              className={cn('mr-2 h-4 w-4', loading && 'animate-spin')}
            />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-destructive">
            {error}
          </div>
        )}

        <ScrollArea className="h-[400px] w-full rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]" />
                <TableHead>Name</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(() => {
                if (loading) {
                  return (
                    <TableRow>
                      <TableCell className="py-8 text-center" colSpan={5}>
                        <RefreshCw className="mx-auto mb-2 h-6 w-6 animate-spin" />
                        Loading files...
                      </TableCell>
                    </TableRow>
                  );
                }

                if (files.length === 0) {
                  return (
                    <TableRow>
                      <TableCell
                        className="py-8 text-center text-muted-foreground"
                        colSpan={5}
                      >
                        No files found
                      </TableCell>
                    </TableRow>
                  );
                }

                return files.map((file) => (
                  <TableRow
                    className={cn(
                      'cursor-pointer hover:bg-muted/50',
                      selectedFile?.id === file.id && 'bg-muted'
                    )}
                    key={file.id}
                    onClick={() => handleSelectFile(file)}
                  >
                    <TableCell>{getFileIcon(file.mimeType)}</TableCell>
                    <TableCell className="font-medium">{file.name}</TableCell>
                    <TableCell>{formatDate(file.modifiedTime)}</TableCell>
                    <TableCell>{formatFileSize(file.size)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFile(file.id);
                        }}
                        size="icon"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ));
              })()}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
