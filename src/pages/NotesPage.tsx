import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, Search, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const NotesPage = () => {
  const { courses, categories } = useData();
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      if (!user) {
        setError('Please sign up/login to access notes');
        setLoading(false);
        return;
      }
      const userId = user.id || (user as any)._id?.toString();
      if (!userId) {
        setError('Please sign up/login to access notes');
        setLoading(false);
        return;
      }
      setError('');
      try {
        const response = await fetch(`/api/notes?userId=${userId}`);
        if (response.ok) {
          const data = await response.json();
          setNotes(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load notes');
        }
      } catch (error) {
        setError('Error loading notes');
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [user]);

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const isExternalNote = (note: any) => !!note.link;

  const handleDownload = (note) => {
    if (note.fileUrl) {
      const a = document.createElement('a');
      a.href = note.fileUrl;
      a.download = `${note.title.replace(/\s+/g, '-')}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Note downloaded!');
      return;
    }

    if (note.link) {
      window.open(note.link, '_blank');
      toast.success('Note opened!');
      return;
    }

    const content = `${note.title}\n\nCategory: ${note.category}\n\n${note.description}\n\nThis is a mock PDF file for demonstration purposes.\n\nErudition Infinite - Integrating Talent, Thought & Action`;
    const blob = new Blob([content], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/\s+/g, '-')}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Note downloaded!');
  };

  return (
    <div>
      <section className="bg-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2 text-xs font-medium tracking-[0.3em] text-gold uppercase">Study Materials</p>
          <h1 className="mb-4 font-heading text-4xl font-bold text-secondary md:text-5xl">Notes & Resources</h1>
          <p className="mx-auto max-w-2xl text-secondary/80">Access course-wise study materials, handbooks, and reference documents.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..." className="pl-10" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No notes found.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map(note => {
                const course = courses.find(c => c.id === note.courseId);
                return (
                  <div key={note.id} className="rounded-lg border border-border bg-card p-5 hover:border-gold/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-base font-semibold text-card-foreground mb-1">{note.title}</h3>
                        <p className="text-xs text-gold mb-2">{note.category}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{note.description}</p>
                        {course && <p className="text-xs text-muted-foreground mb-3">Course: {course.title}</p>}
                        {note.link && (
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <a href={note.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                              👉 Link (Google Drive or external) – Click Here
                            </a>
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{note.uploadDate}</span>
                          <Button variant="outline" size="sm" className="gap-1 text-xs border-primary text-primary" onClick={() => handleDownload(note)}>
                            <Download className="h-3 w-3" /> Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default NotesPage;
