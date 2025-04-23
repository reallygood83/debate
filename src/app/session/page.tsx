'use client';

import React, { useState, useEffect, useCallback } from 'react';
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

export default function SessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scenarioId = searchParams.get('scenarioId');
  const { setActiveTopic, isDebateActive, setIsDebateActive } = useDebate();
  
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0); // 0, 1, 2 (stage1, stage2, stage3)
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPrompts, setShowPrompts] = useState(false);
  
  // 현재 단계와 활동을 배열로 변환
  const getStagesAndActivities = useCallback(() => {
    if (!scenario) return { stages: [], currentActivity: null, currentActiveStage: null };
    
    // 스테이지 배열로 변환
    const stageKeys = ['stage1', 'stage2', 'stage3'];
    const stagesArray = stageKeys.map(key => scenario.stages[key as keyof typeof scenario.stages]);
    
    // 현재 스테이지
    const currentActiveStage = stagesArray[currentStageIndex];
    
    // 현재 활동 (해당 스테이지의 활동 배열에서 인덱스로 접근)
    const currentActivity = currentActiveStage?.activities[currentActivityIndex] || null;
    
    return { 
      stages: stagesArray, 
      currentActivity,
      currentActiveStage 
    };
  }, [scenario, currentStageIndex, currentActivityIndex]);
  
  // 시나리오 로드
  useEffect(() => {
    const loadScenario = () => {
      if (!scenarioId) {
        // 시나리오 ID가 없을 경우 기본 시나리오 사용
        setScenario(DEFAULT_SCENARIO);
        setLoading(false);
        return;
      }
      
      try {
        const foundScenario = getScenarioById(scenarioId);
        if (foundScenario) {
          setScenario(foundScenario);
          // 토론이 아직 활성화되지 않았다면 활성화
          if (!isDebateActive) {
            if (foundScenario.topic) {
              setActiveTopic(foundScenario.topic);
            } else {
              setActiveTopic(foundScenario.title);
            }
            setIsDebateActive(true);
          }
        } else {
          // 시나리오를 찾을 수 없는 경우 기본 시나리오 사용
          setScenario(DEFAULT_SCENARIO);
        }
      } catch (error) {
        console.error('Failed to load scenario:', error);
        // 오류 발생 시 기본 시나리오 사용
        setScenario(DEFAULT_SCENARIO);
      } finally {
        setLoading(false);
      }
    };
    
    loadScenario();
  }, [scenarioId, router, setActiveTopic, isDebateActive, setIsDebateActive]);
  
  // 다음 활동으로 이동
  const handleNext = () => {
    const { stages, currentActiveStage } = getStagesAndActivities();
    
    if (!currentActiveStage) return;
    
    // 현재 스테이지의 마지막 활동인지 확인
    if (currentActivityIndex < currentActiveStage.activities.length - 1) {
      // 같은 스테이지 내 다음 활동으로 이동
      setCurrentActivityIndex(currentActivityIndex + 1);
    } else if (currentStageIndex < stages.length - 1) {
      // 다음 스테이지의 첫 활동으로 이동
      setCurrentStageIndex(currentStageIndex + 1);
      setCurrentActivityIndex(0);
    } else {
      // 모든 활동 완료
      alert('모든 토론 활동이 완료되었습니다.');
    }
    
    // 다음 활동으로 이동 시 발문 숨기기
    setShowPrompts(false);
  };
  
  // 이전 활동으로 이동
  const handlePrevious = () => {
    if (currentActivityIndex > 0) {
      // 같은 스테이지 내 이전 활동으로 이동
      setCurrentActivityIndex(currentActivityIndex - 1);
    } else if (currentStageIndex > 0) {
      // 이전 스테이지의 마지막 활동으로 이동
      setCurrentStageIndex(currentStageIndex - 1);
      const previousStage = getStagesAndActivities().stages[currentStageIndex - 1];
      setCurrentActivityIndex(previousStage.activities.length - 1);
    }
    
    // 이전 활동으로 이동 시 발문 숨기기
    setShowPrompts(false);
  };
  
  // 타이머 종료 처리
  const handleTimeEnd = () => {
    alert('시간이 종료되었습니다.');
  };
  
  // 토론 종료 처리
  const handleEndDebate = () => {
    setIsDebateActive(false);
    router.push('/');
  };
  
  // 로딩 상태 표시
  if (loading) {
    return <div className="container mx-auto p-6 text-center">로딩 중...</div>;
  }
  
  // 시나리오가 없을 경우 (이제 DEFAULT_SCENARIO를 사용하므로 이 부분은 실행되지 않음)
  if (!scenario) {
    return <div className="container mx-auto p-6 text-center">시나리오를 찾을 수 없습니다.</div>;
  }
  
  const { currentActivity, currentActiveStage } = getStagesAndActivities();
  
  if (!currentActivity || !currentActiveStage) {
    return <div className="container mx-auto p-6 text-center">활동을 찾을 수 없습니다.</div>;
  }
  
  // 스테이지 이름 매핑
  const stageNames = ['1단계: 다름과 마주하기', '2단계: 다름을 이해하기', '3단계: 다름과 공존하기'];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-700">{scenario?.title}</h1>
          <button
            onClick={handleEndDebate}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            토론 종료
          </button>
        </div>
        
        <div className="flex flex-col min-h-screen bg-gray-50">
          {/* 헤더 */}
          <header className="bg-blue-700 text-white p-4">
            <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl font-bold">{scenario.title}</h1>
              <Link href="/scenarios" className="text-white hover:underline">
                종료
              </Link>
            </div>
          </header>
          
          {/* 메인 콘텐츠 */}
          <main className="flex-grow container mx-auto p-6">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {/* 상단 진행 정보 */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-semibold text-blue-700 mb-1">{stageNames[currentStageIndex]}</h2>
                  <p className="text-gray-500">
                    단계 {currentStageIndex + 1}/3 • 활동 {currentActivityIndex + 1}/{currentActiveStage.activities.length}
                  </p>
                </div>
                
                <Timer 
                  initialMinutes={currentActivity.durationMinutes} 
                  onTimeEnd={handleTimeEnd} 
                />
              </div>
              
              {/* 활동 정보 */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-3">{currentActivity.title}</h3>
                <p className="text-lg mb-4">{currentActivity.description}</p>
                
                {/* 교사 발문 토글 */}
                <div className="mt-6">
                  <button
                    onClick={() => setShowPrompts(!showPrompts)}
                    className="text-blue-600 hover:text-blue-800 flex items-center"
                  >
                    <span>{showPrompts ? '교사 발문 숨기기' : '교사 발문 보기'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 ml-1">
                      {showPrompts 
                        ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      }
                    </svg>
                  </button>
                  
                  {showPrompts && (
                    <div className="mt-3 p-4 bg-blue-50 rounded-md">
                      <h4 className="font-semibold mb-2">발문 예시:</h4>
                      <ul className="list-disc ml-5 space-y-1">
                        {currentActivity.teacherPrompts.map((prompt, index) => (
                          <li key={index}>{prompt}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* 이전/다음 버튼 */}
            <div className="flex justify-between mt-6">
              <button
                onClick={handlePrevious}
                disabled={currentStageIndex === 0 && currentActivityIndex === 0}
                className={`px-4 py-2 rounded-md ${
                  currentStageIndex === 0 && currentActivityIndex === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                이전 활동
              </button>
              
              <button
                onClick={handleNext}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                다음 활동
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 