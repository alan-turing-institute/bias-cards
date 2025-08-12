'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { getAssetPath } from '@/lib/utils/asset-path';

const activityStages = [
  {
    id: 1,
    title: 'Stage 1: Preliminary Risk Assessment',
    image: getAssetPath('/activity-stage-1.png'),
    caption:
      'Begin by reviewing your project context and identifying potential risk areas. This stage helps you understand the scope of bias concerns relevant to your specific application. Consider the domain, stakeholders, and potential impacts to create a comprehensive foundation for your bias assessment.',
  },
  {
    id: 2,
    title: 'Stage 2: Lifecycle Assignment',
    image: getAssetPath('/activity-stage-2.png'),
    caption:
      'Map identified biases to specific stages in your ML project lifecycle. Drag and drop bias cards onto the appropriate lifecycle phases where they are most likely to occur. This visual mapping helps you understand when and where biases might emerge during development and deployment.',
  },
  {
    id: 3,
    title: 'Stage 3: Documentation of Rationale',
    image: getAssetPath('/activity-stage-3.png'),
    caption:
      'Document your reasoning for each bias-lifecycle mapping. Explain why specific biases are relevant to particular stages and provide context-specific examples. This documentation creates an audit trail and helps team members understand the assessment logic for future reference and reviews.',
  },
  {
    id: 4,
    title: 'Stage 4: Selecting Mitigation Techniques',
    image: getAssetPath('/activity-stage-4.png'),
    caption:
      'Choose appropriate mitigation strategies for each identified bias. Browse through evidence-based techniques and select those most suitable for your context. Consider technical feasibility, resource requirements, and effectiveness when making selections to build a practical mitigation plan.',
  },
  {
    id: 5,
    title: 'Stage 5: Implementation Planning',
    image: getAssetPath('/activity-stage-5.png'),
    caption:
      'Create an actionable implementation plan for your chosen mitigation strategies. Define responsibilities, timelines, and success metrics for each technique. This final stage transforms your assessment into a practical roadmap that guides your team through bias mitigation efforts.',
  },
];

export function ActivityCarousel() {
  return (
    <div className="relative mx-auto my-8 w-full max-w-4xl">
      <Carousel className="w-full px-12">
        <CarouselContent>
          {activityStages.map((stage) => (
            <CarouselItem key={stage.id}>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground text-xl">
                      {stage.title}
                    </h3>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-muted-foreground">
                          [Screenshot placeholder - {stage.image}]
                        </span>
                      </div>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {stage.caption}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
}
