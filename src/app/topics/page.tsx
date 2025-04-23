'use client';

import { useState } from 'react';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// 샘플 토론 주제 데이터
const sampleTopics = [
  {
    id: '1',
    title: '우리나라를 지키기 위한 전쟁, 어떤 경우에도 정당화될 수 있을까?',
    subject: ['도덕', '사회'],
    grade: '초등학교 고학년(4-6학년)',
    createdAt: '2025년 4월 24일'
  },
  {
    id: '2',
    title: '인공지능 기술의 발전은 교육에 더 많은 도움이 될까, 해가 될까?',
    subject: ['도덕', '실과'],
    grade: '초등학교 고학년(4-6학년)',
    createdAt: '2025년 4월 23일'
  },
  {
    id: '3',
    title: '학교에서 스마트폰 사용을 전면 금지해야 할까?',
    subject: ['사회', '도덕'],
    grade: '초등학교 고학년(4-6학년)',
    createdAt: '2025년 4월 22일'
  }
];

export default function TopicsPage() {
  const router = useRouter();
  const [gradeGroup, setGradeGroup] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<{visible: boolean, title: string, description?: string}>({
    visible: false,
    title: '',
  });
  const [topics, setTopics] = useState(sampleTopics);

  const showToast = (title: string, description?: string) => {
    setToastMessage({
      visible: true,
      title,
      description
    });
    
    setTimeout(() => {
      setToastMessage({visible: false, title: ''});
    }, 3000);
  };

  const handleRecommend = async () => {
    if (!gradeGroup) {
      showToast('학년군을 선택해주세요');
      return;
    }

    if (!topic) {
      showToast('주제 분야를 입력해주세요');
      return;
    }

    setIsLoading(true);
    setRecommendations([]);

    try {
      // 프롬프트 구성
      const prompt = `당신은 학생들에게 맞는 토론 주제를 추천해주는 교육 전문가입니다.
다음 정보를 바탕으로 ${gradeGroup} 학생들에게 적합한 토론 주제 5가지를 추천해주세요.
주제 분야: ${topic}
${keywords ? `키워드: ${keywords}` : ''}

각 주제는 찬반 토론이 가능하도록 논쟁적이어야 합니다.
해당 연령대 학생들의 인지 및 언어 발달 수준을 고려해주세요.
교육적으로 가치 있고 학생들의 비판적 사고력을 키울 수 있는 주제를 추천해주세요.
각 주제는 간결하고 명확하게 한 문장으로 작성해주세요.

출력 형식:
1. [첫 번째 토론 주제]
2. [두 번째 토론 주제]
3. [세 번째 토론 주제]
4. [네 번째 토론 주제]
5. [다섯 번째 토론 주제]`;

      console.log('API 요청 시작:', prompt.substring(0, 50) + '...');
      
      const response = await fetch('/api/generate-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      const data = await response.json();
      console.log('API 응답 데이터:', data);

      if (!response.ok) {
        if (data.error === 'API 키가 설정되지 않았습니다. 서버 환경 변수에 GEMINI_API_KEY를 추가해주세요.') {
          throw new Error('서버에 Gemini API 키가 설정되어 있지 않습니다. 관리자에게 문의하세요.');
        } else if (data.error && data.error.includes('Gemini API 오류')) {
          // Gemini API 오류 메시지에서 중요 부분 추출
          let errorMsg = 'Gemini API 오류가 발생했습니다';
          try {
            const errorData = JSON.parse(data.error.replace('Gemini API 오류: ', ''));
            if (errorData.error && errorData.error.message) {
              errorMsg = `Gemini API 오류: ${errorData.error.message}`;
            }
          } catch (e) {
            console.error('오류 파싱 실패:', e);
          }
          throw new Error(errorMsg);
        } else {
          throw new Error(data.error || '주제 추천에 실패했습니다');
        }
      }
      
      // 응답 텍스트에서 추천 주제 파싱
      const topics = data.response
        .split('\n')
        .filter((line: string) => line.trim().match(/^\d+\.\s/))
        .map((line: string) => line.replace(/^\d+\.\s/, '').trim());

      if (topics.length === 0) {
        throw new Error('추천 주제를 찾을 수 없습니다. 다른 주제나 키워드로 시도해보세요.');
      }

      setRecommendations(topics);
    } catch (error) {
      console.error('주제 추천 오류:', error);
      showToast(error instanceof Error ? error.message : '주제 추천 중 오류가 발생했습니다', '잠시 후 다시 시도해주세요');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    showToast('복사되었습니다', text);
    
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  const handleCreateScenario = (topic: string) => {
    // 토론 세션 페이지로 직접 이동 (커스텀 주제로)
    router.push(`/session?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">토론 주제 추천</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md mb-8 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">AI 토론 주제 추천</h2>
          <p className="text-gray-600 text-sm mb-4">
            학년군과 주제 분야를 입력하여 AI가 추천하는 토론 주제를 확인해보세요.
            추천된 주제는 복사하거나 바로 토론을 시작할 수 있습니다.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="grade-group" className="block text-sm font-medium">학년군 선택</label>
            <select
              id="grade-group"
              value={gradeGroup}
              onChange={(e) => setGradeGroup(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">학년군을 선택하세요</option>
              <option value="초등학교 저학년(1-3학년)">초등학교 저학년(1-3학년)</option>
              <option value="초등학교 고학년(4-6학년)">초등학교 고학년(4-6학년)</option>
              <option value="중학교(1-3학년)">중학교(1-3학년)</option>
              <option value="고등학교(1-3학년)">고등학교(1-3학년)</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="topic" className="block text-sm font-medium">주제 분야</label>
            <input
              id="topic"
              type="text"
              placeholder="예: 환경, 과학기술, 사회문제, 교육 등"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="keywords" className="block text-sm font-medium">키워드 (선택사항)</label>
            <textarea
              id="keywords"
              placeholder="관련 키워드를 입력하세요 (쉼표로 구분)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
            />
          </div>
          
          <button 
            onClick={handleRecommend} 
            disabled={isLoading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="inline-block mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em]"></div>
                추천 중...
              </>
            ) : '토론 주제 추천받기'}
          </button>
        </div>
      </div>

      {recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">추천 토론 주제</h2>
            <p className="text-gray-600 text-sm mt-1">
              주제를 선택하여 바로 토론을 시작하거나 클립보드에 복사하여 사용하세요.
            </p>
          </div>
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="border rounded-md p-4 hover:bg-gray-50">
                <p className="text-lg mb-3">{recommendation}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleCopy(recommendation, index)}
                    className="flex items-center text-gray-700 hover:text-blue-600 text-sm border px-3 py-1 rounded"
                  >
                    {copiedIndex === index ? (
                      <>
                        <CheckIcon className="h-4 w-4 mr-1" />
                        복사됨
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-4 w-4 mr-1" />
                        복사하기
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleCreateScenario(recommendation)}
                    className="flex items-center bg-green-500 hover:bg-green-600 text-white text-sm px-3 py-1 rounded"
                  >
                    이 주제로 토론 시작하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 토스트 메시지 */}
      {toastMessage.visible && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-md shadow-lg max-w-xs animate-fade-in-up">
          <h4 className="font-bold">{toastMessage.title}</h4>
          {toastMessage.description && (
            <p className="text-sm mt-1 text-gray-300 truncate">{toastMessage.description}</p>
          )}
        </div>
      )}
    </div>
  );
} 