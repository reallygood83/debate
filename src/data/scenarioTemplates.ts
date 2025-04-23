import { StageSection, Activity } from '../types/scenario';

// 기본 스테이지 템플릿 - 경기초등토론교육모형 3단계
export const defaultStageTemplate: { 
  stage1: StageSection;
  stage2: StageSection;
  stage3: StageSection;
} = {
  stage1: {
    id: 'stage1',
    title: '1단계: 다름과 마주하기',
    activities: [
      {
        id: 'activity1-1',
        title: '질문으로 논제 만나기',
        durationMinutes: 10,
        description: '사진/영상을 보고 자유롭게 질문을 만들어 발표합니다.',
        teacherPrompts: [
          '이 장면에서 무엇이 보이나요? 어떤 생각이 드나요?',
          '왜? 어떻게? 라는 질문으로 시작해보세요.',
          '찬반으로 나뉠 수 있는 질문을 생각해봅시다.'
        ]
      },
      {
        id: 'activity1-2',
        title: '핵심 쟁점 찾기',
        durationMinutes: 10,
        description: '논제의 핵심 단어를 정의하고 찬반 의견의 핵심 쟁점을 찾습니다.',
        teacherPrompts: [
          '논제의 핵심 단어는 무엇인가요?',
          '이 단어의 의미를 어떻게 정의할 수 있을까요?',
          '찬성 측과 반대 측은 어떤 점에서 의견이 다를까요?'
        ]
      },
      {
        id: 'activity1-3',
        title: '자료 조사/분석',
        durationMinutes: 15,
        description: '논제에 관한 자료를 찾고 분석합니다.',
        teacherPrompts: [
          '어떤 자료가 필요할까요?',
          '이 자료는 신뢰할 수 있나요? 출처는 어디인가요?',
          '찾은 자료는 어떤 주장을 뒷받침하나요?'
        ]
      },
      {
        id: 'activity1-4',
        title: '입론서 쓰기',
        durationMinutes: 15,
        description: '자신의 주장과 근거를 정리하여 입론서를 작성합니다.',
        teacherPrompts: [
          '주장을 명확하게 작성했나요?',
          '주장을 뒷받침하는 근거는 무엇인가요?',
          '상대방의 반박을 예상해볼까요?'
        ]
      }
    ]
  },
  stage2: {
    id: 'stage2',
    title: '2단계: 다름을 이해하기',
    activities: [
      {
        id: 'activity2-1',
        title: '토론 여는 주장하기',
        durationMinutes: 10,
        description: '찬성 측과 반대 측이 각각 첫 주장을 발표합니다.',
        teacherPrompts: [
          '먼저 찬성 측의 주장을 들어볼까요?',
          '이제 반대 측의 주장을 들어보겠습니다.',
          '다른 모둠에서는 경청하는 자세로 들어주세요.'
        ]
      },
      {
        id: 'activity2-2',
        title: '협의 시간',
        durationMinutes: 5,
        description: '상대측 주장을 듣고 팀원들과 의견을 나눕니다.',
        teacherPrompts: [
          '상대측 주장의 강점과 약점은 무엇인가요?',
          '어떤 질문을 하면 좋을까요?',
          '우리 주장을 강화할 수 있는 방법은?'
        ]
      },
      {
        id: 'activity2-3',
        title: '질의 및 반박하기',
        durationMinutes: 15,
        description: '상대측에 질문하고 반박합니다.',
        teacherPrompts: [
          '상대방 주장의 어떤 부분이 의문이 드나요?',
          '증거나 근거가 부족한 부분은 어디인가요?',
          '존중하는 태도로 질문해주세요.'
        ]
      },
      {
        id: 'activity2-4',
        title: '협의 및 자유토론 시간',
        durationMinutes: 10,
        description: '팀원들과 협의하고 자유롭게 토론합니다.',
        teacherPrompts: [
          '지금까지의 토론 내용을 정리해봅시다.',
          '우리 주장의 약점은 무엇이었나요?',
          '상대측의 어떤 의견이 타당하다고 생각하나요?'
        ]
      },
      {
        id: 'activity2-5',
        title: '공존을 향한 주장하기',
        durationMinutes: 10,
        description: '상대방 의견을 존중하며 절충안을 제시합니다.',
        teacherPrompts: [
          '상대 의견 중 수용할 수 있는 부분은 무엇인가요?',
          '양측의 의견을 절충할 방안은 없을까요?',
          '서로의 다른 의견을 존중하면서 함께 살아가려면 어떻게 해야 할까요?'
        ]
      }
    ]
  },
  stage3: {
    id: 'stage3',
    title: '3단계: 다름과 공존하기',
    activities: [
      {
        id: 'activity3-1',
        title: '토론 후 생각 나누기',
        durationMinutes: 10,
        description: '토론을 통해 배운 점과 느낀 점을 나눕니다.',
        teacherPrompts: [
          '토론 전과 후에 생각이 어떻게 바뀌었나요?',
          '상대방의 의견 중 인상 깊었던 부분은 무엇인가요?',
          '다른 사람과 의견이 다를 때 어떻게 대화해야 할까요?'
        ]
      },
      {
        id: 'activity3-2',
        title: '성찰/사회 참여 활동 안내',
        durationMinutes: 10,
        description: '토론 주제와 관련된 후속 활동을 안내합니다.',
        teacherPrompts: [
          '이 주제에 대해 더 알아보고 싶은 것이 있나요?',
          '우리 교실이나 학교에서 실천할 수 있는 일은 무엇이 있을까요?',
          '이 문제 해결을 위해 우리가 할 수 있는 일은 무엇일까요?'
        ]
      }
    ]
  }
};

// 시간 배분 함수 - 총 시간에 맞춰 각 활동 시간 비율 조정
export function calculateTimings(
  template: typeof defaultStageTemplate, 
  totalMinutes: number
): typeof defaultStageTemplate {
  // 기존 템플릿의 총 시간 계산
  const getTemplateTotalTime = () => {
    let total = 0;
    Object.values(template).forEach(stage => {
      stage.activities.forEach(activity => {
        total += activity.durationMinutes;
      });
    });
    return total;
  };
  
  const templateTotalTime = getTemplateTotalTime();
  const timeRatio = totalMinutes / templateTotalTime;
  
  // 새 템플릿 생성 및 시간 조정
  const result = JSON.parse(JSON.stringify(template));
  
  Object.keys(result).forEach((stageKey) => {
    const stage = result[stageKey as keyof typeof result];
    stage.activities.forEach((activity: Activity) => {
      // 각 활동 시간을 비율에 맞게 조정 (소수점 반올림)
      activity.durationMinutes = Math.round(activity.durationMinutes * timeRatio);
      // 최소 시간 보장 (1분)
      if (activity.durationMinutes < 1) activity.durationMinutes = 1;
    });
  });
  
  return result;
} 