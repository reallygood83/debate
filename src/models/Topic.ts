import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '토론 주제 제목은 필수입니다.'],
    trim: true,
  },
  background: {
    type: String,
    required: [true, '배경 정보는 필수입니다.'],
  },
  proArguments: [{
    type: String,
    required: [true, '찬성 논거는 최소 1개 이상 필요합니다.'],
  }],
  conArguments: [{
    type: String,
    required: [true, '반대 논거는 최소 1개 이상 필요합니다.'],
  }],
  teacherTips: {
    type: String,
    required: [true, '교사 지도 팁은 필수입니다.'],
  },
  keyQuestions: [{
    type: String,
    required: [true, '핵심 질문은 최소 1개 이상 필요합니다.'],
  }],
  expectedOutcomes: [{
    type: String,
    required: [true, '기대 학습 성과는 최소 1개 이상 필요합니다.'],
  }],
  subjects: [{
    type: String,
    required: [true, '관련 교과는 최소 1개 이상 필요합니다.'],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// 제목 검색을 위한 텍스트 인덱스 생성
topicSchema.index({ title: 'text' });

// 모델이 이미 컴파일되었는지 확인
export default mongoose.models.Topic || mongoose.model('Topic', topicSchema); 