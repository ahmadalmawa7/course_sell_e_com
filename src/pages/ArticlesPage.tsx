import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, User, Heart, MessageCircle, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArticleSubmissionDialog } from '@/components/ArticleSubmissionDialog';
import { Article } from '@/data/types';

const ArticlesPage = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('All');
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/articles?status=approved');
        if (response.ok) {
          const data = await response.json();
          setArticles(data);
        }
      } catch (error) {
        console.error('Failed to fetch articles:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            setCategories(data as string[]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };

    fetchArticles();
    fetchCategories();
  }, []);

  const filtered = active === 'All' ? articles : articles.filter((a) => a.category === active);

  return (
    <div>
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Knowledge Hub</p>
              <h1 className="mb-4 font-heading text-4xl font-bold text-secondary md:text-5xl">Articles</h1>
              <p className="max-w-xl text-secondary/80">Insights on leadership, communication, career development, and professional growth.</p>
            </div>
          </div>
          {user && (
            <div className="mt-6">
              <ArticleSubmissionDialog />
            </div>
          )}
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Button key={cat} size="sm" variant={active === cat ? 'default' : 'outline'} className={active === cat ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'} onClick={() => setActive(cat)}>
                {cat}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-lg text-muted-foreground">No articles found</p>
              {user && (
                <p className="text-sm text-muted-foreground mt-2">
                  Be the first to share your insights!
                </p>
              )}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((article) => (
                <Link key={article.id} to={`/articles/${article.id}`} className="group">
                  <div className="h-full rounded-lg border border-border bg-card p-6 transition-all hover:border-gold/50 hover:shadow-md">
                    {article.image && (
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-40 object-cover rounded-lg mb-4"
                      />
                    )}
                    <span className="mb-2 inline-block text-xs font-medium text-gold">{article.category}</span>
                    <h3 className="mb-2 font-heading text-lg font-semibold text-card-foreground group-hover:text-primary transition-colors">{article.title}</h3>
                    <p className="mb-4 text-sm text-muted-foreground line-clamp-3">{article.excerpt}</p>

                    {/* Like and Comment counts */}
                    <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        {article.likes?.length || 0}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        {article.comments?.length || 0}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {article.author}</span>
                      <div className="flex items-center justify-between">
                        <span>{article.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readTime}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ArticlesPage;
