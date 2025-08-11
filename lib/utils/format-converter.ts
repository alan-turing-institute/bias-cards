import type { BiasActivity } from '@/lib/activities/bias-activity';
import type { BiasDeck } from '@/lib/cards/decks/bias-deck';
import type { LifecycleStage, WorkspaceState } from '@/lib/types';
import type { BiasActivityData } from '@/lib/types/bias-activity';
import {
  type ActivityExport,
  detectDataVersion,
  type IntermediateData,
  type LegacyData,
} from '@/lib/types/migration';

/**
 * Handles progressive format migration between different data versions
 */
export class FormatConverter {
  /**
   * Progressively migrates data from any version to v2.0 activity format
   */
  async migrate(data: unknown, deck: BiasDeck): Promise<BiasActivity> {
    const version = detectDataVersion(data);
    let currentData = data;

    // Progressive migration path
    if (version === '1.0') {
      currentData = this.migrateV1ToV1_5(currentData as LegacyData, deck);
    }

    if (version === '1.0' || version === '1.5') {
      currentData = await this.migrateV1_5ToV2(
        currentData as IntermediateData,
        deck
      );
    }

    // Create activity from v2.0 data
    if (version === '2.0' || currentData) {
      const activityData = this.extractActivityData(currentData);
      return this.createActivityFromData(activityData, deck);
    }

    throw new Error(`Unsupported data version: ${version}`);
  }

  /**
   * Migrates v1.0 legacy format to v1.5 deck-based format
   */
  private migrateV1ToV1_5(
    legacyData: LegacyData,
    deck: BiasDeck
  ): IntermediateData {
    // Map old file-based card IDs to deck card IDs
    const cardIdMapping = this.createCardIdMapping(legacyData, deck);

    return {
      ...legacyData,
      dataVersion: '1.5',
      deckId: deck.getMetadata().id,
      deckVersion: deck.getVersion(),
      // Update all card references to use deck IDs
      biasRiskAssignments:
        legacyData.biasRiskAssignments?.map((assignment) => ({
          ...assignment,
          cardId: cardIdMapping[assignment.cardId] || assignment.cardId,
        })) || [],
      stageAssignments:
        legacyData.stageAssignments?.map((assignment) => ({
          ...assignment,
          cardId: cardIdMapping[assignment.cardId] || assignment.cardId,
        })) || [],
      cardPairs:
        legacyData.cardPairs?.map((pair) => ({
          ...pair,
          biasId: cardIdMapping[pair.biasId] || pair.biasId,
          mitigationId: cardIdMapping[pair.mitigationId] || pair.mitigationId,
        })) || [],
    };
  }

  /**
   * Migrates v1.5 deck-based format to v2.0 activity-based format
   */
  private async migrateV1_5ToV2(
    intermediateData: IntermediateData,
    deck: BiasDeck
  ): Promise<BiasActivityData> {
    const { BiasActivity: BiasActivityClass } = await import(
      '@/lib/activities/bias-activity'
    );

    // Create a temporary activity to build the data
    const tempActivity = new BiasActivityClass(deck, {
      name: intermediateData.name || 'Migrated Activity',
      description: `Migrated from v1.5 format on ${new Date().toISOString()}`,
    });

    // Delegate migration steps to reduce complexity
    this.migrateBiasRisks(tempActivity, intermediateData);
    this.migrateStageAssignments(tempActivity, intermediateData);
    this.migrateCardPairs(tempActivity, intermediateData);

    return tempActivity.export();
  }

  /**
   * Migrate bias risk assignments
   */
  private migrateBiasRisks(
    activity: BiasActivity,
    data: IntermediateData
  ): void {
    if (!data.biasRiskAssignments) {
      return;
    }

    for (const assignment of data.biasRiskAssignments) {
      activity.assignBiasRisk(assignment.cardId, assignment.riskCategory);
    }
  }

  /**
   * Migrate stage assignments with rationale
   */
  private migrateStageAssignments(
    activity: BiasActivity,
    data: IntermediateData
  ): void {
    if (!data.stageAssignments) {
      return;
    }

    for (const assignment of data.stageAssignments) {
      activity.assignToLifecycle(assignment.cardId, assignment.stage);
      if (assignment.annotation) {
        activity.setRationale(
          assignment.cardId,
          assignment.stage,
          assignment.annotation
        );
      }
    }
  }

  /**
   * Migrate card pairs to mitigations
   */
  private migrateCardPairs(
    activity: BiasActivity,
    data: IntermediateData
  ): void {
    if (!data.cardPairs) {
      return;
    }

    for (const pair of data.cardPairs) {
      // Find which stages this bias is assigned to
      const biasStages =
        data.stageAssignments
          ?.filter((a) => a.cardId === pair.biasId)
          .map((a) => a.stage) || [];

      // Add mitigation to all relevant stages
      for (const stage of biasStages) {
        activity.addMitigation(pair.biasId, stage, pair.mitigationId);

        // Add implementation note if available
        if (pair.effectivenessRating || pair.annotation) {
          activity.setImplementationNote(
            pair.biasId,
            stage,
            pair.mitigationId,
            {
              effectivenessRating: pair.effectivenessRating || 3,
              notes: pair.annotation || '',
              status: 'planned',
            }
          );
        }
      }
    }
  }

