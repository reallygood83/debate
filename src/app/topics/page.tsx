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
      
      const responseData = await response.json();
      
      // API 응답 구조 확인 및 데이터 추출
      const data = responseData.data || responseData;
      
      setTopics(data.topics || []);
      setPagination(data.pagination || {
        total: 0,
        page: 1,
        limit: 8,
        totalPages: 1
      });
      
    } catch (err: any) {
      setError(err.message || '토론 주제를 불러오는 중 오류가 발생했습니다.');
      console.error('토론 주제 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  // 주제 카테고리 가져오기
  const fetchSubjects = async () => {
    try {
      const response = await fetch('/api/topics/subjects');
      if (!response.ok) {
        throw new Error('주제 카테고리를 불러오는데 실패했습니다.');
      }
      const responseData = await response.json();
      
      // API 응답 구조 확인 및 데이터 추출
      const data = responseData.data || responseData;
      const subjects = data.subjects || data;
      
      setSubjects(['all', ...subjects]);
    } catch (err: any) {
      console.error('주제 카테고리 조회 오류:', err);
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

  useEffect(() => {
    router.push('/topics/ai-topics');
  }, [router]);

  return null; // 리디렉션 중에는 아무것도 렌더링하지 않음
} 