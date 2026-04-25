import { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Download, Search, Lock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const NotesPage = () => {
  const { courses, categories, notes, refetchNotes, isEnrolled } = useData();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const loadNotes = async () => {
      setLoading(true);
      if (!user?.id) {
        setError('Please sign up/login to access notes');
        setLoading(false);
        return;
      }
      setError('');
      await refetchNotes(user.id);
      setLoading(false);
    };

    loadNotes();
  }, [user?.id]);

  const currentUserId = user?.id || (user as any)?._id?.toString() || '';

  const filteredNotes = notes.filter((n: any) => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDownload = (note: any) => {
    const noteAccessible = note.accessible ?? Boolean(currentUserId && isEnrolled(currentUserId, note.courseId));
    if (!noteAccessible) {
      toast.error('Enroll in the course to access this note.');
      return;
    }

    if (note.fileUrl) {
      const fileHref = note.fileUrl.startsWith('/') ? `${window.location.origin}${note.fileUrl}` : note.fileUrl;
      const a = document.createElement('a');
      a.href = fileHref;
      a.download = `${note.title.replace(/\s+/g, '-')}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Note downloaded!');
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

  const handleOpenLink = (note: any) => {
    const noteAccessible = note.accessible ?? Boolean(currentUserId && isEnrolled(currentUserId, note.courseId));
    if (!noteAccessible) {
      toast.error('Enroll in the course to access this note.');
      return;
    }

    const url = note.externalLink || note.link;
    if (!url) {
      toast.error('No external link available for this note.');
      return;
    }

    window.open(url, '_blank');
    toast.success('Note opened!');
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
          ) : loading ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground animate-pulse" />
              <p className="text-muted-foreground">Loading notes...</p>
            </div>
          ) : filteredNotes.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No notes found.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredNotes.map((note: any) => {
                const course = courses.find(c => c.id === note.courseId);
                const noteAccessible = note.accessible ?? Boolean(currentUserId && isEnrolled(currentUserId, note.courseId));
                return (
                  <div key={note.id} className="rounded-lg border border-border bg-card p-5 hover:border-gold/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <h3 className="font-heading text-base font-semibold text-card-foreground">{note.title}</h3>
                          {!noteAccessible && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                              <Lock className="h-3 w-3" /> Locked
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gold mb-2">{note.category}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{note.description}</p>
                        {course && <p className="text-xs text-muted-foreground mb-3">Course: {course.title}</p>}
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-muted-foreground">{note.uploadDate}</span>
                            <div className="flex flex-wrap gap-2">
                              {note.fileUrl && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 text-xs border-primary text-primary"
                                  onClick={() => handleDownload(note)}
                                  disabled={!noteAccessible}
                                >
                                  <Download className="h-3 w-3" /> {noteAccessible ? 'Download' : 'Locked'}
                                </Button>
                              )}
                              {(note.externalLink || note.link) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 text-xs border-primary text-primary"
                                  onClick={() => handleOpenLink(note)}
                                  disabled={!noteAccessible}
                                >
                                  <ExternalLink className="h-3 w-3" /> {noteAccessible ? 'Click Here' : 'Locked'}
                                </Button>
                              )}
                            </div>
                          </div>
                          {!noteAccessible && (
                            <p className="text-xs text-muted-foreground">Enroll in the course to unlock this note.</p>
                          )}
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
