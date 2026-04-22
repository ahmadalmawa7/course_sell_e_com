import { useState, useEffect } from 'react';
import { Course, RecordedLecture, CourseAdvantageSection, CourseVideo } from '@/data/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Save, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface DialogOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
}

export const DialogOverlay = ({ children, onClose }: DialogOverlayProps) => (
  <div
    className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 overflow-y-auto"
    onClick={onClose}
  >
    <div
      className="my-6 w-full max-w-2xl rounded-lg bg-card shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  </div>
);

interface CourseFormDialogProps {
  initial: Course | null;
  categories: string[];
  onSave: (data: Partial<Course>) => void;
  onClose: () => void;
}

type TabKey = 'basic' | 'details' | 'curriculum' | 'media' | 'assignments';

export function CourseFormDialog({ initial, categories, onSave, onClose }: CourseFormDialogProps) {
  const [tab, setTab] = useState<TabKey>('basic');
  const [uploading, setUploading] = useState(false);
  const [imageName, setImageName] = useState('No file chosen');

  const [form, setForm] = useState({
    title: initial?.title || '',
    category: initial?.category || categories.filter(c => c !== 'All')[0] || '',
    description: initial?.description || '',
    instructor: initial?.instructor || 'Lt Col Shreesh Kumar (Retd)',
    instructorBio: initial?.instructorBio || '',
    duration: initial?.duration || '',
    modules: initial?.modules?.toString() || '6',
    price: initial?.price?.toString() || '',
    originalPrice: initial?.originalPrice?.toString() || '',
    level: initial?.level || 'Beginner',
    image: initial?.image || '',
    language: initial?.language || 'English',
    certificate: initial?.certificate ?? true,
    liveSessionsIncluded: initial?.liveSessionsIncluded ?? true,
    notesIncluded: initial?.notesIncluded ?? true,
    syllabus: initial?.syllabus || '',
    whyTake: initial?.whyTake || '',
  });

  const [highlights, setHighlights] = useState<string[]>(initial?.highlights || ['']);
  const [advantageSections, setAdvantageSections] = useState<CourseAdvantageSection[]>(() => {
    if (!initial?.advantages) return [{ title: '', videos: [{ title: '', videoUrl: '' }] }];
    return initial.advantages.map((adv) => {
      if (typeof adv === 'string') {
        return {
          title: adv,
          videos: (initial.requirements || []).map((req) => ({ title: req, videoUrl: '' })),
        };
      }
      return {
        title: adv.title || '',
        videos: adv.videos?.length ? adv.videos : [{ title: '', videoUrl: '' }],
      };
    });
  });
  const [targetAudience, setTargetAudience] = useState<string[]>(initial?.targetAudience || ['']);
  const [tags, setTags] = useState<string>(initial?.tags?.join(', ') || '');

  const [modulesList, setModulesList] = useState(
    initial?.modulesList?.length
      ? initial.modulesList
      : [{ title: '', lessons: 1, duration: '1 hr', topics: [] as string[] }]
  );

  const [lectures, setLectures] = useState<RecordedLecture[]>(
    (initial?.recordedLectures || []).map((lec: any) => ({
      id: lec.id || `rl-${Date.now()}`,
      moduleName: lec.moduleName || '',
      lectureTitle: lec.lectureTitle || lec.title || '',
      duration: lec.duration || '',
      videoUrl: lec.videoUrl || '',
      preview: lec.preview !== undefined ? lec.preview : lec.isPreview || false,
      thumbnail: lec.thumbnail || '',
      description: lec.description || '',
    }))
  );

  const [assignments, setAssignments] = useState<{ id: string; title: string; fileUrl: string; courseId: string; createdAt: string }[]>(
    initial?.assignments ? initial.assignments.map((a: any) => ({ id: a.id || `temp-${Date.now()}-${Math.random()}`, title: a.title, fileUrl: a.fileUrl, courseId: a.courseId, createdAt: a.createdAt || new Date().toISOString() })) : []
  );
  const [allCourses, setAllCourses] = useState<Course[]>([]);

  useEffect(() => {
    if (!initial && categories.filter(c => c !== 'All').length > 0) {
      setForm(prev => ({ ...prev, category: categories.filter(c => c !== 'All')[0] }));
    }
  }, [categories, initial]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        if (response.ok) {
          const coursesData = await response.json();
          setAllCourses(coursesData);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };
    fetchCourses();
  }, []);

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'course-image');
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        setForm(prev => ({ ...prev, image: data.url }));
        toast.success('Image uploaded!');
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (file: File, sectionIndex: number, videoIndex: number) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'video');
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        setAdvantageSections((prev) => {
          const next = [...prev];
          const section = next[sectionIndex];
          if (section) {
            section.videos = section.videos.map((video, idx) => idx === videoIndex ? { ...video, videoUrl: data.url } : video);
          }
          return next;
        });
        toast.success('Video uploaded!');
      } else {
        toast.error('Upload failed');
      }
    } catch {
      toast.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const updateList = (
    list: string[],
    setList: (v: string[]) => void,
    idx: number,
    val: string
  ) => {
    const next = [...list];
    next[idx] = val;
    setList(next);
  };

  const addListItem = (list: string[], setList: (v: string[]) => void) =>
    setList([...list, '']);

  const removeListItem = (list: string[], setList: (v: string[]) => void, idx: number) =>
    setList(list.filter((_, i) => i !== idx));

  const updateAdvantageSection = (idx: number, updates: Partial<CourseAdvantageSection>) => {
    setAdvantageSections((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  };

  const addAdvantageSection = () => {
    setAdvantageSections((prev) => [...prev, { title: '', videos: [{ title: '', videoUrl: '' }] }]);
  };

  const removeAdvantageSection = (idx: number) => {
    setAdvantageSections((prev) => prev.filter((_, i) => i !== idx));
  };

  const addVideoToSection = (sectionIndex: number) => {
    setAdvantageSections((prev) => {
      const next = [...prev];
      if (next[sectionIndex]) {
        next[sectionIndex].videos = [...next[sectionIndex].videos, { title: '', videoUrl: '' }];
      }
      return next;
    });
  };

  const updateVideoInSection = (sectionIndex: number, videoIndex: number, updates: Partial<CourseVideo>) => {
    setAdvantageSections((prev) => {
      const next = [...prev];
      if (next[sectionIndex]) {
        next[sectionIndex].videos = next[sectionIndex].videos.map((video, idx) => idx === videoIndex ? { ...video, ...updates } : video);
      }
      return next;
    });
  };

  const removeVideoFromSection = (sectionIndex: number, videoIndex: number) => {
    setAdvantageSections((prev) => {
      const next = [...prev];
      if (next[sectionIndex]) {
        next[sectionIndex].videos = next[sectionIndex].videos.filter((_, idx) => idx !== videoIndex);
      }
      return next;
    });
  };

  const addAssignment = () => {
    setAssignments([...assignments, { id: `temp-${Date.now()}-${Math.random()}`, title: '', fileUrl: '', courseId: initial?.id || '', createdAt: new Date().toISOString() }]);
  };

  const removeAssignment = (idx: number) => {
    setAssignments(assignments.filter((_, i) => i !== idx));
  };

  const updateAssignment = (idx: number, updates: Partial<{ id: string; title: string; fileUrl: string; courseId: string; createdAt: string }>) => {
    setAssignments((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...updates };
      return next;
    });
  };

  const handleSave = () => {
    if (!form.title || !form.category) {
      toast.error('Title and category are required.');
      return;
    }
    onSave({
      ...form,
      modules: Math.max(1, parseInt(form.modules) || modulesList.length),
      price: Math.max(0, parseFloat(form.price) || 0),
      originalPrice: form.originalPrice ? Math.max(0, parseFloat(form.originalPrice)) : undefined,
      highlights: highlights.filter(Boolean),
      advantages: advantageSections
        .filter(section => section.title.trim())
        .map(section => ({
          title: section.title,
          videos: section.videos.filter(video => video.title.trim()),
        })),
      targetAudience: targetAudience.filter(Boolean),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      modulesList: modulesList.filter(m => m.title),
      recordedLectures: lectures,
      assignments: assignments.filter(a => a.title && a.fileUrl && a.courseId).map(a => ({
        id: a.id.startsWith('temp-') ? undefined : a.id,
        title: a.title,
        fileUrl: a.fileUrl,
        courseId: a.courseId,
        createdAt: a.createdAt,
      })),
    });
  };

  const TABS: { key: TabKey; label: string }[] = [
    { key: 'basic', label: 'Basic Info' },
    { key: 'details', label: 'Details & Content' },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'assignments', label: 'Assignments' },
    { key: 'media', label: 'Media & Settings' },
  ];

  return (
    <DialogOverlay onClose={onClose}>
      <div className="flex items-center justify-between p-5 border-b border-border">
        <h3 className="font-heading text-lg font-semibold text-card-foreground">
          {initial ? 'Edit Course' : 'Add New Course'}
        </h3>
        <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>

      {/* Tab nav */}
      <div className="flex border-b border-border px-5 gap-0 overflow-x-auto">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`shrink-0 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors ${
              tab === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">

        {/* ── BASIC INFO ── */}
        {tab === 'basic' && (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Course title" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Category *</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Level</label>
                <select
                  value={form.level}
                  onChange={e => setForm({ ...form, level: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Short course description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Price (₹)</label>
                <Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="e.g. 9999" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Original Price (₹)</label>
                <Input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="e.g. 14999" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Duration</label>
                <Input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 6 weeks" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Language</label>
                <Input value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} placeholder="English" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Instructor</label>
              <Input value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Instructor Bio</label>
              <Textarea value={form.instructorBio} onChange={e => setForm({ ...form, instructorBio: e.target.value })} rows={2} placeholder="Brief instructor biography" />
            </div>
          </>
        )}

        {/* ── DETAILS & CONTENT ── */}
        {tab === 'details' && (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Why Take This Course</label>
              <Textarea value={form.whyTake} onChange={e => setForm({ ...form, whyTake: e.target.value })} rows={4} placeholder="Explain the value of this course..." />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">What You'll Learn (Highlights)</label>
              <div className="space-y-2">
                {highlights.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={h} onChange={e => updateList(highlights, setHighlights, i, e.target.value)} placeholder={`Highlight ${i + 1}`} />
                    <button onClick={() => removeListItem(highlights, setHighlights, i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addListItem(highlights, setHighlights)} className="text-xs gap-1">
                  <Plus className="h-3 w-3" /> Add Highlight
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Who Is This For (Target Audience)</label>
              <div className="space-y-2">
                {targetAudience.map((t, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={t} onChange={e => updateList(targetAudience, setTargetAudience, i, e.target.value)} placeholder={`Audience ${i + 1}`} />
                    <button onClick={() => removeListItem(targetAudience, setTargetAudience, i)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => addListItem(targetAudience, setTargetAudience)} className="text-xs gap-1">
                  <Plus className="h-3 w-3" /> Add Audience
                </Button>
              </div>
            </div>
          </>
        )}

        {tab === 'curriculum' && (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Syllabus Overview</label>
              <Textarea value={form.syllabus} onChange={e => setForm({ ...form, syllabus: e.target.value })} rows={3} placeholder="Brief overview of the course structure..." />
            </div>
          </>
        )}

        {/* ── ASSIGNMENTS ── */}
        {tab === 'assignments' && (
          <>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-medium text-muted-foreground">Assignments</label>
                <Button variant="outline" size="sm" className="text-xs gap-1" onClick={addAssignment}>
                  <Plus className="h-3 w-3" /> Add Assignment
                </Button>
              </div>
              <div className="space-y-3">
                {assignments.map((assignment, ai) => (
                  <div key={ai} className="rounded-lg border border-border p-3 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={assignment.title}
                        onChange={e => updateAssignment(ai, { title: e.target.value })}
                        placeholder="Assignment Name"
                        className="flex-1"
                      />
                      <button onClick={() => removeAssignment(ai)} className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Input
                        value={assignment.fileUrl}
                        onChange={e => updateAssignment(ai, { fileUrl: e.target.value })}
                        placeholder="File URL or Link (PDF / Google Drive / external link)"
                        className="text-xs"
                      />
                      <select
                        value={assignment.courseId}
                        onChange={e => updateAssignment(ai, { courseId: e.target.value })}
                        className="h-9 text-xs rounded-md border border-input bg-background px-2"
                      >
                        <option value="">Select Course</option>
                        {allCourses.map(course => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No assignments added yet. Click "Add Assignment" to create one.
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── MEDIA & SETTINGS ── */}
        {tab === 'media' && (
          <>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Course Thumbnail</label>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground cursor-pointer hover:bg-primary/90">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setImageName(file.name);
                          handleImageUpload(file);
                        }
                      }}
                      disabled={uploading}
                      className="sr-only"
                    />
                  </label>
                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">{imageName}</span>
                </div>
                {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
                {form.image && (
                  <img src={form.image} alt="Preview" className="h-24 w-40 object-cover rounded-md border border-border" />
                )}
              </div>
            </div>

            <div className="space-y-3 rounded-lg border border-border p-4">
              <p className="text-xs font-semibold text-card-foreground">Course Features</p>
              {[
                { key: 'certificate', label: 'Certificate of Completion' },
                { key: 'liveSessionsIncluded', label: 'Live Sessions Included' },
                { key: 'notesIncluded', label: 'Notes / Study Material Included' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 text-sm text-card-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!(form as any)[key]}
                    onChange={e => setForm({ ...form, [key]: e.target.checked })}
                    className="rounded"
                  />
                  {label}
                </label>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex gap-2 justify-between p-5 border-t border-border">
        <div className="flex gap-2">
          {TABS.map(({ key, label }, idx) => (
            tab === key && idx > 0 ? (
              <Button key="prev" variant="outline" size="sm" onClick={() => setTab(TABS[idx - 1].key)}>
                ← Back
              </Button>
            ) : null
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          {tab !== 'media' ? (
            <Button size="sm" onClick={() => {
              const idx = TABS.findIndex(t => t.key === tab);
              if (idx < TABS.length - 1) setTab(TABS[idx + 1].key);
            }}>
              Next →
            </Button>
          ) : (
            <Button size="sm" onClick={handleSave} disabled={!form.title || !form.category}>
              <Save className="h-3 w-3 mr-1" /> {initial ? 'Update Course' : 'Create Course'}
            </Button>
          )}
        </div>
      </div>
    </DialogOverlay>
  );
}