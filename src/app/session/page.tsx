'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Scenario } from '@/types/scenario';
import { getScenarioById } from '@/utils/scenarioUtils';
import { useDebate } from '@/context/DebateContext';

// 기본 시나리오 정의
const DEFAULT_SCENARIO: Scenario = {
  id: 'default',
  title: '기본 토론: 초등학교에 휴대폰을 가지고 와야 한다',
  totalDurationMinutes: 90,
  groupCount: 4,
  createdAt: new Date(),
  updatedAt: new Date(),
  stages: {
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
          title: '질의 및 반박하기',
          durationMinutes: 15,
          description: '상대측에 질문하고 반박합니다.',
          teacherPrompts: [
            '상대방 주장의 어떤 부분이 의문이 드나요?',
            '증거나 근거가 부족한 부분은 어디인가요?',
            '존중하는 태도로 질문해주세요.'
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
        }
      ]
    }
  }
};

// 타이머 컴포넌트
function Timer({ 
  initialMinutes, 
  onTimeEnd 
}: { 
  initialMinutes: number; 
  onTimeEnd: () => void;
}) {
  const [seconds, setSeconds] = useState(initialMinutes * 60);
  const [isActive, setIsActive] = useState(false);
  
  // 타이머 포맷 함수
  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // 타이머 토글
  const toggleTimer = () => {
    setIsActive(!isActive);
  };
  
  // 타이머 리셋
  const resetTimer = () => {
    setSeconds(initialMinutes * 60);
    setIsActive(false);
  };
  
  // 타이머 효과
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds - 1);
      }, 1000);
    } else if (isActive && seconds === 0) {
      setIsActive(false);
      if (onTimeEnd) onTimeEnd();
      // 타이머 종료 알림음 
      const audio = new Audio('/notification.mp3');
      audio.play().catch(e => console.error('알림음 재생 실패:', e));
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, seconds, onTimeEnd]);
  
  return (
    <div className="flex flex-col items-center">
      <div className={`text-4xl font-bold mb-3 ${seconds < 30 ? 'text-red-600' : 'text-blue-700'}`}>
        {formatTime()}
      </div>
      <div className="flex gap-2">
        <button
          onClick={toggleTimer}
          className={`px-3 py-1 rounded-md ${isActive ? 'bg-yellow-500' : 'bg-green-500'} text-white`}
        >
          {isActive ? '일시정지' : '시작'}
        </button>
        <button
          onClick={resetTimer}
          className="px-3 py-1 bg-gray-500 text-white rounded-md"
        >
          리셋
        </button>
      </div>
    </div>
  );
}

