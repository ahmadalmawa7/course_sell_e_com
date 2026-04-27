import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';



import { useAuth } from '@/contexts/AuthContext';



import {



  Course, LiveClass, Article, Payment, Note, Testimonial,



  Enquiry, ArticleRequest, SupportTicket, CourseReview, Enrollment, LectureProgress, ArticleComment



} from '@/data/types';







interface DataContextType {



  courses: Course[];



  liveClasses: LiveClass[];



  articles: Article[];



  payments: Payment[];



  notes: Note[];



  testimonials: Testimonial[];



  enquiries: Enquiry[];



  articleRequests: ArticleRequest[];



  supportTickets: SupportTicket[];



  categories: string[];



  enrollments: Enrollment[];



  lectureProgress: LectureProgress[];



  addCourse: (course: Course) => Promise<void>;



  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;



  deleteCourse: (id: string) => Promise<void>;



  refetchCourses: () => Promise<void>;

  addCourseReview: (courseId: string, review: CourseReview) => Promise<void>;



  addLiveClass: (cls: LiveClass) => void;



  updateLiveClass: (id: string, cls: Partial<LiveClass>) => void;



  deleteLiveClass: (id: string) => void;
  refetchLiveClasses: () => Promise<void>;



  addArticle: (article: Article) => void;



  updateArticle: (id: string, article: Partial<Article>) => void;



  deleteArticle: (id: string) => void;



  refetchArticles: () => Promise<void>;



  addPayment: (payment: Payment) => void;



  deleteComment: (articleId: string, commentId: string) => void;



  replyToComment: (articleId: string, commentId: string, reply: string) => void;



  addComment: (articleId: string, comment: ArticleComment) => void;



  addNote: (note: Note) => void;



  updateNote: (id: string, updatedFields: Partial<Note>) => Promise<boolean>;



  deleteNote: (id: string) => Promise<boolean>;



  addTestimonial: (t: Testimonial) => void;



  approveTestimonial: (id: string) => void;



  deleteTestimonial: (id: string) => void;



  addEnquiry: (e: Enquiry) => void;



  updateEnquiryStatus: (id: string, status: Enquiry['status']) => void;



  deleteEnquiry: (id: string) => Promise<void>;



  addArticleRequest: (r: ArticleRequest) => void;



  updateArticleRequestStatus: (id: string, status: ArticleRequest['status']) => void;



  addSupportTicket: (t: SupportTicket) => void;

  createSupportTicket: (ticket: { userId: string; userName: string; subject: string; description: string }) => Promise<SupportTicket>;
  replySupportTicket: (ticketId: string, message: string, sender?: 'user' | 'admin') => Promise<void>;




  addSupportMessage: (ticketId: string, message: { sender: 'user' | 'admin'; text: string; date: string }) => void;



  closeSupportTicket: (id: string) => void;



  updateSupportTicket: (ticketId: string, data: Partial<Pick<SupportTicket, 'subject' | 'description' | 'status'>>) => Promise<void>;


  deleteSupportTicket: (ticketId: string) => Promise<void>;


  addCategory: (category: string) => void;



  updateCategory: (oldCategory: string, newCategory: string) => void;



  deleteCategory: (category: string) => void;



  enrollCourse: (userId: string, courseId: string) => Promise<void>;



  refetchUserEnrollments: (userId: string) => Promise<void>;
  refetchNotes: (userId?: string) => Promise<void>;



  updateProgress: (userId: string, courseId: string, lectureId: string, completed: boolean, watchTime?: number) => Promise<void>;



  getCourseProgress: (userId: string, courseId: string) => number;



  getEnrolledCourses: (userId: string) => Course[];



  isEnrolled: (userId: string, courseId: string) => boolean;



}







const DataContext = createContext<DataContextType | undefined>(undefined);







