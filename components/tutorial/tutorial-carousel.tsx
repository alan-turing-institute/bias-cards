'use client';

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export interface TutorialSlide {
  id: number;
  title: string;
  image: string;
  caption: string;
}

interface TutorialCarouselProps {
  slides: TutorialSlide[];
}

export function TutorialCarousel({ slides }: TutorialCarouselProps) {
  return (
    <div className="relative mx-auto my-8 w-full max-w-4xl">
      <Carousel className="w-full px-12">
        <CarouselContent>
          {slides.map((slide) => (
            <CarouselItem key={slide.id}>
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground text-xl">
                      {slide.title}
                    </h3>
                    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                      <Image
                        alt={slide.title}
                        className="object-cover"
                        fill
                        priority={slide.id === 1}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={slide.image}
                      />
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
