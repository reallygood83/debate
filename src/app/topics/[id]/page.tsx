'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Trash2, ArrowLeft, Play } from 'lucide-react';

interface Topic {
  _id: string;
  title: string;
  background: string;
  proArguments: string[];
  conArguments: string[];
  teacherTips: string;
  keyQuestions: string[];
  expectedOutcomes: string[];
  subjects: string[];
  grade: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function TopicDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 토론 주제 데이터 가져오기
  useEffect(() => {
    async function fetchTopic() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/topics/${params.id}`);
        
        if (!response.ok) {
          throw new Error('토론 주제를 불러오는데 실패했습니다.');
        }
        
        const result = await response.json();
        setTopic(result.data);
        setError(null);
      } catch (err) {
        console.error('토론 주제 불러오기 오류:', err);
        setError('토론 주제를 불러오는데 문제가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopic();
  }, [params.id]);

  // 토론 주제 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm('정말로 이 토론 주제를 삭제하시겠습니까?')) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/topics/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '토론 주제 삭제에 실패했습니다.');
      }

      alert('토론 주제가 성공적으로 삭제되었습니다.');
      router.push('/topics');
    } catch (err: any) {
      console.error('토론 주제 삭제 오류:', err);
      alert(err.message || '토론 주제 삭제 중 오류가 발생했습니다.');
    } finally {
      setIsDeleting(false);
    }
  };

  // 토론 시작 핸들러
  const startDebate = () => {
    router.push(`/session?scenarioId=${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">토론 주제 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p className="font-bold">오류</p>
          <p>{error}</p>
        </div>
        <div className="flex justify-center">
          <Link href="/topics" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            토론 주제 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6" role="alert">
          <p className="font-bold">알림</p>
          <p>토론 주제를 찾을 수 없습니다.</p>
        </div>
        <div className="flex justify-center">
          <Link href="/topics" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            토론 주제 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 날짜 포맷팅 함수
  const formatDate = (dateString?: string) => {
    if (!dateString) return '날짜 정보 없음';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Link href="/topics" className="flex items-center text-gray-600 hover:text-blue-500">
          <ArrowLeft className="mr-1" size={20} />
          <span>토론 주제 목록으로</span>
        </Link>
        
        <div className="flex space-x-2">
          <button
            onClick={startDebate}
            className="flex items-center bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
          >
            <Play size={16} className="mr-1" />
            토론 시작하기
          </button>
          
          <Link 
            href={`/topics/edit/${params.id}`}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
          >
            <Pencil size={16} className="mr-1" />
            수정하기
          </Link>
          
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow disabled:bg-red-300"
          >
            {isDeleting ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                <span>삭제 중...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-1" />
                <span>삭제하기</span>
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {/* 주제 헤더 */}
        <div className="bg-blue-600 text-white p-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{topic.title}</h1>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="bg-blue-700 px-3 py-1 rounded-full font-medium">{topic.grade}</span>
            {topic.subjects.map((subject, index) => (
              <span key={index} className="bg-blue-800 px-3 py-1 rounded-full">{subject}</span>
            ))}
          </div>
        </div>
        
        {/* 메타 정보 */}
        <div className="bg-gray-100 px-6 py-3 text-sm text-gray-600 border-b">
          <div className="flex flex-wrap justify-between">
            <div>
              <span className="font-semibold">생성일:</span> {formatDate(topic.createdAt)}
            </div>
            {topic.updatedAt && topic.updatedAt !== topic.createdAt && (
              <div>
                <span className="font-semibold">수정일:</span> {formatDate(topic.updatedAt)}
              </div>
            )}
          </div>
        </div>
        
        {/* 주제 내용 */}
        <div className="p-6 space-y-8">
          {/* 배경 정보 */}
          <section>
            <h2 className="text-xl font-bold mb-3 text-gray-800 border-b pb-2">배경 정보</h2>
            <p className="whitespace-pre-line text-gray-700">{topic.background}</p>
          </section>
          
          {/* 찬반 논점 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 찬성 논점 */}
            <section className="bg-green-50 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-3 text-green-800 border-b border-green-200 pb-2">찬성측 논점</h2>
              <ul className="list-disc list-inside space-y-2">
                {topic.proArguments.map((arg, index) => (
                  <li key={index} className="text-gray-700">{arg}</li>
                ))}
              </ul>
            </section>
            
            {/* 반대 논점 */}
            <section className="bg-red-50 p-4 rounded-lg">
              <h2 className="text-xl font-bold mb-3 text-red-800 border-b border-red-200 pb-2">반대측 논점</h2>
              <ul className="list-disc list-inside space-y-2">
                {topic.conArguments.map((arg, index) => (
                  <li key={index} className="text-gray-700">{arg}</li>
                ))}
              </ul>
            </section>
          </div>
          
          {/* 교사 지원 자료 */}
          <section className="bg-yellow-50 p-4 rounded-lg">
            <h2 className="text-xl font-bold mb-3 text-yellow-800 border-b border-yellow-200 pb-2">교사 지원 자료</h2>
            
            {/* 교사 팁 */}
            {topic.teacherTips && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg mb-2">교사 팁</h3>
                <p className="whitespace-pre-line text-gray-700">{topic.teacherTips}</p>
              </div>
            )}
            
            {/* 핵심 질문 */}
            <div className="mb-4">
              <h3 className="font-semibold text-lg mb-2">핵심 질문</h3>
              <ul className="list-decimal list-inside space-y-2">
                {topic.keyQuestions.map((question, index) => (
                  <li key={index} className="text-gray-700">{question}</li>
                ))}
              </ul>
            </div>
            
            {/* 기대 학습 성과 */}
            <div>
              <h3 className="font-semibold text-lg mb-2">기대 학습 성과</h3>
              <ul className="list-decimal list-inside space-y-2">
                {topic.expectedOutcomes.map((outcome, index) => (
                  <li key={index} className="text-gray-700">{outcome}</li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
} 