import mongoose from 'mongoose';
import { getEnvVar } from '@/utils/envUtils';

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  isConnecting: boolean;
  lastConnectedAt?: number;
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
const MAX_RETRIES = 3; // 서버리스 함수 실행 시간 고려해 3으로 조정
const INITIAL_RETRY_DELAY_MS = 500;

// Connection Health Check 설정
const CONNECTION_HEALTH_CHECK_INTERVAL = 60000; // 1분
const CONNECTION_MAX_AGE = 3600000; // 1시간

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
  console.log(`MongoDB 연결 시도 #${retryCount + 1}/${MAX_RETRIES + 1}...`);
  
  try {
    console.log(`연결 URI: ${uri.replace(/mongodb\+srv:\/\/([^:]+):([^@]+)@/, 'mongodb+srv://$1:***@')}`);
    console.log('연결 옵션:', JSON.stringify(options, null, 2));
    
    const result = await mongoose.connect(uri, options);
    console.log('MongoDB 연결 성공!');
    return result;
  } catch (error) {
    console.error('MongoDB 연결 실패:', error instanceof Error ? error.message : String(error));
    
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
            'Vercel 배포에서는 이 설정이 필수적입니다.\n' +
            '현재 오류 메시지: ' + (error instanceof Error ? error.message : String(error))
          );
          hasShownAtlasAccessTip = true;
        }
      }
      throw error;
    }
    
    // 지수 백오프 적용 (재시도 지연 시간을 점점 늘림)
    const nextRetryDelay = retryDelay * 2;
    console.warn(`MongoDB 연결 실패, ${retryCount + 1}번째 재시도 (${retryDelay}ms 후)...`);
    console.warn(`실패 원인: ${error instanceof Error ? error.message : String(error)}`);
    
    await new Promise(resolve => setTimeout(resolve, retryDelay));
    return connectWithRetry(uri, options, retryCount + 1, nextRetryDelay);
  }
}

// 연결 상태 확인
function isConnectionHealthy(): boolean {
  if (!cached.conn || !cached.lastConnectedAt) {
    console.log('연결 상태 확인: 유효한 연결 없음');
    return false;
  }
  
  // 연결 상태 확인
  const isConnected = cached.conn.connection.readyState === 1;
  
  // 연결 수명 확인
  const connectionAge = Date.now() - cached.lastConnectedAt;
  const isConnectionFresh = connectionAge < CONNECTION_MAX_AGE;
  
  console.log(`연결 상태 확인: 연결됨=${isConnected}, 연결 나이=${Math.floor(connectionAge/1000)}초, 유효함=${isConnectionFresh}`);
  
  return isConnected && isConnectionFresh;
}

async function dbConnect() {
  console.log('---- MongoDB 연결 함수 시작 ----');
  
  // 이미 건강한 연결이 있으면 기존 연결 반환
  if (isConnectionHealthy()) {
    console.log('이미 유효한 MongoDB 연결이 있습니다. 기존 연결 사용');
    return cached.conn;
  }

  // 연결 진행 중인 경우 기존 Promise 반환
  if (cached.isConnecting && cached.promise) {
    console.log('MongoDB 연결 진행 중. 연결 완료 대기');
    try {
      return await cached.promise;
    } catch (error) {
      console.error('기존 연결 요청 실패, 새로 시도합니다:', error);
      cached.isConnecting = false;
      cached.promise = null;
      // 실패한 경우 계속 진행하여 새로운 연결 시도
    }
  }

  try {
    // 안전하게 환경 변수 가져오기 (없으면 오류 발생)
    console.log('MongoDB URI 환경 변수 확인 중...');
    const MONGODB_URI = getEnvVar('MONGODB_URI');
    
    if (!MONGODB_URI || MONGODB_URI.trim() === '') {
      throw new Error('MONGODB_URI 환경 변수가 비어 있거나 설정되지 않았습니다');
    }
    
    console.log(`MONGODB_URI 환경 변수 확인 완료: ${MONGODB_URI.substring(0, 15)}...`);

    // 연결 중 상태로 설정
    cached.isConnecting = true;

    // 서버리스 환경에 최적화된 연결 설정
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      // 연결 타임아웃 및 소켓 타임아웃 설정
      connectTimeoutMS: 10000, // 10초로 축소 (서버리스 함수 시간 제한 고려)
      socketTimeoutMS: 45000, // 45초로 조정
      serverSelectionTimeoutMS: 10000, // 10초로 축소
      // 연결 풀 설정 - Vercel 서버리스 환경에 최적화
      maxPoolSize: 10, // 연결 풀 크기 조정
      minPoolSize: 5, 
      // 유휴 연결 관리 (Vercel 함수 최대 실행 시간 고려)
      maxIdleTimeMS: 60000, // 60초
      // 연결 대기열이 가득 찼을 때의 동작
      waitQueueTimeoutMS: 10000, // 10초로 축소
      // 자동 재연결 설정
      autoIndex: false,      // 배포 환경에서 인덱스 자동 생성 비활성화
      autoCreate: false,     // 배포 환경에서 컬렉션 자동 생성 비활성화
    };

    console.log('🔄 MongoDB 연결 시도 중...');
    
    // 기존 연결이 있지만 건강하지 않은 경우 재연결
    if (cached.conn) {
      console.log('⚠️ 기존 연결이 유효하지 않아 재연결합니다...');
      console.log(`기존 연결 상태: readyState=${cached.conn.connection.readyState}, lastConnectedAt=${cached.lastConnectedAt}`);
      try {
        await cached.conn.disconnect();
      } catch (disconnectError) {
        console.error('기존 연결 해제 중 오류 발생:', disconnectError);
        // 오류가 발생해도 계속 진행
      }
      cached.conn = null;
      cached.promise = null;
    }
    
    // 명확하게 Promise 설정 및 연결 시도
    cached.promise = connectWithRetry(MONGODB_URI, opts);
    
    try {
      cached.conn = await cached.promise;
      cached.lastConnectedAt = Date.now();
      
      // 디버깅 모드 설정 (개발 환경에서만 활성화)
      mongoose.set('debug', process.env.NODE_ENV === 'development');
      
      console.log('✅ MongoDB 연결 성공');
      console.log(`연결 상태: readyState=${cached.conn.connection.readyState}, lastConnectedAt=${cached.lastConnectedAt}`);
      
      // 주기적으로 연결 상태 확인하는 로직 추가
      if (typeof window === 'undefined') { // 서버 사이드에서만 실행
        setInterval(() => {
          if (!isConnectionHealthy() && !cached.isConnecting) {
            console.log('🔄 MongoDB 연결 상태 확인: 재연결 필요');
            dbConnect().catch(e => console.error('❌ 주기적 재연결 실패:', e));
          }
        }, CONNECTION_HEALTH_CHECK_INTERVAL);
      }
    } catch (error) {
      cached.promise = null;
      throw error; // 다시 던져서 외부에서 처리할 수 있게 함
    } finally {
      cached.isConnecting = false;
    }
    
    console.log('---- MongoDB 연결 함수 완료 ----');
    return cached.conn;
  } catch (e) {
    cached.isConnecting = false;
    cached.promise = null;
    
    console.error('❌ MongoDB 연결 실패:', e instanceof Error ? e.stack : String(e));
    console.error('---- MongoDB 연결 함수 오류로 종료 ----');
    throw e;
  }
}

export default dbConnect; 