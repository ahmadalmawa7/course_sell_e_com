import { Course, LiveClass, Article, User, Payment, Note, Testimonial, Enquiry, ArticleRequest, SupportTicket } from './types';

export const courses: Course[] = [];

export const liveClasses: LiveClass[] = [];

export const articles: Article[] = [
  {
    id: 'a1', title: 'The Art of Strategic Leadership in Modern Organizations',
    excerpt: 'Explore how strategic leadership principles from military doctrine can transform corporate decision-making.',
    content: 'Strategic leadership is not merely about making decisions—it is about creating the conditions under which good decisions naturally emerge.\n\nThe first principle is clarity of purpose. Every great military operation begins with a clear mission statement.\n\nThe second principle is adaptability. Leaders who rigidly adhere to plans in the face of changing circumstances inevitably fail.\n\nThe third principle is empowerment. Mission command produces superior results compared to micromanagement.',
    author: 'Lt Col Shreesh Kumar (Retd)', date: '2026-03-10', category: 'Leadership', readTime: '8 min read', image: '',
    comments: [
      { id: 'cm1', userId: 'admin', userName: 'Rahul Sharma', text: 'Excellent insights on applying military leadership principles.', date: '2026-03-11', createdAt: '2026-03-11T10:00:00Z' },
      { id: 'cm2', userId: 'admin', userName: 'Priya Patel', text: 'Very insightful article. Would love more on adaptability.', date: '2026-03-12', createdAt: '2026-03-12T14:00:00Z' },
    ],
    likes: [],
  },
  {
    id: 'a2', title: 'Communication: The Cornerstone of Professional Success',
    excerpt: 'Why communication skills remain the most sought-after competency in the corporate world.',
    content: 'In every survey of employers worldwide, communication skills consistently rank as the most desired competency.\n\nEffective communication is not about eloquence—it is about clarity, empathy, and impact.',
    author: 'Lt Col Shreesh Kumar (Retd)', date: '2026-03-05', category: 'Communication Skills', readTime: '6 min read', image: '',
    comments: [{ id: 'cm3', userId: 'admin', userName: 'Amit Kumar', text: 'Exactly what I needed before my upcoming presentation.', date: '2026-03-06', createdAt: '2026-03-06T09:00:00Z' }],
    likes: [],
  },
  {
    id: 'a3', title: 'From Campus to Boardroom: Navigating Your First Corporate Role',
    excerpt: 'Essential guide for fresh graduates transitioning from academic life to the corporate world.',
    content: 'The transition from campus to corporate life is one of the most significant shifts a young professional will experience.',
    author: 'Lt Col Shreesh Kumar (Retd)', date: '2026-02-28', category: 'Career Development', readTime: '10 min read', image: '', comments: [], likes: [],
  },
  {
    id: 'a4', title: 'The Power of Personal Branding in Career Growth',
    excerpt: 'How to build and maintain a professional brand that opens doors.',
    content: 'Your personal brand is your professional reputation—it precedes you into rooms, meetings, and opportunities.',
    author: 'Lt Col Shreesh Kumar (Retd)', date: '2026-02-20', category: 'Personal Growth', readTime: '7 min read', image: '',
    comments: [{ id: 'cm4', userId: 'admin', userName: 'Sneha Gupta', text: 'Very practical advice. Thank you!', date: '2026-02-21', createdAt: '2026-02-21T11:00:00Z' }],
    likes: [],
  },
  {
    id: 'a5', title: 'Business Etiquette in the Digital Age',
    excerpt: 'How traditional business etiquette principles apply to virtual meetings and digital communication.',
    content: 'The digital revolution has transformed how we conduct business, but the fundamental principles of professional etiquette remain unchanged.',
    author: 'Lt Col Shreesh Kumar (Retd)', date: '2026-02-15', category: 'Corporate Behaviour', readTime: '5 min read', image: '', comments: [], likes: [],
  },
];

export const mockUser: User = {
  id: 'u1', name: 'Arjun Mehta', email: 'arjun.mehta@email.com', phone: '+91 98765 43210', profileImage: '',
  enrolledCourses: [], completedCourses: [],
  progress: {},
  certificates: [],
};

export const payments: Payment[] = [];

export const notes: Note[] = [];

export const testimonials: Testimonial[] = [];

export const enquiries: Enquiry[] = [
  { id: 'e1', name: 'Raj Kumar', phone: '+91 87654 32109', email: 'raj@email.com', message: 'Interested in corporate training for my team of 20 people.', date: '2026-03-10', status: 'new' },
  { id: 'e2', name: 'Meera Shah', phone: '+91 76543 21098', email: 'meera@email.com', message: 'Want to know more about the Leadership program fees.', date: '2026-03-09', status: 'contacted' },
];

export const articleRequests: ArticleRequest[] = [];

export const supportTickets: SupportTicket[] = [];

export const courseCategories = [
  'All',
];