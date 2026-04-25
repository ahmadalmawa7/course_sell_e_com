import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileText, Lock } from 'lucide-react';
import type { Note } from '@/data/types';

interface NotesCardProps {
  note: Note;
  isEnrolled: boolean;
}

const isValidFileUrl = (url?: string) => {
  if (!url) return false;
  return url.startsWith('/') || /^https?:\/\//i.test(url);
};

const isValidExternalLink = (url?: string) => {
  if (!url) return false;
  return /^https?:\/\//i.test(url);
};

const normalizeFileUrl = (url: string) => {
  return url.startsWith('/') ? `${window.location.origin}${url}` : url;
};

export const NotesCard = ({ note, isEnrolled }: NotesCardProps) => {
  const noteLink = note.link || note.externalLink || '';
  const hasFile = Boolean(note.fileUrl);
  const hasLink = isValidExternalLink(noteLink);
  const canDownload = isEnrolled && hasFile && isValidFileUrl(note.fileUrl);
  const canOpenLink = isEnrolled && hasLink;

  const handleDownload = () => {
    if (!note.fileUrl) return;
    const fileUrl = normalizeFileUrl(note.fileUrl);
    const anchor = document.createElement('a');
    anchor.href = fileUrl;
    anchor.download = note.title.replace(/\s+/g, '-');
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleOpenLink = () => {
    if (!hasLink) return;
    window.open(noteLink, '_blank', 'noopener noreferrer');
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 hover:border-gold/50 transition-colors">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-medium text-card-foreground text-sm mb-1 truncate">{note.title}</p>
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{note.description}</p>
          <p className="text-xs text-muted-foreground mb-4">{note.uploadDate || note.createdAt || 'Unknown upload date'}</p>
          <div className="flex flex-wrap gap-2">
            {hasFile && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs border-primary text-primary h-9"
                onClick={handleDownload}
                disabled={!canDownload}
              >
                <Download className="h-3 w-3" /> Download
              </Button>
            )}
            {hasLink && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-xs border-primary text-primary h-9"
                onClick={handleOpenLink}
                disabled={!canOpenLink}
              >
                <ExternalLink className="h-3 w-3" /> Click Here
              </Button>
            )}
          </div>
          {!hasFile && !hasLink && (
            <p className="text-xs text-muted-foreground mt-2">No download or link available.</p>
          )}
          {!isEnrolled && (
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Enroll to access notes
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
