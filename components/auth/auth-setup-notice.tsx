'use client';

import { AlertCircle, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export function AuthSetupNotice() {
  const hasClientId = !!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  if (hasClientId) {
    return null;
  }

  return (
    <Alert className="mb-4 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
      <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      <AlertTitle className="text-amber-900 dark:text-amber-100">
        Google Authentication Not Configured
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        <p className="text-amber-800 dark:text-amber-200">
          To enable sign-in and cloud storage features, you need to set up
          Google OAuth:
        </p>
        <ol className="list-inside list-decimal space-y-1 text-amber-700 text-sm dark:text-amber-300">
          <li>Create a Google Cloud Project and enable APIs</li>
          <li>Configure OAuth consent screen</li>
          <li>Create OAuth 2.0 credentials</li>
          <li>
            Copy{' '}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-900">
              .env.sample
            </code>{' '}
            to{' '}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-900">
              .env.local
            </code>
          </li>
          <li>
            Add your Google Client ID to the{' '}
            <code className="rounded bg-amber-100 px-1 py-0.5 text-xs dark:bg-amber-900">
              .env.local
            </code>{' '}
            file
          </li>
        </ol>
        <div className="mt-3 flex gap-2">
          <Link href="/docs/GOOGLE_AUTH_SETUP.md" target="_blank">
            <Button size="sm" variant="outline">
              <ExternalLink className="mr-2 h-3 w-3" />
              View Setup Guide
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
}
