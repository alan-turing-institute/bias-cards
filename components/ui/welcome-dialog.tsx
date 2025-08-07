'use client';

import { BookOpen, Play } from 'lucide-react';
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
import { useOnboardingStore } from '@/lib/stores/onboarding-store';

export function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  const {
    showWelcomeDialog,
    hasCompletedOnboarding,
    hasSeenWelcome,
    startOnboarding,
    skipOnboarding,
    setShowWelcomeDialog,
  } = useOnboardingStore();

  useEffect(() => {
    // Show welcome dialog for first-time users who haven't seen it yet
    if (!(hasSeenWelcome || hasCompletedOnboarding || open)) {
      // Small delay to let the page load
      const timer = setTimeout(() => {
        setOpen(true);
        setShowWelcomeDialog(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [hasSeenWelcome, hasCompletedOnboarding, open, setShowWelcomeDialog]);

  const handleStartTour = () => {
    setOpen(false);
    setShowWelcomeDialog(false);
    startOnboarding();
  };

  const handleSkip = () => {
    setOpen(false);
    setShowWelcomeDialog(false);
    skipOnboarding();
  };

  if ((hasCompletedOnboarding || hasSeenWelcome) && !showWelcomeDialog) {
    return null;
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-500/20">
            <BookOpen className="h-8 w-8 text-amber-500" />
          </div>
          <DialogTitle className="text-center text-xl">
            Welcome to Bias Cards
          </DialogTitle>
          <DialogDescription className="text-center">
            An interactive tool for identifying and mitigating bias in machine
            learning projects.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-900">
            <h4 className="font-medium text-sm">What you'll learn:</h4>
            <ul className="mt-2 space-y-1 text-muted-foreground text-sm">
              <li>• Identify different types of ML bias</li>
              <li>• Map biases to project lifecycle stages</li>
              <li>• Apply effective mitigation strategies</li>
              <li>• Generate comprehensive analysis reports</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button className="w-full" onClick={handleStartTour}>
            <Play className="mr-2 h-4 w-4" />
            Start Guided Tour
          </Button>
          <Button className="w-full" onClick={handleSkip} variant="outline">
            Skip
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
