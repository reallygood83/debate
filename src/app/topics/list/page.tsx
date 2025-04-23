'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
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
import { ChevronRight, Edit, Trash2, Search, Plus, ChevronLeft, BookOpen } from 'lucide-react';

// 토론 주제 타입 정의
interface Topic {
  _id: string;
  title: string;
  grade: string;
  background: string;
  subjects: string[];
  createdAt: string;
  useCount: number;
  proArguments: string[];
  conArguments: string[];
  teacherTips?: string;
  keyQuestions?: string[];
  expectedOutcomes?: string[];
  updatedAt?: string;
}

// 페이지네이션 정보 타입 정의
interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TopicsListPage() {
  // 라우터와 검색 파라미터
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 상태 관리
  const [topics, setTopics] = useState<Topic[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 필터 상태
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [grade, setGrade] = useState(searchParams.get('grade') || '');
  const [subject, setSubject] = useState(searchParams.get('subject') || '');
  
  // 현재 페이지
  const currentPage = parseInt(searchParams.get('page') || '1');
  
  // 학년 옵션
  const gradeOptions = [
    { value: '', label: '모든 학년' },
    { value: '초등_저학년', label: '초등 저학년' },
    { value: '초등_고학년', label: '초등 고학년' },
    { value: '중등', label: '중학교' },
    { value: '고등', label: '고등학교' }
  ];
  
  // 교과 옵션
  const subjectOptions = [
    { value: '', label: '모든 교과' },
    { value: '국어', label: '국어' },
    { value: '사회', label: '사회' },
    { value: '도덕', label: '도덕' },
    { value: '과학', label: '과학' },
    { value: '기타', label: '기타' }
  ];
  
  // 주제 로딩 함수
  const fetchTopics = async (page = 1) => {
    try {
      setLoading(true);
      
      // 쿼리 파라미터 구성
      const params = new URLSearchParams();
      params.set('page', page.toString());
      params.set('limit', '12');
      
      if (query) params.set('query', query);
      if (grade) params.set('grade', grade);
      if (subject) params.set('subject', subject);
      
      // API 호출
      const response = await fetch(`/api/topics?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('주제 목록을 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setTopics(data.topics);
      setPagination(data.pagination);
      setError(null);
    } catch (err: any) {
      setError(err.message || '주제 목록을 불러오는데 오류가 발생했습니다.');
      console.error('주제 로딩 오류:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 필터 적용 함수
  const applyFilters = () => {
    const params = new URLSearchParams();
    
    if (query) params.set('query', query);
    if (grade) params.set('grade', grade);
    if (subject) params.set('subject', subject);
    params.set('page', '1'); // 필터 변경 시 1페이지로 이동
    
    router.push(`/topics/list?${params.toString()}`);
  };
  
  // 페이지 변경 함수
  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    
    router.push(`/topics/list?${params.toString()}`);
  };
  
  // 검색 파라미터 변경 시 주제 목록 갱신
  useEffect(() => {
    fetchTopics(currentPage);
  }, [searchParams]);
  
  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // 주제 제목 클릭 핸들러
  const handleTopicClick = (topic: Topic) => {
    router.push(`/topics/${topic._id}`);
  };
  
  // 토론 주제 삭제
  const deleteTopicById = async (id: string) => {
    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '토론 주제를 삭제하는 중 오류가 발생했습니다.');
      }
      
      // 삭제 후 목록 갱신
      fetchTopics(currentPage);
      
      // 현재 페이지의 항목이 없고, 페이지가 1보다 크면 이전 페이지로 이동
      if (topics.length === 1 && currentPage > 1) {
        changePage(currentPage - 1);
      }
      
    } catch (err: any) {
      setError(err.message);
    }
  };
  
  // 토론 주제 아이템 렌더링
  const renderTopicItem = (topic: Topic) => {
    return (
      <Card key={topic._id} className="mb-4 hover:shadow-md transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl font-bold">{topic.title}</CardTitle>
            <div className="flex space-x-2">
              <Link href={`/topics/edit/${topic._id}`}>
                <Button variant="outline" size="icon" title="편집">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon" title="삭제" onClick={() => setDeleteTopicId(topic._id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>토론 주제 삭제</AlertDialogTitle>
                    <AlertDialogDescription>
                      정말로 이 토론 주제를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>취소</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteTopicId && deleteTopicById(deleteTopicId)}>
                      삭제
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <CardDescription className="line-clamp-2">
            {topic.background}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-2">찬성 논점:</h4>
              <ul className="list-disc pl-5 text-sm">
                {topic.proArguments.slice(0, 2).map((arg, index) => (
                  <li key={index} className="line-clamp-1">{arg}</li>
                ))}
                {topic.proArguments.length > 2 && <li>...</li>}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">반대 논점:</h4>
              <ul className="list-disc pl-5 text-sm">
                {topic.conArguments.slice(0, 2).map((arg, index) => (
                  <li key={index} className="line-clamp-1">{arg}</li>
                ))}
                {topic.conArguments.length > 2 && <li>...</li>}
              </ul>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {topic.subjects?.map((subject) => (
              <Badge key={subject} variant="outline">{subject}</Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {topic.updatedAt ? `수정: ${new Date(topic.updatedAt).toLocaleDateString()}` : 
             topic.createdAt ? `생성: ${new Date(topic.createdAt).toLocaleDateString()}` : ''}
          </div>
          <Link href={`/topics/${topic._id}`}>
            <Button variant="ghost" className="text-sm flex items-center">
              자세히 보기 <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </CardFooter>
      </Card>
    );
  };
  
  // 페이지네이션 렌더링
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    
    return (
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  changePage(currentPage - 1);
                }}
              />
            </PaginationItem>
          )}
          
          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
            let pageNumber;
            if (pagination.totalPages <= 5) {
              pageNumber = i + 1;
            } else if (currentPage <= 3) {
              pageNumber = i + 1;
              if (i === 4) pageNumber = pagination.totalPages;
              if (i === 3 && pagination.totalPages > 5) return <PaginationEllipsis key="ellipsis" />;
            } else if (currentPage >= pagination.totalPages - 2) {
              pageNumber = pagination.totalPages - 4 + i;
              if (i === 0) pageNumber = 1;
              if (i === 1 && pagination.totalPages > 5) return <PaginationEllipsis key="ellipsis" />;
            } else {
              if (i === 0) return <PaginationItem key="1"><PaginationLink href="#" onClick={(e) => { e.preventDefault(); changePage(1); }}>1</PaginationLink></PaginationItem>;
              if (i === 1) return <PaginationEllipsis key="ellipsis1" />;
            }
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink href="#" onClick={(e) => { e.preventDefault(); changePage(pageNumber); }}>
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          {currentPage < pagination.totalPages && (
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  changePage(currentPage + 1);
                }}
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">토론 주제 모음</h1>
        <div className="flex space-x-2">
          <Link 
            href="/topics/create" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <span className="mr-2">+</span>
            새 토론 주제 만들기
          </Link>
        </div>
      </div>
      
      {/* 필터 섹션 */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <form onSubmit={applyFilters} className="md:col-span-6 flex">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="토론 주제 검색..."
                className="pl-10 pr-4 py-2 w-full border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <button 
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
            >
              검색
            </button>
          </form>
          
          <div className="md:col-span-3">
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {gradeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-3">
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {subjectOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      {/* 로딩 상태 */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* 주제 목록 */}
          {topics.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <p className="text-lg text-gray-600 mb-4">검색 조건에 맞는 토론 주제가 없습니다.</p>
              <Link 
                href="/topics/create"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
              >
                <span className="mr-2">+</span>
                새 토론 주제 만들기
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {topics.map((topic) => (
                <div 
                  key={topic._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleTopicClick(topic)}
                >
                  <div className="p-5">
                    <h2 className="text-xl font-semibold mb-2 line-clamp-2 h-14">{topic.title}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 h-14">
                      {topic.background.substring(0, 150)}
                      {topic.background.length > 150 ? '...' : ''}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {topic.subjects?.slice(0, 3).map((subject, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          {subject}
                        </span>
                      ))}
                      {topic.subjects && topic.subjects.length > 3 && (
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                          +{topic.subjects.length - 3}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span>찬성: {topic.proArguments.length}개</span>
                      <span>반대: {topic.conArguments.length}개</span>
                    </div>
                    
                    <div className="text-xs text-gray-400">
                      {formatDate(topic.createdAt)}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-5 py-3 flex justify-between items-center border-t">
                    <span className="text-blue-600 text-sm font-medium flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      자세히 보기
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav aria-label="페이지 탐색">
                <ul className="flex space-x-2">
                  <li>
                    <button
                      onClick={() => changePage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={`px-3 py-1 rounded-md flex items-center ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      aria-label="이전 페이지"
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      이전
                    </button>
                  </li>
                  
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = currentPage > 3 ? 
                      (currentPage + i > pagination.totalPages ? pagination.totalPages - 4 + i : currentPage - 2 + i) : 
                      i + 1;
                    
                    if (pageNum <= 0 || pageNum > pagination.totalPages) return null;
                    
                    return (
                      <li key={pageNum}>
                        <button
                          onClick={() => changePage(pageNum)}
                          className={`px-3 py-1 rounded-md ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                          aria-label={`${pageNum} 페이지`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      </li>
                    );
                  })}
                  
                  <li>
                    <button
                      onClick={() => changePage(Math.min(pagination.totalPages, currentPage + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className={`px-3 py-1 rounded-md flex items-center ${
                        currentPage === pagination.totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      aria-label="다음 페이지"
                    >
                      다음
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}
    </div>
  );
} 