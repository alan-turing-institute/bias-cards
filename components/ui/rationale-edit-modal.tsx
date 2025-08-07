'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface RationaleEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cardName: string;
  stageName: string;
  initialValue?: string;
  onSave: (rationale: string) => void;
}

export function RationaleEditModal({
  open,
  onOpenChange,
  cardName,
  stageName,
  initialValue = '',
  onSave,
}: RationaleEditModalProps) {
  const [rationaleText, setRationaleText] = useState(initialValue);

  // Sync state with initialValue prop when it changes
  useEffect(() => {
    setRationaleText(initialValue);
  }, [initialValue]);

  // Clear state when modal closes
  useEffect(() => {
    if (!open) {
      setRationaleText('');
    }
  }, [open]);

  const handleSave = () => {
    onSave(rationaleText.trim());
    onOpenChange(false);
  };

  const handleCancel = () => {
    setRationaleText(initialValue);
    onOpenChange(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    onOpenChange(newOpen);
  };

  return (
    <Dialog onOpenChange={handleOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initialValue ? 'Edit' : 'Add'} Rationale</DialogTitle>
          <DialogDescription>
            Explain why "{cardName}" is relevant to the "{stageName}" stage.
            Consider the potential impact, likelihood of occurrence, and
            specific concerns for your project context.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Textarea
              className="min-h-32"
              id="rationale-textarea"
              onChange={(e) => setRationaleText(e.target.value)}
              placeholder="Enter your rationale here..."
              rows={6}
              value={rationaleText}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleCancel} variant="outline">
            Cancel
          </Button>
          <Button disabled={!rationaleText.trim()} onClick={handleSave}>
            Save Rationale
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
