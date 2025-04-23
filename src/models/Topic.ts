import mongoose from 'mongoose';

// 토론 주제 스키마 정의
const topicSchema = new mongoose.Schema({
  // 기본 정보
  title: {
    type: String,
    required: [true, '주제 제목은 필수입니다.'],
    trim: true
  },
  
  // 학년 정보
  grade: {
    type: String, 
    required: [true, '학년 정보는 필수입니다.'],
    enum: ['초등저학년', '초등고학년', '중학교', '고등학교', '대학/성인']
  },
  
  // 배경 설명
  background: {
    type: String,
    required: [true, '배경 설명은 필수입니다.'],
    trim: true
  },
  
  // 관련 교과
  subjects: {
    type: [String],
    required: [true, '최소 하나 이상의 관련 교과가 필요합니다.'],
    validate: [(v: string[]) => v.length > 0, '최소 하나 이상의 관련 교과가 필요합니다.']
  },
  
  // 찬성 주장
  proArguments: {
    type: [String],
    required: [true, '최소 하나 이상의 찬성 주장이 필요합니다.'],
    validate: [(v: string[]) => v.length > 0, '최소 하나 이상의 찬성 주장이 필요합니다.']
  },
  
  // 반대 주장
  conArguments: {
    type: [String],
    required: [true, '최소 하나 이상의 반대 주장이 필요합니다.'],
    validate: [(v: string[]) => v.length > 0, '최소 하나 이상의 반대 주장이 필요합니다.']
  },
  
  // 교사 팁
  teacherTips: {
    type: String,
    required: [true, '교사 팁은 필수입니다.'],
    trim: true
  },
  
  // 핵심 질문
  keyQuestions: {
    type: [String],
    required: [true, '최소 하나 이상의 핵심 질문이 필요합니다.'],
    validate: [(v: string[]) => v.length > 0, '최소 하나 이상의 핵심 질문이 필요합니다.']
  },
  
  // 기대 학습 성과
  expectedOutcomes: {
    type: [String],
    required: [true, '최소 하나 이상의 기대 학습 성과가 필요합니다.'],
    validate: [(v: string[]) => v.length > 0, '최소 하나 이상의 기대 학습 성과가 필요합니다.']
  },
  
  // 태그
  tags: {
    type: [String],
    default: []
  },
  
  // 생성자 정보 (나중에 인증 추가 시 사용)
  createdBy: {
    type: String,
    default: 'anonymous'
  },
  
  // 시간 정보
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // 토론 주제 사용 횟수
  useCount: {
    type: Number,
    default: 0
  }
});

// 검색을 위한 인덱스 생성
topicSchema.index({ title: 'text', background: 'text' });

// 모델이 이미 존재하는지 확인 후 생성 (Next.js 핫 리로딩 대응)
const Topic = mongoose.models.Topic || mongoose.model('Topic', topicSchema);

export default Topic; 