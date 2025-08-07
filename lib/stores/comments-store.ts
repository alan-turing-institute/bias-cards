import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type {
  Comment,
  CommentCategory,
  CommentFilters,
  CommentSummary,
  LifecycleStage,
} from '@/lib/types';
import { validateComment } from '@/lib/validation/schemas';

/**
 * Interface for the comments store state and actions
 */
interface CommentsStoreState {
  // State
  comments: Comment[];
  commentsCache: Map<string, CommentSummary>;
  isLoading: boolean;
  error: string | null;

  // User identity for comment attribution
  currentUser: {
    id: string;
    name: string;
  } | null;

  // Comment management actions
  addComment: (
    cardId: string,
    cardType: 'bias' | 'mitigation',
    content: string,
    category: CommentCategory,
    stageContext?: LifecycleStage,
    metadata?: Comment['metadata']
  ) => string; // Returns comment ID

  updateComment: (
    commentId: string,
    content: string,
    editReason?: string
  ) => boolean;

  deleteComment: (commentId: string) => boolean;

  // Comment retrieval
  getCommentsByCard: (cardId: string) => Comment[];
  getCommentsByCategory: (
    cardId: string,
    category: CommentCategory
  ) => Comment[];
  getCommentsByStage: (stage: LifecycleStage) => Comment[];
  getCommentById: (commentId: string) => Comment | undefined;

  // Comment filtering and search
  searchComments: (query: string) => Comment[];
  filterComments: (filters: CommentFilters) => Comment[];

  // Comment summaries for UI
  getCommentSummary: (cardId: string) => CommentSummary;
  getCommentCount: (cardId: string) => number;
  getCommentCountByCategory: (
    cardId: string,
    category: CommentCategory
  ) => number;

  // Bulk operations
  bulkDeleteCommentsByCard: (cardId: string) => number; // Returns count deleted
  exportComments: (cardIds?: string[]) => string; // Returns JSON string
  importComments: (commentsJson: string) => number; // Returns count imported

  // Cache management
  refreshCommentCache: () => void;
  clearCache: () => void;

  // User management
  setCurrentUser: (user: { id: string; name: string }) => void;
  getCurrentUser: () => { id: string; name: string } | null;

  // Validation
  validateCommentData: (comment: unknown) => boolean;

  // State management
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  clearAllComments: () => void;
}

/**
 * Generates a unique comment ID
 */
