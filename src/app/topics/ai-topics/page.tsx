'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { 
  Lightbulb, 
  Copy, 
  CheckCircle, 
  Loader2, 
  RefreshCw, 
  ArrowLeft 
} from 'lucide-react';

// 토론 주제 인터페이스
interface TopicSuggestion {
  title: string;
  description: string;
}

// 교과 목록
const SUBJECTS = [
  '국어', '도덕', '사회', '수학', '과학', '실과', 
  '체육', '음악', '미술', '영어', '창의적 체험활동'
];

// 학년군 목록
const GRADE_GROUPS = [
  '1-2학년', '3-4학년', '5-6학년'
];

export default function AITopicsPage() {
  const [subject, setSubject] = useState<string>('');
  const [gradeGroup, setGradeGroup] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [topics, setTopics] = useState<TopicSuggestion[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject && !keywords) {
      setError('주제 관련 분야나 키워드 중 하나는 반드시 입력해주세요.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-ai-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          gradeGroup,
          keywords,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || '주제 생성 중 오류가 발생했습니다.');
      }
      
      if (data.success && data.topics) {
        setTopics(data.topics);
      } else {
        throw new Error('주제 생성에 실패했습니다.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleReset = () => {
    setSubject('');
    setGradeGroup('');
    setKeywords('');
    setTopics([]);
    setError(null);
    formRef.current?.reset();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">AI 토론 주제 생성</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 입력 폼 영역 */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Lightbulb className="h-5 w-5 text-yellow-500 mr-2" />
              토론 주제 조건 설정
            </h2>
            
            <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  관련 교과
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">교과 선택 (선택사항)</option>
                  {SUBJECTS.map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  학년군
                </label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={gradeGroup}
                  onChange={(e) => setGradeGroup(e.target.value)}
                >
                  <option value="">학년군 선택 (선택사항)</option>
                  {GRADE_GROUPS.map((grade) => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  키워드 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 환경, 기술, 미래"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      생성 중...
                    </>
                  ) : (
                    '토론 주제 생성하기'
                  )}
                </button>
                
                {(topics.length > 0 || error) && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
                  >
                    <RefreshCw className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mt-4">
                  {error}
                </div>
              )}
            </form>
            
            <div className="mt-6 text-sm text-gray-600">
              <p className="mb-2">
                <strong>사용 방법:</strong>
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>교과, 학년군, 키워드 중 하나 이상 입력하세요.</li>
                <li>AI가 조건에 맞는 토론 주제를 3개 생성합니다.</li>
                <li>마음에 드는 주제를 선택하여 "복사" 버튼을 클릭하세요.</li>
                <li>복사된 주제를 시나리오 생성 페이지에 붙여넣기할 수 있습니다.</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* 생성된 주제 표시 영역 */}
        <div className="md:col-span-2">
          {loading ? (
            <div className="bg-white rounded-lg shadow-md p-12 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-blue-600 mb-4" />
                <p className="text-lg">AI가 토론 주제를 생성하고 있습니다...</p>
                <p className="text-sm text-gray-500 mt-2">잠시만 기다려주세요.</p>
              </div>
            </div>
          ) : topics.length > 0 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold mb-6">AI 추천 토론 주제</h2>
              
              {topics.map((topic, index) => (
                <div 
                  key={index} 
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold">{topic.title}</h3>
                    <button 
                      onClick={() => copyToClipboard(topic.title, index)}
                      className="flex items-center text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full"
                    >
                      {copiedIndex === index ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          복사됨
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          복사
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-gray-600 mt-2">{topic.description}</p>
                  
                  <div className="mt-4 flex justify-end">
                    <Link href={`/scenarios/create?topic=${encodeURIComponent(topic.title)}`}>
                      <button className="text-blue-600 hover:text-blue-800 text-sm flex items-center">
                        이 주제로 시나리오 만들기
                      </button>
                    </Link>
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-blue-700">
                  <strong>팁:</strong> 원하는 주제가 없으면 키워드를 변경해 다시 생성해보세요.
                  특정 소주제나 이슈를 키워드로 추가하면 더 구체적인 토론 주제를 얻을 수 있습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-12 flex items-center justify-center">
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">AI 토론 주제 추천</h3>
                <p className="text-gray-600 mb-4">
                  왼쪽에서 조건을 입력하고 토론 주제 생성하기 버튼을 클릭하세요.<br />
                  AI가 맞춤형 토론 주제를 추천해드립니다.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg inline-block">
                  <p className="text-sm text-gray-500">
                    키워드 예시: 환경보호, 인공지능, 학교생활, 동물권리, 미래기술 등
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 