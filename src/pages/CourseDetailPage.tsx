import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRazorpay } from '@/hooks/useRazorpay';
import { RecordedLecture } from '@/data/types';
import { Button } from '@/components/ui/button';
import { NotesCard } from '@/components/NotesCard';
import { PaymentReceipt } from '@/components/PaymentReceipt';
import {
  Clock, BookOpen, Users, Star, Award, ArrowLeft, CheckCircle,
  Play, FileText, Lock, ChevronDown, ChevronUp, Globe, RefreshCw,
  Video, Download, MessageCircle, ThumbsUp, Send, Loader2, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

const TABS = ['Overview', 'Curriculum', 'Recorded Lectures', 'Live Classes', 'Notes', 'Reviews'] as const;
type Tab = typeof TABS[number];

const StarRating = ({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) => {
  const s = size === 'lg' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${s} ${i <= Math.round(rating) ? 'fill-gold text-gold' : 'text-muted-foreground'}`} />
      ))}
    </div>
  );
};

const CourseDetailPage = () => {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  const { courses, notes, liveClasses, addCourseReview, isEnrolled, getCourseProgress, refetchUserEnrollments, refetchNotes, enrollCourse } = useData();
  const { isLoading: isPaymentLoading, initiatePayment } = useRazorpay();
  const [activeTab, setActiveTab] = useState<Tab>('Overview');
  const [expandedModules, setExpandedModules] = useState<number[]>([0]);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [isProcessingEnroll, setIsProcessingEnroll] = useState(false);

  // Load user enrollments when page mounts
  useEffect(() => {
    if (user?.id) {
      const userId = user.id || (user as any)._id?.toString();
      if (userId) {
        refetchUserEnrollments(userId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, id]);

  // Find course
  const course = courses.find((c) => c.id === id);
  const userId = user?.id || (user as any)?._id?.toString() || '';
  const authEnrolledCourses = user?.enrolledCourses?.map((c: any) => c?.toString()) || [];
  const isUserEnrolled = Boolean(
    user && id && (isEnrolled(userId, id) || authEnrolledCourses.includes(id))
  );
  const progress = user && id ? getCourseProgress(userId, id) : 0;
  const courseNotes = notes
    .filter((n) => n.courseId === id)
    .sort((a, b) => new Date(b.uploadDate || b.createdAt || 0).getTime() - new Date(a.uploadDate || a.createdAt || 0).getTime());
  const courseLiveClasses = liveClasses.filter((lc) => lc.courseId === id);

  useEffect(() => {
    const loadNotes = async () => {
      if (userId) {
        await refetchNotes(userId);
      } else {
        await refetchNotes();
      }
    };

    loadNotes();
  }, [id, userId, refetchNotes]);

  const handleEnroll = async () => {
    if (!user || !id) return;
    const userId = user.id || (user as any)._id?.toString();
    if (!userId) return;

    const course = courses.find(c => c.id === id);
    if (!course) {
      toast.error('Course not found');
      return;
    }

    // Check for free courses (price 0) - direct enrollment
    if (course.price === 0) {
      setIsProcessingEnroll(true);
      try {
        await enrollCourse(userId, id);
        toast.success('Enrolled Successfully 🎉');
        await refetchUserEnrollments(userId);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('Already enrolled')) {
          toast.success('You are already enrolled in this course!');
          await refetchUserEnrollments(userId);
        } else {
          toast.error('Failed to enroll. Please try again.');
          console.error('Course detail enrollment error:', error);
        }
      } finally {
        setIsProcessingEnroll(false);
      }
      return;
    }

    // For paid courses, initiate Razorpay payment
    setIsProcessingEnroll(true);
    try {
      await initiatePayment(userId, id, () => {
        // Success callback - refresh enrollments
        refetchUserEnrollments(userId);
      });
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setIsProcessingEnroll(false);
    }
  };

  const toggleModule = (idx: number) => {
    setExpandedModules((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handleSubmitReview = () => {
    if (!user) { toast.error('Please sign in to leave a review.'); return; }
    if (!reviewText.trim()) { toast.error('Please write a review.'); return; }
    if (!id) return;
    addCourseReview(id, {
      id: `rev-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      rating: reviewRating,
      comment: reviewText,
      date: new Date().toISOString().split('T')[0],
    });
    toast.success('Review submitted!');
    setReviewText('');
    setReviewRating(5);
  };

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground mb-4">Course not found.</p>
        <Link to="/courses" className="text-primary underline">Back to Courses</Link>
      </div>
    );
  }

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = (course.reviews || []).filter((r) => r.rating === star).length;
    const total = (course.reviews || []).length || 1;
    return { star, count, pct: Math.round((count / total) * 100) };
  });

  const avgRating = course.reviews && course.reviews.length > 0
    ? course.reviews.reduce((s, r) => s + r.rating, 0) / course.reviews.length
    : course.rating;

  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : null;

  return (
    <div className="bg-background min-h-screen">
      {/* Hero Banner */}
      <section className="bg-gradient-hero py-10 md:py-14">
        <div className="container mx-auto px-4">
          <Link
            to="/courses"
            className="mb-5 inline-flex items-center gap-1.5 text-sm text-secondary/70 hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Courses
          </Link>

          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-[1fr_340px]">
            {/* Left: Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="rounded-sm bg-gold/20 px-2 py-0.5 text-xs font-semibold text-gold uppercase tracking-wider">
                  {course.category}
                </span>
                <span className="rounded-sm bg-secondary/10 px-2 py-0.5 text-xs font-medium text-secondary/70">
                  {course.level}
                </span>
              </div>

              <h1 className="mb-4 font-heading text-2xl md:text-4xl font-bold text-secondary leading-tight">
                {course.title}
              </h1>
              <p className="mb-5 text-secondary/75 leading-relaxed text-sm md:text-base">
                {course.description}
              </p>

              {/* Ratings row */}
              <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
                <span className="font-bold text-gold text-lg">{avgRating.toFixed(1)}</span>
                <StarRating rating={avgRating} />
                <span className="text-secondary/60">
                  ({(course.reviews?.length || course.totalRatings || 0)} ratings)
                </span>
                <span className="text-secondary/60">·</span>
                <span className="text-secondary/60">{course.enrolled.toLocaleString()} students</span>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 text-xs text-secondary/65">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-gold" /> By {course.instructor.split(',')[0]}
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 text-gold" /> {course.language || 'English'}
                </span>
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-gold" /> Updated {course.lastUpdated || 'Recently'}
                </span>
                {course.certificate && (
                  <span className="flex items-center gap-1.5">
                    <Award className="h-3.5 w-3.5 text-gold" /> Certificate of completion
                  </span>
                )}
              </div>
            </div>

            {/* Right: Pricing Card (desktop) */}
            <div className="hidden md:flex flex-col gap-4">
              <PricingCard
                course={course}
                isEnrolled={isUserEnrolled}
                discount={discount}
                user={user}
                onEnroll={handleEnroll}
                isLoading={isProcessingEnroll || isPaymentLoading}
                progress={progress}
                userId={userId}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Pricing */}
      <div className="md:hidden border-b border-border bg-card px-4 py-4">
        <PricingCard course={course} isEnrolled={isUserEnrolled} discount={discount} user={user} onEnroll={handleEnroll} isLoading={isProcessingEnroll || isPaymentLoading} progress={progress} userId={userId} />
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* ── OVERVIEW ── */}
        {activeTab === 'Overview' && (
          <div className="space-y-10">
            {/* What you'll learn */}
            {(course.highlights || []).length > 0 && (
              <section>
                <h2 className="mb-4 font-heading text-xl font-bold text-foreground">What You'll Learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 rounded-lg border border-border bg-card p-5">
                  {course.highlights!.map((h, i) => (
                    <div key={i} className="flex gap-2.5 text-sm text-card-foreground">
                      <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Why take this course */}
            {course.whyTake && (
              <section>
                <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Why Take This Course?</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed rounded-lg border border-border bg-card p-5">
                  {course.whyTake.split('\n\n').map((p, i) => (
                    <p key={i} className="mb-3 last:mb-0">{p}</p>
                  ))}
                </div>
              </section>
            )}

            {/* Advantages */}
            {(course.advantages || []).length > 0 && (
              <section>
                <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Key Advantages</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {course.advantages!.map((adv, i) => {
                    const title = typeof adv === 'string' ? adv : adv.title;
                    return (
                      <div key={i} className="flex gap-3 rounded-lg border border-border bg-card p-4">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {i + 1}
                        </div>
                        <p className="text-sm text-card-foreground leading-relaxed">{title}</p>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Requirements */}
            {(course.requirements || []).length > 0 && (
              <section>
                <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Requirements</h2>
                <ul className="space-y-2 rounded-lg border border-border bg-card p-5">
                  {course.requirements!.map((r, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <span className="text-primary mt-1">•</span> {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Target Audience */}
            {(course.targetAudience || []).length > 0 && (
              <section>
                <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Who Is This For?</h2>
                <ul className="space-y-2 rounded-lg border border-border bg-card p-5">
                  {course.targetAudience!.map((t, i) => (
                    <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4 text-gold shrink-0 mt-0.5" /> {t}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Course Includes */}
            <section>
              <h2 className="mb-4 font-heading text-xl font-bold text-foreground">This Course Includes</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { icon: Clock, label: course.duration + ' total duration' },
                  { icon: BookOpen, label: course.modules + ' modules' },
                  { icon: Video, label: (course.recordedLectures?.length || 0) + ' recorded lectures' },
                  { icon: FileText, label: courseNotes.length + ' downloadable notes' },
                  { icon: Video, label: courseLiveClasses.length + ' live sessions' },
                  { icon: Award, label: 'Certificate of completion' },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-3 text-sm text-card-foreground">
                    <Icon className="h-4 w-4 text-gold shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Instructor */}
            <section>
              <h2 className="mb-4 font-heading text-xl font-bold text-foreground">Your Instructor</h2>
              <div className="rounded-lg border border-border bg-card p-5 flex gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold font-heading text-2xl font-bold">
                  {course.instructor[0]}
                </div>
                <div>
                  <p className="font-heading font-semibold text-card-foreground">{course.instructor}</p>
                  <p className="text-xs text-gold mb-2">Corporate Trainer & Leadership Expert</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {course.instructorBio || 'Lt Col Shreesh Kumar (Retd) is an Army veteran with 21+ years of service and extensive corporate experience. He specializes in leadership, training, and organizational development.'}
                  </p>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ── CURRICULUM ── */}
        {activeTab === 'Curriculum' && (
          <div className="space-y-6">
            {/* Syllabus overview - show above only when modules exist */}
            {course.syllabus && course.modulesList.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-5 mb-6">
                <h3 className="font-heading text-base font-semibold text-card-foreground mb-2">Course Overview</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{course.syllabus}</p>
              </div>
            )}

            {course.modulesList.length > 0 && (
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">
                  {course.modules} modules · {course.duration} total
                </p>
              </div>
            )}

            <div className="space-y-2">
              {course.modulesList.map((module, idx) => {
                const isOpen = expandedModules.includes(idx);
                const moduleTitle = typeof module === 'string' ? module : module.title;
                const moduleLectures = (course.recordedLectures || []).filter((l) => l.moduleName === moduleTitle);
                return (
                  <div key={idx} className="rounded-lg border border-border overflow-hidden">
                    <button
                      onClick={() => toggleModule(idx)}
                      className="w-full flex items-center justify-between bg-card px-4 py-3.5 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-card-foreground text-sm text-left">{moduleTitle}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {moduleLectures.length} lectures
                        </span>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="bg-muted/20 divide-y divide-border">
                        {/* Recorded lectures */}
                        {moduleLectures.map((lec) => (
                          <div key={lec.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                            <div className="flex items-center gap-3">
                              {lec.preview || isUserEnrolled ? (
                                <Play className="h-3.5 w-3.5 text-primary shrink-0" />
                              ) : (
                                <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              )}
                              <span className={lec.preview || isUserEnrolled ? 'text-primary hover:underline cursor-pointer' : 'text-muted-foreground'}>
                                {lec.lectureTitle}
                              </span>
                              {lec.preview && (
                                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-sm">Preview</span>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{lec.duration}</span>
                          </div>
                        ))}

                        {/* If no lectures yet */}
                        {moduleLectures.length === 0 && (
                          <div className="px-4 py-3 text-sm text-muted-foreground">
                            Lectures coming soon...
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {course.modulesList.length === 0 && (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                {course.syllabus ? (
                  <div className="text-left mb-6">
                    <h3 className="font-heading text-base font-semibold text-card-foreground mb-2">Course Overview</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{course.syllabus}</p>
                  </div>
                ) : (
                  <BookOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                )}

                <p className="text-muted-foreground">Curriculum details are being updated.</p>
                <p className="mt-3 text-sm text-muted-foreground">{course.modules} modules · {course.duration} total</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'Recorded Lectures' && (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground mb-4">
              Access all course video lectures organized by modules. Watch at your own pace and review anytime.
            </p>
            {(course.recordedLectures || []).length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <Video className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No recorded lectures available for this course yet.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {(() => {
                  // Group lectures by moduleName
                  const groupedLectures = (course.recordedLectures || []).reduce((acc, lecture) => {
                    const module = lecture.moduleName || 'General';
                    if (!acc[module]) acc[module] = [];
                    acc[module].push(lecture);
                    return acc;
                  }, {} as Record<string, RecordedLecture[]>);

                  return Object.entries(groupedLectures).map(([moduleName, lectures]) => (
                    <div key={moduleName} className="space-y-3">
                      <h3 className="font-heading text-lg font-semibold text-foreground border-b border-border pb-2">
                        {moduleName}
                      </h3>
                      <div className="space-y-2">
                        {lectures.map((lecture, idx) => (
                          <div
                            key={lecture.id || idx}
                            className={`flex items-start gap-4 rounded-lg border p-4 transition-all ${
                              isUserEnrolled || lecture.preview
                                ? 'border-border bg-card hover:border-gold/50 hover:shadow-md cursor-pointer'
                                : 'border-muted bg-muted/30 opacity-60'
                            }`}
                            onClick={() => {
                              if (isUserEnrolled || lecture.preview) {
                                if (lecture.videoUrl) {
                                  window.open(lecture.videoUrl, '_blank');
                                }
                              }
                            }}
                          >
                            <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/10">
                              {lecture.thumbnail ? (
                                <>
                                  <img src={lecture.thumbnail} alt={`${lecture.lectureTitle} thumbnail`} className="h-full w-full object-cover" />
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="rounded-full bg-black/30 p-2">
                                      <Play className="h-4 w-4 text-white" />
                                    </span>
                                  </div>
                                </>
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted/20">
                                  <Play className="h-6 w-6 text-primary" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1">
                                  <h4 className="font-medium text-card-foreground text-sm mb-1">
                                    {lecture.lectureTitle}
                                  </h4>
                                  {lecture.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed mb-1">
                                      {lecture.description}
                                    </p>
                                  )}
                                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="h-3 w-3" />
                                    {lecture.duration}
                                  </p>
                                </div>
                                {lecture.preview && (
                                  <span className="px-2.5 py-1 text-xs font-semibold text-gold bg-gold/10 rounded whitespace-nowrap">
                                    Free Preview
                                  </span>
                                )}
                                {!isUserEnrolled && !lecture.preview && (
                                  <span className="px-2.5 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded flex items-center gap-1 whitespace-nowrap">
                                    <Lock className="h-3 w-3" /> Locked
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        )}

        {/* ── LIVE CLASSES ── */}
        {activeTab === 'Live Classes' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Upcoming live sessions for enrolled students via Google Meet.
            </p>
            {courseLiveClasses.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <Video className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No live classes scheduled yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {courseLiveClasses.map((cls) => (
                  <div key={cls.id} className="flex items-start gap-4 rounded-lg border border-border p-4 transition-all hover:border-gold/50 hover:shadow-md bg-card">
                    <div className="relative h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted/10">
                      {cls.thumbnail ? (
                        <>
                          <img src={cls.thumbnail} alt={`${cls.title} thumbnail`} className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="rounded-full bg-black/30 p-2">
                              <Video className="h-4 w-4 text-white" />
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-muted/20">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-card-foreground text-sm mb-1">{cls.title}</h3>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-1">{cls.description}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-gold" />
                            {cls.date} · {cls.time}
                          </p>
                        </div>
                        <div className="shrink-0">
                          {isUserEnrolled ? (
                            <a href={cls.meetLink} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="bg-gold text-charcoal hover:bg-gold-dark font-semibold gap-1.5 text-xs">
                                <Video className="h-3.5 w-3.5" /> Join
                              </Button>
                            </a>
                          ) : (
                            <span className="px-2.5 py-1 text-xs font-semibold text-muted-foreground bg-muted rounded flex items-center gap-1">
                              <Lock className="h-3 w-3" /> Locked
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── NOTES ── */}
        {activeTab === 'Notes' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Downloadable study materials, handbooks, and reference documents for this course.
            </p>
            {courseNotes.length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No Notes Available</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {courseNotes.map((note) => (
                  <NotesCard key={note.id} note={note} isEnrolled={isUserEnrolled} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS ── */}
        {activeTab === 'Reviews' && (
          <div className="space-y-8">
            {/* Rating Summary */}
            <div className="flex flex-col md:flex-row gap-6 rounded-lg border border-border bg-card p-6">
              <div className="text-center">
                <div className="font-heading text-6xl font-bold text-foreground">{avgRating.toFixed(1)}</div>
                <StarRating rating={avgRating} size="lg" />
                <p className="text-xs text-muted-foreground mt-1">Course Rating</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {ratingBreakdown.map(({ star, count, pct }) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gold rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="flex items-center gap-1 w-8 shrink-0">
                      <Star className="h-3 w-3 fill-gold text-gold" />
                      <span>{star}</span>
                    </div>
                    <span className="text-muted-foreground w-8 shrink-0">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave a Review */}
            {user && isUserEnrolled && (
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-heading text-base font-semibold text-card-foreground mb-4">Leave a Review</h3>
                <div className="flex gap-1 mb-3">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      onMouseEnter={() => setHoverRating(r)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setReviewRating(r)}
                    >
                      <Star
                        className={`h-6 w-6 transition-colors ${
                          r <= (hoverRating || reviewRating) ? 'fill-gold text-gold' : 'text-muted-foreground'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this course..."
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary mb-3"
                />
                <Button size="sm" onClick={handleSubmitReview} className="gap-1.5">
                  <Send className="h-3.5 w-3.5" /> Submit Review
                </Button>
              </div>
            )}

            {/* Reviews List */}
            {(course.reviews || []).length === 0 ? (
              <div className="rounded-lg border border-border bg-card p-8 text-center">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(course.reviews || []).map((review) => (
                  <div key={review.id} className="rounded-lg border border-border bg-card p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-sm text-primary">
                        {review.userName[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-card-foreground text-sm">{review.userName}</span>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                        <StarRating rating={review.rating} />
                        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{review.comment}</p>
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
  );
};

/* Reusable Pricing Card */
const PricingCard = ({
  course,
  isEnrolled,
  discount,
  user,
  onEnroll,
  isLoading,
  progress,
  userId,
}: {
  course: any;
  isEnrolled: boolean;
  discount: number | null;
  user: any;
  onEnroll?: () => void;
  isLoading?: boolean;
  progress?: number;
  userId?: string;
}) => (
  <div className="rounded-xl border border-border bg-card shadow-xl overflow-hidden">
    {/* Preview image */}
    {course.image ? (
      <div className="h-40 overflow-hidden bg-slate-100">
        <img src={course.image} alt={course.title} className="h-full w-full object-cover" />
      </div>
    ) : (
      <div className="h-40 bg-gradient-to-br from-primary/20 to-gold/20 flex items-center justify-center">
        <BookOpen className="h-16 w-16 text-primary/40" />
      </div>
    )}

    <div className="p-5">
      {/* Price */}
      <div className="flex items-center gap-3 mb-1">
        <span className="font-heading text-3xl font-bold text-foreground">
          ₹{Math.max(0, course.price).toLocaleString()}
        </span>
        {course.originalPrice && (
          <span className="text-sm text-muted-foreground line-through">
            ₹{course.originalPrice.toLocaleString()}
          </span>
        )}
        {discount && (
          <span className="rounded-sm bg-green-100 text-green-700 px-2 py-0.5 text-xs font-semibold">
            {discount}% OFF
          </span>
        )}
      </div>

      {!isEnrolled && user && (
        <Button
          onClick={onEnroll}
          disabled={isLoading}
          className="w-full bg-primary text-primary-foreground hover:bg-primary-hover mb-3 font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            `Enroll Now - ₹${course.price.toLocaleString()}`
          )}
        </Button>
      )}
      {!isEnrolled && !user && (
        <Link to="/login">
          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary-hover mb-3 font-semibold">
            Sign In to Enroll
          </Button>
        </Link>
      )}

      {/* Course highlights */}
      <div className="space-y-2 text-xs text-muted-foreground">
        {[
          { icon: Clock, label: course.duration + ' total' },
          { icon: BookOpen, label: course.modules + ' modules' },
          { icon: Video, label: (course.recordedLectures?.length || 0) + ' recorded lectures' },
          { icon: FileText, label: 'Downloadable notes' },
          { icon: Globe, label: 'Full lifetime access' },
          { icon: Award, label: 'Certificate of completion' },
        ].map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2">
            <Icon className="h-3.5 w-3.5 text-gold shrink-0" />
            <span>{label}</span>
          </div>
        ))}
      </div>

      {/* Payment Receipt for enrolled users */}
      {isEnrolled && userId && (
        <PaymentReceipt userId={userId} courseId={course.id} />
      )}
    </div>
  </div>
);

export default CourseDetailPage;