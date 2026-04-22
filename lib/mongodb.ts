import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local or .env');
}

let cachedClient: MongoClient | null = null;

export async function connectToDatabase() {
  if (cachedClient) {
    return { client: cachedClient, db: cachedClient.db() };
  }

  const client = new MongoClient(uri);
  await client.connect();

  cachedClient = client;
  return { client, db: client.db() };
}
