import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { BookOpen, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ArticleSubmissionDialogProps {
  onSubmitSuccess?: () => void;
}

export const ArticleSubmissionDialog = ({ onSubmitSuccess }: ArticleSubmissionDialogProps) => {
  const { user } = useAuth();
  const { refetchArticles, categories } = useData();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Leadership',
    readTime: '5 min read',
    image: '',
  });

  useEffect(() => {
    if (categories.length > 0) {
      const defaultCategory = categories.find((c) => c !== 'All') || categories[0];
      setFormData((prev) => ({ ...prev, category: defaultCategory }));
    }
  }, [categories]);

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      author: user?.name || 'Anonymous',
      date: new Date().toISOString().split('T')[0],
      status: 'pending',
      submittedBy: user?.email || 'unknown',
    };

    console.log('Submitting article:', payload);

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        toast.success('Article submitted for approval!');
        setFormData({
          title: '',
          excerpt: '',
          content: '',
          category: 'Leadership',
          readTime: '5 min read',
          image: '',
        });
        setOpen(false);

        // Refetch articles to update the admin panel if needed
        if (refetchArticles) await refetchArticles();
        if (onSubmitSuccess) onSubmitSuccess();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Article submit error:', errorData);
        toast.error(errorData.error || 'Failed to submit article');
      }
    } catch (error) {
      toast.error('Error submitting article');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary text-primary-foreground">
          <BookOpen className="h-4 w-4" />
          Submit Article
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Submit an Article</DialogTitle>
          <DialogDescription>
            Share your insights with our community. Your article will be reviewed by our admin team before publication.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Article title"
              className="w-full rounded-lg border border-border bg-card p-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Excerpt *</label>
            <textarea
              required
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              placeholder="Brief summary (one or two sentences)"
              rows={2}
              className="w-full rounded-lg border border-border bg-card p-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Content *</label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Full article content"
              rows={6}
              className="w-full rounded-lg border border-border bg-card p-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-border bg-card p-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1"
              >
                {categories.filter((cat) => cat !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground">Read Time</label>
              <input
                type="text"
                value={formData.readTime}
                onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                placeholder="e.g., 5 min read"
                className="w-full rounded-lg border border-border bg-card p-2 text-sm text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground">Article Image</label>
            <div className="mt-1 space-y-2">
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground cursor-pointer hover:bg-primary/90 transition-colors">
                  <Upload className="h-4 w-4" />
                  Choose Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploading(true);
                        try {
                          const uploadData = new FormData();
                          uploadData.append('file', file);
                          uploadData.append('type', 'article');
                          const response = await fetch('/api/upload', { method: 'POST', body: uploadData });
                          if (response.ok) {
                            const data = await response.json();
                            setFormData(prev => ({ ...prev, image: data.url }));
                            toast.success('Image uploaded successfully!');
                          } else {
                            toast.error('Failed to upload image');
                          }
                        } catch {
                          toast.error('Upload failed');
                        } finally {
                          setUploading(false);
                        }
                      }
                    }}
                    disabled={uploading}
                    className="sr-only"
                  />
                </label>
                {uploading && <span className="text-sm text-muted-foreground">Uploading...</span>}
              </div>
              {formData.image && (
                <div className="relative">
                  <img src={formData.image} alt="Article preview" className="h-32 w-48 object-cover rounded-lg border border-border" />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, image: '' })}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-destructive text-white text-xs hover:bg-destructive/90"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Article'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
