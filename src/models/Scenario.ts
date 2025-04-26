import { Schema, models, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

// 활동 스키마
const ActivitySchema = new Schema({
  id: String,
  title: String,
  durationMinutes: Number,
  description: String,
  teacherPrompts: [String]
});

// 스테이지 섹션 스키마
const StageSectionSchema = new Schema({
  id: String,
  title: String,
  activities: [ActivitySchema]
});

// 시나리오 스키마
const ScenarioSchema = new Schema({
  // UUID를 _id로 사용할 수 있도록 설정
  _id: {
    type: String,
    default: function() {
      return uuidv4();
    }
  },
  title: {
    type: String,
    required: [true, '토론 주제를 입력해주세요.'],
    trim: true
  },
  totalDurationMinutes: {
    type: Number,
    required: [true, '총 토론 시간을 입력해주세요.'],
    min: [10, '최소 10분 이상의 시간이 필요합니다.']
  },
  groupCount: Number,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  stages: {
    stage1: StageSectionSchema,
    stage2: StageSectionSchema,
    stage3: StageSectionSchema
  },
  // AI로 생성된 추가 정보
  aiGenerated: {
    type: Boolean,
    default: false
  },
  scenarioDetails: {
    background: String,
    proArguments: [String],
    conArguments: [String],
    teacherTips: String,
    keyQuestions: [String]
  }
}, {
  // 인덱스 자동 생성 활성화
  autoIndex: true, 
  // JSON 직렬화 시 가상 필드 포함
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
  // 버전키 비활성화 (서버리스 환경에서 성능 향상)
  versionKey: false,
  // _id 타입이 String이므로 이를 명시적으로 설정
  _id: true
});

// 자주 조회되는 필드에 인덱스 추가
ScenarioSchema.index({ createdAt: -1 }); // 생성일 기준 내림차순 정렬을 위한 인덱스
ScenarioSchema.index({ title: 'text' }); // 제목 기준 텍스트 검색 인덱스
ScenarioSchema.index({ aiGenerated: 1 }); // AI 생성 필터링을 위한 인덱스

// 대용량 데이터 처리를 위한 lean() 메서드를 기본으로 설정하는 쿼리 미들웨어
ScenarioSchema.pre('find', function() {
  this.lean();
});

// 모델이 이미 있는지 확인하고 없으면 생성
export default models.Scenario || model('Scenario', ScenarioSchema); 