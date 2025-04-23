'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Scenario } from '@/types/scenario';
import { getSavedScenarios, deleteScenario } from '@/utils/scenarioUtils';
import { useDebate } from '@/context/DebateContext';

// MongoDB에서 가져온 시나리오 타입
interface ServerScenario {
  _id: string;
  title: string;
  totalDurationMinutes: number;
  groupCount?: number;
  createdAt: string;
  updatedAt: string;
  stages?: {
    stage1: Record<string, unknown>;
    stage2: Record<string, unknown>;
    stage3: Record<string, unknown>;
  };
  aiGenerated?: boolean;
  scenarioDetails?: {
    background?: string;
    proArguments?: string[];
    conArguments?: string[];
    teacherTips?: string;
    keyQuestions?: string[];
  };
}

// 예시 시나리오 데이터
const exampleScenarios: Scenario[] = [
  {
    id: '1',
    title: '기초 연금 지급 대상 확대',
    topic: '기초 연금 지급 대상 확대에 찬성한다 vs 반대한다',
    grade: '6학년',
    subject: '사회',
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2023-08-15'),
    totalDurationMinutes: 45,
    stages: {
      stage1: { id: '1', title: '다름과 마주하기', activities: [] },
      stage2: { id: '2', title: '다름을 이해하기', activities: [] },
      stage3: { id: '3', title: '다름과 공존하기', activities: [] }
    },
    scenarioDetails: {
      background: '기초 연금 지급 대상을 확대하는 것의 찬반에 대해 토론합니다.'
    }
  },
  {
    id: '2',
    title: '인공지능 창작물의 저작권',
    topic: '인공지능 창작물의 저작권은 AI에게 있다 vs 인간에게 있다',
    grade: '5-6학년',
    subject: '실과, 사회',
    createdAt: new Date('2023-09-03'),
    updatedAt: new Date('2023-09-03'),
    totalDurationMinutes: 50,
    stages: {
      stage1: { id: '1', title: '다름과 마주하기', activities: [] },
      stage2: { id: '2', title: '다름을 이해하기', activities: [] },
      stage3: { id: '3', title: '다름과 공존하기', activities: [] }
    },
    scenarioDetails: {
      background: '인공지능이 만든 작품의 저작권은 누구에게 있는지 토론합니다.'
    }
  },
  {
    id: '3',
    title: '학교 교복 착용 의무화',
    topic: '초등학교 교복 착용 의무화에 찬성한다 vs 반대한다',
    grade: '5학년',
    subject: '사회',
    createdAt: new Date('2023-07-20'),
    updatedAt: new Date('2023-07-20'),
    totalDurationMinutes: 40,
    stages: {
      stage1: { id: '1', title: '다름과 마주하기', activities: [] },
      stage2: { id: '2', title: '다름을 이해하기', activities: [] },
      stage3: { id: '3', title: '다름과 공존하기', activities: [] }
    },
    scenarioDetails: {
      background: '초등학교에서 교복 착용을 의무화하는 것에 대한 찬반 토론입니다.'
    }
  },
  {
    id: '4',
    title: '청소년 스마트폰 사용 시간 제한',
    topic: '청소년 스마트폰 사용 시간 제한에 찬성한다 vs 반대한다',
    grade: '4-6학년',
    subject: '도덕, 사회',
    createdAt: new Date('2023-09-10'),
    updatedAt: new Date('2023-09-10'),
    totalDurationMinutes: 45,
    stages: {
      stage1: { id: '1', title: '다름과 마주하기', activities: [] },
      stage2: { id: '2', title: '다름을 이해하기', activities: [] },
      stage3: { id: '3', title: '다름과 공존하기', activities: [] }
    },
    scenarioDetails: {
      background: '청소년의 스마트폰 사용 시간에 제한을 두어야 하는지에 대한 토론입니다.'
    }
  },
  {
    id: '5',
    title: '재활용 분리수거 의무화',
    topic: '재활용 분리수거 의무화에 찬성한다 vs 반대한다',
    grade: '3-4학년',
    subject: '과학, 사회',
    createdAt: new Date('2023-08-28'),
    updatedAt: new Date('2023-08-28'),
    totalDurationMinutes: 35,
    stages: {
      stage1: { id: '1', title: '다름과 마주하기', activities: [] },
      stage2: { id: '2', title: '다름을 이해하기', activities: [] },
      stage3: { id: '3', title: '다름과 공존하기', activities: [] }
    },
    scenarioDetails: {
      background: '모든 가정에서 재활용 분리수거를 의무적으로 해야 하는지에 대한 토론입니다.'
    }
  }
];