const generateCommentId = (): string => {
  return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Generates a unique user ID for new users
 */
const generateUserId = (): string => {
  return `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Gets or creates a default user for comments
 */
const getDefaultUser = () => {
  const stored = localStorage.getItem('bias-cards-user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user.id && user.name) {
        return user;
      }
    } catch {
      // Fall through to create new user
    }
  }

  // Create new default user
  const defaultUser = {
    id: generateUserId(),
    name: 'Guest User',
  };

  localStorage.setItem('bias-cards-user', JSON.stringify(defaultUser));
  return defaultUser;
};

/**
 * Creates a comment summary from an array of comments
 */
const createCommentSummary = (
  cardId: string,
  comments: Comment[]
): CommentSummary => {
  const cardComments = comments.filter((c) => c.cardId === cardId);

  const commentsByCategory = cardComments.reduce(
    (acc, comment) => {
      acc[comment.category] = (acc[comment.category] || 0) + 1;
      return acc;
    },
    {} as Record<CommentCategory, number>
  );

  // Ensure all categories are represented
  const categories: CommentCategory[] = [
    'rationale',
    'implementation',
    'general',
  ];
  for (const category of categories) {
    if (!(category in commentsByCategory)) {
      commentsByCategory[category] = 0;
    }
  }

  const sortedComments = cardComments.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    cardId,
    totalComments: cardComments.length,
    commentsByCategory,
    lastCommentTimestamp: sortedComments[0]?.timestamp,
    hasUnreadComments: false, // Could be enhanced with read tracking
  };
};

/**
 * Filters comments based on provided criteria
 */
const matchesCardFilter = (comment: Comment, cardIds?: string[]): boolean => {
  return !cardIds || cardIds.includes(comment.cardId);
};

const matchesCategoryFilter = (
  comment: Comment,
  categories?: CommentCategory[]
): boolean => {
  return !categories || categories.includes(comment.category);
};

const matchesStageFilter = (
  comment: Comment,
  stages?: LifecycleStage[]
): boolean => {
  return (
    !(stages && comment.stageContext) || stages.includes(comment.stageContext)
  );
};

const matchesUserFilter = (comment: Comment, userId?: string): boolean => {
  return !userId || comment.userId === userId;
};

const matchesDateFilter = (
  comment: Comment,
  dateRange?: { start: string; end: string }
): boolean => {
  if (!dateRange) {
    return true;
  }

  const commentDate = new Date(comment.timestamp);
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);

  return commentDate >= startDate && commentDate <= endDate;
};

const matchesSearchFilter = (
  comment: Comment,
  searchQuery?: string
): boolean => {
  if (!searchQuery) {
    return true;
  }

  const query = searchQuery.toLowerCase();
  const searchableText = [comment.content, comment.userName, comment.category]
    .join(' ')
    .toLowerCase();

  return searchableText.includes(query);
};

const applyCommentFilters = (
  comments: Comment[],
  filters: CommentFilters
): Comment[] => {
  return comments.filter((comment) => {
    return (
      matchesCardFilter(comment, filters.cardIds) &&
      matchesCategoryFilter(comment, filters.categories) &&
      matchesStageFilter(comment, filters.stages) &&
      matchesUserFilter(comment, filters.userId) &&
      matchesDateFilter(comment, filters.dateRange) &&
      matchesSearchFilter(comment, filters.searchQuery)
    );
  });
};

/**
 * Creates the comments store with Zustand
 */
export const useCommentsStore = create<CommentsStoreState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        comments: [],
        commentsCache: new Map(),
        isLoading: false,
        error: null,
        currentUser: null,

        // Comment management actions
        addComment: (
          cardId,
          cardType,
          content,
          category,
          stageContext,
          metadata
        ) => {
          try {
            set({ isLoading: true, error: null });

            const currentUser = get().currentUser || getDefaultUser();
            const commentId = generateCommentId();

            const newComment: Comment = {
              id: commentId,
              cardId,
              cardType,
              stageContext,
              userId: currentUser.id,
              userName: currentUser.name,
              timestamp: new Date().toISOString(),
              content: content.trim(),
              category,
              isEdited: false,
              metadata,
            };

            // Validate the comment
            const validation = validateComment(newComment);
            if (!validation.success) {
              throw new Error(
                `Invalid comment data: ${validation.errors?.[0]?.message}`
              );
            }

            set((state) => ({
              comments: [...state.comments, newComment],
              isLoading: false,
            }));

            // Refresh cache for this card
            get().refreshCommentCache();

            return commentId;
          } catch (error) {
            set({
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to add comment',
            });
            throw error;
          }
        },

        updateComment: (commentId, content, editReason) => {
          try {
            set({ isLoading: true, error: null });

            const comment = get().comments.find((c) => c.id === commentId);
            if (!comment) {
              throw new Error('Comment not found');
            }

            const currentUser = get().currentUser || getDefaultUser();

            // Only allow editing own comments
            if (comment.userId !== currentUser.id) {
              throw new Error("Cannot edit another user's comment");
            }

            const updatedComment: Comment = {
              ...comment,
              content: content.trim(),
              isEdited: true,
              editHistory: [
                ...(comment.editHistory || []),
                {
                  timestamp: new Date().toISOString(),
                  previousContent: comment.content,
                  editReason,
                },
              ],
            };

            // Validate the updated comment
            const validation = validateComment(updatedComment);
            if (!validation.success) {
              throw new Error(
                `Invalid comment data: ${validation.errors?.[0]?.message}`
              );
            }

            set((state) => ({
              comments: state.comments.map((c) =>
                c.id === commentId ? updatedComment : c
              ),
              isLoading: false,
            }));

            get().refreshCommentCache();
            return true;
          } catch (error) {
            set({
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to update comment',
            });
            return false;
          }
        },

        deleteComment: (commentId) => {
          try {
            set({ isLoading: true, error: null });

            const comment = get().comments.find((c) => c.id === commentId);
            if (!comment) {
              throw new Error('Comment not found');
            }

            const currentUser = get().currentUser || getDefaultUser();

            // Only allow deleting own comments
            if (comment.userId !== currentUser.id) {
              throw new Error("Cannot delete another user's comment");
            }

            set((state) => ({
              comments: state.comments.filter((c) => c.id !== commentId),
              isLoading: false,
            }));

            get().refreshCommentCache();
            return true;
          } catch (error) {
            set({
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to delete comment',
            });
            return false;
          }
        },

        // Comment retrieval
        getCommentsByCard: (cardId) => {
          return get().comments.filter((comment) => comment.cardId === cardId);
        },

        getCommentsByCategory: (cardId, category) => {
          return get().comments.filter(
            (comment) =>
              comment.cardId === cardId && comment.category === category
          );
        },

        getCommentsByStage: (stage) => {
          return get().comments.filter(
            (comment) => comment.stageContext === stage
          );
        },

        getCommentById: (commentId) => {
          return get().comments.find((comment) => comment.id === commentId);
        },

        // Search and filtering
        searchComments: (query) => {
          const searchQuery = query.toLowerCase().trim();
          if (!searchQuery) {
            return get().comments;
          }

          return get().comments.filter((comment) => {
            const searchableText = [
              comment.content,
              comment.userName,
              comment.category,
            ]
              .join(' ')
              .toLowerCase();

            return searchableText.includes(searchQuery);
          });
        },

        filterComments: (filters) => {
          return applyCommentFilters(get().comments, filters);
        },

        // Comment summaries
        getCommentSummary: (cardId) => {
          const cached = get().commentsCache.get(cardId);
          if (cached) {
            return cached;
          }

          const summary = createCommentSummary(cardId, get().comments);

          // Update cache
          set((state) => {
            const newCache = new Map(state.commentsCache);
            newCache.set(cardId, summary);
            return { commentsCache: newCache };
          });

          return summary;
        },

        getCommentCount: (cardId) => {
          return get().comments.filter((comment) => comment.cardId === cardId)
            .length;
        },

        getCommentCountByCategory: (cardId, category) => {
          return get().comments.filter(
            (comment) =>
              comment.cardId === cardId && comment.category === category
          ).length;
        },

        // Bulk operations
        bulkDeleteCommentsByCard: (cardId) => {
          try {
            set({ isLoading: true, error: null });

            const commentsToDelete = get().comments.filter(
              (c) => c.cardId === cardId
            );
            const deleteCount = commentsToDelete.length;

            set((state) => ({
              comments: state.comments.filter((c) => c.cardId !== cardId),
              isLoading: false,
            }));

            get().refreshCommentCache();
            return deleteCount;
          } catch (error) {
            set({
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to bulk delete comments',
            });
            return 0;
          }
        },

        exportComments: (cardIds) => {
          const commentsToExport = cardIds
            ? get().comments.filter((c) => cardIds.includes(c.cardId))
            : get().comments;

          return JSON.stringify(
            {
              version: '1.0',
              exportedAt: new Date().toISOString(),
              comments: commentsToExport,
            },
            null,
            2
          );
        },

        importComments: (commentsJson) => {
          try {
            set({ isLoading: true, error: null });

            const data = JSON.parse(commentsJson);
            const importedComments = data.comments as Comment[];

            if (!Array.isArray(importedComments)) {
              throw new Error('Invalid import format');
            }

            // Validate each comment
            const validComments: Comment[] = [];
            for (const comment of importedComments) {
              const validation = validateComment(comment);
              if (validation.success) {
                validComments.push(validation.data);
              }
            }

            // Merge with existing comments (avoid duplicates by ID)
            const existingIds = new Set(get().comments.map((c) => c.id));
            const newComments = validComments.filter(
              (c) => !existingIds.has(c.id)
            );

            set((state) => ({
              comments: [...state.comments, ...newComments],
              isLoading: false,
            }));

            get().refreshCommentCache();
            return newComments.length;
          } catch (error) {
            set({
              isLoading: false,
              error:
                error instanceof Error
                  ? error.message
                  : 'Failed to import comments',
            });
            return 0;
          }
        },

        // Cache management
        refreshCommentCache: () => {
          set({ commentsCache: new Map() });
        },

        clearCache: () => {
          set({ commentsCache: new Map() });
        },

        // User management
        setCurrentUser: (user) => {
          set({ currentUser: user });
          // Persist user info
          localStorage.setItem('bias-cards-user', JSON.stringify(user));
        },

        getCurrentUser: () => {
          return get().currentUser || getDefaultUser();
        },

        // Validation
        validateCommentData: (comment) => {
          const validation = validateComment(comment);
          return validation.success;
        },

        // State management
        clearError: () => {
          set({ error: null });
        },

        setLoading: (loading) => {
          set({ isLoading: loading });
        },

        clearAllComments: () => {
          set({
            comments: [],
            commentsCache: new Map(),
            error: null,
          });
        },
      }),
      {
        name: 'comments-store',
        partialize: (state) => ({
          comments: state.comments,
          currentUser: state.currentUser,
        }),
        onRehydrateStorage: () => (state) => {
          // Initialize user if not set
          if (state && !state.currentUser) {
            state.currentUser = getDefaultUser();
          }
        },
      }
    ),
    { name: 'comments-store' }
  )
);
