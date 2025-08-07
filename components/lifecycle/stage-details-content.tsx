import { BiasCardList } from '@/components/cards/bias-card-list';
import { Badge } from '@/components/ui/badge';
import {
  LIFECYCLE_STAGES,
  PROJECT_PHASES,
} from '@/lib/data/lifecycle-constants';
import { STAGE_BIAS_EXAMPLES } from '@/lib/data/stage-bias-examples';
import type { BiasCard, LifecycleStage } from '@/lib/types';

interface StageDetailsContentProps {
  selectedStage: LifecycleStage;
}

export function StageDetailsContent({
  selectedStage,
}: StageDetailsContentProps) {
  const stageInfo = LIFECYCLE_STAGES[selectedStage];
  const phaseInfo = PROJECT_PHASES[stageInfo.phase];
  const exampleBiases = STAGE_BIAS_EXAMPLES[selectedStage];

  // Convert example biases to BiasCard format for the component
  const biasCards: BiasCard[] = exampleBiases.map((bias, index) => ({
    id: `example-${selectedStage}-${index}`,
    name: bias.name,
    title: bias.name.toLowerCase().replace(/\s+/g, '-').replace("'", ''),
    category: bias.category as BiasCard['category'],
    caption: bias.description,
    description: bias.description,
    example: '',
    prompts: [],
    icon: bias.name.toLowerCase().replace(/\s+/g, '-').replace("'", ''),
  }));

  return (
    <>
      <div className="space-y-4 pb-4">
        <div className="flex items-start justify-between">
          <h2 className="font-bold text-2xl">{stageInfo.name}</h2>
          <Badge
            className="ml-4 border"
            style={{
              backgroundColor: `${phaseInfo.color}20`,
              color: phaseInfo.color,
              borderColor: phaseInfo.color,
            }}
            variant="secondary"
          >
            {phaseInfo.name}
          </Badge>
        </div>
        <p className="text-base text-muted-foreground leading-relaxed">
          {stageInfo.description}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="mb-3 font-semibold text-lg">
          Common Biases at This Stage
        </h3>
        <div className="space-y-2">
          {biasCards.map((card, index) => (
            <BiasCardList
              card={card}
              cardNumber={String(index + 1).padStart(2, '0')}
              className="cursor-default hover:scale-100"
              key={card.id}
              showCategory={false}
            />
          ))}
        </div>
      </div>
    </>
  );
}
