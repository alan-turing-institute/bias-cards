'use client';

import { useState } from 'react';
import { BiasCardChip } from '@/components/cards/bias-card-chip';
import { BiasCardGrid } from '@/components/cards/bias-card-grid';
import { BiasCardGrouped } from '@/components/cards/bias-card-grouped';
import { BiasCardList } from '@/components/cards/bias-card-list';
import { MitigationCardChip } from '@/components/cards/mitigation-card-chip';
import { MitigationCardGrid } from '@/components/cards/mitigation-card-grid';
import { MitigationCardGrouped } from '@/components/cards/mitigation-card-grouped';
import { MitigationCardList } from '@/components/cards/mitigation-card-list';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { BiasCard, MitigationCard } from '@/lib/types/cards';

// Sample data for demonstration
const sampleBiasCards: BiasCard[] = [
  {
    id: 'confirmation-bias',
    name: 'Confirmation Bias',
    title: 'confirmation-bias',
    category: 'cognitive-bias',
    caption:
      'The tendency to favor information that confirms pre-existing beliefs or hypotheses',
    description:
      'People tend to search for, interpret, and remember information in ways that confirm their pre-existing beliefs.',
    example:
      "A hiring manager who believes certain demographics are less qualified may focus only on negative aspects of those candidates' resumes.",
    prompts: [
      'How might you unconsciously favor information that supports your hypothesis?',
    ],
    icon: 'target',
  },
  {
    id: 'selection-bias',
    name: 'Selection Bias',
    title: 'selection-bias',
    category: 'social-bias',
    caption:
      'Error due to systematic differences between selected and non-selected groups',
    description:
      'Occurs when the sample is not representative of the target population due to flawed selection processes.',
    example:
      'Training a facial recognition system primarily on images of young adults, leading to poor performance on children and elderly individuals.',
    prompts: [
      'Is your sample representative of all groups that will use this system?',
    ],
    icon: 'git-branch',
  },
  {
    id: 'sampling-bias',
    name: 'Sampling Bias',
    title: 'sampling-bias',
    category: 'statistical-bias',
    caption:
      'Systematic error due to non-random sampling that produces unrepresentative data',
    description:
      'When data collection methods systematically exclude certain groups or favor others.',
    example:
      'Online surveys may miss populations with limited internet access, skewing results toward more connected demographics.',
    prompts: [
      'What groups might be systematically excluded from your data collection?',
    ],
    icon: 'zap',
  },
];

const sampleMitigationCards: MitigationCard[] = [
  {
    id: 'peer-review',
    name: 'Peer Review',
    title: 'peer-review',
    category: 'mitigation-technique',
    caption:
      'Independent evaluation by experts to identify blind spots and validate approaches',
    description:
      'Having colleagues or external experts review your work to catch potential biases and errors.',
    example:
      'Before deploying a hiring algorithm, have it reviewed by both data scientists and HR professionals.',
    prompts: ['Who should review this work to catch potential blind spots?'],
    icon: 'users',
  },
  {
    id: 'data-augmentation',
    name: 'Data Augmentation',
    title: 'data-augmentation',
    category: 'mitigation-technique',
    caption:
      'Artificially expanding datasets to improve representation and model robustness',
    description:
      'Adding synthetic or modified data to address gaps in representation.',
    example:
      'Adding rotated, scaled, or color-shifted versions of images to improve model performance across different conditions.',
    prompts: ['How can you expand your dataset to be more representative?'],
    icon: 'sparkles',
  },
];