export default function ScenariosPage() {
  const router = useRouter();
  const { setActiveTopic, setIsDebateActive } = useDebate();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showServerData, setShowServerData] = useState(true);
  const [serverScenarios, setServerScenarios] = useState<Scenario[]>([]);
  const [serverDataLoading, setServerDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  // 서버 시나리오 로드
  const loadServerScenarios = useCallback(async () => {
    if (serverDataLoading) return;
    
    setServerDataLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scenarios');
      
      if (!response.ok) {
        throw new Error('서버에서 시나리오를 불러오는 중 오류가 발생했습니다.');
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '서버 응답 오류');
      }
      
      // MongoDB 데이터 형식을 Scenario 형식으로 변환
      const formattedScenarios: Scenario[] = result.data.map((item: ServerScenario) => ({
        ...item,
        id: item._id,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
        // stages 속성이 없는 경우 기본값 제공
        stages: item.stages || {
          stage1: { id: '1', title: '다름과 마주하기', activities: [] },
          stage2: { id: '2', title: '다름을 이해하기', activities: [] },
          stage3: { id: '3', title: '다름과 공존하기', activities: [] }
        }
      }));
      
      setServerScenarios(formattedScenarios);
      setShowServerData(true);
    } catch (error) {
      console.error('Failed to load server scenarios:', error);
      const errorMessage = error instanceof Error ? error.message : '서버 시나리오를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      setShowServerData(false);
    } finally {
      setServerDataLoading(false);
    }
  }, [serverDataLoading]);
  
  // 로컬 시나리오 로드
  useEffect(() => {
    const loadScenarios = () => {
      try {
        const savedScenarios = getSavedScenarios();
        setScenarios(savedScenarios);
      } catch (error) {
        console.error('Failed to load scenarios:', error);
        setError('시나리오를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    
    loadScenarios();
    
    // 페이지 로드 시 서버 데이터 자동 로드
    loadServerScenarios();
  }, [loadServerScenarios]);
  
  // 서버에서 시나리오 삭제
  const handleDeleteServerScenario = async (id: string) => {
    if (!confirm('이 시나리오를 서버에서 삭제하시겠습니까?')) return;
    
    try {
      const response = await fetch(`/api/scenarios/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('시나리오 삭제 중 오류가 발생했습니다.');
      }
      
      // 성공적으로 삭제된 경우 목록에서 제거
      setServerScenarios(prev => prev.filter(scenario => scenario.id !== id));
    } catch (error) {
      console.error('Failed to delete server scenario:', error);
      alert('시나리오 삭제 중 오류가 발생했습니다.');
    }
  };
  
  // 로컬에서 시나리오 삭제
  const handleDeleteLocalScenario = (id: string) => {
    if (!confirm('이 시나리오를 삭제하시겠습니까?')) return;
    
    try {
      deleteScenario(id);
      setScenarios(prev => prev.filter(scenario => scenario.id !== id));
    } catch (error) {
      console.error('Failed to delete scenario:', error);
      alert('시나리오 삭제 중 오류가 발생했습니다.');
    }
  };
  
  // 사용할 시나리오 배열 선택
  const displayScenarios = showServerData ? serverScenarios : scenarios;
  
  // 날짜 포맷 헬퍼 함수
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  // 토론 시작 핸들러
  const handleDebateStart = (scenario: Scenario) => {
    // 토론 주제를 전역 상태에 설정
    if (scenario.topic) {
      setActiveTopic(scenario.topic);
    } else {
      setActiveTopic(scenario.title);
    }
    
    // 토론 활성화 상태 설정
    setIsDebateActive(true);
    
    // 토론 세션 페이지로 이동
    router.push(`/session?scenarioId=${scenario.id}`);
  };
  
  if (loading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <p>시나리오를 불러오는 중...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">토론 시나리오</h1>
        <Link
          href="/scenarios/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          새 시나리오 만들기
        </Link>
      </div>
      
      {/* 데이터 소스 전환 버튼 */}
      <div className="mb-6 flex items-center">
        <div className="rounded-md bg-gray-200 p-1 flex">
          <button
            onClick={() => setShowServerData(false)}
            className={`px-4 py-2 rounded-md ${!showServerData ? 'bg-white shadow-sm' : ''}`}
          >
            내 토론자료
          </button>
          <button
            onClick={loadServerScenarios}
            className={`px-4 py-2 rounded-md ${showServerData ? 'bg-white shadow-sm' : ''}`}
          >
            {serverDataLoading ? '로딩 중...' : '공유 토론자료'}
          </button>
        </div>
      </div>
      
      {/* 오류 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      {displayScenarios.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-xl text-gray-600 mb-4">저장된 시나리오가 없습니다.</p>
          <p className="text-gray-500">
            시나리오를 생성하려면 '새 시나리오 만들기' 버튼을 클릭하세요.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayScenarios.map(scenario => (
            <div key={scenario.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2 text-gray-800">{scenario.title}</h2>
                <div className="mb-4 text-sm text-gray-500">
                  <p>총 시간: {scenario.totalDurationMinutes}분</p>
                  <p>생성 날짜: {formatDate(scenario.createdAt)}</p>
                  {scenario.aiGenerated && (
                    <p className="text-purple-600 font-medium mt-1">AI 생성 시나리오</p>
                  )}
                </div>
                
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => router.push(`/scenarios/${scenario.id}`)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    상세 보기
                  </button>
                  
                  <button
                    onClick={() => showServerData 
                      ? handleDeleteServerScenario(scenario.id) 
                      : handleDeleteLocalScenario(scenario.id)
                    }
                    className="text-red-600 hover:text-red-800"
                  >
                    삭제
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 flex justify-between">
                <button
                  onClick={() => handleDebateStart(scenario)}
                  className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  토론 시작
                </button>
                
                <Link
                  href={`/scenarios/edit/${scenario.id}`}
                  className="px-3 py-1 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                >
                  수정
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 