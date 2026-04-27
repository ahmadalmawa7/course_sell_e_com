import { Fragment, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Course, LiveClass, Article, Note, RecordedLecture } from '@/data/types';
import { BookOpen, Users, CreditCard, Calendar, FileText, Award, BarChart3, Settings, Plus, Pencil, Trash2, Eye, MessageCircle, Reply, X, Save, HelpCircle, Star, Mail, CheckCircle, XCircle, Send, Upload, Loader, ExternalLink, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { CourseFormDialog } from "@/components/CourseFormDialog";
import { RecordedLectureFormDialog } from "@/components/RecordedLectureFormDialog";
import SupportChat from '@/components/SupportChat';

type Tab = 'overview' | 'courses' | 'classes' | 'students' | 'payments' | 'articles' | 'comments' | 'certificates' | 'notes' | 'testimonials' | 'enquiries' | 'article-requests' | 'support' | 'settings' | 'categories' | 'recorded-lectures';

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'categories', label: 'Categories', icon: BookOpen },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'recorded-lectures', label: 'Recorded Lectures', icon: Video },
  { id: 'classes', label: 'Live Classes', icon: Calendar },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'comments', label: 'Comments', icon: MessageCircle },
  { id: 'notes', label: 'Notes', icon: Upload },
  { id: 'testimonials', label: 'Testimonials', icon: Star },
  { id: 'enquiries', label: 'Enquiries', icon: Mail },
  { id: 'article-requests', label: 'Article Requests', icon: FileText },
  { id: 'support', label: 'Support', icon: HelpCircle },
  { id: 'certificates', label: 'Certificates', icon: Award },
  { id: 'settings', label: 'Settings', icon: Settings },
];

const CHART_COLORS = ['hsl(0, 100%, 27%)', 'hsl(43, 55%, 53%)', 'hsl(210, 60%, 50%)', 'hsl(150, 60%, 40%)', 'hsl(280, 60%, 50%)'];

