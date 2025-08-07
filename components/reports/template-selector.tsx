'use client';

import {
  Building2,
  Check,
  FileText,
  Heart,
  Info,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTemplateStore } from '@/lib/templates/template-store';
import type { ReportTemplate } from '@/lib/types/reports';

interface TemplateSelectorProps {
  projectDomain?: string;
  onSelectTemplate: (templateId: string) => void;
  selectedTemplateId?: string | null;
}

const domainIcons: Record<string, React.ReactNode> = {
  Healthcare: <Heart className="h-5 w-5" />,
  'Financial Services': <TrendingUp className="h-5 w-5" />,
  Recruitment: <Users className="h-5 w-5" />,
  General: <Building2 className="h-5 w-5" />,
};

export function TemplateSelector({
  projectDomain,
  onSelectTemplate,
  selectedTemplateId,
}: TemplateSelectorProps) {
  const {
    getAllTemplates,
    getTemplatesByDomain,
    getMostUsedTemplates,
    selectTemplate,
  } = useTemplateStore();

  const [selectedId, setSelectedId] = useState<string | null>(
    selectedTemplateId || null
  );
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [suggestedTemplates, setSuggestedTemplates] = useState<
    ReportTemplate[]
  >([]);

  useEffect(() => {
    // Get all templates
    const allTemplates = getAllTemplates().filter((t) => t.isActive);

    // Separate templates by whether they match the project domain
    if (projectDomain) {
      const domainTemplates = getTemplatesByDomain(projectDomain);
      const otherTemplates = allTemplates.filter(
        (t) => t.domain.toLowerCase() !== projectDomain.toLowerCase()
      );

      setSuggestedTemplates(domainTemplates);
      setTemplates(otherTemplates);
    } else {
      // If no domain, show most used templates as suggestions
      const mostUsed = getMostUsedTemplates(3);
      const others = allTemplates.filter(
        (t) => !mostUsed.find((m) => m.id === t.id)
      );

      setSuggestedTemplates(mostUsed);
      setTemplates(others);
    }
  }, [
    projectDomain,
    getAllTemplates,
    getTemplatesByDomain,
    getMostUsedTemplates,
  ]);

  const handleSelect = (templateId: string) => {
    setSelectedId(templateId);
    selectTemplate(templateId);
    onSelectTemplate(templateId);
  };

  const renderTemplateCard = (
    template: ReportTemplate,
    isSuggested = false
  ) => {
    const isSelected = selectedId === template.id;
    const icon = domainIcons[template.domain] || (
      <FileText className="h-5 w-5" />
    );

    return (
      <Card
        className={`cursor-pointer transition-all ${
          isSelected
            ? 'border-primary ring-2 ring-primary/20'
            : 'hover:border-primary/50'
        } ${isSuggested ? 'bg-primary/5' : ''}`}
        key={template.id}
        onClick={() => handleSelect(template.id)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-base">{template.name}</CardTitle>
            </div>
            {isSelected && <Check className="h-5 w-5 text-primary" />}
          </div>
          <CardDescription className="mt-1.5 text-sm">
            {template.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{template.domain}</Badge>
            {template.metadata.usageCount > 0 && (
              <Badge variant="outline">
                Used {template.metadata.usageCount} times
              </Badge>
            )}
            {isSuggested && (
              <Badge className="bg-primary/10 text-primary">Recommended</Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-3">
          <div className="flex items-center gap-4 text-muted-foreground text-xs">
            <span>{template.structure.sections.length} sections</span>
            <span>v{template.version}</span>
            {
              ('requireComplianceSection' in
                template.structure.validationRules &&
                template.structure.validationRules.requireComplianceSection && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge className="text-xs" variant="outline">
                        <Info className="mr-1 h-3 w-3" />
                        Compliance
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This template includes compliance requirements</p>
                    </TooltipContent>
                  </Tooltip>
                )) as React.ReactNode
            }
          </div>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Suggested Templates */}
      {suggestedTemplates.length > 0 && (
        <div>
          <Label className="mb-3 font-semibold text-base">
            Recommended Templates
            {projectDomain && (
              <span className="ml-2 font-normal text-muted-foreground text-sm">
                Based on your {projectDomain} project
              </span>
            )}
          </Label>
          <RadioGroup onValueChange={handleSelect} value={selectedId || ''}>
            <div className="grid gap-3 md:grid-cols-2">
              {suggestedTemplates.map((template) => (
                <div className="relative" key={template.id}>
                  <RadioGroupItem
                    className="sr-only"
                    id={template.id}
                    value={template.id}
                  />
                  <Label className="cursor-pointer" htmlFor={template.id}>
                    {renderTemplateCard(template, true)}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      )}

      {/* Other Templates */}
      {templates.length > 0 && (
        <div>
          <Label className="mb-3 font-semibold text-base">
            {suggestedTemplates.length > 0
              ? 'Other Templates'
              : 'Available Templates'}
          </Label>
          <ScrollArea className="h-[400px] pr-4">
            <RadioGroup onValueChange={handleSelect} value={selectedId || ''}>
              <div className="grid gap-3 md:grid-cols-2">
                {templates.map((template) => (
                  <div className="relative" key={template.id}>
                    <RadioGroupItem
                      className="sr-only"
                      id={template.id}
                      value={template.id}
                    />
                    <Label className="cursor-pointer" htmlFor={template.id}>
                      {renderTemplateCard(template)}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </ScrollArea>
        </div>
      )}

      {/* No Templates Message */}
      {suggestedTemplates.length === 0 && templates.length === 0 && (
        <div className="py-8 text-center">
          <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">
            No templates available. Create a custom template to get started.
          </p>
        </div>
      )}
    </div>
  );
}
