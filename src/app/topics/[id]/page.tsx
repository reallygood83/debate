'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Loader2, Edit, ArrowLeft, Copy, Check } from 'lucide-react';

// 토론 주제 인터페이스
interface TopicDetail {
  id: string;
  title: string;
  grade: string;
  author: string;
  background: string;
  teacherTips: string;
  subject: string[];
  proArguments: string[];
  conArguments: string[];
  expectedOutcomes: string[];
  keyQuestions: string[];
  createdAt: string;
  updatedAt: string;
}

export default function TopicDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [topic, setTopic] = useState<TopicDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    async function loadTopic() {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // 실제로는 API 호출
        // const response = await fetch(`/api/topics/${id}`);
        // if (!response.ok) throw new Error('토론 주제를 불러오는 데 실패했습니다');
        // const data = await response.json();

        // 데모용 더미 데이터
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const dummyTopic: TopicDetail = {
          id,
          title: '우리나라를 지키기 위한 전쟁, 어떤 경우에도 정당화될 수 있을까?',
          grade: '고등학교',
          author: '김교사',
          background: '국가의 안보와 전쟁의 정당성에 관한 토론 주제입니다. 이 주제는 학생들이 평화와 안보, 국가의 역할, 개인의 생명과 권리 사이의 균형 등 복잡한 윤리적 문제를 탐구하도록 도와줍니다. 역사적으로 다양한 전쟁이 있었고, 그 정당성에 대한 논쟁이 계속되어 왔습니다. 이 토론을 통해 학생들은 전쟁의 정당성을 판단하는 기준과 국가 안보의 중요성에 대해 생각해볼 수 있습니다.',
          teacherTips: '이 주제는 학생들의 감정적 반응을 불러일으킬 수 있으므로, 토론 전에 객관적이고 균형 잡힌 자료를 제공하는 것이 중요합니다. 토론 중에는 상대방의 의견을 존중하도록 강조하고, 역사적 사례와 윤리적 원칙을 활용하여 논증을 뒷받침할 수 있도록 지도해주세요.',
          subject: ['도덕', '사회', '역사'],
          proArguments: [
            '국가의 생존과 국민 보호는 정부의 가장 기본적인 의무이므로, 이를 위한 전쟁은 정당화될 수 있다.',
            '침략에 대한 방어적 전쟁은 국제법상으로도 인정되는 정당한 권리이다.',
            '외교적 노력이 모두 실패했을 때, 무력은 최후의 수단으로 사용될 수 있다.'
          ],
          conArguments: [
            '어떤 이유로도 인명 살상을 수반하는 전쟁은 윤리적으로 정당화될 수 없다.',
            '전쟁은 항상 민간인 희생을 가져오므로 그 목적이 정당하더라도 수단으로서 정당화되기 어렵다.',
            '현대 사회에서는 외교, 경제 제재 등 비폭력적 방법으로 갈등을 해결할 수 있다.',
            '이른바 "정의로운 전쟁"이라도 결국 더 큰 폭력과 불의의 순환을 만들어낸다.'
          ],
          expectedOutcomes: [
            '국가 안보와 개인의 생명권 사이의 윤리적 딜레마를 이해한다.',
            '정의로운 전쟁의 개념과 국제법적 기준을 탐구한다.',
            '평화적 갈등 해결 방법의 중요성을 인식한다.',
            '국가의 역할과 국민 보호의 의무에 대해 비판적으로 사고한다.'
          ],
          keyQuestions: [
            '정의로운 전쟁의 조건은 무엇인가요?',
            '국가의 존속과 개인의 생명 중 어느 것이 더 중요한가요?',
            '전쟁 외에 국가 안보를 지키는 방법에는 무엇이 있을까요?',
            '역사적으로 정당화된 전쟁의 사례는 무엇이 있으며, 그 기준은 무엇인가요?'
          ],
          createdAt: '2023년 9월 15일',
          updatedAt: '2023년 10월 2일'
        };

        setTopic(dummyTopic);
      } catch (err) {
        console.error('주제 로딩 오류:', err);
        setError('토론 주제를 불러오는 데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    }

    loadTopic();
  }, [id]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600">토론 주제 정보를 불러오는 중...</p>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/topics" className="text-blue-500 hover:text-blue-700">
            ← 토론 주제 목록으로 돌아가기
          </Link>
        </div>
        
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h2 className="text-lg font-bold mb-2">오류 발생</h2>
          <p>{error || '토론 주제를 찾을 수 없습니다.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/topics" className="text-blue-500 hover:text-blue-700 flex items-center">
          <ArrowLeft className="mr-1 h-4 w-4" />
          토론 주제 목록으로 돌아가기
        </Link>
        
        <Link
          href={`/topics/edit/${topic.id}`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center"
        >
          <Edit className="mr-2 h-4 w-4" />
          주제 편집
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* 주제 헤더 */}
        <div className="p-6 border-b bg-blue-50">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-2">
                {topic.subject.map((subj, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {subj}
                  </span>
                ))}
                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                  {topic.grade}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-800">{topic.title}</h1>
              
              <div className="mt-2 text-sm text-gray-600">
                {topic.author && <p>작성자: {topic.author}</p>}
                <p>생성일: {topic.createdAt} | 수정일: {topic.updatedAt}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 배경 */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">배경</h2>
            <button
              onClick={() => copyToClipboard(topic.background, 'background')}
              className="text-gray-500 hover:text-blue-500 flex items-center text-sm"
              title="클립보드에 복사"
            >
              {copied === 'background' ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
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
          <p className="text-gray-700 whitespace-pre-line">{topic.background}</p>
        </div>

        {/* 찬성/반대 논점 */}
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold mb-4">주요 논점</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 찬성 논점 */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-green-800">
                  찬성 측 논점
                </h3>
                <button
                  onClick={() => copyToClipboard(topic.proArguments.join('\n'), 'pro')}
                  className="text-gray-500 hover:text-green-700 flex items-center text-sm"
                  title="클립보드에 복사"
                >
                  {copied === 'pro' ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
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
              
              <ul className="space-y-2">
                {topic.proArguments.map((arg, index) => (
                  <li key={index} className="flex">
                    <span className="text-green-500 font-bold mr-2">•</span>
                    <span className="text-gray-700">{arg}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* 반대 논점 */}
            <div className="bg-red-50 border border-red-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-red-800">
                  반대 측 논점
                </h3>
                <button
                  onClick={() => copyToClipboard(topic.conArguments.join('\n'), 'con')}
                  className="text-gray-500 hover:text-red-700 flex items-center text-sm"
                  title="클립보드에 복사"
                >
                  {copied === 'con' ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
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
              
              <ul className="space-y-2">
                {topic.conArguments.map((arg, index) => (
                  <li key={index} className="flex">
                    <span className="text-red-500 font-bold mr-2">•</span>
                    <span className="text-gray-700">{arg}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 교사용 팁 */}
        {topic.teacherTips && (
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">교사용 팁</h2>
              <button
                onClick={() => copyToClipboard(topic.teacherTips, 'tips')}
                className="text-gray-500 hover:text-blue-500 flex items-center text-sm"
                title="클립보드에 복사"
              >
                {copied === 'tips' ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
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
            <p className="text-gray-700 whitespace-pre-line">{topic.teacherTips}</p>
          </div>
        )}

        {/* 핵심 질문 */}
        {topic.keyQuestions && topic.keyQuestions.length > 0 && (
          <div className="p-6 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">핵심 질문</h2>
              <button
                onClick={() => copyToClipboard(topic.keyQuestions.join('\n'), 'questions')}
                className="text-gray-500 hover:text-blue-500 flex items-center text-sm"
                title="클립보드에 복사"
              >
                {copied === 'questions' ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
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
            
            <ul className="space-y-2">
              {topic.keyQuestions.map((question, index) => (
                <li key={index} className="flex">
                  <span className="text-blue-500 font-bold mr-2">Q:</span>
                  <span className="text-gray-700">{question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 기대 성과 */}
        {topic.expectedOutcomes && topic.expectedOutcomes.length > 0 && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">기대 성과</h2>
              <button
                onClick={() => copyToClipboard(topic.expectedOutcomes.join('\n'), 'outcomes')}
                className="text-gray-500 hover:text-blue-500 flex items-center text-sm"
                title="클립보드에 복사"
              >
                {copied === 'outcomes' ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
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
            
            <ul className="space-y-2">
              {topic.expectedOutcomes.map((outcome, index) => (
                <li key={index} className="flex">
                  <span className="text-purple-500 font-bold mr-2">•</span>
                  <span className="text-gray-700">{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {/* 세션 시작 버튼 */}
      <div className="mt-8 text-center">
        <Link
          href={`/session?topic=${encodeURIComponent(topic.title)}`}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg inline-block"
        >
          이 주제로 토론 시작하기
        </Link>
      </div>
    </div>
  );
} 