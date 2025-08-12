'use client';

import { CheckCircle2, FileText, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface ActivityCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerateReport: () => void;
  onReturnToDashboard: () => void;
  activityName?: string;
}

export function ActivityCompletionDialog({
  open,
  onOpenChange,
  onGenerateReport,
  onReturnToDashboard,
  activityName = 'Activity',
}: ActivityCompletionDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
            <DialogTitle>Activity Complete!</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Congratulations! You've completed all 5 stages of {activityName}.
            What would you like to do next?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 py-4">
          <Button
            className="h-auto w-full justify-start p-4 text-left"
            onClick={() => {
              onGenerateReport();
              onOpenChange(false);
            }}
            variant="outline"
          >
            <FileText className="mr-3 h-5 w-5 flex-shrink-0 text-primary" />
            <div className="flex-1 space-y-1">
              <div className="font-semibold">Generate Report</div>
              <div className="text-muted-foreground text-xs">
                Create a comprehensive bias management report
              </div>
            </div>
          </Button>

          <Button
            className="h-auto w-full justify-start p-4 text-left"
            onClick={() => {
              onReturnToDashboard();
              onOpenChange(false);
            }}
            variant="outline"
          >
            <Home className="mr-3 h-5 w-5 flex-shrink-0 text-primary" />
            <div className="flex-1 space-y-1">
              <div className="font-semibold">Return to Dashboard</div>
              <div className="text-muted-foreground text-xs">
                Go back to the activities dashboard
              </div>
            </div>
          </Button>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} variant="ghost">
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
