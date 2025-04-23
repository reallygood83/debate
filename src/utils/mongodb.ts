import { MongoClient, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB || 'debateAGI';

// MongoDB 클라이언트 캐싱
let cachedClient: MongoClient | null = null;
let cachedDb: any = null;

/**
 * MongoDB에 연결하고 데이터베이스 인스턴스를 반환합니다.
 */
export async function connectToDatabase() {
  // 이미 연결된 클라이언트가 있으면 재사용
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // 새 연결 생성
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI가 설정되지 않았습니다. 환경 변수를 확인하세요.');
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  // 연결 정보 캐싱
  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

/**
 * 지정된 컬렉션을 반환합니다.
 * @param collectionName 컬렉션 이름
 */
export async function getCollection(collectionName: string): Promise<Collection> {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}

/**
 * 모든 컬렉션 연결을 닫습니다. (필요시 사용)
 */
export async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
} 