export function CardLayoutsDemo() {
  const [selectedLayout, setSelectedLayout] = useState<string>('all');

  const layouts = [
    {
      id: 'all',
      name: 'All Layouts',
      description: 'Compare all card layout options',
    },
    {
      id: 'list',
      name: 'List View',
      description: 'Standard horizontal cards (70px height)',
    },
    {
      id: 'grid',
      name: 'Grid View',
      description: 'Compact 2-column grid (50px height)',
    },
    {
      id: 'grouped',
      name: 'Grouped View',
      description: 'Categories with collapsible sections (32px height)',
    },
    {
      id: 'chip',
      name: 'Chip/Pill View',
      description: 'Ultra-compact pill style (32px height)',
    },
  ];

  const getCardNumber = (index: number) => String(index + 1).padStart(2, '0');

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-bold text-2xl text-gray-900">
          Ultra-Compact Card Layouts
        </h1>
        <p className="mt-1 text-gray-600">
          Space-efficient card designs for the bias cards application
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {layouts.map((layout) => (
          <Badge
            className="cursor-pointer"
            key={layout.id}
            onClick={() => setSelectedLayout(layout.id)}
            variant={selectedLayout === layout.id ? 'default' : 'secondary'}
          >
            {layout.name}
          </Badge>
        ))}
      </div>

      {(selectedLayout === 'all' || selectedLayout === 'list') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              List View (Standard)
              <Badge variant="outline">70px height</Badge>
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Standard horizontal layout for drawer/sheet views
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-sm">Bias Cards</h4>
              <div className="space-y-2">
                {sampleBiasCards.map((card, index) => (
                  <BiasCardList
                    card={card}
                    cardNumber={getCardNumber(index)}
                    key={card.id}
                  />
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="mb-2 font-medium text-sm">Mitigation Cards</h4>
              <div className="space-y-2">
                {sampleMitigationCards.map((card, index) => (
                  <MitigationCardList
                    card={card}
                    cardNumber={getCardNumber(index)}
                    key={card.id}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(selectedLayout === 'all' || selectedLayout === 'grid') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Grid View (Compact)
              <Badge variant="outline">50px height</Badge>
            </CardTitle>
            <p className="text-gray-600 text-sm">
              2-column grid layout with truncated content and tooltips
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-sm">Bias Cards</h4>
              <div className="grid grid-cols-2 gap-2">
                {sampleBiasCards.map((card, index) => (
                  <BiasCardGrid
                    card={card}
                    cardNumber={getCardNumber(index)}
                    key={card.id}
                  />
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="mb-2 font-medium text-sm">Mitigation Cards</h4>
              <div className="grid grid-cols-2 gap-2">
                {sampleMitigationCards.map((card, index) => (
                  <MitigationCardGrid
                    card={card}
                    cardNumber={getCardNumber(index)}
                    key={card.id}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {(selectedLayout === 'all' || selectedLayout === 'grouped') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Grouped View (Ultra-Compact)
              <Badge variant="outline">32px height</Badge>
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Collapsible categories with minimal cards, maximum space
              efficiency
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-sm">
                Bias Cards (Grouped by Category)
              </h4>
              <BiasCardGrouped
                cards={sampleBiasCards}
                getCardNumber={(card) => {
                  const index = sampleBiasCards.findIndex(
                    (c) => c.id === card.id
                  );
                  return getCardNumber(index);
                }}
                onCardClick={(_card) => {
                  // Demo component - no action needed
                }}
              />
            </div>
            <Separator />
            <div>
              <h4 className="mb-2 font-medium text-sm">Mitigation Cards</h4>
              <MitigationCardGrouped
                cards={sampleMitigationCards}
                getCardNumber={(card) => {
                  const index = sampleMitigationCards.findIndex(
                    (c) => c.id === card.id
                  );
                  return getCardNumber(index);
                }}
                onCardClick={(_card) => {
                  // Demo component - no action needed
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {(selectedLayout === 'all' || selectedLayout === 'chip') && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Chip/Pill View (Canvas)
              <Badge variant="outline">32px height</Badge>
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Ultra-compact pill style for canvas/workspace display
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="mb-2 font-medium text-sm">Bias Cards</h4>
              <div className="flex flex-wrap gap-2">
                {sampleBiasCards.map((card, index) => (
                  <BiasCardChip
                    card={card}
                    cardNumber={getCardNumber(index)}
                    key={card.id}
                  />
                ))}
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="mb-2 font-medium text-sm">Mitigation Cards</h4>
              <div className="flex flex-wrap gap-2">
                {sampleMitigationCards.map((card, index) => (
                  <MitigationCardChip
                    card={card}
                    cardNumber={getCardNumber(index)}
                    key={card.id}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-800">
            Space Efficiency Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-1">
              <div className="font-medium text-amber-800">List View</div>
              <div className="text-amber-700">70px height</div>
              <div className="text-amber-600">Standard layout</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-amber-800">Grid View</div>
              <div className="text-amber-700">50px height</div>
              <div className="text-amber-600">29% more compact</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-amber-800">Grouped View</div>
              <div className="text-amber-700">32px height</div>
              <div className="text-amber-600">54% more compact</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium text-amber-800">Chip View</div>
              <div className="text-amber-700">32px height</div>
              <div className="text-amber-600">Flexible width</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
