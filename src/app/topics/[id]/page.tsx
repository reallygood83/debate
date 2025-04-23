'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface Topic {
  _id: string;
  title: string;
  grade: string;
  author: string;
  background: string;
  proArguments: string[];
  conArguments: string[];
  teacherTips: string;
  keyQuestions: string[];
  expectedOutcomes: string[];
  subjects: string[];
  createdAt: string;
  updatedAt: string;
}

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await fetch(`/api/topics/${params.id}`);
        if (!response.ok) {
          throw new Error('토론 주제를 불러오는데 실패했습니다.');
        }
        const data = await response.json();
        setTopic(data.topic);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopic();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
          <p className="font-bold">오류</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative">
          <p>토론 주제를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/topics" className="text-blue-500 hover:text-blue-700">
          ← 토론 주제 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        {/* 헤더 섹션 */}
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold mb-4">{topic.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <div>대상: {topic.grade}</div>
            <div>작성자: {topic.author || '미상'}</div>
            <div>작성일: {new Date(topic.createdAt).toLocaleDateString('ko-KR')}</div>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {topic.subjects.map((subject, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {subject}
              </span>
            ))}
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* 배경 섹션 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">배경</h2>
            <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap">
              {topic.background}
            </div>
          </section>

          {/* 찬성/반대 논점 섹션 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">주요 논점</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 찬성 논점 */}
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 mb-3">찬성 측 논점</h3>
                <ul className="space-y-2">
                  {topic.proArguments.map((arg, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">•</span>
                      {arg}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 반대 논점 */}
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-800 mb-3">반대 측 논점</h3>
                <ul className="space-y-2">
                  {topic.conArguments.map((arg, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-red-500 mr-2">•</span>
                      {arg}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 교사용 팁 섹션 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">교사용 팁</h2>
            <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 whitespace-pre-wrap">
              {topic.teacherTips}
            </div>
          </section>

          {/* 핵심 질문 섹션 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">핵심 질문</h2>
            <ul className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
              {topic.keyQuestions.map((question, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">Q.</span>
                  {question}
                </li>
              ))}
            </ul>
          </section>

          {/* 기대 성과 섹션 */}
          <section>
            <h2 className="text-xl font-semibold mb-4">기대 성과</h2>
            <ul className="bg-purple-50 border border-purple-100 rounded-lg p-4 space-y-2">
              {topic.expectedOutcomes.map((outcome, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-500 mr-2">•</span>
                  {outcome}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 하단 버튼 */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-end gap-4">
            <Link
              href={`/topics/${topic._id}/edit`}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded"
            >
              수정하기
            </Link>
            <Link
              href={`/session?topicId=${topic._id}`}
              className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded"
            >
              토론 시작하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 