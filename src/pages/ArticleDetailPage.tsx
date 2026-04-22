import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, User, Calendar, MessageCircle, Heart, Edit2, Trash2, Loader } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { getTimeAgo } from '@/lib/dateUtils';
import { Article } from '@/data/types';

const ArticleDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/${id}`);
        if (response.ok) {
          const data = await response.json();
          setArticle(data);
          setIsLiked(data.likes?.includes(user?.id || '') || false);
          setLikesCount(data.likes?.length || 0);
        }
      } catch (error) {
        console.error('Failed to fetch article:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchArticle();
  }, [id, user?.id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p>Article not found.</p>
        <Link to="/articles" className="text-primary underline">Back to Articles</Link>
      </div>
    );
  }

  const handleLike = async () => {
    if (!user) {
      toast.error('Please sign in to like articles');
      return;
    }

    try {
      const response = await fetch(`/api/articles/${id}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.liked);
        setLikesCount(prev => data.liked ? prev + 1 : prev - 1);
        toast.success(data.liked ? 'Article liked!' : 'Article unliked');
      }
    } catch (error) {
      toast.error('Failed to update like');
    }
  };

  const handleComment = async () => {
    if (!comment.trim() || !user) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/articles/${id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: user.name,
          text: comment.trim(),
        }),
      });

      if (response.ok) {
        toast.success('Comment posted!');
        setComment('');
        // Refetch the article to update comments
        const articleResponse = await fetch(`/api/articles/${id}`);
        if (articleResponse.ok) {
          setArticle(await articleResponse.json());
        }
      }
    } catch (error) {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editText.trim()) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/articles/${id}/comments`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          userId: user?.id,
          text: editText.trim(),
        }),
      });

      if (response.ok) {
        toast.success('Comment updated!');
        setEditingComment(null);
        setEditText('');
        // Refetch the article to update comments
        const articleResponse = await fetch(`/api/articles/${id}`);
        if (articleResponse.ok) {
          setArticle(await articleResponse.json());
        }
      }
    } catch (error) {
      toast.error('Failed to update comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    setSubmitting(true);
    try {
      const response = await fetch(`/api/articles/${id}/comments`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commentId,
          userId: user?.id,
          isAdmin: user?.role === 'admin',
        }),
      });

      if (response.ok) {
        toast.success('Comment deleted!');
        // Refetch the article to update comments
        const articleResponse = await fetch(`/api/articles/${id}`);
        if (articleResponse.ok) {
          setArticle(await articleResponse.json());
        }
      }
    } catch (error) {
      toast.error('Failed to delete comment');
    } finally {
      setSubmitting(false);
    }
  };;

  const startEditing = (comment: any) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditText('');
  };

  return (
    <div>
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4">
          <Link to="/articles" className="mb-4 inline-flex items-center gap-1 text-sm text-secondary/70 hover:text-gold transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Articles
          </Link>
          <span className="mb-3 block text-xs font-medium text-gold">{article.category}</span>
          <h1 className="mb-4 font-heading text-3xl font-bold text-secondary md:text-4xl">{article.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-secondary/70">
            <span className="flex items-center gap-1"><User className="h-4 w-4 text-gold" /> {article.author}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4 text-gold" /> {article.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-gold" /> {article.readTime}</span>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <div className="prose prose-lg max-w-none">
              {article.content.split('\n\n').map((p, i) => (
                <p key={i} className="mb-4 text-foreground leading-relaxed">{p}</p>
              ))}
            </div>

            {/* Like and Comment Stats */}
            <div className="mt-8 flex items-center gap-6 border-t border-border pt-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`flex items-center gap-2 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MessageCircle className="h-4 w-4" />
                {article.comments.length} {article.comments.length === 1 ? 'Comment' : 'Comments'}
              </div>
            </div>

            {/* Comments */}
            <div className="mt-8 border-t border-border pt-8">
              <h3 className="mb-6 font-heading text-xl font-bold text-foreground flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-gold" /> Comments ({article.comments.length})
              </h3>

              {article.comments.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to share your thoughts!</p>
              ) : (
                <div className="space-y-4">
                  {article.comments.map((c) => (
                    <div key={c.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-medium text-card-foreground">{c.userName}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {c.createdAt ? getTimeAgo(c.createdAt) : c.date}
                          </span>
                          {user && (user.id === c.userId || user.role === 'admin') && (
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditing(c)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-primary"
                              >
                                <Edit2 className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteComment(c.id)}
                                className="h-6 w-6 p-0 text-muted-foreground hover:text-red-500"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      {editingComment === c.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full rounded-lg border border-border bg-card p-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleEditComment(c.id)}
                              size="sm"
                              disabled={submitting}
                              className="bg-primary text-primary-foreground"
                            >
                              {submitting ? 'Saving...' : 'Save'}
                            </Button>
                            <Button
                              onClick={cancelEditing}
                              size="sm"
                              variant="outline"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">{c.text}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {user ? (
                <div className="mt-6">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="w-full rounded-lg border border-border bg-card p-3 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={3}
                  />
                  <Button
                    onClick={handleComment}
                    size="sm"
                    className="mt-2 bg-primary text-primary-foreground"
                    disabled={submitting || !comment.trim()}
                  >
                    {submitting ? 'Posting...' : 'Post Comment'}
                  </Button>
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  <Link to="/login" className="text-primary underline">Sign in</Link> to leave a comment.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArticleDetailPage;
