import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Trash, PaperPlaneRight, User, Star } from '@phosphor-icons/react';
import { feedback, auth } from '@/lib/api';
import { ParentComment } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommentSectionProps {
    contentType: 'activity' | 'book';
    contentId: string;
    className?: string;
}

export function CommentSection({ contentType, contentId, className }: CommentSectionProps) {
    const queryClient = useQueryClient();
    const [newComment, setNewComment] = useState('');
    const [user, setUser] = useState<{ id: string } | null>(null);

    useEffect(() => {
        // Check auth status
        auth.getMe().then(res => setUser(res.user)).catch(() => setUser(null));
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['comments', contentType, contentId],
        queryFn: () => feedback.getComments(contentType, contentId),
    });

    const addCommentMutation = useMutation({
        mutationFn: (text: string) => feedback.addComment(contentType, contentId, text),
        onSuccess: (res) => {
            queryClient.setQueryData(['comments', contentType, contentId], (old: any) => ({
                comments: [res.comment, ...(old?.comments || [])],
                count: (old?.count || 0) + 1
            }));
            setNewComment('');
            toast.success('Comment added');
        },
        onError: () => toast.error('Failed to post comment')
    });

    const deleteCommentMutation = useMutation({
        mutationFn: (id: string) => feedback.deleteComment(id),
        onSuccess: (_, id) => {
            queryClient.setQueryData(['comments', contentType, contentId], (old: any) => ({
                comments: old?.comments?.filter((c: ParentComment) => c.id !== id) || [],
                count: Math.max((old?.count || 0) - 1, 0)
            }));
            toast.success('Comment deleted');
        },
        onError: () => toast.error('Failed to delete comment')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        addCommentMutation.mutate(newComment);
    };

    if (isLoading) return <div className="p-4 text-center text-muted-foreground">Loading comments...</div>;

    const comments = data?.comments || [];

    return (
        <div className={cn("space-y-6", className)}>
            <h3 className="text-lg font-display font-bold">
                Parent Comments ({data?.count || 0})
            </h3>

            {/* Add Comment */}
            <form onSubmit={handleSubmit} className="flex gap-4">
                <Avatar className="h-10 w-10 border">
                    <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                    <Textarea
                        placeholder="Share your experience..."
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                        className="min-h-[80px] text-base"
                    />
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            size="sm"
                            disabled={!newComment.trim() || addCommentMutation.isPending}
                        >
                            <PaperPlaneRight className="mr-2 h-4 w-4" />
                            Post Comment
                        </Button>
                    </div>
                </div>
            </form>

            {/* List Comments */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">
                        No comments yet. Be the first to share!
                    </p>
                ) : (
                    comments.map((comment: ParentComment) => (
                        <div key={comment.id} className="flex gap-4 group">
                            <Avatar className="h-10 w-10 border border-border/50">
                                <AvatarImage src={comment.userAvatar} />
                                <AvatarFallback>{comment.userName?.[0] || '?'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-1">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">
                                            {comment.userName || 'Parent'}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </span>
                                        {comment.isSuccessStory && (
                                            <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                                <Star weight="fill" className="h-3 w-3" />
                                                Success Story
                                            </span>
                                        )}
                                    </div>
                                    {user && user.id === comment.userId && (
                                        <button
                                            onClick={() => deleteCommentMutation.mutate(comment.id)}
                                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                        >
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                                    {comment.commentText}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
