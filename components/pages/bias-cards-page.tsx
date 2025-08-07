'use client';

import { useEffect, useState } from 'react';
import { BiasCardCompact } from '@/components/cards/bias-card-compact';
import { CardModalRedesigned } from '@/components/cards/card-modal-redesigned';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useCardsStore } from '@/lib/stores/cards-store';
import type { BiasCard as BiasCardType } from '@/lib/types/cards';

interface BiasCardsPageProps {
  category: 'cognitive-bias' | 'social-bias' | 'statistical-bias';
  title: string;
  description: string;
}

export function BiasCardsPage({
  category,
  title,
  description,
}: BiasCardsPageProps) {
  const { biasCards, isLoading, error, loadCards } = useCardsStore();
  const [selectedCard, setSelectedCard] = useState<BiasCardType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const filteredCards = biasCards.filter((card) => card.category === category);

  const handleCardClick = (card: BiasCardType) => {
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/cards">Bias Cards</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <div className="space-y-2 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
            <p className="text-gray-600">
              Loading {title.toLowerCase()} cards...
            </p>
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
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/cards">Bias Cards</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>{title}</BreadcrumbPage>
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
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/cards">Bias Cards</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="space-y-1">
          <h1 className="font-bold text-3xl tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
          {filteredCards.map((card) => (
            <BiasCardCompact
              card={card}
              cardNumber={
                card.displayNumber || String(card.id).padStart(2, '0')
              }
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
