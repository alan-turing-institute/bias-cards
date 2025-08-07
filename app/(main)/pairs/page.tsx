'use client';

import { PageHeader } from '@/components/page-header';
import { PairsList } from '@/components/pages/workspace/pairs-list';

export default function PairsPage() {
  return (
    <>
      <PageHeader
        breadcrumbs={[
          { label: 'Bias Cards' },
          { label: 'Bias-Mitigation Pairs' },
        ]}
      />
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="font-bold text-3xl">Bias-Mitigation Pairs</h1>
          <p className="text-muted-foreground">
            View and manage your bias-mitigation pairs with effectiveness
            ratings
          </p>
        </div>
        <PairsList />
      </div>
    </>
  );
}
