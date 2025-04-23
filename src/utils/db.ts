import mongoose from 'mongoose';

// MongoDB 연결 URI (환경변수에서 가져옴)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'MongoDB URI가 제공되지 않았습니다. 환경변수 MONGODB_URI를 설정해주세요.'
  );
}

/**
 * MongoDB에 연결하는 함수
 */
export async function connectDB() {
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
    throw new Error('MongoDB 연결에 실패했습니다.');
  }
}

export default connectDB; 