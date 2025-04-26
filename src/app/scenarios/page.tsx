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
  const [showServerData, setShowServerData] = useState(false);
  const [serverScenarios, setServerScenarios] = useState<Scenario[]>([]);
  const [serverDataLoading, setServerDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  
  // 토스트 메시지 상태 추가
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  // 토스트 메시지 표시 함수
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
    
    // 3초 후 토스트 메시지 자동 숨김
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  // 서버 시나리오 로드
  const loadServerScenarios = useCallback(async () => {
    if (serverDataLoading) return;
    
    setServerDataLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/scenarios');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `서버 오류: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || '서버 응답 오류');
      }
      
      // MongoDB 데이터 형식을 Scenario 형식으로 변환
      const formattedScenarios: Scenario[] = result.data.map((item: ServerScenario) => {
        // 날짜 문자열을 안전하게 Date 객체로 변환
        let createdAt: Date;
        let updatedAt: Date;
        
        try {
          createdAt = new Date(item.createdAt);
          updatedAt = new Date(item.updatedAt);
          
          // 유효하지 않은 날짜인 경우 현재 날짜로 설정
          if (isNaN(createdAt.getTime())) createdAt = new Date();
          if (isNaN(updatedAt.getTime())) updatedAt = new Date();
        } catch (e) {
          console.error('날짜 변환 오류:', e);
          createdAt = new Date();
          updatedAt = new Date();
        }
        
        return {
          ...item,
          id: item._id,
          title: item.title || '제목 없음',
          totalDurationMinutes: item.totalDurationMinutes || 30,
          groupCount: item.groupCount || 4,
          createdAt,
          updatedAt,
          // stages 속성이 없는 경우 기본값 제공
          stages: item.stages || {
            stage1: { id: '1', title: '다름과 마주하기', activities: [] },
            stage2: { id: '2', title: '다름을 이해하기', activities: [] },
            stage3: { id: '3', title: '다름과 공존하기', activities: [] }
          }
        };
      });
      
      setServerScenarios(formattedScenarios);
      setShowServerData(true);
    } catch (error) {
      console.error('Failed to load server scenarios:', error);
      const errorMessage = error instanceof Error ? error.message : '서버 시나리오를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      setShowServerData(false);
      
      // MongoDB 연결 오류일 경우 특별 메시지 표시
      if (error instanceof Error && 
          (error.message.includes('MongoDB 연결') || 
           error.message.includes('연결에 실패'))) {
        setError('MongoDB 연결 문제가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      // 항상 로딩 상태를 해제하여 UI가 멈추지 않게 함
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
    
    // 페이지 로드 시 서버 데이터 자동 로드하지 않음
    // 사용자가 서버 데이터 탭을 클릭할 때만 로드함
    
    // 로딩 상태가 30초 이상 지속되면 자동 취소
    const timeoutId = setTimeout(() => {
      if (serverDataLoading) {
        console.log('서버 데이터 로딩 타임아웃: 자동 취소');
        setServerDataLoading(false);
        setError('서버 연결 시간이 너무 오래 걸립니다. 내 토론자료로 전환합니다.');
        setShowServerData(false);
      }
    }, 30000);
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [loadServerScenarios, serverDataLoading]);
  
  // 서버에서 시나리오 삭제
  const handleDeleteServerScenario = async (id: string) => {
    if (!confirm('이 시나리오를 서버에서 삭제하시겠습니까?')) return;
    
    try {
      const result = await deleteScenario(id);
      
      if (result.success) {
        // 성공적으로 삭제된 경우 목록에서 제거
        setServerScenarios(prev => prev.filter(scenario => scenario.id !== id));
        // 성공 토스트 메시지 표시
        showToast('시나리오가 성공적으로 삭제되었습니다.', 'success');
        if (result.message) {
          // 선택적으로 성공 메시지 표시
          console.log(result.message);
        }
      } else {
        showToast(result.message || '시나리오 삭제 중 오류가 발생했습니다.', 'error');
      }
    } catch (error: any) {
      console.error('Failed to delete server scenario:', error);
      showToast(error.message || '시나리오 삭제 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // 로컬에서 시나리오 삭제
  const handleDeleteLocalScenario = async (id: string) => {
    if (!confirm('이 시나리오를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    
    try {
      const result = await deleteScenario(id);
      if (result.success) {
        // 삭제 성공 시 상태 업데이트
        setScenarios(prev => prev.filter(s => s.id !== id));
        // 성공 토스트 메시지 표시
        showToast('시나리오가 성공적으로 삭제되었습니다.', 'success');
      } else {
        showToast(result.message || '시나리오 삭제 중 오류가 발생했습니다.', 'error');
      }
    } catch (error: any) {
      console.error('시나리오 삭제 오류:', error);
      showToast(error.message || '시나리오 삭제 중 오류가 발생했습니다.', 'error');
    }
  };
  
  // 사용할 시나리오 배열 선택
  const displayScenarios = showServerData ? serverScenarios : scenarios;
  
  // 날짜 포맷 헬퍼 함수
  const formatDate = (date: Date | string | undefined) => {
    if (!date) return '날짜 없음';
    
    try {
      // 문자열인 경우 Date 객체로 변환
      const dateObj = date instanceof Date ? date : new Date(date);
      
      // 유효한 날짜인지 확인
      if (isNaN(dateObj.getTime())) {
        return '날짜 형식 오류';
      }
      
      return dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('날짜 포맷 오류:', error);
      return '날짜 처리 오류';
    }
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
    router.push(`/session?id=${scenario.id}`);
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
      {/* 토스트 메시지 표시 */}
      {toast.show && (
        <div 
          className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 transition-opacity duration-300 ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          } text-white`}
        >
          <div className="flex items-center">
            {toast.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-700">토론 시나리오</h1>
        <Link
          href="/scenarios/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          새 시나리오 만들기
        </Link>
      </div>
      
      {/* 데이터 소스 설명 */}
      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-blue-800">
          <span className="font-bold">내 로컬 토론자료</span>: 현재 브라우저에 저장된 시나리오입니다. 다른 기기나 브라우저에서는 확인할 수 없습니다.
        </p>
        <p className="text-blue-800 mt-2">
          <span className="font-bold">서버 공유 토론자료</span>: 모든 사용자가 공유할 수 있는 서버에 저장된 시나리오입니다. 누구나 이 자료를 볼 수 있고 사용할 수 있습니다.
        </p>
      </div>
      
      {/* 데이터 소스 전환 버튼 */}
      <div className="mb-6 flex items-center">
        <div className="rounded-md bg-gray-200 p-1 flex">
          <button
            onClick={() => {
              setShowServerData(false);
              setError(null);
              // 무한 로딩 문제를 방지하기 위해 서버 데이터 로딩 상태도 리셋
              setServerDataLoading(false);
            }}
            className={`px-4 py-2 rounded-md font-medium text-blue-800 ${!showServerData ? 'bg-white shadow-sm' : 'hover:bg-blue-50'} transition-colors`}
          >
            내 로컬 토론자료
          </button>
          <button
            onClick={() => {
              if (!serverDataLoading) {
                loadServerScenarios();
              }
            }}
            disabled={serverDataLoading}
            className={`px-4 py-2 rounded-md font-medium ${showServerData ? 'bg-white shadow-sm' : 'hover:bg-blue-50'} ${serverDataLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {serverDataLoading ? (
              <span className="flex items-center">
                <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                로딩 중...
              </span>
            ) : '서버 공유 토론자료'}
          </button>
        </div>
        
        {/* 로딩 중 취소 버튼 추가 */}
        {serverDataLoading && (
          <button
            onClick={() => {
              setServerDataLoading(false);
              setShowServerData(false);
            }}
            className="ml-2 px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 font-medium"
          >
            취소
          </button>
        )}

        {/* 새로고침 버튼은 로딩 중이 아닐 때만 표시 */}
        {showServerData && !serverDataLoading && (
          <button
            onClick={loadServerScenarios}
            disabled={serverDataLoading}
            className="ml-2 p-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="새로고침"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      
      {/* 오류 메시지 - 더 눈에 띄게 개선 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
          {serverDataLoading && (
            <div className="mt-3 flex">
              <button 
                onClick={() => {
                  setServerDataLoading(false);
                  setShowServerData(false);
                }} 
                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                로딩 취소하고 내 토론자료로 전환하기
              </button>
            </div>
          )}
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