const DialogOverlay = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
    <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-card p-6 shadow-xl" onClick={e => e.stopPropagation()}>{children}</div>
  </div>
);

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const {
    courses, liveClasses, articles, payments, notes, testimonials, enquiries, supportTickets, categories,
    addCourse, updateCourse, deleteCourse, refetchCourses, addLiveClass, updateLiveClass, deleteLiveClass, refetchLiveClasses,
    addArticle, updateArticle, deleteArticle, deleteComment, replyToComment,
    addNote, updateNote, deleteNote, approveTestimonial, deleteTestimonial, updateEnquiryStatus, deleteEnquiry,
    addSupportMessage, updateSupportTicket, deleteSupportTicket, closeSupportTicket,
    addCategory, updateCategory, deleteCategory,
  } = useData();
  const [adminTestimonials, setAdminTestimonials] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const storedTab = typeof window !== 'undefined' ? localStorage.getItem('adminActiveTab') : null;
    return (storedTab as Tab) || 'overview';
  });
  const [courseDialog, setCourseDialog] = useState<{ open: boolean; editing: Course | null }>({ open: false, editing: null });
  const [classDialog, setClassDialog] = useState<{ open: boolean; editing: LiveClass | null }>({ open: false, editing: null });
  const [articleDialog, setArticleDialog] = useState<{ open: boolean; editing: Article | null }>({ open: false, editing: null });
  const [recordedLectureDialog, setRecordedLectureDialog] = useState<{ open: boolean; editing: RecordedLecture | null }>({ open: false, editing: null });
  const [viewCourse, setViewCourse] = useState<Course | null>(null);
  const [categoryDialog, setCategoryDialog] = useState<{ open: boolean; editing: string | null }>({ open: false, editing: null });
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [noteDialog, setNoteDialog] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ title: '', courseId: '', category: '', description: '', externalLink: '', fileUrl: '' });
  const [noteFileUploading, setNoteFileUploading] = useState(false);
  const [noteFileName, setNoteFileName] = useState('');
  const [supportReply, setSupportReply] = useState<{ ticketId: string; text: string } | null>(null);
  const [expandedSupportTicketId, setExpandedSupportTicketId] = useState<string | null>(null);
  const [hiddenSupportTickets, setHiddenSupportTickets] = useState<string[]>([]);
  const [adminTickets, setAdminTickets] = useState<any[]>([]);
  const [loadingAdminTickets, setLoadingAdminTickets] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [settings, setSettings] = useState({ razorpayKeyId: '', razorpayKeySecret: '', smtpHost: '', smtpPort: '587', smtpUser: '', smtpPass: '', smtpFrom: 'noreply@eruditioninfinite.com' });

  // Fetch students data when students tab is active
  useEffect(() => {
    const fetchStudents = async () => {
      if (activeTab !== 'students') return;

      setLoadingStudents(true);
      setStudentsError(null);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error(`Unable to load students: ${response.statusText}`);
        }
        const data = await response.json();
        setStudents(data.users || []);
      } catch (error) {
        console.error('Failed to fetch student data:', error);
        setStudentsError(error instanceof Error ? error.message : 'Failed to fetch student data.');
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [activeTab]);

  useEffect(() => {
    if (categories.length > 0) {
      const defaultCategory = categories.find((c) => c !== 'All') || categories[0];
      setNoteForm((prev) => ({ ...prev, category: prev.category || defaultCategory || '' }));
    }
  }, [categories]);

  useEffect(() => {
    if (activeTab !== 'students') return;

    const fetchStudents = async () => {
      setLoadingStudents(true);
      setStudentsError(null);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error(`Unable to load students: ${response.statusText}`);
        }
        const data = await response.json();
        setStudents(data.users || []);
      } catch (error) {
        console.error('Failed to fetch student data:', error);
        setStudentsError(error instanceof Error ? error.message : 'Failed to fetch student data.');
      } finally {
        setLoadingStudents(false);
      }
    };

    fetchStudents();
  }, [activeTab]);

  const [pendingArticles, setPendingArticles] = useState<any[]>([]);
  const [loadingPendingArticles, setLoadingPendingArticles] = useState(false);
  const [loadingApprovedArticles, setLoadingApprovedArticles] = useState(false);
  const [viewArticleImage, setViewArticleImage] = useState<{ url: string; title: string } | null>(null);
  const [pendingTestimonials, setPendingTestimonials] = useState<any[]>([]);
  const [hasSeenTestimonials, setHasSeenTestimonials] = useState(false);
  const [lastSeenTestimonialCount, setLastSeenTestimonialCount] = useState(0);

  useEffect(() => {
    const fetchPendingArticles = async () => {
      try {
        setLoadingPendingArticles(true);
        const response = await fetch('/api/articles?status=pending');
        if (response.ok) {
          const data = await response.json();
          setPendingArticles(data);
        }
      } catch (error) {
        console.error('Failed to fetch pending articles:', error);
      } finally {
        setLoadingPendingArticles(false);
      }
    };

    if (activeTab === 'article-requests') {
      fetchPendingArticles();
    }

    // Refresh pending articles every 10 seconds when viewing article requests
    const interval = setInterval(() => {
      if (activeTab === 'article-requests') {
        fetchPendingArticles();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Fetch pending testimonials count for sidebar notification
  useEffect(() => {
    const fetchPendingTestimonials = async () => {
      try {
        const res = await fetch('/api/admin/testimonials?status=pending');
        if (res.ok) {
          const data = await res.json();
          // Only show dot if there are MORE pending testimonials than last seen
          if (data.length > lastSeenTestimonialCount) {
            setHasSeenTestimonials(false);
          }
          setPendingTestimonials(data);
        }
      } catch (err) {
        console.error('Failed to fetch pending testimonials count', err);
      }
    };

    fetchPendingTestimonials();

    // Refresh every 30 seconds
    const interval = setInterval(() => {
      fetchPendingTestimonials();
    }, 30000);

    return () => clearInterval(interval);
  }, [lastSeenTestimonialCount]);

  useEffect(() => {
    const fetchAdminTestimonials = async () => {
      if (activeTab !== 'testimonials') return;
      try {
        const res = await fetch('/api/admin/testimonials');
        if (res.ok) {
          const data = await res.json();
          setAdminTestimonials(data.map((i: any) => ({
            id: i.id || i._id?.toString(),
            name: i.name || 'Anonymous',
            role: i.role || 'Student',
            text: i.message || i.text || '',
            rating: i.rating || 5,
            status: i.status || 'pending',
            createdAt: i.createdAt,
          })));
        }
      } catch (err) {
        console.error('Failed to fetch admin testimonials', err);
      }
    };

    fetchAdminTestimonials();
  }, [activeTab]);

  // Load admin support tickets when viewing support tab
  useEffect(() => {
    const fetchTickets = async () => {
      if (activeTab !== 'support') return;
      setLoadingAdminTickets(true);
      try {
        const resp = await fetch('/api/support/all-tickets');
        if (!resp.ok) {
          setAdminTickets([]);
          return;
        }
        const data = await resp.json();
        if (data.success && Array.isArray(data.tickets)) {
          const mapped = data.tickets.map((t: any) => ({
            id: t._id || t.id,
            userId: t.userId || '',
            userName: t.userName || '',
            subject: t.subject || '',
            description: t.description || '',
            status: t.status || 'open',
            date: t.createdAt ? (new Date(t.createdAt)).toISOString().split('T')[0] : '',
            messages: Array.isArray(t.messages) ? t.messages.map((m: any) => ({ sender: m.sender === 'admin' ? 'admin' : 'user', text: m.message || m.text || '', date: m.createdAt ? (new Date(m.createdAt)).toISOString().split('T')[0] : '' })) : [],
          }));
          setAdminTickets(mapped);
        } else {
          setAdminTickets([]);
        }
      } catch (err) {
        console.error('Failed to fetch admin tickets', err);
        setAdminTickets([]);
      } finally {
        setLoadingAdminTickets(false);
      }
    };

    fetchTickets();
  }, [activeTab]);

  useEffect(() => {
    const fetchApprovedArticles = async () => {
      try {
        setLoadingApprovedArticles(true);
        const response = await fetch('/api/articles?status=approved');
        if (response.ok) {
          const data = await response.json();
          // Map database articles to local state
          const mappedArticles = data.map((article: any) => ({
            ...article,
            id: article.id || article._id?.toString(),
            comments: article.comments || [],
            likes: article.likes || [],
          }));
          // Update the local articles through the data context by triggering refetch
          if (data.length > 0) {
            // For approved articles in admin, we can update articles state directly
            // This keeps admin view in sync with database
          }
        }
      } catch (error) {
        console.error('Failed to fetch approved articles:', error);
      } finally {
        setLoadingApprovedArticles(false);
      }
    };

    if (activeTab === 'articles') {
      fetchApprovedArticles();
    }

    // Refresh approved articles every 10 seconds when viewing articles tab
    const interval = setInterval(() => {
      if (activeTab === 'articles') {
        fetchApprovedArticles();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTab]);

  if (!user || !isAdmin) return <Navigate to="/login" />;

  const totalRevenue = payments.filter(p => p.status === 'completed' || p.status === 'success').reduce((sum, p) => sum + p.amount, 0);
  const revenueByMonth = [{ month: 'Jan', revenue: 21998 }, { month: 'Feb', revenue: 23998 }, { month: 'Mar', revenue: 16498 }];
  const userGrowth = [{ month: 'Oct', users: 45 }, { month: 'Nov', users: 78 }, { month: 'Dec', users: 120 }, { month: 'Jan', users: 189 }, { month: 'Feb', users: 267 }, { month: 'Mar', users: 312 }];
  const enrollmentsByCategory = courses.map(c => ({ name: c.category, value: c.enrolled })).reduce((acc, item) => {
    const existing = acc.find(a => a.name === item.name);
    if (existing) existing.value += item.value; else acc.push({ ...item });
    return acc;
  }, [] as { name: string; value: number }[]).slice(0, 5);
  const allComments = articles.flatMap(a => a.comments.map(c => ({ ...c, articleId: a.id, articleTitle: a.title })));
  // categories is now from useData()

  // const handleSaveCourse = async (formData: Record<string, string>) => {
  //   const priceValue = Math.max(0, parseInt(formData.price) || 0);
  //   const courseData: Omit<Course, 'id'> = {
  //     title: formData.title, category: formData.category, description: formData.description,
  //     instructor: formData.instructor || 'Lt Col Shreesh Kumar (Retd)', duration: formData.duration || '4 weeks',
  //     modules: Math.max(0, parseInt(formData.modules) || 6), price: priceValue,
  //     image: formData.image || '', level: formData.level || 'Beginner', enrolled: 0, rating: 4.5, modulesList: [],
  //   };

  const handleSaveCourse = async (data: Partial<Course>) => {
  try {
    let courseId: string;
    
    if (courseDialog.editing) {
      await updateCourse(courseDialog.editing.id, data);
      courseId = courseDialog.editing.id;
      toast.success('Course updated!');
    } else {
      const newCourse: Course = {
        id: `c-${Date.now()}`,
        title: data.title || '',
        category: data.category || 'General',
        description: data.description || '',
        instructor: data.instructor || 'Lt Col Shreesh Kumar (Retd)',
        instructorBio: data.instructorBio || '',
        duration: data.duration || '',
        modules: data.modules || 0,
        price: data.price || 0,
        originalPrice: data.originalPrice,
        image: data.image || '',
        level: data.level || 'Beginner',
        enrolled: 0,
        rating: 4.5,
        modulesList: data.modulesList || [],
        highlights: data.highlights || [],
        advantages: data.advantages || [],
        requirements: data.requirements || [],
        targetAudience: data.targetAudience || [],
        recordedLectures: data.recordedLectures || [],
        whyTake: data.whyTake || '',
        syllabus: data.syllabus || '',
        tags: data.tags || [],
        language: data.language || 'English',
        certificate: data.certificate ?? true,
        liveSessionsIncluded: data.liveSessionsIncluded ?? true,
        notesIncluded: data.notesIncluded ?? true,
        assignments: data.assignments,
      };

      await addCourse(newCourse);
      courseId = newCourse.id;
      toast.success('Course added!');
    }

    // Save assignments to the assignments collection
    if (data.assignments && data.assignments.length > 0) {
      let savedCount = 0;
      
      // If editing, delete existing assignments for this course first
      if (courseDialog.editing) {
        try {
          const existingAssignments = await fetch(`/api/assignments?courseId=${courseId}`);
          if (existingAssignments.ok) {
            const existingData = await existingAssignments.json();
            for (const existing of existingData) {
              await fetch('/api/assignments', {
                method: 'DELETE',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: existing.id }),
              });
            }
          }
        } catch (error) {
          console.error('Failed to delete existing assignments:', error);
        }
      }
      
      // Create new assignments
      for (const assignment of data.assignments) {
        try {
          const response = await fetch('/api/assignments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              title: assignment.title,
              fileUrl: assignment.fileUrl,
              courseId: courseId, // Always use the current course ID
            }),
          });
          if (response.ok) {
            savedCount++;
          }
        } catch (error) {
          console.error('Failed to save assignment:', error);
        }
      }
      
      if (savedCount > 0) {
        toast.success(`${savedCount} assignment(s) saved successfully!`);
      }
    }

    setCourseDialog({ open: false, editing: null });
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Failed to save course');
  }
};

  //   try {
  //     if (courseDialog.editing) {
  //       await updateCourse(courseDialog.editing.id, courseData);
  //       toast.success('Course updated!');
  //     } else {
  //       const newCourse: Course = { ...courseData, id: `c-${Date.now()}` } as Course;
  //       await addCourse(newCourse);
  //       toast.success('Course added!');
  //     }
  //     setCourseDialog({ open: false, editing: null });
  //   } catch (error) {
  //     toast.error(error instanceof Error ? error.message : 'Failed to save course');
  //   }
  // };

  const handleSaveClass = async (formData: Record<string, string>) => {
    try {
      const newId = classDialog.editing ? classDialog.editing.id : `lc-${Date.now()}`;
      const lecturePayload = {
        id: newId,
        title: formData.title,
        instructor: formData.instructor || 'Lt Col Shreesh Kumar (Retd)',
        date: formData.date,
        time: formData.time,
        meetLink: formData.meetLink || 'https://meet.google.com/xxx-yyyy-zzz',
        courseId: formData.courseId || courses[0]?.id || '',
        description: formData.description || '',
        thumbnail: formData.thumbnail || '',
      };

      const selectedCourse = courses.find(c => c.id === lecturePayload.courseId);
      if (!selectedCourse) {
        toast.error('Selected course not found');
        return;
      }

      if (classDialog.editing) {
        // Update existing
        const response = await fetch('/api/live-lectures', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: selectedCourse.id, lectureId: classDialog.editing.id, lecture: lecturePayload }),
        });
        const data = await response.json();
        if (response.ok) {
          await refetchCourses();
          await refetchLiveClasses();
          toast.success('Class updated!');
        } else {
          toast.error(data.error || 'Failed to update class');
        }
      } else {
        // Add new
        const response = await fetch('/api/live-lectures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseId: selectedCourse.id, lecture: lecturePayload }),
        });
        const data = await response.json();
        if (response.ok) {
          await refetchCourses();
          await refetchLiveClasses();
          toast.success('Class scheduled!');
        } else {
          toast.error(data.error || 'Failed to schedule class');
        }
      }
    } catch (error) {
      console.error('Error saving class:', error);
      toast.error('Error saving class');
    } finally {
      setClassDialog({ open: false, editing: null });
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      const courseWithClass = courses.find(c => c.liveClasses?.some((l: any) => l.id === classId));
      if (!courseWithClass) {
        toast.error('Class not found in any course');
        return;
      }
      const response = await fetch('/api/live-lectures', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: courseWithClass.id, lectureId: classId }),
      });
      const data = await response.json();
      if (response.ok) {
        await refetchCourses();
        await refetchLiveClasses();
        toast.success('Class deleted.');
      } else {
        toast.error(data.error || 'Failed to delete class');
      }
    } catch (error) {
      console.error('Error deleting class:', error);
      toast.error('Error deleting class');
    }
  };

  const handleSaveArticle = async (formData: Record<string, string>) => {
    const articleData: Omit<Article, 'id' | 'comments'> = {
      title: formData.title,
      excerpt: formData.excerpt || `${formData.content?.substring(0, 150) || ''}...`,
      content: formData.content,
      author: formData.author || 'Lt Col Shreesh Kumar (Retd)',
      date: new Date().toISOString().split('T')[0],
      category: formData.category || 'Leadership',
      readTime: `${Math.max(1, Math.ceil((formData.content?.length || 0) / 1000))} min read`,
      image: formData.image || '',
      likes: [],
    };

    if (articleDialog.editing) {
      try {
        const response = await fetch('/api/articles', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: articleDialog.editing.id, ...articleData }),
        });

        if (response.ok) {
          const updated = await response.json();
          updateArticle(articleDialog.editing.id, {
            ...articleData,
            comments: updated.comments || articleDialog.editing.comments,
            likes: updated.likes || articleDialog.editing.likes,
          });
          toast.success('Article updated!');
        } else {
          toast.error('Failed to update article');
        }
      } catch (error) {
        toast.error('Failed to update article');
      }
    } else {
      try {
        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...articleData,
            status: 'approved',
            submittedBy: user?.email || 'admin@eruditioninfinite.com',
          }),
        });

        if (response.ok) {
          const created = await response.json();
          addArticle({
            ...articleData,
            id: created.id || `a-${Date.now()}`,
            comments: created.comments || [],
            likes: created.likes || [],
          });
          toast.success('Article published!');
        } else {
          toast.error('Failed to publish article');
        }
      } catch (error) {
        toast.error('Failed to publish article');
      }
    }

    setArticleDialog({ open: false, editing: null });
  };

  const handleSaveRecordedLecture = async (lectureData: RecordedLecture, courseId: string) => {
    try {
      const selectedCourse = courses.find(c => c.id === courseId);

      if (!selectedCourse) {
        toast.error('Course not found');
        return;
      }

      if (recordedLectureDialog.editing) {
        // Update existing lecture
        console.log('Updating lecture:', { courseId, lectureId: recordedLectureDialog.editing.id, lecture: lectureData });

        const response = await fetch('/api/recorded-lectures', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: selectedCourse.id,
            lectureId: recordedLectureDialog.editing.id,
            lecture: lectureData,
          }),
        });

        const responseData = await response.json();
        console.log('Update response:', { status: response.status, data: responseData });

        if (response.ok) {
          // Refetch all courses to get fresh data
          await refetchCourses();
          toast.success('Recorded lecture updated!');
        } else {
          toast.error(responseData.error || 'Failed to update lecture');
        }
      } else {
        // Add new lecture
        console.log('Adding new lecture:', { courseId: selectedCourse.id, lecture: lectureData });

        const response = await fetch('/api/recorded-lectures', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            courseId: selectedCourse.id,
            lecture: lectureData,
          }),
        });

        const responseData = await response.json();
        console.log('Add response:', { status: response.status, data: responseData });

        if (response.ok) {
          // Refetch all courses to get fresh data
          await refetchCourses();
          toast.success('Recorded lecture added!');
        } else {
          toast.error(responseData.error || 'Failed to add lecture');
        }
      }

      setRecordedLectureDialog({ open: false, editing: null });
    } catch (error) {
      console.error('Error saving recorded lecture:', error);
      toast.error('Error saving recorded lecture');
    }
  };

  const handleDeleteRecordedLecture = async (lectureId: string) => {
    try {
      const courseWithLecture = courses.find(c =>
        c.recordedLectures?.some(l => l.id === lectureId)
      );

      if (!courseWithLecture) {
        toast.error('Lecture not found');
        return;
      }

      console.log('Deleting lecture:', { courseId: courseWithLecture.id, lectureId });

      const response = await fetch('/api/recorded-lectures', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: courseWithLecture.id,
          lectureId: lectureId,
        }),
      });

      const responseData = await response.json();
      console.log('Delete response:', { status: response.status, data: responseData });

      if (response.ok) {
        // Refetch all courses to get fresh data
        await refetchCourses();
        toast.success('Recorded lecture deleted!');
      } else {
        toast.error(responseData.error || 'Failed to delete lecture');
      }
    } catch (error) {
      console.error('Error deleting recorded lecture:', error);
      toast.error('Error deleting recorded lecture');
    }
  };

  const resetNoteDialog = () => {
    setNoteDialog(false);
    setEditingNoteId(null);
    setNoteForm({ title: '', courseId: '', category: '', description: '', externalLink: '', fileUrl: '' });
    setNoteFileName('');
    setNoteFileUploading(false);
  };

  const handleAddNote = async () => {
    if (!noteForm.title || !noteForm.courseId) { toast.error('Title and Course are required.'); return; }
    if (!noteForm.fileUrl && !noteForm.externalLink) { toast.error('Upload a file or provide an external link.'); return; }
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': user?.email || process.env.NEXT_PUBLIC_ADMIN_EMAIL || '',
          'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '',
        },
        body: JSON.stringify({
          ...noteForm,
          uploadedBy: user?.email || process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@eruditioninfinite.com'
        }),
      });
      if (response.ok) {
        const data = await response.json();
        addNote({ id: data.id, ...noteForm, fileUrl: noteForm.fileUrl, uploadDate: new Date().toISOString().split('T')[0] });
        toast.success('Note uploaded!');
        resetNoteDialog();
      } else {
        toast.error('Failed to upload note');
      }
    } catch (error) {
      toast.error('Error uploading note');
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNoteId(note.id);
    setNoteForm({
      title: note.title,
      courseId: note.courseId,
      category: note.category || '',
      description: note.description || '',
      externalLink: note.externalLink || note.link || '',
      fileUrl: note.fileUrl || '',
    });
    setNoteDialog(true);
  };

  const handleSaveNote = async () => {
    if (!noteForm.title || !noteForm.courseId) { toast.error('Title and Course are required.'); return; }
    if (editingNoteId) {
      const success = await updateNote(editingNoteId, noteForm);
      if (success) {
        toast.success('Note updated!');
        resetNoteDialog();
      } else {
        toast.error('Failed to update note');
      }
      return;
    }
    await handleAddNote();
  };

  const handleNoteFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setNoteFileUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'notes');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setNoteForm(prev => ({ ...prev, fileUrl: data.url, externalLink: prev.externalLink }));
        setNoteFileName(file.name);
        toast.success('File uploaded successfully!');
      } else {
        toast.error('File upload failed');
      }
    } catch (error) {
      toast.error('File upload error');
    } finally {
      setNoteFileUploading(false);
    }
  };

  const handleSupportReply = async () => {
    if (!supportReply?.text) return;
    try {
      const resp = await fetch(`/api/support/reply/${supportReply.ticketId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sender: 'admin', message: supportReply.text }) });
      if (!resp.ok) throw new Error('Failed to send reply');
      const data = await resp.json();
      if (data.success && data.ticket) {
        const tk = data.ticket;
        const mapped = {
          id: tk._id || tk.id,
          userId: tk.userId || '',
          userName: tk.userName || '',
          subject: tk.subject || '',
          description: tk.description || '',
          status: tk.status || 'open',
          date: tk.createdAt ? (new Date(tk.createdAt)).toISOString().split('T')[0] : '',
          messages: Array.isArray(tk.messages) ? tk.messages.map((m: any) => ({ sender: m.sender === 'admin' ? 'admin' : 'user', text: m.message || m.text || '', date: m.createdAt ? (new Date(m.createdAt)).toISOString().split('T')[0] : '' })) : [],
        };
        setAdminTickets(prev => prev.map(t => t.id === mapped.id ? mapped : t));
        toast.success('Reply sent!');
        setSupportReply(null);
      } else {
        throw new Error('Invalid response');
      }
    } catch (err) {
      console.error('Reply error', err);
      toast.error('Failed to send reply');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm('Delete this ticket?')) return;
    try {
      const resp = await fetch(`/api/support/admin/${ticketId}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Delete failed');
      setAdminTickets(prev => prev.filter(t => t.id !== ticketId));
      setHiddenSupportTickets(prev => prev.filter(id => id !== ticketId));
      if (supportReply?.ticketId === ticketId) setSupportReply(null);
      toast.success('Ticket deleted');
    } catch (err) {
      console.error('Delete ticket error', err);
      toast.error('Failed to delete ticket');
    }
  };

  const toggleTicketHidden = (ticketId: string) => {
    setHiddenSupportTickets(prev =>
      prev.includes(ticketId) ? prev.filter(id => id !== ticketId) : [...prev, ticketId]
    );
  };

  const toggleTicketStatus = async (ticketId: string) => {
    try {
      const t = adminTickets.find(a => a.id === ticketId);
      if (!t) return;
      const newStatus = t.status === 'open' ? 'closed' : 'open';
      const resp = await fetch(`/api/support/admin/${ticketId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
      if (!resp.ok) throw new Error('Update failed');
      const data = await resp.json();
      if (data.success && data.ticket) {
        setAdminTickets(prev => prev.map(a => a.id === ticketId ? { ...a, status: data.ticket.status } : a));
        if (supportReply?.ticketId === ticketId) {
          setSupportReply(null);
        }
        toast.success('Ticket updated');
      }
    } catch (err) {
      console.error('Toggle status error', err);
      toast.error('Failed to update ticket');
    }
  };

  const handleApproveArticle = async (articleId: string) => {
    try {
      const response = await fetch('/api/articles', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: articleId, status: 'approved' }),
      });

      if (response.ok) {
        setPendingArticles(prev => prev.filter(a => a.id !== articleId));
        // Refetch articles to update the Published Articles list
        const approvedResponse = await fetch('/api/articles?status=approved');
        if (approvedResponse.ok) {
          const approvedData = await approvedResponse.json();
          const mappedArticles = approvedData.map((article: any) => ({
            ...article,
            id: article.id || article._id?.toString(),
            comments: article.comments || [],
            likes: article.likes || [],
          }));
          // Update articles in the context
          approvedData.forEach((article: any) => {
            const existingArticle = articles.find(a => a.id === (article.id || article._id?.toString()));
            if (!existingArticle) {
              addArticle({
                ...article,
                id: article.id || article._id?.toString(),
                comments: article.comments || [],
                likes: article.likes || [],
              });
            }
          });
        }
        toast.success('Article approved!');
      } else {
        toast.error('Failed to approve article');
      }
    } catch (error) {
      console.error('Error approving article:', error);
      toast.error('Error approving article');
    }
  };

  const handleRejectArticle = async (articleId: string) => {
    try {
      const response = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: articleId }),
      });

      if (response.ok) {
        setPendingArticles(prev => prev.filter(a => a.id !== articleId));
        toast.success('Article rejected and deleted!');
      } else {
        toast.error('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Error deleting article');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      const response = await fetch('/api/articles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: articleId }),
      });

      if (response.ok) {
        deleteArticle(articleId);
        toast.success('Article deleted successfully');
      } else {
        toast.error('Failed to delete article');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Error deleting article');
    }
  };

const handleSaveCategory = async (formData: Record<string, string>) => {
    if (!formData.name?.trim()) { toast.error('Category name is required.'); return; }
    try {
      if (categoryDialog.editing) {
        await updateCategory(categoryDialog.editing, formData.name.trim());
        toast.success('Category updated!');
      } else {
        if (categories.includes(formData.name.trim())) {
          toast.error('Category already exists.');
          return;
        }
        await addCategory(formData.name.trim());
        toast.success('Category added!');
      }
      setCategoryForm({ name: '' });
      setCategoryDialog({ open: false, editing: null });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (category: string) => {
    if (category === 'All') {
      toast.error('The All category cannot be deleted.');
      return;
    }

    try {
      // If category is used, reassign the dependent content to All, then delete category.
      const usedInCourses = courses.some(c => c.category === category);
      const usedInArticles = articles.some(a => a.category === category);
      const usedInNotes = notes.some(n => n.category === category);

      if (usedInCourses || usedInArticles || usedInNotes) {
        // We now allow deleting in-use categories by reassigning items to All
        toast('Category in use; its courses/articles/notes will be reassigned to All.', { icon: '⚠️' });
      }

      await deleteCategory(category);
      toast.success('Category deleted!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete category');
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminActiveTab', activeTab);
    }
    // Mark testimonials as seen when admin clicks on the testimonials tab
    if (activeTab === 'testimonials') {
      setHasSeenTestimonials(true);
      setLastSeenTestimonialCount(pendingTestimonials.length);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="flex">
        <aside className="hidden w-56 border-r border-border bg-card md:block min-h-screen">
          <div className="p-4 border-b border-border">
            <p className="font-heading text-sm font-bold text-card-foreground">Admin Panel</p>
            <p className="text-xs text-muted-foreground">Erudition Infinite</p>
          </div>
          <nav className="p-2 space-y-0.5">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs transition-colors ${activeTab === id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="flex-1 text-left">{label}</span>
                {id === 'article-requests' && pendingArticles.length > 0 && (
                  <span className="flex h-2 w-2 rounded-full bg-green-500" />
                )}
                {id === 'testimonials' && pendingTestimonials.length > lastSeenTestimonialCount && !hasSeenTestimonials && (
                  <span className="flex h-2 w-2 rounded-full bg-green-500" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex w-full flex-col md:flex-1">
          <div className="flex gap-1 overflow-x-auto border-b border-border bg-card p-2 md:hidden">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)}
                className={`flex shrink-0 items-center gap-1 rounded-md px-2 py-1.5 text-xs ${activeTab === id ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground'}`}>
                <Icon className="h-3 w-3" />
                <span>{label}</span>
                {id === 'article-requests' && pendingArticles.length > 0 && (
                  <span className="flex h-2 w-2 rounded-full bg-green-500" />
                )}
                {id === 'testimonials' && pendingTestimonials.length > lastSeenTestimonialCount && !hasSeenTestimonials && (
                  <span className="flex h-2 w-2 rounded-full bg-green-500" />
                )}
              </button>
            ))}
          </div>

          <main className="flex-1 p-6">
            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Dashboard Overview</h2>
                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                  {[
                    { label: 'Total Students', value: '312', icon: Users },
                    { label: 'Total Courses', value: courses.length.toString(), icon: BookOpen },
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString()}`, icon: CreditCard },
                    { label: 'Live Classes', value: liveClasses.length.toString(), icon: Calendar },
                  ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <Icon className="h-4 w-4 text-gold" />
                      </div>
                      <p className="font-heading text-xl font-bold text-card-foreground">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mb-8 grid gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-4 font-heading text-sm font-semibold text-card-foreground">Revenue (Monthly)</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={revenueByMonth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip formatter={(v: number) => [`₹${v.toLocaleString()}`, 'Revenue']} />
                        <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-4 font-heading text-sm font-semibold text-card-foreground">User Growth</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={userGrowth}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                        <Tooltip />
                        <Line type="monotone" dataKey="users" stroke="hsl(var(--gold))" strokeWidth={2} dot={{ fill: 'hsl(var(--gold))' }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-4 font-heading text-sm font-semibold text-card-foreground">Enrollments by Category</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <PieChart>
                        <Pie data={enrollmentsByCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}>
                          {enrollmentsByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-4">
                    <h3 className="mb-3 font-heading text-sm font-semibold text-card-foreground">Recent Payments</h3>
                    <div className="space-y-2">
                      {payments.slice(0, 5).map(p => (
                        <div key={p.id} className="flex items-center justify-between text-sm">
                          <div>
                            <p className="text-card-foreground font-medium">{p.userName}</p>
                            <p className="text-xs text-muted-foreground">{p.courseName}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-card-foreground">₹{p.amount.toLocaleString()}</p>
                            <span className={`text-xs ${p.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{p.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* CATEGORIES */}
            {activeTab === 'categories' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-bold text-foreground">Category Management</h2>
                  <Button size="sm" onClick={() => { setCategoryForm({ name: '' }); setCategoryDialog({ open: true, editing: null }); }}><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
                </div>
                <div className="rounded-lg border border-border bg-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted"><tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Category Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Courses</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Articles</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Notes</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Actions</th>
                    </tr></thead>
                    <tbody>{categories.filter(cat => cat !== 'All').map(category => {
                      const courseCount = courses.filter(c => c.category === category).length;
                      const articleCount = articles.filter(a => a.category === category).length;
                      const noteCount = notes.filter(n => n.category === category).length;
                      return (
                        <tr key={category} className="border-t border-border">
                          <td className="px-4 py-2 font-medium text-card-foreground">{category}</td>
                          <td className="px-4 py-2 text-muted-foreground">{courseCount}</td>
                          <td className="px-4 py-2 text-muted-foreground">{articleCount}</td>
                          <td className="px-4 py-2 text-muted-foreground">{noteCount}</td>
                          <td className="px-4 py-2">
                            <div className="flex gap-1">
                              <Button size="sm" variant="outline" onClick={() => { setCategoryForm({ name: category }); setCategoryDialog({ open: true, editing: category }); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => handleDeleteCategory(category)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}</tbody>
                  </table>
                </div>
              </div>
            )}

            {/* COURSES */}
            {activeTab === 'courses' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-bold text-foreground">Course Management</h2>
                  <Button size="sm" onClick={() => setCourseDialog({ open: true, editing: null })}><Plus className="h-4 w-4 mr-1" /> Add Course</Button>
                </div>
                <div className="rounded-lg border border-border bg-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted"><tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Course</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Category</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Price</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Enrolled</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Actions</th>
                    </tr></thead>
                    <tbody>{courses.map(c => (
                      <tr key={c.id} className="border-t border-border">
                        <td className="px-4 py-2 font-medium text-card-foreground">{c.title}</td>
                        <td className="px-4 py-2 text-muted-foreground">{c.category}</td>
                        <td className="px-4 py-2 text-card-foreground">₹{c.price.toLocaleString()}</td>
                        <td className="px-4 py-2 text-card-foreground">{c.enrolled}</td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-between gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors flex-shrink-0" 
                              onClick={() => setViewCourse(c)}
                              title="View Course"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-3 hover:bg-green-50 hover:text-green-600 transition-colors flex-shrink-0 text-xs" 
                              onClick={() => setCourseDialog({ open: true, editing: c })}
                              title="Edit Course"
                            >
                              <Pencil className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 px-3 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0 text-xs text-destructive" 
                              onClick={() => { deleteCourse(c.id); toast.success('Course deleted.'); }}
                              title="Delete Course"
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

            {/* LIVE CLASSES */}
            {activeTab === 'classes' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-bold text-foreground">Live Class Management</h2>
                  <Button size="sm" onClick={() => setClassDialog({ open: true, editing: null })}><Plus className="h-4 w-4 mr-1" /> Schedule Class</Button>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {liveClasses.map(cls => (
                    <div key={cls.id} className="rounded-lg border border-border bg-card p-4">
                      <h3 className="font-medium text-card-foreground">{cls.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{cls.date} • {cls.time}</p>
                      <p className="text-xs text-muted-foreground">{cls.instructor}</p>
                      <div className="mt-3 flex gap-1">
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setClassDialog({ open: true, editing: cls })}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => { if (confirm('Delete this class?')) handleDeleteClass(cls.id); }}><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STUDENTS */}
            {activeTab === 'students' && (
              <div>
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Student Management</h2>
                <div className="rounded-lg border border-border bg-card overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted"><tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Contact No</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Courses Enrolled</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">View Enrolled Courses</th>
                      </tr></thead>
                      <tbody>
                        {loadingStudents ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Loading students...</td>
                          </tr>
                        ) : studentsError ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-destructive">{studentsError}</td>
                          </tr>
                        ) : students.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">No student records found.</td>
                          </tr>
                        ) : (
                          students.map((student) => (
                            <tr key={student.id} className="border-t border-border bg-background">
                              <td className="px-4 py-3 font-medium text-card-foreground">{student.name}</td>
                              <td className="px-4 py-3 text-muted-foreground">{student.email}</td>
                              <td className="px-4 py-3 text-card-foreground">{student.phone || '—'}</td>
                              <td className="px-4 py-3 font-medium text-card-foreground">{student.enrolledCount}</td>
                              <td className="px-4 py-3">
                                <Button size="sm" className="h-8 px-3" onClick={() => setSelectedStudent(student)}>
                                  View Enrolled Courses
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Student Details Dialog */}
                {selectedStudent && (
                  <DialogOverlay onClose={() => setSelectedStudent(null)}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading text-xl font-bold">Student Details</h3>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}><X className="h-4 w-4" /></Button>
                      </div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Name</p>
                            <p className="font-medium">{selectedStudent.name}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="font-medium">{selectedStudent.email}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Contact</p>
                            <p className="font-medium">{selectedStudent.phone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Joined</p>
                            <p className="font-medium">{selectedStudent.createdAt ? new Date(selectedStudent.createdAt).toLocaleDateString() : 'N/A'}</p>
                          </div>
                        </div>
                        <div className="border-t border-border pt-3">
                          <p className="text-sm font-medium mb-2">Enrolled Courses ({selectedStudent.enrolledCoursesCount})</p>
                          {(selectedStudent.enrolledCourses?.length ?? 0) > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {(selectedStudent.enrolledCourses ?? []).map((course: any, idx: number) => (
                                <div key={idx} className="rounded bg-muted p-2">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{course.courseName}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      course.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                      course.status === 'Pursuing' ? 'bg-blue-100 text-blue-700' :
                                      'bg-yellow-100 text-yellow-700'
                                    }`}>{course.status}</span>
                                  </div>
                                  <div className="mt-1 flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                      <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress}%` }} />
                                    </div>
                                    <span className="text-xs text-muted-foreground">{course.progress}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No courses enrolled</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogOverlay>
                )}
              </div>
            )}

            {/* PAYMENTS */}
            {activeTab === 'payments' && (
              <div>
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Payment Management</h2>
                <div className="mb-4 rounded-lg border border-border bg-card p-4">
                  <p className="text-sm text-muted-foreground">Total Revenue: <span className="font-heading text-xl font-bold text-card-foreground ml-2">₹{totalRevenue.toLocaleString()}</span></p>
                </div>
                <div className="rounded-lg border border-border bg-card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted"><tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Student</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Course</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Amount</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Payment Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Enrolled Date</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Status</th>
                    </tr></thead>
                    <tbody>{payments.map(p => (
                      <tr key={p.id} className="border-t border-border">
                        <td className="px-4 py-2 text-card-foreground">{p.userName}</td>
                        <td className="px-4 py-2 text-muted-foreground">{p.userEmail || '—'}</td>
                        <td className="px-4 py-2 text-muted-foreground">{p.courseName}</td>
                        <td className="px-4 py-2 font-medium text-card-foreground">₹{p.amount.toLocaleString()}</td>
                        <td className="px-4 py-2 text-muted-foreground">{p.paymentDate ? new Date(p.paymentDate).toLocaleString() : '—'}</td>
                        <td className="px-4 py-2 text-muted-foreground">{p.enrolledAt ? new Date(p.enrolledAt).toLocaleDateString() : '—'}</td>
                        <td className="px-4 py-2"><span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${p.status === 'completed' || p.status === 'success' ? 'bg-green-100 text-green-700' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ARTICLES */}
            {activeTab === 'articles' && (
              <div className="space-y-6">
                {/* Published Articles */}
                <div>
                  <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <h2 className="font-heading text-2xl font-bold text-foreground">Published Articles</h2>
                    <Button size="sm" onClick={() => setArticleDialog({ open: true, editing: null })}><Plus className="h-3 w-3 mr-1" /> Add Article</Button>
                  </div>
                  <div className="space-y-3">
                    {articles.map(a => (
                      <div key={a.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                        <div>
                          <p className="font-medium text-card-foreground">{a.title}</p>
                          <p className="text-xs text-muted-foreground">{a.category} • {a.date} • {a.comments.length} comments</p>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setArticleDialog({ open: true, editing: a })}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleDeleteArticle(a.id)}><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COMMENTS */}
            {activeTab === 'comments' && (
              <div>
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Comment Management</h2>
                {allComments.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card p-8 text-center"><p className="text-muted-foreground">No comments yet.</p></div>
                ) : (
                  <div className="space-y-3">
                    {allComments.map(c => (
                      <div key={c.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">On: <span className="font-medium text-card-foreground">{c.articleTitle}</span></p>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium text-card-foreground">{c.userName}</span>
                              <span className="text-xs text-muted-foreground">{c.date}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{c.text}</p>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => { deleteComment(c.articleId, c.id); toast.success('Comment deleted.'); }}><Trash2 className="h-3 w-3" /></Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* RECORDED LECTURES */}
            {activeTab === 'recorded-lectures' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-bold text-foreground">Recorded Lectures Management</h2>
                  <Button size="sm" onClick={() => setRecordedLectureDialog({ open: true, editing: null })}><Plus className="h-4 w-4 mr-1" /> Add Lecture</Button>
                </div>

                {courses.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card p-6 text-center">
                    <p className="text-muted-foreground">No courses available. Please create a course first.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {courses.map(course => (
                      <div key={course.id}>
                        <h3 className="font-medium text-card-foreground mb-3 flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-gold" />
                          {course.title}
                        </h3>
                        {!course.recordedLectures || course.recordedLectures.length === 0 ? (
                          <div className="rounded-lg border border-border bg-muted/30 p-4 text-center">
                            <p className="text-xs text-muted-foreground">No recorded lectures for this course</p>
                          </div>
                        ) : (
                          <div className="rounded-lg border border-border bg-card overflow-hidden">
                            <table className="w-full text-sm">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Module</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Lecture Title</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Duration</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {course.recordedLectures.map((lecture, idx) => (
                                  <tr key={lecture.id} className={idx > 0 ? 'border-t border-border' : ''}>
                                    <td className="px-4 py-2 text-card-foreground">{lecture.moduleName}</td>
                                    <td className="px-4 py-2">
                                      <div>
                                        <p className="text-card-foreground">{lecture.lectureTitle}</p>
                                        {lecture.description && (
                                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{lecture.description}</p>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 text-muted-foreground">{lecture.duration}</td>
                                    <td className="px-4 py-2">
                                      <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${
                                        lecture.preview
                                          ? 'bg-blue-100 text-blue-700'
                                          : 'bg-gray-100 text-gray-700'
                                      }`}>
                                        {lecture.preview ? 'Free' : 'Premium'}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2">
                                      <div className="flex gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs"
                                          onClick={() => setRecordedLectureDialog({ open: true, editing: lecture })}
                                        >
                                          <Pencil className="h-3 w-3 mr-1" /> Edit
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-7 text-xs text-destructive"
                                          onClick={() => handleDeleteRecordedLecture(lecture.id)}
                                        >
                                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                                        </Button>
                                        {lecture.videoUrl && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs text-primary"
                                            onClick={() => window.open(lecture.videoUrl, '_blank')}
                                          >
                                            <ExternalLink className="h-3 w-3 mr-1" /> View
                                          </Button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* NOTES */}
            {activeTab === 'notes' && (
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="font-heading text-2xl font-bold text-foreground">Notes Management</h2>
                  <Button size="sm" onClick={() => setNoteDialog(true)}><Plus className="h-4 w-4 mr-1" /> Upload Note</Button>
                </div>
                <div className="space-y-3">
                  {notes.map(n => (
                    <div key={n.id} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
                      <div>
                        <p className="font-medium text-card-foreground">{n.title}</p>
                        <p className="text-xs text-muted-foreground">{n.category} • {n.uploadDate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary"
                          onClick={() => handleEditNote(n)}
                        ><Pencil className="h-3 w-3 mr-1" /> Update</Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-destructive"
                          onClick={async () => {
                            const success = await deleteNote(n.id);
                            if (success) {
                              toast.success('Note deleted.');
                            } else {
                              toast.error('Failed to delete note.');
                            }
                          }}
                        ><Trash2 className="h-3 w-3 mr-1" /> Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TESTIMONIALS */}
            {activeTab === 'testimonials' && (
              <div>
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Testimonial Management</h2>
                <div className="space-y-3">
                  {adminTestimonials.map(t => (
                    <div key={t.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-card-foreground">{t.name}</p>
                            <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${t.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status === 'approved' ? 'Approved' : 'Pending'}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{t.role} • {t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : ''}</p>
                          <div className="flex gap-0.5 my-1">{Array.from({ length: t.rating }).map((_: any, j: number) => <Star key={j} className="h-3 w-3 fill-gold text-gold" />)}</div>
                          <p className="text-sm text-muted-foreground italic">"{t.text}"</p>
                        </div>
                        <div className="flex gap-1 ml-2">
                          {t.status !== 'approved' && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600" onClick={async () => {
                              try {
                                const res = await fetch(`/api/admin/testimonials/${t.id}/approve`, { method: 'PUT' });
                                if (!res.ok) throw new Error('Approve failed');
                                toast.success('Testimonial approved!');
                                // refresh
                                const updated = await fetch('/api/admin/testimonials');
                                if (updated.ok) {
                                  const d = await updated.json();
                                  setAdminTestimonials(d.map((i: any) => ({ id: i.id || i._id?.toString(), name: i.name, role: i.role, text: i.message || i.text, rating: i.rating, status: i.status, createdAt: i.createdAt })));
                                }
                              } catch (err) {
                                console.error(err);
                                toast.error('Failed to approve');
                              }
                            }}><CheckCircle className="h-3 w-3 mr-1" /> Approve</Button>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={async () => {
                            if (!confirm('Delete this testimonial?')) return;
                            try {
                              const res = await fetch(`/api/admin/testimonials/${t.id}`, { method: 'DELETE' });
                              if (!res.ok) throw new Error('Delete failed');
                              toast.success('Testimonial deleted.');
                              const updated = await fetch('/api/admin/testimonials');
                              if (updated.ok) {
                                const d = await updated.json();
                                setAdminTestimonials(d.map((i: any) => ({ id: i.id || i._id?.toString(), name: i.name, role: i.role, text: i.message || i.text, rating: i.rating, status: i.status, createdAt: i.createdAt })));
                              }
                            } catch (err) {
                              console.error(err);
                              toast.error('Failed to delete');
                            }
                          }}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ENQUIRIES */}
            {activeTab === 'enquiries' && (
              <div>
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Enquiry Management</h2>
                <div className="space-y-3">
                  {enquiries.map(e => (
                    <div key={e.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium text-card-foreground">{e.name}</p>
                            <span className={`rounded-sm px-2 py-0.5 text-xs font-medium ${e.status === 'new' ? 'bg-blue-100 text-blue-700' : e.status === 'contacted' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{e.status}</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                            <div>
                              <span className="font-medium text-foreground">Email:</span> {e.email}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Phone:</span> {e.phone}
                            </div>
                            <div>
                              <span className="font-medium text-foreground">Date:</span> {e.date}
                            </div>
                          </div>
                          <div className="bg-muted/50 rounded-md p-3">
                            <p className="text-xs font-medium text-foreground mb-1">Message:</p>
                            <p className="text-sm text-muted-foreground">{e.message}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          {e.status === 'new' && (
                            <Button variant="default" size="sm" className="h-8 text-xs" onClick={() => { updateEnquiryStatus(e.id, 'contacted'); toast.success('Marked as contacted.'); }}>Mark Contacted</Button>
                          )}
                          {e.status === 'contacted' && (
                            <Button variant="default" size="sm" className="h-8 text-xs bg-green-600 hover:bg-green-700" onClick={() => { updateEnquiryStatus(e.id, 'resolved'); toast.success('Marked as resolved.'); }}>Resolve</Button>
                          )}
                          <Button variant="outline" size="sm" className="h-8 text-xs text-destructive border-destructive hover:bg-destructive hover:text-white" onClick={async () => {
                            if (confirm('Are you sure you want to delete this enquiry?')) {
                              try {
                                await deleteEnquiry(e.id);
                                toast.success('Enquiry deleted.');
                              } catch {
                                toast.error('Failed to delete enquiry.');
                              }
                            }
                          }}>Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ARTICLE REQUESTS */}
            {activeTab === 'article-requests' && (
              <div>
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Article Requests</h2>
                {loadingPendingArticles ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : pendingArticles.length === 0 ? (
                  <div className="rounded-lg border border-border bg-card p-6 text-center">
                    <p className="text-muted-foreground">No pending article requests at the moment.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingArticles.map(article => (
                      <div key={article.id} className="rounded-lg border border-border bg-card p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-medium text-card-foreground">{article.title}</p>
                            <p className="text-xs text-muted-foreground">By {article.author} • {article.date}</p>
                            <p className="text-sm text-muted-foreground mt-1">{article.excerpt}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-xs text-muted-foreground">Category: {article.category}</p>
                              {article.image && (
                                <button
                                  onClick={() => setViewArticleImage({ url: article.image, title: article.title })}
                                  className="text-xs text-primary hover:text-primary/80 hover:underline"
                                >
                                  View Image
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-1 ml-2">
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-green-600" onClick={() => handleApproveArticle(article.id)}><CheckCircle className="h-3 w-3 mr-1" /> Approve</Button>
                            <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleRejectArticle(article.id)}><XCircle className="h-3 w-3 mr-1" /> Reject</Button>
                            <span className="rounded-sm px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-700">pending</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUPPORT */}
            {activeTab === 'support' && (
              <div>
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Support Tickets</h2>
                <div className="space-y-3">
                  {supportTickets.map(t => (
                    <div key={t.id} className="rounded-lg border border-border bg-card p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-card-foreground">{t.subject}</p>
                          <p className="text-xs text-muted-foreground">{t.userName} • {t.date}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {t.status === 'open' ? (
                            <>
                              <span className="rounded-sm px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">open</span>
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleTicketStatus(t.id)}>Close</Button>
                            </>
                          ) : (
                            <span className="rounded-sm px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-500">closed</span>
                          )}
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => toggleTicketHidden(t.id)}>
                            {hiddenSupportTickets.includes(t.id) ? 'Show' : 'Hide'}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleDeleteTicket(t.id)}>Delete</Button>
                        </div>
                      </div>
                      {hiddenSupportTickets.includes(t.id) ? null : (
                        <>
                          <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                            {[...(t.description ? [{ sender: 'user', text: t.description, date: t.date }] : []), ...t.messages].map((m, i) => (
                              <div key={i} className={`rounded-md p-2 text-sm ${m.sender === 'admin' ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'}`}>
                                <p className="text-xs font-medium text-card-foreground mb-0.5">{m.sender === 'admin' ? 'You (Admin)' : t.userName}</p>
                                <p className="text-muted-foreground">{m.text}</p>
                              </div>
                            ))}
                          </div>
                          {t.status === 'open' && (
                            supportReply?.ticketId === t.id ? (
                              <div className="flex gap-2">
                                <Input value={supportReply.text} onChange={e => setSupportReply({ ...supportReply, text: e.target.value })} placeholder="Type reply..." onKeyDown={e => e.key === 'Enter' && handleSupportReply()} />
                                <Button size="sm" onClick={handleSupportReply}><Send className="h-4 w-4" /></Button>
                                <Button variant="outline" size="sm" onClick={() => setSupportReply(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm" className="text-xs" onClick={() => setSupportReply({ ticketId: t.id, text: '' })}><Reply className="h-3 w-3 mr-1" /> Reply</Button>
                            )
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CERTIFICATES */}
            {activeTab === 'certificates' && (
              <div>
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Certificate Management</h2>
                <div className="rounded-lg border border-border bg-card p-6 text-center">
                  <Award className="mx-auto mb-3 h-10 w-10 text-gold" />
                  <p className="font-medium text-card-foreground">Certificate System</p>
                  <p className="text-sm text-muted-foreground mt-1">Certificates are automatically generated upon course completion.</p>
                  <p className="text-sm text-muted-foreground mt-1">Total certificates issued: <strong>1</strong></p>
                </div>
              </div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
              <div>
                <h2 className="mb-6 font-heading text-2xl font-bold text-foreground">Platform Settings</h2>
                <div className="space-y-6">
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="font-heading text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2"><CreditCard className="h-5 w-5 text-gold" /> Payment Gateway (Razorpay)</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Razorpay Key ID</label><Input value={settings.razorpayKeyId} onChange={e => setSettings({ ...settings, razorpayKeyId: e.target.value })} placeholder="rzp_test_xxxxxxxxxx" /></div>
                      <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Razorpay Key Secret</label><Input type="password" value={settings.razorpayKeySecret} onChange={e => setSettings({ ...settings, razorpayKeySecret: e.target.value })} placeholder="Enter key secret" /></div>
                    </div>
                    <Button size="sm" className="mt-4" onClick={() => toast.success('Razorpay settings saved (mock).')}><Save className="h-3 w-3 mr-1" /> Save Payment Settings</Button>
                  </div>
                  <div className="rounded-lg border border-border bg-card p-6">
                    <h3 className="font-heading text-lg font-semibold text-card-foreground mb-4 flex items-center gap-2"><Mail className="h-5 w-5 text-gold" /> SMTP / Email Settings</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div><label className="text-xs font-medium text-muted-foreground mb-1 block">SMTP Host</label><Input value={settings.smtpHost} onChange={e => setSettings({ ...settings, smtpHost: e.target.value })} placeholder="smtp.gmail.com" /></div>
                      <div><label className="text-xs font-medium text-muted-foreground mb-1 block">SMTP Port</label><Input value={settings.smtpPort} onChange={e => setSettings({ ...settings, smtpPort: e.target.value })} placeholder="587" /></div>
                      <div><label className="text-xs font-medium text-muted-foreground mb-1 block">SMTP Username</label><Input value={settings.smtpUser} onChange={e => setSettings({ ...settings, smtpUser: e.target.value })} placeholder="your@email.com" /></div>
                      <div><label className="text-xs font-medium text-muted-foreground mb-1 block">SMTP Password</label><Input type="password" value={settings.smtpPass} onChange={e => setSettings({ ...settings, smtpPass: e.target.value })} placeholder="Enter password" /></div>
                      <div className="md:col-span-2"><label className="text-xs font-medium text-muted-foreground mb-1 block">From Email</label><Input value={settings.smtpFrom} onChange={e => setSettings({ ...settings, smtpFrom: e.target.value })} /></div>
                    </div>
                    <Button size="sm" className="mt-4" onClick={() => toast.success('SMTP settings saved (mock).')}><Save className="h-3 w-3 mr-1" /> Save Email Settings</Button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* DIALOGS */}
      {courseDialog.open && <CourseFormDialog initial={courseDialog.editing} categories={categories} onSave={handleSaveCourse} onClose={() => setCourseDialog({ open: false, editing: null })} />}
      {viewCourse && (
        <DialogOverlay onClose={() => setViewCourse(null)}>
          <h3 className="font-heading text-lg font-semibold text-card-foreground mb-4">Course Details</h3>
          <div className="space-y-2 text-sm">
            <p><strong>Title:</strong> {viewCourse.title}</p>
            <p><strong>Category:</strong> {viewCourse.category}</p>
            <p><strong>Instructor:</strong> {viewCourse.instructor}</p>
            <p><strong>Duration:</strong> {viewCourse.duration}</p>
            <p><strong>Modules:</strong> {viewCourse.modules}</p>
            <p><strong>Price:</strong> ₹{viewCourse.price.toLocaleString()}</p>
            <p><strong>Level:</strong> {viewCourse.level}</p>
            <p><strong>Enrolled:</strong> {viewCourse.enrolled}</p>
            <p><strong>Rating:</strong> {viewCourse.rating}</p>
            <p><strong>Description:</strong> {viewCourse.description}</p>
            {viewCourse.image && <img src={viewCourse.image} alt="Course" className="mt-2 h-32 w-full object-cover rounded" />}
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={() => setViewCourse(null)}>Close</Button>
          </div>
        </DialogOverlay>
      )}
      {selectedStudent && (
        <DialogOverlay onClose={() => setSelectedStudent(null)}>
          <h3 className="font-heading text-lg font-semibold text-card-foreground mb-4">Enrolled Courses for {selectedStudent.name}</h3>
          <p className="text-sm text-muted-foreground mb-4">Total enrolled courses: {selectedStudent.courses.length}</p>
          {selectedStudent.courses.length > 0 ? (
            <div className="grid gap-3">
              {selectedStudent.courses.map((course: any) => (
                <div key={course.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="text-sm font-semibold text-card-foreground mb-2">{course.title}</div>
                  <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                    course.status === 'Completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : course.status === 'In Progress'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {course.status}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No enrolled courses found for this student.</p>
          )}
          <div className="mt-4 flex justify-end">
            <Button size="sm" onClick={() => setSelectedStudent(null)}>Close</Button>
          </div>
        </DialogOverlay>
      )}
      {classDialog.open && <ClassFormDialog initial={classDialog.editing} courses={courses} onSave={handleSaveClass} onClose={() => setClassDialog({ open: false, editing: null })} />}
      {articleDialog.open && <ArticleFormDialog initial={articleDialog.editing} categories={categories} onSave={handleSaveArticle} onClose={() => setArticleDialog({ open: false, editing: null })} />}
      {viewArticleImage && (
        <DialogOverlay onClose={() => setViewArticleImage(null)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-card-foreground">Article Image</h3>
            <button onClick={() => setViewArticleImage(null)}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{viewArticleImage.title}</p>
          <img src={viewArticleImage.url} alt={viewArticleImage.title} className="w-full max-h-[60vh] object-contain rounded-lg" />
        </DialogOverlay>
      )}
      {recordedLectureDialog.open && <RecordedLectureFormDialog initial={recordedLectureDialog.editing} courses={courses} onSave={handleSaveRecordedLecture} onClose={() => setRecordedLectureDialog({ open: false, editing: null })} />}
      {categoryDialog.open && (
        <DialogOverlay onClose={() => { setCategoryDialog({ open: false, editing: null }); setCategoryForm({ name: '' }); }}>
          <h3 className="font-heading text-lg font-semibold text-card-foreground mb-4">{categoryDialog.editing ? 'Edit Category' : 'Add Category'}</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category Name</label>
              <Input value={categoryForm.name} onChange={e => setCategoryForm({ name: e.target.value })} placeholder="Enter category name" />
            </div>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => { setCategoryDialog({ open: false, editing: null }); setCategoryForm({ name: '' }); }}>Cancel</Button>
            <Button size="sm" onClick={() => handleSaveCategory({ name: categoryForm.name })}><Save className="h-3 w-3 mr-1" /> {categoryDialog.editing ? 'Update' : 'Add'} Category</Button>
          </div>
        </DialogOverlay>
      )}
      {noteDialog && (
        <DialogOverlay onClose={() => resetNoteDialog()}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg font-semibold text-card-foreground">{editingNoteId ? 'Update Note' : 'Upload Note'}</h3>
            <button onClick={() => resetNoteDialog()}><X className="h-4 w-4 text-muted-foreground" /></button>
          </div>
          <div className="space-y-3">
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label><Input value={noteForm.title} onChange={e => setNoteForm({ ...noteForm, title: e.target.value })} /></div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
              <select
                value={noteForm.category}
                onChange={e => setNoteForm({ ...noteForm, category: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">Select a category</option>
                {categories.filter((cat) => cat !== 'All').map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1 block">Course</label>
              <select value={noteForm.courseId} onChange={e => setNoteForm({ ...noteForm, courseId: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select a course</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label><Textarea value={noteForm.description} onChange={e => setNoteForm({ ...noteForm, description: e.target.value })} rows={3} /></div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Upload File</label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={handleNoteFileChange}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
                {noteFileUploading && <p className="mt-2 text-xs text-muted-foreground">Uploading file...</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">External Link (Google Drive or other)</label>
                <Input value={noteForm.externalLink} onChange={e => setNoteForm({ ...noteForm, externalLink: e.target.value })} placeholder="https://drive.google.com/..." />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Note: File upload is saved to the database and will be available to users for download.</p>
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={() => resetNoteDialog()}>Cancel</Button>
            <Button size="sm" onClick={handleSaveNote}>
              {editingNoteId ? <Save className="h-3 w-3 mr-1" /> : <Upload className="h-3 w-3 mr-1" />} 
              {editingNoteId ? 'Update' : 'Upload'}
            </Button>
          </div>
        </DialogOverlay>
      )}
    </div>
  );
};

// Form Dialogs
// function CourseFormDialog({ initial, categories, onSave, onClose }: { initial: Course | null; categories: string[]; onSave: (data: Record<string, string>) => void; onClose: () => void }) {
//   const [form, setForm] = useState({
//     title: initial?.title || '', category: initial?.category || categories[0] || '', description: initial?.description || '',
//     instructor: initial?.instructor || 'Lt Col Shreesh Kumar (Retd)', duration: initial?.duration || '',
//     modules: initial?.modules?.toString() || '', price: initial?.price?.toString() || '', level: initial?.level || 'Beginner',
//     image: initial?.image || '',
//   });

//   useEffect(() => {
//     if (!initial && categories.length > 0) {
//       setForm((prev) => ({ ...prev, category: categories[0] }));
//     }
//   }, [categories, initial]);
//   const [imageFile, setImageFile] = useState<File | null>(null);
//   const [imageName, setImageName] = useState('No file chosen');
//   const [uploading, setUploading] = useState(false);

//   const handleImageUpload = async (file: File) => {
//     setUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       const response = await fetch('/api/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setForm({ ...form, image: data.url });
//         toast.success('Image uploaded successfully!');
//       } else {
//         toast.error('Failed to upload image');
//       }
//     } catch (error) {
//       toast.error('Upload failed');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {     
//       setImageFile(file);
//       setImageName(file.name);
//       handleImageUpload(file);
//     }
//   };
//   return (
//     <DialogOverlay onClose={onClose}>
//       <div className="flex items-center justify-between mb-4">
//         <h3 className="font-heading text-lg font-semibold text-card-foreground">{initial ? 'Edit Course' : 'Add New Course'}</h3>
//         <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
//       </div>
//       <div className="space-y-3">
//         <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
//         <div>
//           <label className="text-xs font-medium text-muted-foreground mb-1 block">Category *</label>
//           <select
//             value={form.category}
//             onChange={e => setForm({ ...form, category: e.target.value })}
//             className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
//           >
//             {categories.map((cat) => (
//               <option key={cat} value={cat}>{cat}</option>
//             ))}
//           </select>
//         </div>
//         <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} /></div>
//         <div className="grid grid-cols-2 gap-3">
//           <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Price (₹)</label><Input type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
//           <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Duration</label><Input value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="e.g. 4 weeks" /></div>
//         </div>
//         <div className="grid grid-cols-2 gap-3">
//           <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Modules</label><Input type="number" value={form.modules} onChange={e => setForm({ ...form, modules: e.target.value })} /></div>
//           <div>
//             <label className="text-xs font-medium text-muted-foreground mb-1 block">Level</label>
//             <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
//               <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
//             </select>
//           </div>
//         </div>
//         <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Instructor</label><Input value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} /></div>
//         <div>
//           <label className="text-xs font-medium text-muted-foreground mb-1 block">Course Image</label>
//           <div className="space-y-2">
//             <div className="flex items-center gap-3">
//               <label className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground cursor-pointer hover:bg-primary/90">
//                 Choose File
//                 <input
//                   type="file"
//                   accept="image/*"
//                   onChange={handleFileChange}
//                   disabled={uploading}
//                   className="sr-only"
//                 />
//               </label>
//               <span className="text-xs text-muted-foreground truncate max-w-[220px]">{imageName}</span>
//             </div>
//             {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
//             {form.image && (
//               <div className="flex items-center gap-2">
//                 <img src={form.image} alt="Course preview" className="h-16 w-16 object-cover rounded" />
//                 <span className="text-xs text-muted-foreground">Image uploaded</span>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//       <div className="mt-4 flex gap-2 justify-end">
//         <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
//         <Button size="sm" onClick={() => onSave(form)} disabled={!form.title || !form.category}><Save className="h-3 w-3 mr-1" /> {initial ? 'Update' : 'Create'}</Button>
//       </div>
//     </DialogOverlay>
//   );
// }

function ClassFormDialog({ initial, courses, onSave, onClose }: { initial: LiveClass | null; courses: Course[]; onSave: (data: Record<string, string>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title || '', instructor: initial?.instructor || 'Lt Col Shreesh Kumar (Retd)',
    date: initial?.date || '', time: initial?.time || '', meetLink: initial?.meetLink || '',
    courseId: initial?.courseId || courses[0]?.id || '', description: initial?.description || '',
    thumbnail: initial?.thumbnail || '',
  });
  const [uploading, setUploading] = useState(false);
  const [imageName, setImageName] = useState(initial?.thumbnail ? 'Image uploaded' : 'No file chosen');

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageName(file.name);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'live-class');

      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        setForm(prev => ({ ...prev, thumbnail: data.url }));
        toast.success('Thumbnail uploaded successfully!');
      } else {
        toast.error('Failed to upload thumbnail');
      }
    } catch (error) {
      toast.error('Error uploading thumbnail');
    } finally {
      setUploading(false);
    }
  };

  return (
    <DialogOverlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-card-foreground">{initial ? 'Edit Class' : 'Schedule New Class'}</h3>
        <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <div className="space-y-3">
        <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Course</label>
          <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Date</label><Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
          <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Time</label><Input value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="e.g. 10:00 AM IST" /></div>
        </div>
        <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Google Meet Link</label><Input value={form.meetLink} onChange={e => setForm({ ...form, meetLink: e.target.value })} placeholder="https://meet.google.com/..." /></div>
        <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Description</label><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} /></div>
        <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Instructor</label><Input value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} /></div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Class Thumbnail</label>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <label className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground cursor-pointer hover:bg-primary/90">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-muted-foreground">{imageName}</span>
            </div>
            {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
            {form.thumbnail && (
              <div className="mt-2">
                <img 
                  src={form.thumbnail} 
                  alt="Thumbnail preview" 
                  className="h-24 w-40 object-cover rounded-md border border-border"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.title || uploading}>
          <Save className="h-3 w-3 mr-1" /> {initial ? 'Update' : 'Schedule'}
        </Button>
      </div>
    </DialogOverlay>
  );
}

function ArticleFormDialog({ initial, categories, onSave, onClose }: { initial: Article | null; categories: string[]; onSave: (data: Record<string, string>) => void; onClose: () => void }) {
  const [form, setForm] = useState({
    title: initial?.title || '', category: initial?.category || '', excerpt: initial?.excerpt || '',
    content: initial?.content || '', author: initial?.author || 'Lt Col Shreesh Kumar (Retd)',
    image: initial?.image || '',
  });
  const [uploading, setUploading] = useState(false);
  const [imageName, setImageName] = useState(initial?.image ? 'Image uploaded' : 'No file chosen');

  useEffect(() => {
    if (!initial) {
      const defaultCategory = categories.find(c => c !== 'All') || categories[0] || '';
      setForm(prev => ({ ...prev, category: prev.category || defaultCategory }));
    }
  }, [categories, initial]);

  return (
    <DialogOverlay onClose={onClose}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-card-foreground">{initial ? 'Edit Article' : 'New Article'}</h3>
        <button onClick={onClose}><X className="h-4 w-4 text-muted-foreground" /></button>
      </div>
      <div className="space-y-3">
        <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Title *</label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Category</label>
          <select
            value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {categories.filter(c => c !== 'All').map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Excerpt</label><Textarea value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} rows={2} /></div>
        <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Content *</label><Textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} rows={6} /></div>
        <div><label className="text-xs font-medium text-muted-foreground mb-1 block">Author</label><Input value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} /></div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Article Image</label>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <label className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground cursor-pointer hover:bg-primary/90">
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageName(file.name);
                      setUploading(true);
                      try {
                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('type', 'article');
                        const response = await fetch('/api/upload', { method: 'POST', body: formData });
                        if (response.ok) {
                          const data = await response.json();
                          setForm({ ...form, image: data.url });
                          toast.success('Image uploaded!');
                        } else {
                          toast.error('Upload failed');
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
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">{imageName}</span>
            </div>
            {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
            {form.image && (
              <img src={form.image} alt="Preview" className="h-24 w-40 object-cover rounded-md border border-border" />
            )}
          </div>
        </div>
      </div>
      <div className="mt-4 flex gap-2 justify-end">
        <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.title || !form.content}><Save className="h-3 w-3 mr-1" /> {initial ? 'Update' : 'Publish'}</Button>
      </div>
    </DialogOverlay>
  );
}

export default AdminPage;
