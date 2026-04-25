export interface CourseModule {
  title: string;
  lessons: number;
  duration: string;
  topics?: string[];
}

export interface CourseReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface RecordedLecture {
  id: string;
  moduleName: string;
  lectureTitle: string;
  duration: string;
  videoUrl: string;
  preview: boolean;
  thumbnail?: string;
  description?: string;
}

export interface CourseVideo {
  title: string;
  videoUrl: string;
  duration?: string;
}

export interface CourseAdvantageSection {
  title: string;
  videos: CourseVideo[];
}

export interface Course {
  id: string;
  title: string;
  category: string;
  description: string;
  instructor: string;
  instructorBio?: string;
  duration: string;
  modules: number;
  price: number;
  originalPrice?: number;
  image: string;
  level: string;
  enrolled: number;
  rating: number;
  totalRatings?: number;
  modulesList: CourseModule[];
  // Rich fields
  highlights?: string[];          // "What you'll learn" bullet points
  whyTake?: string;               // Why this course paragraph
  advantages?: Array<string | CourseAdvantageSection>; // Advantages / section titles with videos
  requirements?: string[];        // Prerequisites (legacy)
  targetAudience?: string[];      // Who should take this
  language?: string;
  certificate?: boolean;
  liveSessionsIncluded?: boolean;
  notesIncluded?: boolean;
  recordedLectures?: RecordedLecture[];
  liveClasses?: LiveClass[];
  reviews?: CourseReview[];
  syllabus?: string;              // Long-form syllabus text
  tags?: string[];
  lastUpdated?: string;
  assignments?: Assignment[];
}

export interface LiveClass {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  meetLink: string;
  courseId: string;
  description: string;
  thumbnail?: string;
}

export interface ArticleComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  date: string;
  createdAt?: string;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  readTime: string;
  image: string;
  comments: ArticleComment[];
  likes: string[]; // Array of user IDs who liked the article
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  enrolledCourses: string[];
  completedCourses: string[];
  progress: Record<string, number>;
  certificates: Certificate[];
  role?: string; // 'admin' or 'user'
}

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  studentName: string;
  instructor: string;
  completionDate: string;
}

export interface Payment {
  id: string;
  userId: string;
  courseId: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  courseName: string;
  userName: string;
}

export interface Note {
  id: string;
  title: string;
  courseId: string;
  category: string;
  description: string;
  fileUrl: string;
  externalLink?: string;
  link?: string;
  uploadedBy?: string;
  createdAt?: string;
  uploadDate: string;
  accessible?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  approved: boolean;
  date: string;
}

export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  date: string;
  status: 'new' | 'contacted' | 'resolved';
}

export interface ArticleRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  topic: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  date: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  description?: string;
  messages: { sender: 'user' | 'admin'; text: string; date: string }[];
  status: 'open' | 'closed';
  date: string;
  createdAt?: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  paymentStatus: 'success' | 'pending' | 'failed';
  progress: number;
  enrolledAt: string;
  lastAccessedAt?: string;
}

export interface LectureProgress {
  id: string;
  userId: string;
  lectureId: string;
  courseId: string;
  completed: boolean;
  watchTime: number;
  completedAt?: string;
}

export interface Assignment {
  id: string;
  title: string;
  fileUrl: string;
  courseId: string;
  createdAt: string;
}