'use client';

import { Edit3, MessageSquare, Plus, Save, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useCommentsStore } from '@/lib/stores';
import type { Comment, CommentCategory, LifecycleStage } from '@/lib/types';

interface CardCommentDialogProps {
  cardId: string;
  cardType: 'bias' | 'mitigation';
  cardName: string;
  stageContext?: LifecycleStage;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface CommentItemProps {
  comment: Comment;
  onEdit: (commentId: string, content: string) => void;
  onDelete: (commentId: string) => void;
  currentUserId: string;
}

const CommentItem = ({
  comment,
  onEdit,
  onDelete,
  currentUserId,
}: CommentItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = comment.userId === currentUserId;
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== comment.content) {
      onEdit(comment.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{comment.userName}</span>
          <Badge className="text-xs" variant="outline">
            {comment.category}
          </Badge>
          {comment.isEdited && (
            <Badge className="text-xs" variant="secondary">
              edited
            </Badge>
          )}
        </div>

        {isOwner && !isEditing && (
          <div className="flex space-x-1">
            <Button
              className="h-6 w-6 p-0"
              onClick={() => setIsEditing(true)}
              size="sm"
              variant="ghost"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
            <Button
              className="h-6 w-6 p-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(comment.id)}
              size="sm"
              variant="ghost"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}

        {isEditing && (
          <div className="flex space-x-1">
            <Button
              className="h-6 w-6 p-0 text-green-600"
              onClick={handleSaveEdit}
              size="sm"
              variant="ghost"
            >
              <Save className="h-3 w-3" />
            </Button>
            <Button
              className="h-6 w-6 p-0"
              onClick={handleCancelEdit}
              size="sm"
              variant="ghost"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          className="min-h-[60px] text-sm"
          onChange={(e) => setEditContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
              handleSaveEdit();
            } else if (e.key === 'Escape') {
              handleCancelEdit();
            }
          }}
          placeholder="Edit your comment..."
          value={editContent}
        />
      ) : (
        <p className="whitespace-pre-wrap text-muted-foreground text-sm">
          {comment.content}
        </p>
      )}

      <div className="flex items-center justify-between text-muted-foreground text-xs">
        <span>{formatDate(comment.timestamp)}</span>
        {comment.stageContext && (
          <Badge className="text-xs" variant="outline">
            {comment.stageContext.replace('-', ' ')}
          </Badge>
        )}
      </div>
    </div>
  );
};

interface AddCommentFormProps {
  category: CommentCategory;
  onAdd: (content: string, category: CommentCategory) => void;
  isLoading: boolean;
}

const AddCommentForm = ({
  category,
  onAdd,
  isLoading,
}: AddCommentFormProps) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAdd(content.trim(), category);
      setContent('');
    }
  };

  const getCategoryPlaceholder = (cat: CommentCategory) => {
    switch (cat) {
      case 'rationale':
        return 'Explain why this bias/mitigation is relevant to your project...';
      case 'implementation':
        return 'Describe how you plan to implement this mitigation strategy...';
      case 'general':
        return 'Add any additional notes or observations...';
      default:
        return 'Add your comment...';
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div>
        <Label className="font-medium text-sm" htmlFor={`comment-${category}`}>
          Add {category} comment
        </Label>
        <Textarea
          className="mt-1 min-h-[80px]"
          disabled={isLoading}
          id={`comment-${category}`}
          onChange={(e) => setContent(e.target.value)}
          placeholder={getCategoryPlaceholder(category)}
          value={content}
        />
      </div>
      <Button disabled={!content.trim() || isLoading} size="sm" type="submit">
        <Plus className="mr-1 h-3 w-3" />
        Add Comment
      </Button>
    </form>
  );
};

export function CardCommentDialog({
  cardId,
  cardType,
  cardName,
  stageContext,
  trigger,
  open,
  onOpenChange,
}: CardCommentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<CommentCategory>('rationale');

  const {
    getCommentsByCard,
    getCommentsByCategory,
    addComment,
    updateComment,
    deleteComment,
    getCurrentUser,
    isLoading,
    error,
    clearError,
  } = useCommentsStore();

  const currentUser = getCurrentUser();
  const allComments = getCommentsByCard(cardId);

  // Group comments by category
  const commentsByCategory = {
    rationale: getCommentsByCategory(cardId, 'rationale'),
    implementation: getCommentsByCategory(cardId, 'implementation'),
    general: getCommentsByCategory(cardId, 'general'),
  };

  // Handle controlled vs uncontrolled open state
  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  useEffect(() => {
    if (error) {
      setTimeout(clearError, 5000); // Clear error after 5 seconds
    }
  }, [error, clearError]);

  const handleAddComment = async (
    content: string,
    category: CommentCategory
  ) => {
    try {
      await addComment(cardId, cardType, content, category, stageContext);
    } catch (_error) {}
  };

  const handleEditComment = async (commentId: string, content: string) => {
    try {
      await updateComment(commentId, content);
    } catch (_error) {}
  };

  const handleDeleteComment = async (commentId: string) => {
    if (confirm('Are you sure you want to delete this comment?')) {
      try {
        await deleteComment(commentId);
      } catch (_error) {}
    }
  };

  const getTotalComments = () => allComments.length;
  const getCategoryCount = (category: CommentCategory) =>
    commentsByCategory[category].length;

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline">
            <MessageSquare className="mr-1 h-3 w-3" />
            Comments ({getTotalComments()})
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>Comments for {cardName}</span>
          </DialogTitle>
          <DialogDescription>
            Add rationale, implementation notes, or general observations for
            this {cardType} card.
            {stageContext && (
              <span className="mt-1 block">
                Context:{' '}
                <Badge variant="outline">
                  {stageContext.replace('-', ' ')}
                </Badge>
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-destructive text-sm">
            {error}
          </div>
        )}

        <Tabs
          onValueChange={(value) => setActiveTab(value as CommentCategory)}
          value={activeTab}
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger className="text-xs" value="rationale">
              Rationale ({getCategoryCount('rationale')})
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="implementation">
              Implementation ({getCategoryCount('implementation')})
            </TabsTrigger>
            <TabsTrigger className="text-xs" value="general">
              General ({getCategoryCount('general')})
            </TabsTrigger>
          </TabsList>

          {(
            ['rationale', 'implementation', 'general'] as CommentCategory[]
          ).map((category) => (
            <TabsContent className="space-y-4" key={category} value={category}>
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {commentsByCategory[category].length > 0 ? (
                    commentsByCategory[category]
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp).getTime() -
                          new Date(a.timestamp).getTime()
                      )
                      .map((comment) => (
                        <CommentItem
                          comment={comment}
                          currentUserId={currentUser?.id || ''}
                          key={comment.id}
                          onDelete={handleDeleteComment}
                          onEdit={handleEditComment}
                        />
                      ))
                  ) : (
                    <div className="flex h-24 items-center justify-center text-muted-foreground">
                      <p className="text-sm">No {category} comments yet</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              <Separator />

              <AddCommentForm
                category={category}
                isLoading={isLoading}
                onAdd={handleAddComment}
              />
            </TabsContent>
          ))}
        </Tabs>

        <div className="flex items-center justify-between pt-2 text-muted-foreground text-xs">
          <span>
            Total: {getTotalComments()} comment
            {getTotalComments() !== 1 ? 's' : ''}
          </span>
          <span>Signed in as: {currentUser?.name || 'Guest'}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
