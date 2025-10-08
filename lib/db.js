import { MongoClient } from 'mongodb';

let client;
let clientPromise;

export function getMongoClient() {
  if (!clientPromise) {
    client = new MongoClient(process.env.DATABASE_URL, {
      maxPoolSize: 10,
    });
    clientPromise = client.connect();
  }
  return clientPromise;
}

export async function getDb() {
  const conn = await getMongoClient();
  return conn.db();
}
