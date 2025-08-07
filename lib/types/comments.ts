import type { LifecycleStage } from './cards';

/**
 * Categories for card comments to organize different types of user input
 */
export type CommentCategory = 'rationale' | 'implementation' | 'general';

/**
 * User comment on a bias or mitigation card with context and metadata
 */
export interface Comment {
  /** Unique identifier for the comment */
  id: string;

  /** ID of the card this comment relates to */
  cardId: string;

  /** Type of card being commented on */
  cardType: 'bias' | 'mitigation';

  /** Lifecycle stage context when comment was made (optional) */
  stageContext?: LifecycleStage;

  /** User ID who created the comment */
  userId: string;

  /** Display name of the user who created the comment */
  userName: string;

  /** ISO timestamp when comment was created */
  timestamp: string;

  /** The comment content */
  content: string;

  /** Category/type of comment for organization */
  category: CommentCategory;

  /** Whether this comment has been edited */
  isEdited: boolean;

  /** Edit history for audit trail */
  editHistory?: Array<{
    timestamp: string;
    previousContent: string;
    editReason?: string;
  }>;

  /** Optional metadata for context */
  metadata?: {
    /** If comment was made during card pairing */
    pairContext?: {
      biasId: string;
      mitigationId: string;
    };
    /** If comment relates to specific stage assignment */
    assignmentContext?: {
      assignmentId: string;
      stage: LifecycleStage;
    };
  };
}

/**
 * Summary of comments for a specific card
 */
export interface CommentSummary {
  cardId: string;
  totalComments: number;
  commentsByCategory: Record<CommentCategory, number>;
  lastCommentTimestamp?: string;
  hasUnreadComments?: boolean;
}

/**
 * Comment filter and search options
 */
export interface CommentFilters {
  cardIds?: string[];
  categories?: CommentCategory[];
  stages?: LifecycleStage[];
  userId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  searchQuery?: string;
}

/**
 * Comment display options for UI components
 */
export interface CommentDisplayOptions {
  showMetadata: boolean;
  showEditHistory: boolean;
  groupByCategory: boolean;
  sortBy: 'timestamp' | 'category' | 'relevance';
  sortOrder: 'asc' | 'desc';
}
