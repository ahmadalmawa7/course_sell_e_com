import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'erudition-elite-learning';

const articles = [
  {
    id: 'a1',
    title: 'The Art of Strategic Leadership in Modern Organizations',
    excerpt: 'Explore how strategic leadership principles from military doctrine can transform corporate decision-making.',
    content: 'Strategic leadership is not merely about making decisions—it is about creating the conditions under which good decisions naturally emerge.\n\nThe first principle is clarity of purpose. Every great military operation begins with a clear mission statement.\n\nThe second principle is adaptability. Leaders who rigidly adhere to plans in the face of changing circumstances inevitably fail.\n\nThe third principle is empowerment. Mission command produces superior results compared to micromanagement.',
    author: 'Lt Col Shreesh Kumar (Retd)',
    date: '2026-03-10',
    category: 'Leadership',
    readTime: '8 min read',
    image: '',
    status: 'approved',
    submittedBy: 'admin@eruditioninfinite.com',
    likes: [],
    comments: [
      {
        id: 'cm1',
        userId: 'admin',
        userName: 'Rahul Sharma',
        text: 'Excellent insights on applying military leadership principles.',
        date: '2026-03-11',
        createdAt: new Date()
      },
      {
        id: 'cm2',
        userId: 'admin',
        userName: 'Priya Patel',
        text: 'Very insightful article. Would love more on adaptability.',
        date: '2026-03-12',
        createdAt: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'a2',
    title: 'Communication: The Cornerstone of Professional Success',
    excerpt: 'Why communication skills remain the most sought-after competency in the corporate world.',
    content: 'In every survey of employers worldwide, communication skills consistently rank as the most desired competency.\n\nEffective communication is not about eloquence—it is about clarity, empathy, and impact.',
    author: 'Lt Col Shreesh Kumar (Retd)',
    date: '2026-03-05',
    category: 'Communication Skills',
    readTime: '6 min read',
    image: '',
    status: 'approved',
    submittedBy: 'admin@eruditioninfinite.com',
    likes: [],
    comments: [{
      id: 'cm3',
      userId: 'admin',
      userName: 'Amit Kumar',
      text: 'Exactly what I needed before my upcoming presentation.',
      date: '2026-03-06',
      createdAt: new Date()
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'a3',
    title: 'From Campus to Boardroom: Navigating Your First Corporate Role',
    excerpt: 'Essential guide for fresh graduates transitioning from academic life to the corporate world.',
    content: 'The transition from campus to corporate life is one of the most significant shifts a young professional will experience.',
    author: 'Lt Col Shreesh Kumar (Retd)',
    date: '2026-02-28',
    category: 'Career Development',
    readTime: '10 min read',
    image: '',
    status: 'approved',
    submittedBy: 'admin@eruditioninfinite.com',
    likes: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'a4',
    title: 'The Power of Personal Branding in Career Growth',
    excerpt: 'How to build and maintain a professional brand that opens doors.',
    content: 'Your personal brand is your professional reputation—it precedes you into rooms, meetings, and opportunities.',
    author: 'Lt Col Shreesh Kumar (Retd)',
    date: '2026-02-20',
    category: 'Personal Growth',
    readTime: '7 min read',
    image: '',
    status: 'approved',
    submittedBy: 'admin@eruditioninfinite.com',
    likes: [],
    comments: [{
      id: 'cm4',
      userId: 'admin',
      userName: 'Sneha Gupta',
      text: 'Very practical advice. Thank you!',
      date: '2026-02-21',
      createdAt: new Date()
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'a5',
    title: 'Business Etiquette in the Digital Age',
    excerpt: 'How traditional business etiquette principles apply to virtual meetings and digital communication.',
    content: 'The digital revolution has transformed how we conduct business, but the fundamental principles of professional etiquette remain unchanged.',
    author: 'Lt Col Shreesh Kumar (Retd)',
    date: '2026-02-15',
    category: 'Corporate Behaviour',
    readTime: '5 min read',
    image: '',
    status: 'approved',
    submittedBy: 'admin@eruditioninfinite.com',
    likes: [],
    comments: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedArticles() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('articles');

    // Clear existing articles
    await collection.deleteMany({});

    // Insert articles
    const result = await collection.insertMany(articles);
    console.log(`Seeded ${result.insertedCount} articles`);

  } catch (error) {
    console.error('Error seeding articles:', error);
  } finally {
    await client.close();
  }
}

seedArticles();