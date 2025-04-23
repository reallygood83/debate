'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Trash2, ArrowLeftCircle, Play, Copy } from 'lucide-react';
import { ArrowLeftIcon, DocumentDuplicateIcon, BookOpenIcon } from '@heroicons/react/24/outline';

// 토론 주제 타입 정의
interface Topic {
  _id: string;
  title: string;
  grade: string;
  background: string;
  proArguments: string[];
  conArguments: string[];
  teacherTips: string;
  keyQuestions: string[];
  expectedOutcomes: string[];
  subjects: string[];
  createdAt: string;
  updatedAt: string;
  useCount: number;
}

// 학년 옵션 맵
const gradeMap: Record<string, string> = {
  '초등_저학년': '초등 저학년',
  '초등_고학년': '초등 고학년',
  '중등': '중학교',
  '고등': '고등학교'
};

export default function TopicDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  // 토론 주제 불러오기
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/topics/${id}`);
        
        if (!response.ok) {
          throw new Error('주제를 불러오는데 실패했습니다.');
        }
        
        const data = await response.json();
        setTopic(data);
      } catch (err) {
        setError('주제를 불러오는 중 오류가 발생했습니다.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTopic();
    }
  }, [id]);

  // 토론 주제 삭제
  const deleteTopic = async () => {
    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '토론 주제를 삭제하는 중 오류가 발생했습니다.');
      }
      
      router.push('/topics/list');
    } catch (err: any) {
      setError(err.message);
    }
  };

  // 텍스트 복사 함수
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // 토론 시작 함수
  const startDebateWithTopic = () => {
    if (topic) {
      // 토론 시작 페이지로 이동하면서 현재 주제 정보 전달
      router.push(`/session?topic=${encodeURIComponent(topic.title)}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error || '주제를 찾을 수 없습니다.'}</p>
        </div>
        <Link href="/topics" className="text-blue-500 hover:underline flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> 주제 목록으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/topics" className="text-blue-500 hover:underline flex items-center">
          <ArrowLeftIcon className="h-4 w-4 mr-1" /> 주제 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h1 className="text-3xl font-bold text-gray-800">{topic.title}</h1>
            <div className="flex space-x-2">
              <button
                onClick={startDebateWithTopic}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                <BookOpenIcon className="h-5 w-5 inline mr-1" />
                이 주제로 토론 시작
              </button>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {topic.subjects.map((subject, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm">
                {subject}
              </span>
            ))}
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">배경 정보</h2>
              <button 
                onClick={() => copyToClipboard(topic.background, 'background')}
                className="text-gray-500 hover:text-gray-700"
                title="클립보드에 복사"
              >
                <DocumentDuplicateIcon className="h-5 w-5" />
              </button>
            </div>
            {copied === 'background' && (
              <div className="text-green-600 text-sm mb-2">복사되었습니다!</div>
            )}
            <div className="bg-gray-50 p-4 rounded-md whitespace-pre-wrap">
              {topic.background}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">찬성 측 논거</h2>
                <button 
                  onClick={() => copyToClipboard(topic.proArguments.join('\n\n'), 'pro')}
                  className="text-gray-500 hover:text-gray-700"
                  title="클립보드에 복사"
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
              </div>
              {copied === 'pro' && (
                <div className="text-green-600 text-sm mb-2">복사되었습니다!</div>
              )}
              <ul className="bg-green-50 p-4 rounded-md list-disc pl-5">
                {topic.proArguments.map((arg, index) => (
                  <li key={index} className="mb-2">{arg}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">반대 측 논거</h2>
                <button 
                  onClick={() => copyToClipboard(topic.conArguments.join('\n\n'), 'con')}
                  className="text-gray-500 hover:text-gray-700"
                  title="클립보드에 복사"
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
              </div>
              {copied === 'con' && (
                <div className="text-green-600 text-sm mb-2">복사되었습니다!</div>
              )}
              <ul className="bg-red-50 p-4 rounded-md list-disc pl-5">
                {topic.conArguments.map((arg, index) => (
                  <li key={index} className="mb-2">{arg}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-700 mb-2">교사 지도 팁</h2>
              <button 
                onClick={() => copyToClipboard(topic.teacherTips, 'tips')}
                className="text-gray-500 hover:text-gray-700"
                title="클립보드에 복사"
              >
                <DocumentDuplicateIcon className="h-5 w-5" />
              </button>
            </div>
            {copied === 'tips' && (
              <div className="text-green-600 text-sm mb-2">복사되었습니다!</div>
            )}
            <div className="bg-yellow-50 p-4 rounded-md whitespace-pre-wrap">
              {topic.teacherTips}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-4">
            <div>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">핵심 질문</h2>
                <button 
                  onClick={() => copyToClipboard(topic.keyQuestions.join('\n\n'), 'questions')}
                  className="text-gray-500 hover:text-gray-700"
                  title="클립보드에 복사"
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
              </div>
              {copied === 'questions' && (
                <div className="text-green-600 text-sm mb-2">복사되었습니다!</div>
              )}
              <ul className="bg-purple-50 p-4 rounded-md list-disc pl-5">
                {topic.keyQuestions.map((question, index) => (
                  <li key={index} className="mb-2">{question}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">기대 학습 성과</h2>
                <button 
                  onClick={() => copyToClipboard(topic.expectedOutcomes.join('\n\n'), 'outcomes')}
                  className="text-gray-500 hover:text-gray-700"
                  title="클립보드에 복사"
                >
                  <DocumentDuplicateIcon className="h-5 w-5" />
                </button>
              </div>
              {copied === 'outcomes' && (
                <div className="text-green-600 text-sm mb-2">복사되었습니다!</div>
              )}
              <ul className="bg-blue-50 p-4 rounded-md list-disc pl-5">
                {topic.expectedOutcomes.map((outcome, index) => (
                  <li key={index} className="mb-2">{outcome}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 