import { articles } from '../src/data/mockData.js';

async function seedArticles() {
  try {
    // Transform articles to match API expectations
    const articlesToInsert = articles.map(article => ({
      ...article,
      likes: [],
      comments: article.comments.map(comment => ({
        id: comment.id,
        userId: 'admin', // Default to admin for existing comments
        userName: comment.user,
        text: comment.text,
        date: comment.date,
        createdAt: new Date().toISOString()
      }))
    }));

    for (const article of articlesToInsert) {
      const response = await fetch('http://localhost:3002/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(article),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`Failed to insert article ${article.title}:`, error);
      } else {
        const result = await response.json();
        console.log(`Inserted article: ${result.title}`);
      }
    }

    console.log('Seeding completed');
  } catch (error) {
    console.error('Error seeding articles:', error);
  }
}

seedArticles();