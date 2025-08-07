'use client';

import { AlertCircle, CheckCircle, Clock, Target } from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Card as BiasCard, WorkspaceState } from '@/lib/types';
import {
  getNextAction,
  type ValidationGate,
  validateActivityCompletion,
} from '@/lib/validation/activity-validation';

interface ActivityProgressIndicatorProps {
  workspace: WorkspaceState;
  biasCards: BiasCard[];
  mitigationCards: BiasCard[];
  className?: string;
}

export function ActivityProgressIndicator({
  workspace,
  biasCards,
  mitigationCards,
  className,
}: ActivityProgressIndicatorProps) {
  const validation = useMemo(
    () => validateActivityCompletion(workspace, biasCards, mitigationCards),
    [
      workspace.stageAssignments,
      workspace.cardPairs,
      workspace.customAnnotations,
      biasCards,
      mitigationCards,
      workspace,
    ]
  );

  const getGateIcon = (gate: ValidationGate) => {
    if (gate.passed) {
      return <CheckCircle className="h-3 w-3 text-green-600" />;
    }
    if (gate.required) {
      return <AlertCircle className="h-3 w-3 text-red-500" />;
    }
    return <Clock className="h-3 w-3 text-amber-500" />;
  };

  const getProgressColor = () => {
    if (validation.canGenerateReport) {
      return 'bg-green-500';
    }
    if (validation.completionPercentage >= 60) {
      return 'bg-amber-500';
    }
    return 'bg-red-500';
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Activity Progress</h3>
            </div>
            <Badge
              className="text-xs"
              variant={validation.canGenerateReport ? 'default' : 'secondary'}
            >
              {validation.completionPercentage}%
            </Badge>
          </div>

          {/* Progress Bar */}
          <div>
            <Progress
              className="h-2"
              style={
                {
                  '--progress-foreground': getProgressColor(),
                } as React.CSSProperties
              }
              value={validation.completionPercentage}
            />
            <p className="mt-1 text-muted-foreground text-xs">
              {validation.canGenerateReport
                ? 'Ready for report generation!'
                : getNextAction(validation)}
            </p>
          </div>

          {/* Quick Status Gates */}
          <div className="flex flex-wrap items-center gap-2">
            <TooltipProvider>
              {validation.gates.map((gate) => (
                <Tooltip key={gate.id}>
                  <TooltipTrigger asChild>
                    <div
                      className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors ${(() => {
                        if (gate.passed) {
                          return 'border border-green-200 bg-green-50 text-green-700';
                        }
                        if (gate.required) {
                          return 'border border-red-200 bg-red-50 text-red-700';
                        }
                        return 'border border-amber-200 bg-amber-50 text-amber-700';
                      })()}`}
                    >
                      {getGateIcon(gate)}
                      <span className="font-medium">{gate.name}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs" side="bottom">
                    <div className="space-y-1">
                      <p className="font-medium text-xs">{gate.description}</p>
                      {gate.details && (
                        <p className="text-muted-foreground text-xs">
                          {gate.details}
                        </p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>

          {/* Success/Warning Message */}
          {validation.canGenerateReport ? (
            <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-2">
              <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
              <p className="text-green-700 text-xs">
                All required criteria met. You can generate your bias analysis
                report.
              </p>
            </div>
          ) : (
            validation.missingRequirements.length > 0 && (
              <div className="space-y-1">
                <p className="font-medium text-muted-foreground text-xs">
                  To complete:
                </p>
                <div className="space-y-1">
                  {validation.missingRequirements.slice(0, 2).map((req, i) => (
                    <div
                      className="flex items-start gap-2"
                      key={`missing-requirement-${i}-${req.slice(0, 15)}`}
                    >
                      <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-500" />
                      <p className="text-muted-foreground text-xs leading-tight">
                        {req}
                      </p>
                    </div>
                  ))}
                  {validation.missingRequirements.length > 2 && (
                    <p className="ml-3 text-muted-foreground text-xs">
                      +{validation.missingRequirements.length - 2} more...
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
