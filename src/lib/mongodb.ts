import mongoose from 'mongoose';
import { getEnvVar } from '@/utils/envUtils';

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isConnecting: boolean;
}

// global 타입에 mongoose 프로퍼티 추가
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: CachedConnection | undefined;
}

// 전역 캐시 변수
const cached: CachedConnection = global.mongooseConnection || {
  conn: null,
  promise: null,
  isConnecting: false
};

// 전역 객체에 캐시 설정
global.mongooseConnection = cached;

// 연결 재시도 설정
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 500;

// Atlas IP 액세스 리스트 확인 팁 표시 여부
let hasShownAtlasAccessTip = false;

/**
 * MongoDB 연결을 지수 백오프로 재시도합니다.
 * 
 * @param uri MongoDB 연결 URI
 * @param options 연결 옵션
 * @param retryCount 현재 재시도 횟수
 * @param retryDelay 재시도 지연 시간(ms)
 * @returns mongoose 인스턴스
 */
async function connectWithRetry(
  uri: string, 
  options: mongoose.ConnectOptions, 
  retryCount = 0, 
  retryDelay = INITIAL_RETRY_DELAY_MS
): Promise<typeof mongoose> {
  try {
    return await mongoose.connect(uri, options);
  } catch (error) {
    if (retryCount >= MAX_RETRIES) {
      // 특정 오류 패턴 감지 (Atlas IP 접근 목록 문제 가능성)
      if (
        error instanceof Error && 
        (error.message.includes('ECONNREFUSED') || 
         error.message.includes('connection timed out') ||
         error.message.includes('not whitelisted'))
      ) {
        // Atlas IP 접근 목록 문제를 위한 도움말 표시 (한 번만)
        if (!hasShownAtlasAccessTip) {
          console.warn(
            '⚠️ MongoDB Atlas 연결 실패: IP 접근 목록 문제일 수 있습니다.\n' +
            'Atlas 대시보드에서 Network Access 설정에 $0.0.0.0/0이 추가되어 있는지 확인하세요.\n' +
            'Vercel 배포에서는 이 설정이 필수적입니다.'
          );
          hasShownAtlasAccessTip = true;
        }
      }
      throw error;
    }
    
    // 지수 백오프 적용 (재시도 지연 시간을 점점 늘림)
    const nextRetryDelay = retryDelay * 2;
    console.warn(`MongoDB 연결 실패, ${retryCount + 1}번째 재시도 (${retryDelay}ms 후)...`);
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    return connectWithRetry(uri, options, retryCount + 1, nextRetryDelay);
  }
}

async function dbConnect() {
  // 이미 연결되어 있으면 기존 연결 반환
  if (cached.conn) {
    return cached.conn;
  }

  // 연결 진행 중인 경우 기존 Promise 반환
  if (cached.isConnecting && cached.promise) {
    return cached.promise;
  }

  // 안전하게 환경 변수 가져오기 (없으면 오류 발생)
  const MONGODB_URI = getEnvVar('MONGODB_URI');

  try {
    // 연결 중 상태로 설정
    cached.isConnecting = true;

    if (!cached.promise) {
      // 서버리스 환경에 최적화된 연결 설정
      const opts: mongoose.ConnectOptions = {
        bufferCommands: false,
        // 연결 타임아웃 및 소켓 타임아웃 설정
        connectTimeoutMS: 10000, // 10초
        socketTimeoutMS: 45000, // 45초
        serverSelectionTimeoutMS: 10000, // 10초
        // 연결 풀 설정 - Vercel 서버리스 환경에 최적화
        maxPoolSize: 10, // 서버리스 환경에서는 낮은 값이 적합
        minPoolSize: 1, 
        // 유휴 연결 관리 (Vercel 함수 최대 실행 시간 고려)
        maxIdleTimeMS: 30000, // 30초
        // 연결 대기열이 가득 찼을 때의 동작
        waitQueueTimeoutMS: 10000,
      };

      console.log('🔄 MongoDB 연결 시도 중...');
      cached.promise = connectWithRetry(MONGODB_URI, opts);
    }
    
    cached.conn = await cached.promise;
    cached.isConnecting = false;
    
    // 디버깅 모드 설정 (개발 환경에서만 활성화)
    mongoose.set('debug', process.env.NODE_ENV === 'development');
    
    console.log('✅ MongoDB 연결 성공');
    return cached.conn;
  } catch (e) {
    cached.isConnecting = false;
    cached.promise = null;
    
    console.error('❌ MongoDB 연결 실패:', e);
    throw e;
  }
}

export default dbConnect; 