'use client';

import { AlertTriangle, Eye, Shield, Users, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { categoryStyles } from '@/lib/design-tokens';
import type { CardCategory } from '@/lib/types/cards';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategories: CardCategory[];
  onCategoryChange: (categories: CardCategory[]) => void;
  showCounts?: boolean;
  categoryCounts?: Record<CardCategory, number>;
  className?: string;
}

const categoryConfig = {
  'cognitive-bias': {
    label: 'Cognitive Bias',
    icon: AlertTriangle,
    description: 'Biases from individual thinking patterns',
  },
  'social-bias': {
    label: 'Social Bias',
    icon: Users,
    description: 'Biases from social structures and interactions',
  },
  'statistical-bias': {
    label: 'Statistical Bias',
    icon: Eye,
    description: 'Biases from data and statistical methods',
  },
  'mitigation-technique': {
    label: 'Mitigation Strategies',
    icon: Shield,
    description: 'Techniques to reduce and prevent biases',
  },
} as const;

export function CategoryFilter({
  selectedCategories,
  onCategoryChange,
  showCounts = false,
  categoryCounts = {
    'cognitive-bias': 0,
    'social-bias': 0,
    'statistical-bias': 0,
    'mitigation-technique': 0,
  },
  className,
}: CategoryFilterProps) {
  const toggleCategory = (category: CardCategory) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter((c) => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const clearAllFilters = () => {
    onCategoryChange([]);
  };

  const selectAllCategories = () => {
    onCategoryChange(Object.keys(categoryConfig) as CardCategory[]);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Filter by Category</h3>
        <div className="flex gap-2">
          {selectedCategories.length > 0 && (
            <Button
              className="h-8 text-gray-500 hover:text-gray-700"
              onClick={clearAllFilters}
              size="sm"
              variant="ghost"
            >
              <X className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          )}
          {selectedCategories.length < Object.keys(categoryConfig).length && (
            <Button
              className="h-8 text-gray-500 hover:text-gray-700"
              onClick={selectAllCategories}
              size="sm"
              variant="ghost"
            >
              Select All
            </Button>
          )}
        </div>
      </div>

      {/* Category badges */}
      <div className="flex flex-wrap gap-2">
        {(Object.keys(categoryConfig) as CardCategory[]).map((category) => {
          const config = categoryConfig[category];
          const colors = categoryStyles[category];
          const isSelected = selectedCategories.includes(category);
          const count = categoryCounts[category] || 0;
          const IconComponent = config.icon;

          return (
            <Badge
              className={cn(
                'cursor-pointer transition-all duration-200 hover:scale-105',
                'flex items-center gap-1.5 px-3 py-1.5 font-medium text-sm',
                isSelected
                  ? 'border-2 shadow-sm'
                  : 'border hover:border-gray-400'
              )}
              key={category}
              onClick={() => toggleCategory(category)}
              style={{
                backgroundColor: isSelected ? colors.light : 'transparent',
                borderColor: isSelected ? colors.primary : '#e5e7eb',
                color: isSelected ? colors.dark : '#6b7280',
              }}
              variant="outline"
            >
              <IconComponent className="h-3.5 w-3.5" />
              <span>{config.label}</span>
              {showCounts && count > 0 && (
                <span
                  className="ml-1 rounded-full px-1.5 py-0.5 font-semibold text-xs"
                  style={{
                    backgroundColor: isSelected ? colors.primary : '#f3f4f6',
                    color: isSelected ? 'white' : '#6b7280',
                  }}
                >
                  {count}
                </span>
              )}
            </Badge>
          );
        })}
      </div>

      {/* Selected categories summary */}
      {selectedCategories.length > 0 && (
        <div className="text-gray-600 text-sm">
          Showing {selectedCategories.length} of{' '}
          {Object.keys(categoryConfig).length} categories
          {showCounts && (
            <span className="ml-2 font-medium">
              (
              {Object.values(categoryCounts).reduce(
                (sum, count) => sum + count,
                0
              )}{' '}
              total cards)
            </span>
          )}
        </div>
      )}
    </div>
  );
}
