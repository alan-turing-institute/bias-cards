'use client';

import { Check, Copy } from 'lucide-react';
import { type ReactNode, useState } from 'react';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  children: ReactNode;
  language?: string;
  className?: string;
}

export function CodeBlock({ children, language, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    const codeElement = document.querySelector('#code-content');
    const text = codeElement?.textContent || '';
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-4 overflow-hidden rounded-lg border bg-secondary/50">
      {language && (
        <div className="flex items-center justify-between border-b bg-secondary/80 px-4 py-2">
          <span className="text-muted-foreground text-xs">{language}</span>
          <button
            className="flex items-center gap-1 rounded px-2 py-1 text-muted-foreground text-xs transition-colors hover:bg-secondary hover:text-foreground"
            onClick={copyToClipboard}
            type="button"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
      )}
      <pre
        className={cn(
          'overflow-x-auto p-4 text-sm',
          !language && 'rounded-lg',
          className
        )}
        id="code-content"
      >
        {children}
      </pre>
    </div>
  );
}