export const DataProvider = ({ children }: { children: ReactNode }) => {



  const [courses, setCourses] = useState<Course[]>([]);



  const [liveClasses, setLiveClasses] = useState<LiveClass[]>([]);



  const [articles, setArticles] = useState<Article[]>([]);



  const [payments, setPayments] = useState<Payment[]>([]);



  const [notes, setNotes] = useState<Note[]>([]);



  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);



  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);



  const [articleRequests, setArticleRequests] = useState<ArticleRequest[]>([]);



  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);



  const [categories, setCategories] = useState<string[]>(['All']);



  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);



  const [lectureProgress, setLectureProgress] = useState<LectureProgress[]>([]);







  // Fetch courses from API on mount



  useEffect(() => {



    const fetchCourses = async () => {



      try {



        const response = await fetch('/api/courses');



        if (response.ok) {



          const data = await response.json();



          if (Array.isArray(data) && data.length > 0) {



            setCourses(data.map((item: any) => ({



              ...item,



              id: item._id ? item._id.toString() : item.id,



              modulesList: item.modulesList || [],



              highlights: item.highlights || [],



              advantages: item.advantages || [],



              requirements: item.requirements || [],



              targetAudience: item.targetAudience || [],



              recordedLectures: item.recordedLectures || [],



              reviews: item.reviews || [],



              tags: item.tags || [],



            })));



          }



        }



      } catch (error) {



        console.error('Failed to fetch courses:', error);



      }



    };



    fetchCourses();



  }, []);

  // Fetch live classes from API on mount
  useEffect(() => {
    const fetchLiveClasses = async () => {
      try {
        const response = await fetch('/api/live-lectures');
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data)) {
            setLiveClasses(data.map((lc: any) => ({
              ...lc,
              id: lc.id || lc._id || `lc-${Date.now()}`,
              courseId: lc.courseId || lc.courseId,
            })));
          }
        }
      } catch (error) {
        console.error('Failed to fetch live classes:', error);
      }
    };
    fetchLiveClasses();
  }, []);







  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await fetch('/api/payment/receipt?all=true');
        if (!response.ok) {
          throw new Error(`Unable to load payments: ${response.statusText}`);
        }

        const data = await response.json();
        if (data.success && Array.isArray(data.receipts)) {
          setPayments(data.receipts.map((item: any) => {
            const paymentDate = item.paymentDate || item.enrolledAt || item.createdAt || null;
            return {
              id: item.paymentId || item.orderId || item.receiptId || `${item.userId}-${item.courseId}-${Date.now()}`,
              userId: item.userId || '',
              courseId: item.courseId || '',
              amount: item.amount || 0,
              amountInPaise: item.amountInPaise,
              date: paymentDate ? new Date(paymentDate).toISOString() : new Date().toISOString(),
              paymentDate: paymentDate ? new Date(paymentDate).toISOString() : undefined,
              enrolledAt: item.enrolledAt ? new Date(item.enrolledAt).toISOString() : undefined,
              createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
              status: item.status || 'pending',
              courseName: item.courseName || '',
              userName: item.userName || '',
              userEmail: item.userEmail || '',
              orderId: item.orderId,
              paymentId: item.paymentId,
              receiptId: item.receiptId,
              signature: item.signature,
              currency: item.currency,
            };
          }));
        }
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      }
    };

    fetchPayments();
  }, []);

  // Fetch enquiries from API on mount



  useEffect(() => {



    const fetchEnquiries = async () => {



      try {



        const response = await fetch('/api/enquiries');



        if (response.ok) {



          const data = await response.json();



          if (Array.isArray(data) && data.length > 0) {



            setEnquiries(data.map((item: any) => ({ ...item, id: item._id ? item._id.toString() : item.id })));



          }



        }



      } catch (error) {



        console.error('Failed to fetch enquiries:', error);



      }



    };



    fetchEnquiries();



  }, []);







  // Fetch categories from API on mount



  useEffect(() => {



    const fetchCategories = async () => {



      try {



        const response = await fetch('/api/categories');



        if (response.ok) {



          const data = await response.json();



          if (Array.isArray(data) && data.length > 0) setCategories(data);



        }



      } catch (error) {



        console.error('Failed to fetch categories:', error);



      }



    };



    fetchCategories();



  }, []);







  // Fetch articles from API on mount



  useEffect(() => {



    const fetchArticles = async () => {



      try {



        const response = await fetch('/api/articles');



        if (response.ok) {



          const data = await response.json();



          if (Array.isArray(data) && data.length > 0) {



            setArticles(data.map((item: any) => ({



              ...item,



              id: item.id || item._id?.toString(),



              comments: item.comments || [],



              likes: item.likes || [],



            })));



          }



        }



      } catch (error) {



        console.error('Failed to fetch articles:', error);



      }



    };



    fetchArticles();



  }, []);







  const { user, isAdmin } = useAuth();







  const normalizeBackendTicket = (ticket: any): SupportTicket => ({
    id: ticket.id || ticket._id?.toString?.() || '',
    userId: ticket.userId?.toString?.() || ticket.userId || '',
    userName: ticket.userName || '',
    subject: ticket.subject || '',
    description: ticket.description || '',
    status: ticket.status === 'closed' ? 'closed' : 'open',
    messages: Array.isArray(ticket.messages) ? ticket.messages.map((m: any) => ({
      sender: m.sender === 'admin' ? 'admin' : 'user',
      text: m.text || m.message || '',
      date: m.date || (m.createdAt ? new Date(m.createdAt).toISOString().split('T')[0] : ''),
    })) : [],
    date: ticket.date || (ticket.createdAt ? new Date(ticket.createdAt).toISOString().split('T')[0] : ''),
    createdAt: ticket.createdAt ? new Date(ticket.createdAt).toISOString() : undefined,
  });

  const getSupportAdminHeaders = () => {
    if (!user?.email) return {};
    return {
      'x-admin-email': user.email,
      'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '',
    };
  };

  const createSupportTicket = async (ticket: { userId: string; userName: string; subject: string; description: string }): Promise<SupportTicket> => {
    const response = await fetch('/api/support/create-ticket', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ticket),
    });

    const data = await response.json();
    if (!response.ok || !data.success || !data.ticket) {
      throw new Error(data.message || 'Failed to create support ticket');
    }

    const createdTicket = normalizeBackendTicket(data.ticket);
    setSupportTickets(prev => [...prev, createdTicket]);
    return createdTicket;
  };

  const replySupportTicket = async (ticketId: string, message: string, sender: 'user' | 'admin' = 'user'): Promise<void> => {
    const response = await fetch(`/api/support/reply/${encodeURIComponent(ticketId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender, message }),
    });
    const data = await response.json();
    if (!response.ok || !data.success || !data.ticket) {
      throw new Error(data.message || 'Failed to send support message');
    }
    const updatedTicket = normalizeBackendTicket(data.ticket);
    setSupportTickets(prev => prev.map(t => t.id === updatedTicket.id ? updatedTicket : t));
  };

  const fetchSupportTickets = async (userId?: string, adminFetch = false) => {
    try {
      const endpoint = adminFetch
        ? '/api/support/all-tickets'
        : `/api/support/my-tickets?userId=${encodeURIComponent(userId || '')}`;
      const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(adminFetch ? getSupportAdminHeaders() : {}) };
      const response = await fetch(endpoint, { headers });
      if (!response.ok) {
        throw new Error(`Unable to load support tickets: ${response.statusText}`);
      }
      const data = await response.json();
      const tickets = Array.isArray(data) ? data : data.tickets;
      if (Array.isArray(tickets)) {
        setSupportTickets(tickets.map(normalizeBackendTicket));
      }
    } catch (error) {
      console.error('Failed to fetch support tickets:', error);
    }
  };

  useEffect(() => {
    if (isAdmin && user?.email) {
      fetchSupportTickets(undefined, true);
    } else if (user?.id) {
      fetchSupportTickets(user.id, false);
    } else {
      setSupportTickets([]);
    }
  }, [user?.id, user?.email, isAdmin]);


  const refetchAdminNotes = async () => {




    if (!isAdmin || !user?.email) return;



    try {



      const response = await fetch('/api/notes?admin=true', {



        headers: {



          'Content-Type': 'application/json',



          'x-admin-email': user.email,



          'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '',



        },



      });



      if (response.ok) {



        const data = await response.json();



        if (Array.isArray(data)) {



          setNotes(data.map((item: any) => ({



            ...item,



            id: item.id || item._id?.toString(),



            fileUrl: item.fileUrl || '',

            externalLink: item.externalLink || item.link || '',



            uploadDate: item.uploadDate || new Date(item.createdAt).toISOString(),



          })));



        }



      }



    } catch (error) {



      console.error('Failed to fetch admin notes:', error);



    }



  };

  // Load support tickets for the authenticated user
  useEffect(() => {
    const fetchSupportTickets = async () => {
      if (!user?.id) {
        setSupportTickets([]);
        return;
      }

      try {
        const resp = await fetch(`/api/support/my-tickets?userId=${encodeURIComponent(user.id)}`);
        if (!resp.ok) {
          setSupportTickets([]);
          return;
        }
        const data = await resp.json();
        if (!data.success || !Array.isArray(data.tickets)) {
          setSupportTickets([]);
          return;
        }

        setSupportTickets(data.tickets.map(normalizeBackendTicket));
      } catch (err) {
        console.error('Failed to fetch support tickets:', err);
        setSupportTickets([]);
      }
    };

    fetchSupportTickets();
  }, [user?.id]);







  const refetchNotes = async (userId?: string) => {
    try {
      const endpoint = userId ? `/api/notes?userId=${encodeURIComponent(userId)}` : '/api/notes';
      const response = await fetch(endpoint);
      if (!response.ok) {
        console.error('Failed to fetch notes:', response.statusText);
        return;
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setNotes(data.map((item: any) => ({
          ...item,
          id: item.id || item._id?.toString(),
          courseId: item.courseId?.toString ? item.courseId.toString() : item.courseId,
          fileUrl: item.fileUrl || '',
          externalLink: item.externalLink || item.link || '',
          uploadDate: item.uploadDate || new Date(item.createdAt).toISOString(),
          accessible: item.accessible ?? false,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    }
  };

  const refetchUserEnrollments = async (userId: string) => {



    try {



      const response = await fetch(`/api/user/enrollments?userId=${userId}`);



      if (response.ok) {



        const data = await response.json();



        if (data.success && data.enrollments) {



          setEnrollments(data.enrollments.map((e: any) => ({



            id: e._id?.toString() || e.id,



            userId: e.userId?.toString() || e.userId,



            courseId: e.courseId?.toString() || e.courseId,



            paymentStatus: e.paymentStatus || 'success',



            progress: e.progress || 0,



            enrolledAt: e.enrolledAt || new Date().toISOString(),



            lastAccessedAt: e.lastAccessedAt || new Date().toISOString(),



          })));



        }



      }



    } catch (error) {



      console.error('Failed to fetch user enrollments:', error);



    }



  };







  // Fetch user enrollments from database whenever the authenticated user changes



  useEffect(() => {



    if (!user?.id) {



      setEnrollments([]);



      setLectureProgress([]);



      return;



    }







    refetchUserEnrollments(user.id);



  }, [user?.id]);







  useEffect(() => {



    if (!isAdmin && user?.id) {
      refetchNotes(user.id);
    }

    if (isAdmin) {
      refetchAdminNotes();
    }



  }, [isAdmin, user?.email, user?.id]);







  const addCourse = async (c: Course) => {



    try {



      const response = await fetch('/api/courses', {



        method: 'POST',



        headers: { 'Content-Type': 'application/json' },



        body: JSON.stringify(c),



      });



      if (!response.ok) throw new Error('Failed to add course');



      const saved = await response.json();



      const newCourse: Course = {



        ...c,



        ...saved,



        id: saved._id?.toString ? saved._id.toString() : c.id,



        modulesList: saved.modulesList || c.modulesList || [],



        highlights: saved.highlights || c.highlights || [],



        advantages: saved.advantages || c.advantages || [],



        requirements: saved.requirements || c.requirements || [],



        targetAudience: saved.targetAudience || c.targetAudience || [],



        recordedLectures: saved.recordedLectures || c.recordedLectures || [],



        reviews: saved.reviews || c.reviews || [],



        tags: saved.tags || c.tags || [],



      };



      setCourses(p => [...p, newCourse]);



    } catch (error) {



      console.error('Failed to add course:', error);



      throw error;



    }



  };







  const updateCourse = async (id: string, d: Partial<Course>) => {



    try {



      const response = await fetch('/api/courses', {



        method: 'PUT',



        headers: { 'Content-Type': 'application/json' },



        body: JSON.stringify({ id, data: d }),



      });



      if (!response.ok) throw new Error('Failed to update course');



      setCourses(p => p.map(c => c.id === id ? { ...c, ...d } : c));



    } catch (error) {



      console.error('Failed to update course:', error);



      throw error;



    }



  };







  const deleteCourse = async (id: string) => {



    // Handle mock data courses (string IDs like 'c1', 'c2') - delete locally only



    if (id.startsWith('c')) {



      setCourses(p => p.filter(c => c.id !== id));



      return;



    }



    try {



      const response = await fetch('/api/courses', {



        method: 'DELETE',



        headers: { 'Content-Type': 'application/json' },



        body: JSON.stringify({ id }),



      });



      if (!response.ok) {



        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));



        throw new Error(errorData.error || 'Failed to delete course');



      }



      setCourses(p => p.filter(c => c.id !== id));



    } catch (error) {



      console.error('Failed to delete course:', error);



      throw error;



    }



  };





  const refetchCourses = async () => {

    try {

      const response = await fetch('/api/courses');

      if (response.ok) {

        const coursesList = await response.json();

        const freshCourses = coursesList.map((item: any) => ({

          ...item,

          id: item._id ? item._id.toString() : item.id,

          modulesList: item.modulesList || [],

          highlights: item.highlights || [],

          advantages: item.advantages || [],

          requirements: item.requirements || [],

          targetAudience: item.targetAudience || [],

          recordedLectures: item.recordedLectures || [],

          reviews: item.reviews || [],

          tags: item.tags || [],

        }));

        setCourses(freshCourses);

      }

    } catch (error) {

      console.error('Failed to refetch courses:', error);

    }

  };





  const addCourseReview = async (courseId: string, review: CourseReview) => {



    try {



      // Update locally immediately



      setCourses(p => p.map(c =>



        c.id === courseId



          ? { ...c, reviews: [...(c.reviews || []), review] }



          : c



      ));



      // Persist to API



      await fetch('/api/courses', {



        method: 'PATCH',



        headers: { 'Content-Type': 'application/json' },



        body: JSON.stringify({ id: courseId, review }),



      });



    } catch (error) {



      console.error('Failed to add review:', error);



    }



  };







  const addCategory = async (category: string) => {



    try {



      const response = await fetch('/api/categories', {



        method: 'POST',



        headers: { 'Content-Type': 'application/json' },



        body: JSON.stringify({ name: category }),



      });



      if (response.ok) {



        setCategories(prev => [...prev, category]);



      } else {



        const error = await response.json();



        throw new Error(error.error);



      }



    } catch (error) {



      console.error('Failed to add category:', error);



      throw error;



    }



  };







  const updateCategory = async (oldCategory: string, newCategory: string) => {



    try {



      const response = await fetch('/api/categories', {



        method: 'PUT',



        headers: { 'Content-Type': 'application/json' },



        body: JSON.stringify({ oldName: oldCategory, newName: newCategory }),



      });



      if (response.ok) {



        setCategories(prev => prev.map(c => c === oldCategory ? newCategory : c));



        setCourses(prev => prev.map(course => course.category === oldCategory ? { ...course, category: newCategory } : course));



        setArticles(prev => prev.map(article => article.category === oldCategory ? { ...article, category: newCategory } : article));



        setNotes(prev => prev.map(note => note.category === oldCategory ? { ...note, category: newCategory } : note));



      } else {



        const error = await response.json();



        throw new Error(error.error);



      }



    } catch (error) {



      console.error('Failed to update category:', error);



      throw error;



    }



  };







  const deleteCategory = async (category: string) => {



    try {



      const response = await fetch('/api/categories', {



        method: 'DELETE',



        headers: { 'Content-Type': 'application/json' },



        body: JSON.stringify({ categoryName: category }),



      });



      if (response.ok) {



        setCategories(prev => prev.filter(c => c !== category));



        setCourses(prev => prev.map(course => course.category === category ? { ...course, category: 'All' } : course));



        setArticles(prev => prev.map(article => article.category === category ? { ...article, category: 'All' } : article));



        setNotes(prev => prev.map(note => note.category === category ? { ...note, category: 'All' } : note));



      } else {



        const error = await response.json();



        throw new Error(error.error);



      }



    } catch (error) {



      console.error('Failed to delete category:', error);



      throw error;



    }



  };







  const enrollCourse = async (userId: string, courseId: string) => {



    try {



      const res = await fetch('/api/enroll', {



        method: 'POST',



        headers: { 'Content-Type': 'application/json' },



        body: JSON.stringify({ userId, courseId }),



      });



      const data = await res.json();



      if (res.ok && data.success) {



        setEnrollments(prev => [...prev, {



          id: `enr-${Date.now()}`,



          userId,



          courseId,



          paymentStatus: 'success',



          progress: 0,



          enrolledAt: new Date().toISOString(),



          lastAccessedAt: new Date().toISOString(),



        }]);



        // Refetch to sync with backend



        setTimeout(() => refetchUserEnrollments(userId), 500);



      } else {



        throw new Error(data.message || 'Failed to enroll');



      }



    } catch (error) {



      console.error('Failed to enroll:', error);



      throw error;



    }



  };







  const updateProgress = async (userId: string, courseId: string, lectureId: string, completed: boolean, watchTime: number = 0) => {



    try {



      const existingProgress = lectureProgress.find(



        lp => lp.userId === userId && lp.lectureId === lectureId



      );



      



      const progressData: LectureProgress = existingProgress ? {



        ...existingProgress,



        completed,



        watchTime,



        completedAt: completed ? new Date().toISOString() : existingProgress.completedAt,



      } : {



        id: `lp-${Date.now()}`,



        userId,



        lectureId,



        courseId,



        completed,



        watchTime,



        completedAt: completed ? new Date().toISOString() : undefined,



      };







      await fetch('/api/enrollment/progress', {



        method: 'PUT',



        headers: { 'Content-Type': 'application/json' },



        body: JSON.stringify({ userId, courseId, lectureId, completed }),



      });







      setLectureProgress(prev => {



        const filtered = prev.filter(lp => !(lp.userId === userId && lp.lectureId === lectureId));



        return [...filtered, progressData];



      });







      const course = courses.find(c => c.id === courseId);



      if (course && course.recordedLectures) {



        const totalLectures = course.recordedLectures.length;



        const completedLectures = lectureProgress.filter(



          lp => lp.userId === userId && lp.courseId === courseId && lp.completed



        ).length + (completed ? 1 : 0);



        const newProgress = Math.round((completedLectures / totalLectures) * 100);



        



        setEnrollments(prev => prev.map(e => 



          e.userId === userId && e.courseId === courseId 



            ? { ...e, progress: newProgress, lastAccessedAt: new Date().toISOString() }



            : e



        ));



      }



    } catch (error) {



      console.error('Failed to update progress:', error);



      throw error;



    }



  };







  const getCourseProgress = (userId: string, courseId: string): number => {



    const enrollment = enrollments.find(e => e.userId === userId && e.courseId === courseId);



    return enrollment?.progress || 0;



  };







  const getEnrolledCourses = (userId: string): Course[] => {



    // Use auth user's enrolledCourses as primary source (updated immediately on enrollment)



    if (user?.id === userId && user?.enrolledCourses) {



      return courses.filter(c => user.enrolledCourses.includes(c.id));



    }







    // Fallback to DataContext enrollments for other users



    const enrolledCourseIds = enrollments



      .filter(e => e.userId === userId)



      .map(e => e.courseId);



    return courses.filter(c => enrolledCourseIds.includes(c.id));



  };







  const isEnrolled = (userId: string, courseId: string): boolean => {



    // Check DataContext enrollments



    const hasEnrollment = enrollments.some(e => e.userId === userId && e.courseId === courseId);



    if (hasEnrollment) return true;







    // Also check auth user's enrolledCourses for immediate feedback after enrollment



    if (user?.id === userId && user?.enrolledCourses?.includes(courseId)) {



      return true;



    }







    return false;



  };







  return (



    <DataContext.Provider value={{



      courses, liveClasses, articles, payments, notes, testimonials,



      enquiries, articleRequests, supportTickets, categories,



      enrollments, lectureProgress,



      addCourse, updateCourse, deleteCourse, refetchCourses, addCourseReview,



      addLiveClass: (c) => setLiveClasses(p => [...p, c]),



      updateLiveClass: (id, d) => setLiveClasses(p => p.map(c => c.id === id ? { ...c, ...d } : c)),



      deleteLiveClass: (id) => setLiveClasses(p => p.filter(c => c.id !== id)),

      refetchLiveClasses: async () => {
        try {
          const resp = await fetch('/api/live-lectures');
          if (resp.ok) {
            const data = await resp.json();
            if (Array.isArray(data)) {
              setLiveClasses(data.map((lc: any) => ({
                ...lc,
                id: lc.id || lc._id || `lc-${Date.now()}`,
                courseId: lc.courseId || lc.courseId,
              })));
            }
          }
        } catch (err) {
          console.error('Failed to refetch live classes:', err);
        }
      },



      addArticle: (a) => setArticles(p => [...p, a]),



      updateArticle: (id, d) => setArticles(p => p.map(a => a.id === id ? { ...a, ...d } : a)),



      deleteArticle: (id) => setArticles(p => p.filter(a => a.id !== id)),



      refetchArticles: async () => {



        try {



          const response = await fetch('/api/articles');



          if (response.ok) {



            const data = await response.json();



            if (Array.isArray(data) && data.length > 0) {



              setArticles(data.map((item: any) => ({



                ...item,



                id: item.id || item._id?.toString(),



                comments: item.comments || [],



                likes: item.likes || [],



              })));



            }



          }



        } catch (error) {



          console.error('Failed to refetch articles:', error);



        }



      },



      addPayment: (p) => setPayments(prev => [...prev, p]),



      deleteComment: (aId, cId) => setArticles(p => p.map(a => a.id === aId ? { ...a, comments: a.comments.filter(c => c.id !== cId) } : a)),



      replyToComment: (aId, cId, r) => setArticles(p => p.map(a => a.id === aId ? { ...a, comments: a.comments.map(c => c.id === cId ? { ...c, reply: r } : c) } : a)),



      addComment: (aId, c) => setArticles(p => p.map(a => a.id === aId ? { ...a, comments: [...a.comments, c] } : a)),



      addNote: (n) => setNotes(p => [...p, n]),



      updateNote: async (id, updatedFields) => {



        if (!user?.email) return false;



        try {



          const response = await fetch('/api/notes', {



            method: 'PUT',



            headers: {



              'Content-Type': 'application/json',



              'x-admin-email': user.email,



              'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '',



            },



            body: JSON.stringify({ id, ...updatedFields }),



          });



          if (!response.ok) return false;



          setNotes(p => p.map(note => note.id === id ? {



            ...note,



            ...updatedFields,



            fileUrl: updatedFields.fileUrl !== undefined ? updatedFields.fileUrl : note.fileUrl,



          } : note));



          return true;



        } catch (error) {



          console.error('Failed to update note:', error);



          return false;



        }



      },



      deleteNote: async (id) => {



        if (!user?.email) return false;



        try {



          const response = await fetch('/api/notes', {



            method: 'DELETE',



            headers: {



              'Content-Type': 'application/json',



              'x-admin-email': user.email,



              'x-admin-password': process.env.NEXT_PUBLIC_ADMIN_PASSWORD || '',



            },



            body: JSON.stringify({ id }),



          });



          if (!response.ok) return false;



          setNotes(p => p.filter(n => n.id !== id));



          return true;



        } catch (error) {



          console.error('Failed to delete note:', error);



          return false;



        }



      },



      addTestimonial: (t) => setTestimonials(p => [...p, t]),



      approveTestimonial: (id) => setTestimonials(p => p.map(t => t.id === id ? { ...t, approved: true } : t)),



      deleteTestimonial: (id) => setTestimonials(p => p.filter(t => t.id !== id)),



      addEnquiry: async (e) => {



        try {



          const response = await fetch('/api/enquiries', {



            method: 'POST',



            headers: { 'Content-Type': 'application/json' },



            body: JSON.stringify(e),



          });



          if (response.ok) {



            const saved = await response.json();



            setEnquiries(p => [...p, { ...e, id: saved._id?.toString ? saved._id.toString() : e.id }]);



          } else {



            setEnquiries(p => [...p, e]);



          }



        } catch {



          setEnquiries(p => [...p, e]);



        }



      },



      updateEnquiryStatus: async (id, s) => {



        try {



          await fetch('/api/enquiries', {



            method: 'PUT',



            headers: { 'Content-Type': 'application/json' },



            body: JSON.stringify({ id, data: { status: s } }),



          });



        } catch {}



        setEnquiries(p => p.map(e => e.id === id ? { ...e, status: s } : e));



      },



      deleteEnquiry: async (id) => {



        try {



          const response = await fetch('/api/enquiries', {



            method: 'DELETE',



            headers: { 'Content-Type': 'application/json' },



            body: JSON.stringify({ id }),



          });



          if (!response.ok) throw new Error('Failed to delete enquiry');



          setEnquiries(p => p.filter(e => e.id !== id));



        } catch (error) {



          console.error('Failed to delete enquiry:', error);



          throw error;



        }



      },



      addArticleRequest: (r) => setArticleRequests(p => [...p, r]),



      updateArticleRequestStatus: (id, s) => setArticleRequests(p => p.map(r => r.id === id ? { ...r, status: s } : r)),



      addSupportTicket: (t) => setSupportTickets(p => [...p, t]),

      createSupportTicket,
      replySupportTicket,



      addSupportMessage: (tId, m) => setSupportTickets(p => p.map(t => t.id === tId ? { ...t, messages: [...t.messages, m] } : t)),



      closeSupportTicket: (id) => setSupportTickets(p => p.map(t => t.id === id ? { ...t, status: 'closed' } : t)),

      updateSupportTicket: async () => {},

      deleteSupportTicket: async () => {},



      addCategory, updateCategory, deleteCategory,



      enrollCourse, refetchUserEnrollments, refetchNotes, updateProgress, getCourseProgress, getEnrolledCourses, isEnrolled,



    }}>



      {children}



    </DataContext.Provider>



  );



};







export const useData = () => {



  const context = useContext(DataContext);



  if (!context) throw new Error('useData must be used within DataProvider');



  return context;



};