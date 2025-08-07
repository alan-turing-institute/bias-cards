import { BarChart3, Brain, Users } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';

const biasCategories = [
  {
    name: 'Cognitive Biases',
    href: '/cards/cognitive',
    icon: Brain,
    count: 8,
    description:
      'Individual reasoning patterns and mental shortcuts that can lead to systematic errors in ML development.',
    examples: 'Confirmation bias, automation bias, optimism bias',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    iconColor: 'text-blue-600',
  },
  {
    name: 'Social Biases',
    href: '/cards/social',
    icon: Users,
    count: 9,
    description:
      'Biases arising from cultural contexts, team dynamics, and societal stereotypes that affect ML systems.',
    examples: 'Historical bias, representation bias, selection bias',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    iconColor: 'text-purple-600',
  },
  {
    name: 'Statistical Biases',
    href: '/cards/statistical',
    icon: BarChart3,
    count: 7,
    description:
      'Technical biases from data characteristics, sampling methods, and mathematical assumptions.',
    examples: 'Aggregation bias, measurement bias, missing data bias',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    iconColor: 'text-amber-600',
  },
];

export default function CardsIndexPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Bias Cards', href: '/cards' },
          { label: 'Library' },
        ]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 font-bold text-4xl text-gray-900">
              Bias Cards Library
            </h1>
            <p className="mx-auto max-w-2xl text-gray-600 text-lg">
              Explore our comprehensive collection of bias cards organized by
              type. Each category contains detailed information about specific
              biases that can impact machine learning systems.
            </p>
          </div>

          {/* Category Cards */}
          <div className="grid gap-8 md:grid-cols-3">
            {biasCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Link
                  className="group hover:-translate-y-1 relative overflow-hidden rounded-lg border bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-lg"
                  href={category.href}
                  key={category.name}
                >
                  {/* Icon and Count Badge */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className={`rounded-lg p-3 ${category.color}`}>
                      <Icon className={`h-6 w-6 ${category.iconColor}`} />
                    </div>
                    <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700 text-sm">
                      {category.count} cards
                    </span>
                  </div>

                  {/* Content */}
                  <h2 className="mb-2 font-semibold text-gray-900 text-xl group-hover:text-amber-600">
                    {category.name}
                  </h2>
                  <p className="mb-3 text-gray-600">{category.description}</p>
                  <p className="text-gray-500 text-sm">
                    <span className="font-medium">Examples:</span>{' '}
                    {category.examples}
                  </p>

                  {/* Hover Arrow */}
                  <div className="absolute right-4 bottom-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="text-amber-600">→</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Additional Information */}
          <div className="mt-16 rounded-lg bg-gray-50 p-8">
            <h2 className="mb-4 font-semibold text-2xl text-gray-900">
              Understanding Bias Categories
            </h2>
            <div className="space-y-4 text-gray-600">
              <p>
                Machine learning biases can emerge at various stages of the
                development lifecycle and from different sources. Our bias cards
                are organized into three main categories to help you identify
                and address these challenges systematically.
              </p>
              <p>
                Each bias card includes a detailed description, real-world
                examples, and prompts to help you assess whether your project
                might be affected. Use these cards alongside our mitigation
                strategies to build more fair and equitable ML systems.
              </p>
            </div>
            <div className="mt-6">
              <Link
                className="inline-flex items-center text-amber-600 hover:text-amber-700"
                href="/mitigation"
              >
                Explore Mitigation Strategies
                <span className="ml-2">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
