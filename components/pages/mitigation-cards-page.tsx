'use client';

import { useEffect, useState } from 'react';
import { CardModalRedesigned } from '@/components/cards/card-modal-redesigned';
import { MitigationCardCompact } from '@/components/cards/mitigation-card-compact';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCardsStore } from '@/lib/stores/cards-store';
import type { MitigationCard as MitigationCardType } from '@/lib/types/cards';

export function MitigationCardsPage() {
  const { mitigationCards, isLoading, error, loadCards } = useCardsStore();
  const [selectedCard, setSelectedCard] = useState<MitigationCardType | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = (card: MitigationCardType) => {
    setSelectedCard(card);
    setModalOpen(true);
  };

  // Load cards on mount
  useEffect(() => {
    loadCards();
  }, [loadCards]);

  if (isLoading) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Mitigation Strategies</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
            <p className="text-gray-600">Loading mitigation strategies...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator className="mr-2 h-4" orientation="vertical" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage>Mitigation Strategies</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="space-y-2 text-center">
            <p className="font-medium text-red-600">Error loading cards</p>
            <p className="text-gray-600">{error}</p>
            <button
              className="rounded-md bg-primary px-4 py-2 text-white transition-colors hover:bg-primary/90"
              onClick={() => loadCards()}
              type="button"
            >
              Try Again
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator className="mr-2 h-4" orientation="vertical" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Mitigation Strategies</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-1">
          <h1 className="font-bold text-3xl tracking-tight">
            Mitigation Strategies
          </h1>
          <p className="text-muted-foreground">
            Explore proven strategies and techniques to mitigate biases in ML
            systems throughout the project lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {mitigationCards.map((card, index) => (
            <MitigationCardCompact
              card={card}
              cardNumber={String(index + 1).padStart(2, '0')}
              key={card.id}
              onClick={() => handleCardClick(card)}
            />
          ))}
        </div>

        <CardModalRedesigned
          card={selectedCard}
          onOpenChange={setModalOpen}
          open={modalOpen}
        />
      </div>
    </>
  );
}
