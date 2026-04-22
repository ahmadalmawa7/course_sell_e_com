import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('categories');

    switch (req.method) {
      case 'GET':
        let categories = await collection.find({}).toArray();

        // If no categories exist, initialize with default categories
        if (categories.length === 0) {
          const defaultCategories = [
            'All', 'Leadership Development', 'Communication Skills', 'Personality Development',
            'Campus to Corporate', 'Business Etiquette', 'Presentation Skills',
            'Time Management', 'Life Skills', 'Project Management', 'Corporate Readiness'
          ];

          const categoryDocs = defaultCategories.map(name => ({
            name,
            createdAt: new Date()
          }));

          await collection.insertMany(categoryDocs);
          categories = await collection.find({}).toArray();
        }

        res.status(200).json(categories.map((cat: any) => cat.name));
        break;

      case 'POST':
        const { name } = req.body;
        if (!name) {
          return res.status(400).json({ error: 'Category name is required' });
        }

        // Check if category already exists
        const existing = await collection.findOne({ name });
        if (existing) {
          return res.status(400).json({ error: 'Category already exists' });
        }

        await collection.insertOne({ name, createdAt: new Date() });
        res.status(201).json({ message: 'Category added successfully' });
        break;

      case 'PUT':
        const { oldName, newName } = req.body;
        if (!oldName || !newName) {
          return res.status(400).json({ error: 'Both old and new category names are required' });
        }

        // Update the category name
        await collection.updateOne({ name: oldName }, { $set: { name: newName, updatedAt: new Date() } });

        // Update all references in other collections
        await db.collection('courses').updateMany({ category: oldName }, { $set: { category: newName } });
        await db.collection('articles').updateMany({ category: oldName }, { $set: { category: newName } });
        await db.collection('notes').updateMany({ category: oldName }, { $set: { category: newName } });

        res.status(200).json({ message: 'Category updated successfully' });
        break;

      case 'DELETE':
        const { categoryName } = req.body;
        if (!categoryName) {
          return res.status(400).json({ error: 'Category name is required' });
        }

        if (categoryName === 'All') {
          return res.status(400).json({ error: 'Cannot delete the All category' });
        }

        // Reassign items to 'All' category before deleting
        await db.collection('courses').updateMany({ category: categoryName }, { $set: { category: 'All' } });
        await db.collection('articles').updateMany({ category: categoryName }, { $set: { category: 'All' } });
        await db.collection('notes').updateMany({ category: categoryName }, { $set: { category: 'All' } });

        // Delete the category
        await collection.deleteOne({ name: categoryName });

        res.status(200).json({ message: 'Category deleted successfully' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}