// SearchParams 래퍼 컴포넌트
function SessionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('scenarioId');
  const { setActiveTopic, isDebateActive, setIsDebateActive } = useDebate();
  
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0); // 0, 1, 2 (stage1, stage2, stage3)
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPrompts, setShowPrompts] = useState(false);
  
  // 주제 입력 관련 상태 추가
  const [customTopic, setCustomTopic] = useState('');
  const [showTopicInput, setShowTopicInput] = useState(false);
  
  // 현재 단계와 활동을 배열로 변환
  const getStagesAndActivities = useCallback(() => {
    if (!scenario) return { stages: [], currentActivity: null, currentActiveStage: null };
    
    // 스테이지 배열로 변환
    const stageKeys = ['stage1', 'stage2', 'stage3'];
    const stagesArray = stageKeys.map(key => scenario.stages[key as keyof typeof scenario.stages]);
    
    // 현재 스테이지
    const currentActiveStage = stagesArray[currentStageIndex];
    
    // 현재 활동
    const currentActivity = currentActiveStage && 
                           currentActiveStage.activities && 
                           currentActiveStage.activities.length > currentActivityIndex
      ? currentActiveStage.activities[currentActivityIndex] 
      : null;
      
    return { stages: stagesArray, currentActivity, currentActiveStage };
  }, [scenario, currentStageIndex, currentActivityIndex]);
  
  // 시나리오 로드
  useEffect(() => {
    async function loadScenario() {
      try {
        setLoading(true);
        
        // scenarioId가 없는 경우, 주제 입력 화면 표시
        if (!scenarioId) {
          setShowTopicInput(true);
          setLoading(false);
          return;
        }
        
        // scenarioId가 있는 경우 시나리오 로드 시도
        try {
          const result = await getScenarioById(scenarioId);
          
          if (result.success && result.data) {
            const loadedScenario = result.data;
            setScenario(loadedScenario);
            
            // 토론 주제 설정
            if (loadedScenario.topic) {
              setActiveTopic(loadedScenario.topic);
            } else {
              setActiveTopic(loadedScenario.title);
            }
            
            // 토론 활성화 상태 설정
            setIsDebateActive(true);
          } else {
            // 시나리오를 찾을 수 없는 경우 주제 입력 화면 표시
            console.error('시나리오를 찾을 수 없습니다. 주제 입력 화면으로 전환합니다.');
            setShowTopicInput(true);
          }
        } catch (error) {
          // 시나리오 로드 중 오류 발생 시 주제 입력 화면 표시
          console.error('시나리오 로드 오류:', error);
          setShowTopicInput(true);
        }
      } finally {
        setLoading(false);
      }
    }
    
    loadScenario();
  }, [scenarioId, setActiveTopic, setIsDebateActive]);
  
  // 사용자 정의 주제로 토론 시작
  const startCustomDebate = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customTopic.trim()) return;
    
    // 기본 시나리오 복사 후 사용자 주제로 변경
    const customScenario = {
      ...DEFAULT_SCENARIO,
      title: customTopic.trim(),
      topic: customTopic.trim(),
      id: `custom-${Date.now()}` // 고유 ID 생성
    };
    
    setScenario(customScenario);
    setActiveTopic(customTopic.trim());
    setIsDebateActive(true);
    setShowTopicInput(false);
  };
  
  const { stages, currentActivity, currentActiveStage } = getStagesAndActivities();
  
  // 다음 활동/단계로 이동
  const handleNext = () => {
    if (!currentActiveStage || !stages.length) return;
    
    if (currentActivityIndex < currentActiveStage.activities.length - 1) {
      // 현재 단계의 다음 활동으로 이동
      setCurrentActivityIndex(currentActivityIndex + 1);
    } else if (currentStageIndex < stages.length - 1) {
      // 다음 단계의 첫 활동으로 이동
      setCurrentStageIndex(currentStageIndex + 1);
      setCurrentActivityIndex(0);
    }
  };
  
  // 이전 활동/단계로 이동
  const handlePrevious = () => {
    if (currentActivityIndex > 0) {
      // 현재 단계의 이전 활동으로 이동
      setCurrentActivityIndex(currentActivityIndex - 1);
    } else if (currentStageIndex > 0) {
      // 이전 단계의 마지막 활동으로 이동
      setCurrentStageIndex(currentStageIndex - 1);
      const prevStage = stages[currentStageIndex - 1];
      setCurrentActivityIndex(prevStage.activities.length - 1);
    }
  };
  
  const handleTimeEnd = () => {
    // 시간 종료 시 자동으로 다음 활동으로 이동할 수 있음
    // 선택적으로 구현
  };
  
  const handleEndDebate = () => {
    setIsDebateActive(false);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">토론 세션을 준비 중입니다...</p>
        </div>
      </div>
    );
  }
  
  // 주제 입력 화면
  if (showTopicInput) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">토론 주제 입력</h1>
            
            <form onSubmit={startCustomDebate} className="space-y-6">
              <div>
                <label htmlFor="debateTopic" className="block text-gray-700 font-medium mb-2">
                  토론 주제를 입력하세요
                </label>
                <div className="text-sm text-gray-500 mb-3">
                  토론 주제는 '<span className="font-medium">~에 찬성한다 vs 반대한다</span>' 또는 
                  '<span className="font-medium">~해야 한다 vs ~하지 말아야 한다</span>' 형식으로 
                  입력하시면 효과적인 토론이 가능합니다.
                </div>
                <input
                  type="text"
                  id="debateTopic"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="예: 초등학교에 휴대폰을 가지고 와야 한다 vs 가지고 오지 말아야 한다"
                  className="w-full px-4 py-3 text-xl font-bold text-gray-800 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <div className="mt-2 text-sm text-gray-500">
                  <p>토론 주제 예시:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>급식 잔반 처리에 페널티를 부과해야 한다 vs 부과하지 말아야 한다</li>
                    <li>학교 교복 착용을 의무화하는 것에 찬성한다 vs 반대한다</li>
                    <li>어린이 스마트폰 사용 시간을 제한해야 한다 vs 제한하지 말아야 한다</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex justify-center">
                <button
                  type="submit"
                  disabled={!customTopic.trim()}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  토론 시작
                </button>
              </div>
              
              <div className="text-center text-gray-500 text-sm mt-4">
                주제를 입력하지 않고 시나리오 페이지에서 시나리오를 선택할 수도 있습니다.
                <br />
                <Link href="/scenarios" className="text-blue-600 hover:underline">
                  시나리오 선택하러 가기
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 나머지 렌더링 로직...
  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {scenario?.title || '토론 세션'}
            </h1>
            <button
              onClick={handleEndDebate}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              토론 종료
            </button>
          </div>
          
          {/* 단계 진행 상태 */}
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              {stages.map((stage, index) => (
                <div 
                  key={stage.id}
                  className={`text-center flex-1 ${index < stages.length - 1 ? 'border-r border-gray-300' : ''} ${currentStageIndex === index ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}
                >
                  {stage.title}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-blue-600 h-full transition-all" 
                style={{ 
                  width: `${((currentStageIndex * 100) / stages.length) + 
                    ((currentActivityIndex + 1) * 100) / (currentActiveStage?.activities.length || 1) / stages.length}%` 
                }}
              ></div>
            </div>
          </div>
          
          {/* 현재 활동 내용 */}
          {currentActivity && (
            <div className="bg-blue-50 p-5 rounded-lg mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                {currentActivity.title}
              </h2>
              <p className="text-gray-700 mb-4">{currentActivity.description}</p>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  소요 시간: {currentActivity.durationMinutes}분
                </span>
                <button
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {showPrompts ? '교사 안내 숨기기' : '교사 안내 보기'}
                </button>
              </div>
              
              {showPrompts && (
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h3 className="text-md font-semibold text-gray-700 mb-2">교사 안내:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {currentActivity.teacherPrompts.map((prompt, index) => (
                      <li key={index} className="text-gray-700">{prompt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* 타이머 */}
          <div className="flex flex-col items-center mb-6 py-4 border-y border-gray-200">
            <Timer 
              initialMinutes={currentActivity?.durationMinutes || 10} 
              onTimeEnd={handleTimeEnd}
            />
          </div>
          
          {/* 이전/다음 버튼 */}
          <div className="flex justify-between mt-4">
            <button
              onClick={handlePrevious}
              disabled={currentStageIndex === 0 && currentActivityIndex === 0}
              className={`px-4 py-2 rounded-md ${currentStageIndex === 0 && currentActivityIndex === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-500 hover:bg-gray-600'} text-white transition-colors`}
            >
              이전 활동
            </button>
            <button
              onClick={handleNext}
              disabled={currentStageIndex === stages.length - 1 && currentActivityIndex === (currentActiveStage?.activities.length || 0) - 1}
              className={`px-4 py-2 rounded-md ${currentStageIndex === stages.length - 1 && currentActivityIndex === (currentActiveStage?.activities.length || 0) - 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white transition-colors`}
            >
              다음 활동
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">토론 세션을 준비 중입니다...</p>
        </div>
      </div>
    }>
      <SessionContent />
    </Suspense>
  );
} 