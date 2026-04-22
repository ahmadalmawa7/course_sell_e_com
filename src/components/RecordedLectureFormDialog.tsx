import { useState, useEffect } from 'react';
import { X, Save, Upload, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Course, RecordedLecture } from '@/data/types';

interface RecordedLectureFormDialogProps {
  initial: RecordedLecture | null;
  courses: Course[];
  onSave: (data: RecordedLecture, courseId: string) => void;
  onClose: () => void;
}

const DialogOverlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>
      {children}
    </div>
  </div>
);

export function RecordedLectureFormDialog({
  initial,
  courses,
  onSave,
  onClose,
}: RecordedLectureFormDialogProps) {
  const [form, setForm] = useState({
    id: initial?.id || `rl-${Date.now()}`,
    moduleName: initial?.moduleName || '',
    lectureTitle: initial?.lectureTitle || '',
    duration: initial?.duration || '',
    videoUrl: initial?.videoUrl || '',
    preview: initial?.preview || false,
    thumbnail: initial?.thumbnail || '',
    description: initial?.description || '',
  });

  // Find the course that contains this lecture when editing
  const findCourseForLecture = () => {
    if (!initial) return '';
    for (const course of courses) {
      if (course.recordedLectures?.some(l => l.id === initial.id)) {
        return course.id;
      }
    }
    return '';
  };

  const [selectedCourseId, setSelectedCourseId] = useState(
    initial ? findCourseForLecture() : ''
  );

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailName, setThumbnailName] = useState(initial?.thumbnail ? 'Image uploaded' : 'No file chosen');
  const [uploading, setUploading] = useState(false);

  const handleThumbnailUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'lectures');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setForm({ ...form, thumbnail: data.url });
        toast.success('Thumbnail uploaded successfully!');
      } else {
        toast.error('Failed to upload thumbnail');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailName(file.name);
      handleThumbnailUpload(file);
    }
  };

  const handleSave = () => {
    console.log('Form data:', form);
    console.log('Selected course ID:', selectedCourseId);
    
    if (!form.moduleName || !form.lectureTitle || !form.videoUrl || !selectedCourseId) {
      toast.error('Module Name, Lecture Title, Video URL, and Course are required');
      return;
    }

    if (!form.videoUrl.includes('youtube') && !form.videoUrl.includes('vimeo') && !form.videoUrl.startsWith('http')) {
      toast.error('Please enter a valid video URL (YouTube, Vimeo, or direct link)');
      return;
    }

    console.log('Saving lecture:', form);
    onSave(form, selectedCourseId);
  };

  return (
    <DialogOverlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-card-foreground">
          {initial ? 'Edit Recorded Lecture' : 'Add Recorded Lecture'}
        </h3>
        <button onClick={onClose}>
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Course *
          </label>
          <select
            value={selectedCourseId}
            onChange={e => setSelectedCourseId(e.target.value)}
            disabled={initial ? true : false}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Select a course</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          {initial && <p className="text-xs text-muted-foreground mt-1">Course cannot be changed when editing</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Module Title *
          </label>
          <Input
            value={form.moduleName}
            onChange={e => setForm({ ...form, moduleName: e.target.value })}
            placeholder="e.g. Introduction to Leadership"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Lecture Title *
          </label>
          <Input
            value={form.lectureTitle}
            onChange={e => setForm({ ...form, lectureTitle: e.target.value })}
            placeholder="e.g. Lesson 1: Core Principles"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Video URL *
          </label>
          <Input
            value={form.videoUrl}
            onChange={e => setForm({ ...form, videoUrl: e.target.value })}
            placeholder="e.g. https://www.youtube.com/watch?v=... or https://vimeo.com/..."
          />
          <p className="text-xs text-muted-foreground mt-1">Supports YouTube, Vimeo, or direct video links</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Duration *
            </label>
            <Input
              value={form.duration}
              onChange={e => setForm({ ...form, duration: e.target.value })}
              placeholder="e.g. 45:30"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <input
                type="checkbox"
                checked={form.preview}
                onChange={e => setForm({ ...form, preview: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              Preview/Free
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Thumbnail Image
          </label>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <label className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground cursor-pointer hover:bg-primary/90">
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="sr-only"
                />
              </label>
              <span className="text-xs text-muted-foreground truncate max-w-[220px]">{thumbnailName}</span>
            </div>
            {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
            {form.thumbnail && (
              <div className="flex items-center gap-2">
                <img
                  src={form.thumbnail}
                  alt="Thumbnail preview"
                  className="h-16 w-16 object-cover rounded"
                />
                <span className="text-xs text-muted-foreground">Image uploaded</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            Description (Optional)
          </label>
          <Textarea
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            rows={3}
            placeholder="Brief description of the lecture content..."
          />
        </div>
      </div>

      <div className="mt-6 flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!form.moduleName || !form.lectureTitle || !form.videoUrl || !selectedCourseId}
        >
          <Save className="h-3 w-3 mr-1" />
          {initial ? 'Update' : 'Add'} Lecture
        </Button>
      </div>
    </DialogOverlay>
  );
}
