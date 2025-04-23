import mongoose from 'mongoose';

// MongoDB 연결 URI (환경변수에서 가져옴)
const MONGODB_URI = process.env.MONGODB_URI;

/**
 * MongoDB에 연결하는 함수
 */
export async function connectDB() {
  // 빌드 시에는 실행하지 않음
  if (process.env.NODE_ENV === 'production' && process.env.VERCEL_ENV === 'preview') {
    console.log('빌드 환경에서는 DB 연결을 건너뜁니다.');
    return;
  }

  // MONGODB_URI가 없으면 경고만 출력
  if (!MONGODB_URI) {
    console.warn('경고: MongoDB URI가 제공되지 않았습니다. 환경변수 MONGODB_URI를 설정해주세요.');
    return;
  }

  try {
    // 이미 연결되어 있으면 기존 연결 사용
    if (mongoose.connection.readyState >= 1) {
      return;
    }

    // 연결 옵션
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };

    // MongoDB 연결
    await mongoose.connect(MONGODB_URI, options);
    console.log('MongoDB에 성공적으로 연결되었습니다.');
  } catch (error) {
    console.error('MongoDB 연결 오류:', error);
    console.warn('MongoDB 연결에 실패했지만 빌드는 계속 진행됩니다.');
  }
}

export default connectDB; 