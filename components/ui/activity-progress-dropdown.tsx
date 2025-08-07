'use client';

import {
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Clock,
  Target,
} from 'lucide-react';
import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import type { Card as BiasCard, WorkspaceState } from '@/lib/types';
import {
  getNextAction,
  type ValidationGate,
  validateActivityCompletion,
} from '@/lib/validation/activity-validation';

interface ActivityProgressDropdownProps {
  workspace: WorkspaceState;
  biasCards: BiasCard[];
  mitigationCards: BiasCard[];
}

export function ActivityProgressDropdown({
  workspace,
  biasCards,
  mitigationCards,
}: ActivityProgressDropdownProps) {
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

  const getButtonVariant = () => {
    if (validation.canGenerateReport) {
      return 'default';
    }
    if (validation.completionPercentage >= 60) {
      return 'secondary';
    }
    return 'outline';
  };

  const getButtonColor = () => {
    if (validation.canGenerateReport) {
      return 'text-green-600';
    }
    if (validation.completionPercentage >= 60) {
      return 'text-amber-600';
    }
    return 'text-red-500';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2" size="sm" variant={getButtonVariant()}>
          <Target className={`h-4 w-4 ${getButtonColor()}`} />
          <span className="hidden sm:inline">Progress</span>
          <Badge className="text-xs" variant="secondary">
            {validation.completionPercentage}%
          </Badge>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-4">
        <DropdownMenuLabel className="flex items-center justify-between px-0">
          Activity Progress
          <Badge
            className="text-xs"
            variant={validation.canGenerateReport ? 'default' : 'secondary'}
          >
            {validation.completionPercentage}%
          </Badge>
        </DropdownMenuLabel>

        <div className="space-y-3 pt-2">
          {/* Progress Bar */}
          <div>
            <Progress className="h-2" value={validation.completionPercentage} />
            <p className="mt-1 text-muted-foreground text-xs">
              {validation.canGenerateReport
                ? 'Ready for report generation!'
                : getNextAction(validation)}
            </p>
          </div>

          <DropdownMenuSeparator />

          {/* Completion Gates */}
          <div>
            <h4 className="mb-2 font-medium text-muted-foreground text-xs uppercase tracking-wide">
              Completion Criteria
            </h4>
            <div className="space-y-2">
              {validation.gates.map((gate) => (
                <div className="flex items-start gap-2" key={gate.id}>
                  <div className="mt-0.5 flex-shrink-0">
                    {getGateIcon(gate)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-xs">{gate.name}</span>
                      {gate.required && (
                        <Badge className="h-4 px-1 text-xs" variant="outline">
                          Required
                        </Badge>
                      )}
                    </div>
                    {gate.details && (
                      <p className="mt-0.5 font-mono text-muted-foreground text-xs">
                        {gate.details}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Message */}
          {validation.canGenerateReport ? (
            <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-2">
              <CheckCircle className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-600" />
              <p className="text-green-700 text-xs">
                All criteria met! You can generate your report.
              </p>
            </div>
          ) : (
            validation.missingRequirements.length > 0 && (
              <div className="space-y-1">
                <h4 className="font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  Next Steps
                </h4>
                <div className="space-y-1">
                  {validation.missingRequirements.slice(0, 3).map((req, i) => (
                    <div className="flex items-start gap-2" key={i}>
                      <div className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-red-500" />
                      <p className="text-muted-foreground text-xs leading-tight">
                        {req}
                      </p>
                    </div>
                  ))}
                  {validation.missingRequirements.length > 3 && (
                    <p className="ml-3 text-muted-foreground text-xs">
                      +{validation.missingRequirements.length - 3} more...
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
