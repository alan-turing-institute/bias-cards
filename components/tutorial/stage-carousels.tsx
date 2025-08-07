'use client';

import Image from 'next/image';
import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Legacy carousel data - to be migrated to MDX
// Stage 3-5 carousels still use the old format
// TODO: Migrate these to use TutorialCarousel component

// Placeholder data for Stage 1 (migrated to MDX)
const stage1Slides = [
  {
    id: 1,
    title: 'Initial View',
    image: '/tutorial/stage1/01-initial-view.png',
    hasImage: true,
    caption:
      'Stage 1 begins with an empty workspace showing four risk categories. The progress bar indicates you need to categorise at least 10 bias cards to proceed. Each category has a distinct colour and description to guide your assessment.',
  },
  {
    id: 2,
    title: 'Bias Card Library',
    image: '/tutorial/stage1/02-bias-card-library.png',
    hasImage: true,
    caption:
      'Click "View All Bias Cards" to open the library drawer. Cards are organised by type (Cognitive, Social, Statistical) with clear descriptions to help you understand each bias. Use the search function to quickly find specific biases relevant to your project.',
  },
  {
    id: 3,
    title: 'Categorising High Risk Biases',
    image: '/tutorial/stage1/03-high-risk.png',
    hasImage: true,
    caption:
      'Drag cards to the High Risk category for biases that could significantly impact your project. Consider factors like patient safety, system reliability, and regulatory compliance when making these critical assessments.',
  },
  {
    id: 4,
    title: 'Adding Medium and Low Risk Biases',
    image: '/tutorial/stage1/04-medium-low-risks.png',
    hasImage: true,
    caption:
      'Cards can be assigned to multiple risk categories to help you prioritise those that are likely to have the greatest impact on your project. This proportional approach to risk assessment will help you and your team balance time demands with careful reflection and deliberation.',
  },
  {
    id: 5,
    title: 'Needs Discussion',
    image: '/tutorial/stage1/05-needs-discussion.png',
    hasImage: true,
    caption:
      'Use the "Needs Discussion" category for biases where the risk level is unclear or requires team input. This acknowledges that some assessments benefit from collaborative expertise and prevents hasty categorisation decisions.',
  },
  {
    id: 6,
    title: 'Completed Assessment',
    image: '/tutorial/stage1/06-completed.png',
    hasImage: true,
    caption:
      'Once you\'ve categorised the minimum required biases, you can proceed to Stage 2. The system prompts you to confirm whether uncategorised cards should be marked as "ignored", ensuring conscious decisions about assessment scope.',
  },
];

// Stage 2: Lifecycle Assignment
const stage2Slides = [
  {
    id: 1,
    title: 'Initial View',
    image: '/tutorial/stage2/01-initial-view.png',
    hasImage: true,
    caption:
      "Stage 2 presents the ML project lifecycle divided into phases. Your goal is to map categorised biases to specific lifecycle stages where they're most likely to emerge, creating a comprehensive view of bias risks throughout your project.",
  },
  {
    id: 2,
    title: 'Categorised Bias Library',
    image: '/tutorial/stage2/02-categorised-bias-library.png',
    hasImage: true,
    caption:
      'Access your previously categorised biases from the side panel. Cards maintain their risk-level colour coding, helping you prioritise high-risk biases when mapping them to lifecycle stages.',
  },
  {
    id: 3,
    title: 'Adding Multiple Cards',
    image: '/tutorial/stage2/03-adding-multiple-cards.png',
    hasImage: true,
    caption:
      'Multiple biases can affect the same lifecycle stage, reflecting the complex nature of bias in ML projects. The progress indicator helps track your mapping completion whilst encouraging thorough consideration.',
  },
  {
    id: 4,
    title: 'Project Lifecycle Stages',
    image: '/tutorial/stage2/04-project-lifecycle-stages.png',
    hasImage: true,
    caption:
      'The complete lifecycle view spans from project design through system deployment. This comprehensive mapping ensures you consider bias risks throughout the entire ML project journey, not just during development.',
  },
  {
    id: 5,
    title: 'Information Modal',
    image: '/tutorial/stage2/05-information-modal.png',
    hasImage: true,
    caption:
      'Click any bias card to explore detailed information, including practical examples and discussion prompts. This deeper understanding helps inform your mapping decisions and prepares you for mitigation planning.',
  },
];

// Stage 3: Rationale Documentation
const stage3Slides = [
  {
    id: 1,
    title: 'Mapped Biases Overview',
    image: '/tutorial/stage3/01-mapped-overview.png',
    hasImage: false,
    caption:
      'Stage 3 presents all your mapped biases with space for detailed rationales. Each bias card now has an "Add Rationale" button. Document why each bias matters for your specific healthcare AI context.',
  },
  {
    id: 2,
    title: 'Adding Clinical Context',
    image: '/tutorial/stage3/02-adding-rationale.png',
    hasImage: false,
    caption:
      'Click on Decision-Automation Bias to add rationale. Explain: "In emergency departments, time pressure and high patient volumes may lead clinicians to accept AI recommendations without adequate verification, potentially missing crucial clinical nuances."',
  },
  {
    id: 3,
    title: 'Data-Specific Rationales',
    image: '/tutorial/stage3/03-data-rationale.png',
    hasImage: false,
    caption:
      'For Missing Data Bias, document: "Our training data primarily includes patients presenting to emergency departments, excluding those who self-manage symptoms or visit GPs. This creates systematic gaps in diagnostic coverage for less acute presentations."',
  },
  {
    id: 4,
    title: 'Implementation Considerations',
    image: '/tutorial/stage3/04-implementation-rationale.png',
    hasImage: false,
    caption:
      'Document Implementation Bias concerns: "Integration with existing hospital systems, varying IT infrastructure across departments, and different clinical workflows could lead to inconsistent deployment, affecting both system performance and user trust."',
  },
  {
    id: 5,
    title: 'Complete Documentation',
    image: '/tutorial/stage3/05-all-rationales.png',
    hasImage: false,
    caption:
      'With all rationales documented, you have created a comprehensive audit trail. This documentation helps team members understand assessment logic, supports regulatory compliance, and guides future system improvements.',
  },
];