  /**
   * Extracts activity data from various formats
   */
  private extractActivityData(data: unknown): BiasActivityData {
    const activityExport = data as ActivityExport;

    // If it's already an activity export, extract the activity data
    if (activityExport.activityData) {
      return activityExport.activityData;
    }

    // If it's direct activity data
    if ((data as BiasActivityData).biases) {
      return data as BiasActivityData;
    }

    // If it's wrapped in workspace data
    const workspaceData = data as WorkspaceState & {
      activityData?: BiasActivityData;
    };
    if (workspaceData.activityData) {
      return workspaceData.activityData;
    }

    throw new Error('Could not extract activity data from import');
  }

  /**
   * Creates a BiasActivity instance from activity data
   */
  private async createActivityFromData(
    activityData: BiasActivityData,
    deck: BiasDeck
  ): Promise<BiasActivity> {
    const { BiasActivity: BiasActivityClass } = await import(
      '@/lib/activities/bias-activity'
    );

    const activity = new BiasActivityClass(deck, {
      name: activityData.name,
      description: activityData.description,
    });

    activity.load(activityData);
    return activity;
  }

  /**
   * Creates a mapping from old card IDs to deck card IDs
   */
  private createCardIdMapping(
    _legacyData: LegacyData,
    deck: BiasDeck
  ): Record<string, string> {
    const mapping: Record<string, string> = {};

    // Get all cards from the deck
    const allCards = deck.getAllCards();

    // Create mapping based on card names (assuming names are consistent)
    for (const card of allCards) {
      // Map both by ID and by name for flexibility
      mapping[card.id] = card.id;
      mapping[card.name] = card.id;
    }

    return mapping;
  }

  /**
   * Optional: Downgrades v2.0 activity format to older formats for compatibility
   */
  downgrade(
    activity: BiasActivity,
    targetVersion: '1.0' | '1.5'
  ): LegacyData | IntermediateData {
    const v2Data = activity.export();

    if (targetVersion === '1.5') {
      return this.downgradeV2ToV1_5(v2Data);
    }

    if (targetVersion === '1.0') {
      const v1_5Data = this.downgradeV2ToV1_5(v2Data);
      return this.downgradeV1_5ToV1(v1_5Data);
    }

    throw new Error(`Unsupported target version: ${targetVersion}`);
  }

  /**
   * Downgrades v2.0 to v1.5 format
   */
  private downgradeV2ToV1_5(activityData: BiasActivityData): IntermediateData {
    const biasRiskAssignments = Object.entries(activityData.biases)
      .filter(([_, bias]) => bias.riskCategory)
      .map(([biasId, bias]) => ({
        id: `risk-${biasId}`,
        cardId: biasId,
        riskCategory:
          bias.riskCategory ||
          ('needs-discussion' as import('@/lib/types').BiasRiskCategory),
        timestamp: bias.riskAssignedAt || new Date().toISOString(),
      }));

    const stageAssignments = Object.entries(activityData.biases).flatMap(
      ([biasId, bias]) =>
        bias.lifecycleAssignments.map((stage) => ({
          id: `stage-${biasId}-${stage}`,
          cardId: biasId,
          stage,
          annotation: bias.rationale[stage],
          timestamp: new Date().toISOString(),
        }))
    );

    const cardPairs = Object.entries(activityData.biases).flatMap(
      ([biasId, bias]) =>
        Object.entries(bias.mitigations).flatMap(([stage, mitigationIds]) =>
          mitigationIds.map((mitigationId) => ({
            biasId,
            mitigationId,
            annotation:
              bias.implementationNotes[stage as LifecycleStage]?.[mitigationId]
                ?.notes,
            effectivenessRating:
              bias.implementationNotes[stage as LifecycleStage]?.[mitigationId]
                ?.effectivenessRating,
            timestamp: new Date().toISOString(),
          }))
        )
    );

    return {
      dataVersion: '1.5',
      sessionId: activityData.id,
      name: activityData.name,
      activityId: activityData.id,
      createdAt: activityData.createdAt,
      lastModified: activityData.updatedAt,
      completedStages: activityData.state
        .completedStages as unknown as LifecycleStage[],
      biasRiskAssignments,
      stageAssignments,
      cardPairs,
      customAnnotations: {},
      deckId: activityData.deckId,
      deckVersion: activityData.deckVersion,
    };
  }

  /**
   * Downgrades v1.5 to v1.0 format
   */
  private downgradeV1_5ToV1(intermediateData: IntermediateData): LegacyData {
    // Remove deck-specific fields
    const {
      deckId: _deckId,
      deckVersion: _deckVersion,
      ...legacyData
    } = intermediateData;

    return {
      ...legacyData,
      dataVersion: undefined, // v1.0 doesn't have explicit version
    };
  }
}
