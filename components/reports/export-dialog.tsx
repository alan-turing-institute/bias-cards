'use client';

import { Check, Download, FileCode, FileDown, FileText } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import {
  getAvailableFormats,
  getDefaultConfig,
} from '@/lib/export/export-service';
import { useReportsStore } from '@/lib/stores/reports-store';
import type {
  Report,
  ReportExportConfig,
  ReportFormat,
} from '@/lib/types/reports';

interface ReportExportDialogProps {
  report: Report;
  trigger?: React.ReactNode;
}

const formatIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="h-4 w-4" />,
  docx: <FileText className="h-4 w-4" />,
  markdown: <FileCode className="h-4 w-4" />,
  json: <FileCode className="h-4 w-4" />,
};

export function ReportExportDialog({
  report,
  trigger,
}: ReportExportDialogProps) {
  const { exportReport, isLoading } = useReportsStore();
  const [open, setOpen] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<string>('pdf');
  const [config, setConfig] = useState<ReportExportConfig>(
    getDefaultConfig('pdf')
  );
  const [exportSuccess, setExportSuccess] = useState(false);

  const formats = getAvailableFormats();

  const handleFormatChange = (format: string) => {
    setSelectedFormat(format);
    setConfig(getDefaultConfig(format));
  };

  const handleSectionToggle = (section: keyof typeof config.sections) => {
    setConfig({
      ...config,
      sections: {
        ...config.sections,
        [section]: !config.sections[section],
      },
    });
  };

  const handleExport = async () => {
    try {
      await exportReport(report.id, {
        ...config,
        format: selectedFormat as ReportFormat,
      });
      setExportSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setExportSuccess(false);
      }, 2000);
    } catch (_error) {
      // Handle error silently
    }
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Report</DialogTitle>
          <DialogDescription>
            Choose an export format and customize what to include in your
            report.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6">
          {/* Format Selection */}
          <div>
            <Label className="mb-3 font-semibold text-base">
              Export Format
            </Label>
            <RadioGroup
              onValueChange={handleFormatChange}
              value={selectedFormat}
            >
              <div className="grid gap-3">
                {formats.map((format) => (
                  <div className="relative" key={format.value}>
                    <RadioGroupItem
                      className="sr-only"
                      id={format.value}
                      value={format.value}
                    />
                    <Label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-all ${
                        selectedFormat === format.value
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      htmlFor={format.value}
                    >
                      <div className="mt-0.5">{formatIcons[format.value]}</div>
                      <div className="flex-1">
                        <div className="font-medium">{format.label}</div>
                        <div className="text-muted-foreground text-sm">
                          {format.description}
                        </div>
                      </div>
                      {selectedFormat === format.value && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* Section Selection */}
          <div>
            <Label className="mb-3 font-semibold text-base">
              Include Sections
            </Label>
            <div className="rounded-md border p-4">
              <div className="space-y-3">
                {Object.entries({
                  executiveSummary: 'Executive Summary',
                  projectInfo: 'Project Information',
                  biasIdentification: 'Bias Identification',
                  mitigationStrategies: 'Mitigation Strategies',
                  tracking: 'Implementation Tracking',
                  comments: 'Comments & Annotations',
                  auditTrail: 'Audit Trail',
                  appendices: 'Appendices',
                }).map(([key, label]) => (
                  <div className="flex items-center space-x-2" key={key}>
                    <Checkbox
                      checked={
                        config.sections[key as keyof typeof config.sections]
                      }
                      id={key}
                      onCheckedChange={() =>
                        handleSectionToggle(key as keyof typeof config.sections)
                      }
                    />
                    <Label
                      className="cursor-pointer font-normal text-sm"
                      htmlFor={key}
                    >
                      {label}
                      {key === 'executiveSummary' &&
                        !report.analysis.executiveSummary && (
                          <span className="ml-1 text-muted-foreground">
                            (Not available)
                          </span>
                        )}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <Separator />

          {/* Export Options */}
          <div>
            <Label className="mb-3 font-semibold text-base">
              Export Options
            </Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={config.options.includeBranding}
                  id="branding"
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      options: {
                        ...config.options,
                        includeBranding: checked as boolean,
                      },
                    })
                  }
                />
                <Label
                  className="cursor-pointer font-normal text-sm"
                  htmlFor="branding"
                >
                  Include branding and logos
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={config.options.includeSensitiveData}
                  id="sensitive"
                  onCheckedChange={(checked) =>
                    setConfig({
                      ...config,
                      options: {
                        ...config.options,
                        includeSensitiveData: checked as boolean,
                      },
                    })
                  }
                />
                <Label
                  className="cursor-pointer font-normal text-sm"
                  htmlFor="sensitive"
                >
                  Include sensitive data (IP addresses, user details)
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={() => setOpen(false)} variant="outline">
            Cancel
          </Button>
          <Button disabled={isLoading || exportSuccess} onClick={handleExport}>
            {(() => {
              if (exportSuccess) {
                return (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Exported!
                  </>
                );
              }
              if (isLoading) {
                return (
                  <>
                    <FileDown className="mr-2 h-4 w-4 animate-pulse" />
                    Exporting...
                  </>
                );
              }
              return (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Export Report
                </>
              );
            })()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
