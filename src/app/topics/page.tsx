'use client';

import { useState } from 'react';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { Loader2 } from 'lucide-react';

export default function TopicsPage() {
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
다음 정보를 바탕으로 ${gradeGroup} 학생들에게 적합한 토론 주제 3가지를 추천해주세요.
주제 분야: ${topic}
${keywords ? `키워드: ${keywords}` : ''}

각 주제는 찬반 토론이 가능하도록 논쟁적이어야 합니다.
해당 연령대 학생들의 인지 및 언어 발달 수준을 고려해주세요.
교육적으로 가치 있고 학생들의 비판적 사고력을 키울 수 있는 주제를 추천해주세요.
각 주제는 간결하고 명확하게 한 문장으로 작성해주세요.

출력 형식:
1. [첫 번째 토론 주제]
2. [두 번째 토론 주제]
3. [세 번째 토론 주제]`;

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

      if (!response.ok) {
        if (data.error === 'API 키가 설정되지 않았습니다') {
          throw new Error('서버에 Gemini API 키가 설정되어 있지 않습니다. 관리자에게 문의하세요.');
        } else {
          throw new Error(data.error || '주제 추천에 실패했습니다');
        }
      }
      
      // 응답 텍스트에서 추천 주제 파싱
      const topics = data.response
        .split('\n')
        .filter((line: string) => line.trim().match(/^\d+\.\s/))
        .map((line: string) => line.replace(/^\d+\.\s/, '').trim());

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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">AI 토론 주제 추천</h1>
      
      <div className="bg-white rounded-lg shadow-md mb-8 p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">토론 주제 추천 받기</h2>
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
                <svg className="inline mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
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
          </div>
          <div className="space-y-4">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start justify-between p-4 border rounded-md">
                <p className="text-lg flex-grow">{recommendation}</p>
                <button
                  onClick={() => handleCopy(recommendation, index)}
                  className="ml-2 p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md"
                >
                  {copiedIndex === index ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Toast 메시지 */}
      {toastMessage.visible && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg max-w-xs z-50">
          <div className="font-medium">{toastMessage.title}</div>
          {toastMessage.description && <div className="text-sm text-gray-300">{toastMessage.description}</div>}
        </div>
      )}
    </div>
  );
} 