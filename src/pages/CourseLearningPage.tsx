import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import {
  Play, Lock, CheckCircle, ChevronDown, ChevronUp, BookOpen,
  FileText, Clock, Star, ArrowLeft, TrendingUp, X, Download, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const TABS = ['Overview', 'Notes', 'Assignments'] as const;
type Tab = typeof TABS[number];

const CourseLearningPage = () => {
  const { id } = useParams();
  const { user, enrollInCourse } = useAuth();
  const { courses, updateProgress, getCourseProgress, isEnrolled, lectureProgress } = useData();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [expandedAdvantage, setExpandedAdvantage] = useState<number | null>(null);
  const [currentVideo, setCurrentVideo] = useState<{ title: string; videoUrl: string; duration?: string; id: string } | null>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [courseNotes, setCourseNotes] = useState<any[]>([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [notesError, setNotesError] = useState('');
  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState('');

  const course = courses.find((c) => c.id === id);
  const isUserEnrolled = user && isEnrolled(user.id, id || '');
  const progress = user ? getCourseProgress(user.id, id || '') : 0;

  const advantageSections = course ? (course.advantages || []).map((adv, sectionIndex) => {
    if (typeof adv === 'string') {
      return {
        title: adv,
        videos: (course.requirements || []).map((req, reqIndex) => ({
          title: req,
          videoUrl: '',
          duration: undefined,
          id: `legacy-${sectionIndex}-${reqIndex}`,
        })),
      };
    }
    return {
      title: adv.title || '',
      videos: (adv.videos || []).map((video, videoIndex) => ({
        title: video.title,
        videoUrl: video.videoUrl,
        duration: video.duration,
        id: `${sectionIndex}-${videoIndex}`,
      })),
    };
  }) : [];

  useEffect(() => {
    if (!user || !id) return;
    if (!isUserEnrolled) {
      navigate(`/courses/${id}`);
      toast.error('Please enroll to access this course');
    }
  }, [user, id, isUserEnrolled, navigate]);

  const toggleAdvantage = (idx: number) => {
    setExpandedAdvantage((prev) => (prev === idx ? null : idx));
  };

  const handleVideoSelect = (sectionIndex: number, videoIndex: number, video: { title: string; videoUrl: string; duration?: string }) => {
    const id = `${sectionIndex}-${videoIndex}`;
    setCurrentVideo({ ...video, id });
  };

  const handleMarkComplete = async () => {
    if (!user || !currentVideo?.id || !id) return;
    try {
      await updateProgress(user.id, id, currentVideo.id, true, watchTime);
      toast.success('Video marked as completed! 🎉');
    } catch (error) {
      toast.error('Failed to update progress');
    }
  };

  const handleEnroll = async () => {
    if (!user || !id) return;
    try {
      await enrollInCourse(id);
      toast.success('Enrolled Successfully 🎉');
    } catch (error) {
      toast.error('Failed to enroll');
    }
  };

  useEffect(() => {
    const fetchNotes = async () => {
      if (!id) return;
      setNotesLoading(true);
      setNotesError('');
      setCourseNotes([]);

      if (!user) {
        setNotesError('Please sign up/login to access notes');
        setNotesLoading(false);
        return;
      }

      try {
        const userId = user.id || (user as any)._id?.toString?.();
        const response = await fetch(`/api/notes?courseId=${encodeURIComponent(id)}&userId=${encodeURIComponent(userId)}`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            setNotesError('Please sign up/login to access notes');
          } else if (response.status === 403) {
            setNotesError('Please enroll in this course to access notes');
          } else {
            setNotesError(data.error || 'Failed to load notes');
          }
          setCourseNotes([]);
        } else {
          setCourseNotes(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        setNotesError('Failed to load notes');
      } finally {
        setNotesLoading(false);
      }
    };

    if (activeTab === 'Notes') {
      fetchNotes();
    }
  }, [activeTab, id, user]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!id) return;
      setAssignmentsLoading(true);
      setAssignmentsError('');
      setAssignments([]);

      if (!user) {
        setAssignmentsError('Please sign up/login to access assignments');
        setAssignmentsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/assignments?courseId=${encodeURIComponent(id)}`);
        const data = await response.json();

        if (!response.ok) {
          setAssignmentsError(data.error || 'Failed to load assignments');
          setAssignments([]);
        } else {
          const apiAssignments = Array.isArray(data) ? data : [];
          // If no assignments from API, try fallback to course document
          if (apiAssignments.length === 0 && course?.assignments) {
            setAssignments(course.assignments);
          } else {
            setAssignments(apiAssignments);
          }
        }
      } catch (error) {
        setAssignmentsError('Failed to load assignments');
      } finally {
        setAssignmentsLoading(false);
      }
    };

    if (activeTab === 'Assignments') {
      fetchAssignments();
    }
  }, [activeTab, id, user, course]);

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Course not found.</p>
        <Link to="/courses" className="text-primary underline">Back to Courses</Link>
      </div>
    );
  }

  if (!isUserEnrolled) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Lock className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-bold mb-4">Enroll to Access This Course</h2>
        <p className="text-muted-foreground mb-6">You need to enroll in this course to access the learning materials.</p>
        <Button onClick={handleEnroll} className="bg-primary text-primary-foreground hover:bg-primary-hover">
          Enroll Now
        </Button>
      </div>
    );
  }

  const currentLectureData = currentVideo;

  const isLectureCompleted = currentVideo?.id
    ? lectureProgress.some(lp => lp.userId === user?.id && lp.lectureId === currentVideo.id && lp.completed)
    : false;

  return (
    <div className="bg-background min-h-screen">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to={`/courses/${id}`} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-heading text-lg font-semibold text-foreground">{course.title}</h1>
              <p className="text-xs text-muted-foreground">{course.instructor}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gold" />
              <span className="text-sm font-medium text-foreground">{progress}%</span>
            </div>
            <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-gold transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Side - Video Player and Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="rounded-lg overflow-hidden bg-black aspect-video">
              {currentLectureData && currentLectureData.videoUrl ? (
                <video
                  controls
                  className="w-full h-full bg-black object-cover"
                  src={currentLectureData.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center text-white/70">
                    <Play className="mx-auto mb-2 h-12 w-12" />
                    <p>{currentLectureData ? 'Video not available' : 'Select a video to start learning'}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Lecture Info */}
            {currentLectureData && (
              <div className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="font-heading text-xl font-bold text-foreground mb-2">
                      {currentLectureData.title}
                    </h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {currentLectureData.duration}</span>
                      {isLectureCompleted && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={handleMarkComplete}
                    disabled={isLectureCompleted}
                    className={isLectureCompleted ? 'bg-green-600 hover:bg-green-700' : 'bg-primary text-primary-foreground hover:bg-primary-hover'}
                  >
                    {isLectureCompleted ? 'Completed' : 'Mark as Complete'}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This lecture covers key concepts and practical examples. Watch the video carefully and take notes for better understanding.
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex border-b border-border">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">
                {activeTab === 'Overview' && (
                  <div className="space-y-6">
                    {/* Course Description */}
                    {course.description && (
                      <section>
                        <h3 className="mb-3 font-heading text-lg font-bold text-foreground">Course Description</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
                      </section>
                    )}
                  </div>
                )}
                {activeTab === 'Notes' && (
                  <div>
                    {notesLoading ? (
                      <div className="text-center text-muted-foreground">
                        <FileText className="mx-auto mb-2 h-8 w-8" />
                        <p>Loading notes...</p>
                      </div>
                    ) : notesError ? (
                      <div className="text-center text-muted-foreground">
                        <FileText className="mx-auto mb-2 h-8 w-8" />
                        <p>{notesError}</p>
                      </div>
                    ) : courseNotes.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        <FileText className="mx-auto mb-2 h-8 w-8" />
                        <p>Course notes will be available here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {courseNotes.map((note) => (
                          <div key={note.id} className="rounded-lg border border-border bg-card p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-base font-semibold text-card-foreground">{note.title}</h3>
                                <p className="text-sm text-muted-foreground mt-2">{note.description}</p>
                                <p className="text-xs text-muted-foreground mt-2">{new Date(note.uploadDate).toLocaleString()}</p>
                              </div>
                              <div className="flex flex-col items-start gap-2 sm:items-end">
                                {note.link ? (
                                  <a
                                    href={note.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 rounded-full border border-primary px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/10"
                                  >
                                    <ExternalLink className="h-3 w-3" /> Click Here
                                  </a>
                                ) : null}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-1 text-xs border-primary text-primary"
                                  onClick={() => {
                                    if (note.fileUrl) {
                                      const a = document.createElement('a');
                                      a.href = note.fileUrl;
                                      a.download = `${note.title.replace(/\s+/g, '-')}`;
                                      a.target = '_blank';
                                      document.body.appendChild(a);
                                      a.click();
                                      document.body.removeChild(a);
                                    } else if (note.link) {
                                      window.open(note.link, '_blank');
                                    }
                                  }}
                                >
                                  <Download className="h-3 w-3" /> Download
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === 'Assignments' && (
                  <div>
                    {assignmentsLoading ? (
                      <div className="text-center text-muted-foreground">
                        <FileText className="mx-auto mb-2 h-8 w-8" />
                        <p>Loading assignments...</p>
                      </div>
                    ) : assignmentsError ? (
                      <div className="text-center text-muted-foreground">
                        <FileText className="mx-auto mb-2 h-8 w-8" />
                        <p>{assignmentsError}</p>
                      </div>
                    ) : assignments.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        <FileText className="mx-auto mb-2 h-8 w-8" />
                        <p>Assignments will be available here</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {assignments.map((assignment) => (
                          <div key={assignment.id} className="rounded-lg border border-border bg-card p-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <h3 className="text-base font-semibold text-card-foreground">{assignment.title}</h3>
                                <p className="text-xs text-muted-foreground mt-2">{new Date(assignment.createdAt).toLocaleString()}</p>
                              </div>
                              <div className="flex flex-col items-start gap-2 sm:items-end">
                                <a
                                  href={assignment.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                                >
                                  <ExternalLink className="h-3 w-3" /> Open Assignment
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Lecture List */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-lg border border-border bg-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30">
                <h3 className="font-heading text-base font-semibold text-foreground">Course Content</h3>
                <p className="text-xs text-muted-foreground">{course.modules} modules · {course.duration}</p>
              </div>

              <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
                {advantageSections.length > 0 ? (
                  advantageSections.map((section, idx) => (
                    <div key={idx} className="border-b border-border last:border-b-0">
                      <button
                        onClick={() => toggleAdvantage(idx)}
                        className="w-full flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium text-card-foreground text-sm text-left">{section.title || 'Untitled section'}</span>
                        </div>
                        <div className="flex items-center shrink-0">
                          {expandedAdvantage === idx ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </button>

                      {expandedAdvantage === idx && (
                        <div className="bg-muted/20 px-4 pb-4">
                          <div className="space-y-2 pt-2">
                            {section.videos.map((video, videoIdx) => {
                              const isActive = currentVideo?.id === video.id;
                              return (
                                <button
                                  key={video.id}
                                  onClick={() => handleVideoSelect(idx, videoIdx, video)}
                                  className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                                    isActive ? 'border-primary bg-primary/10' : 'border-border bg-card hover:bg-muted/70'
                                  }`}
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2">
                                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                        ▶
                                      </span>
                                      <div>
                                        <p className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-card-foreground'}`}>{video.title || 'Untitled video'}</p>
                                        {video.duration && (
                                          <p className="text-xs text-muted-foreground">{video.duration}</p>
                                        )}
                                      </div>
                                    </div>
                                    {isActive && (
                                      <span className="text-xs text-primary font-semibold">Playing</span>
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-sm text-muted-foreground">
                    No advantages available
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseLearningPage;
