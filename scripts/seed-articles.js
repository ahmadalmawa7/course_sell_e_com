import { connectToDatabase } from '../lib/mongodb';
import { articles } from '../src/data/mockData';

async function seedArticles() {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('articles');

    // Clear existing articles
    await collection.deleteMany({});

    // Insert articles with proper structure
    const articlesToInsert = articles.map(article => ({
      ...article,
      likes: [],
      comments: article.comments.map(comment => ({
        id: comment.id,
        userId: 'admin', // Default to admin for existing comments
        userName: comment.user,
        text: comment.text,
        date: comment.date,
        createdAt: new Date()
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    const result = await collection.insertMany(articlesToInsert);
    console.log(`Seeded ${result.insertedCount} articles`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding articles:', error);
    process.exit(1);
  }
}

seedArticles();