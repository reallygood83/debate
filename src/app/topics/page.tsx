'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, BookOpen } from 'lucide-react';

// 토론 주제 인터페이스
interface Topic {
  _id: string;
  title: string;
  background: string;
  proArguments: string[];
  conArguments: string[];
  teacherTips?: string;
  keyQuestions?: string[];
  expectedOutcomes?: string[];
  subjects?: string[];
  createdAt: string;
  updatedAt?: string;
}

// 페이지네이션 인터페이스
interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TopicsPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 8,
    totalPages: 1
  });
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [subjects, setSubjects] = useState<string[]>([]);

  // 주제 목록 가져오기
  const fetchTopics = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/api/topics?page=${page}&limit=8`;
      
      if (searchQuery) {
        url += `&q=${encodeURIComponent(searchQuery)}`;
      }
      
      if (selectedSubject && selectedSubject !== 'all') {
        url += `&subject=${encodeURIComponent(selectedSubject)}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('토론 주제를 불러오는데 실패했습니다.');
      }
      
      const data = await response.json();
      setTopics(data.topics);
      setPagination(data.pagination);
      
    } catch (err: any) {
      setError(err.message || '토론 주제를 불러오는 중 오류가 발생했습니다.');
      console.error('토론 주제 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 모든 과목 목록 가져오기
  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/topics/subjects');
      if (!response.ok) {
        throw new Error('과목 목록을 불러오는데 실패했습니다.');
      }
      const data = await response.json();
      setSubjects(data.subjects);
    } catch (err) {
      console.error('과목 목록 조회 오류:', err);
    }
  };

  // 검색 처리
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchTopics(1);
  };

  // 페이지 변경
  const changePage = (newPage: number) => {
    setCurrentPage(newPage);
    fetchTopics(newPage);
  };

  // 과목 필터 변경
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSubject(e.target.value);
    setCurrentPage(1);
    setTimeout(() => fetchTopics(1), 0);
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  // 컴포넌트 마운트시 데이터 로딩
  useEffect(() => {
    fetchTopics(currentPage);
    fetchSubjects();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">토론 주제 모음</h1>
        <div className="flex space-x-2">
          <Link 
            href="/topics/create" 
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            새 토론 주제 만들기
          </Link>
        </div>
      </div>

      {/* 검색 및 필터링 */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <form onSubmit={handleSearch} className="md:col-span-6 flex">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="토론 주제 검색..."
                className="pl-10 pr-4 py-2 w-full border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              value={selectedSubject}
              onChange={handleSubjectChange}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">모든 과목</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex items-center justify-end">
            <span className="text-sm text-gray-500">
              총 {pagination.total}개의 토론 주제
            </span>
          </div>
        </div>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && !loading && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* 검색 결과가 없는 경우 */}
      {!loading && !error && topics.length === 0 && (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <p className="text-lg text-gray-600 mb-4">검색 조건에 맞는 토론 주제가 없습니다.</p>
          <Link 
            href="/topics/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            <Plus className="mr-2 h-4 w-4" />
            새 토론 주제 만들기
          </Link>
        </div>
      )}

      {/* 토론 주제 목록 */}
      {!loading && !error && topics.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
          {topics.map((topic) => (
            <div 
              key={topic._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/topics/${topic._id}`)}
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
      {!loading && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav>
            <ul className="flex space-x-2">
              <li>
                <button
                  onClick={() => changePage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
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
                  className={`px-3 py-1 rounded-md ${
                    currentPage === pagination.totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  다음
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );
} 