// Stage 4: Mitigation Selection
const stage4Slides = [
  {
    id: 1,
    title: 'Biases Requiring Mitigation',
    image: '/tutorial/stage4/01-biases-view.png',
    hasImage: false,
    caption:
      'Stage 4 displays your documented biases alongside available mitigation strategies. Focus on high-risk biases first. The mitigation library contains evidence-based techniques with clear descriptions of their application and requirements.',
  },
  {
    id: 2,
    title: 'Mitigation Strategy Library',
    image: '/tutorial/stage4/02-mitigation-library.png',
    hasImage: false,
    caption:
      "Open the mitigation strategies drawer to view available techniques. Each card describes the approach, resource requirements, and effectiveness. Consider technical feasibility and your team's capabilities when selecting strategies.",
  },
  {
    id: 3,
    title: 'Pairing Critical Mitigations',
    image: '/tutorial/stage4/03-pairing-strategies.png',
    hasImage: false,
    caption:
      'Pair Decision-Automation Bias with "Human-in-the-Loop" and "Skills and Training" strategies. These ensure clinicians maintain critical oversight while understanding system limitations. Multiple strategies can address a single bias for comprehensive coverage.',
  },
  {
    id: 4,
    title: 'Data Quality Mitigations',
    image: '/tutorial/stage4/04-data-mitigations.png',
    hasImage: false,
    caption:
      'Address Missing Data Bias with "Additional Data Collection" and "Identify Underrepresented Groups". For Training-Serving Skew, select "Regular Auditing" and "External Validation" to ensure ongoing model performance monitoring.',
  },
  {
    id: 5,
    title: 'Completed Mitigation Plan',
    image: '/tutorial/stage4/05-completed-mitigation.png',
    hasImage: false,
    caption:
      'Review your bias-mitigation pairings to ensure comprehensive coverage. High-risk biases should have multiple mitigation strategies. This structured approach transforms identified risks into actionable interventions.',
  },
];

// Stage 5: Implementation Planning
const stage5Slides = [
  {
    id: 1,
    title: 'Planning Interface',
    image: '/tutorial/stage5/01-planning-interface.png',
    hasImage: false,
    caption:
      'Stage 5 transforms your mitigation strategies into an actionable implementation plan. Set priorities, timelines, and responsibilities for each strategy. Consider dependencies between different mitigation approaches.',
  },
  {
    id: 2,
    title: 'Immediate Priorities',
    image: '/tutorial/stage5/02-immediate-priorities.png',
    hasImage: false,
    caption:
      'Mark "Human-in-the-Loop protocols" and "Skills and Training" as immediate priorities (Month 1). These foundational elements must be established before system deployment to ensure safe clinical integration.',
  },
  {
    id: 3,
    title: 'Phased Implementation',
    image: '/tutorial/stage5/03-phased-approach.png',
    hasImage: false,
    caption:
      'Schedule "Participatory Design Workshops" for Months 2-3, allowing clinician input to shape system integration. Plan "Additional Data Collection" for Months 4-6 to address identified gaps in training data coverage.',
  },
  {
    id: 4,
    title: 'Success Metrics Definition',
    image: '/tutorial/stage5/04-success-metrics.png',
    hasImage: false,
    caption:
      'Define measurable success criteria for each mitigation: diagnostic accuracy improvements, clinician satisfaction scores, reduction in bias-related incidents, and successful identification of edge cases. These metrics guide evaluation.',
  },
  {
    id: 5,
    title: 'Final Implementation Roadmap',
    image: '/tutorial/stage5/05-final-roadmap.png',
    hasImage: false,
    caption:
      'Your completed roadmap provides a clear path from risk identification to mitigation. Export this plan for project management tools, share with stakeholders, and use it to track progress throughout implementation.',
  },
];

// Individual carousel components for stages 3-5 (to be migrated)
export function Stage3Carousel() {
  return (
    <div className="relative mx-auto my-8 w-full max-w-4xl">
      <Carousel className="w-full px-12">
        <CarouselContent>
          {stage3Slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground text-xl">
                      {slide.title}
                    </h3>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      {slide.hasImage ? (
                        <Image
                          alt={slide.title}
                          className="object-cover"
                          fill
                          src={slide.image}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-muted-foreground">
                            [Screenshot: {slide.title}]
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {slide.caption}
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

export function Stage4Carousel() {
  return (
    <div className="relative mx-auto my-8 w-full max-w-4xl">
      <Carousel className="w-full px-12">
        <CarouselContent>
          {stage4Slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground text-xl">
                      {slide.title}
                    </h3>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      {slide.hasImage ? (
                        <Image
                          alt={slide.title}
                          className="object-cover"
                          fill
                          src={slide.image}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-muted-foreground">
                            [Screenshot: {slide.title}]
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {slide.caption}
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

export function Stage5Carousel() {
  return (
    <div className="relative mx-auto my-8 w-full max-w-4xl">
      <Carousel className="w-full px-12">
        <CarouselContent>
          {stage5Slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground text-xl">
                      {slide.title}
                    </h3>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      {slide.hasImage ? (
                        <Image
                          alt={slide.title}
                          className="object-cover"
                          fill
                          src={slide.image}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-muted-foreground">
                            [Screenshot: {slide.title}]
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {slide.caption}
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
