'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

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
}

export default function EditTopicPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 동적 입력 필드를 위한 상태
  const [proArguments, setProArguments] = useState<string[]>([]);
  const [conArguments, setConArguments] = useState<string[]>([]);
  const [keyQuestions, setKeyQuestions] = useState<string[]>([]);
  const [expectedOutcomes, setExpectedOutcomes] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');

  // 기본 입력 필드를 위한 상태
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState('');
  const [teacherTips, setTeacherTips] = useState('');
  const [grade, setGrade] = useState('');

  useEffect(() => {
    async function fetchTopic() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/topics/${id}`);
        if (!response.ok) {
          throw new Error('토론 주제를 불러오는데 실패했습니다.');
        }
        const result = await response.json();
        if (!result.data) {
          throw new Error('토론 주제 데이터가 없습니다.');
        }
        
        setTopic(result.data);
        
        // 개별 상태 업데이트
        setTitle(result.data.title);
        setBackground(result.data.background);
        setProArguments(result.data.proArguments);
        setConArguments(result.data.conArguments);
        setTeacherTips(result.data.teacherTips);
        setKeyQuestions(result.data.keyQuestions);
        setExpectedOutcomes(result.data.expectedOutcomes);
        setSubjects(result.data.subjects);
        setGrade(result.data.grade);
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        console.error('토론 주제 불러오기 오류:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTopic();
  }, [id]);

  // 배열 항목 추가 함수들
  const addProArgument = () => setProArguments([...proArguments, '']);
  const addConArgument = () => setConArguments([...conArguments, '']);
  const addKeyQuestion = () => setKeyQuestions([...keyQuestions, '']);
  const addExpectedOutcome = () => setExpectedOutcomes([...expectedOutcomes, '']);
  
  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  // 배열 항목 제거 함수들
  const removeProArgument = (index: number) => {
    setProArguments(proArguments.filter((_, i) => i !== index));
  };

  const removeConArgument = (index: number) => {
    setConArguments(conArguments.filter((_, i) => i !== index));
  };

  const removeKeyQuestion = (index: number) => {
    setKeyQuestions(keyQuestions.filter((_, i) => i !== index));
  };

  const removeExpectedOutcome = (index: number) => {
    setExpectedOutcomes(expectedOutcomes.filter((_, i) => i !== index));
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  // 배열 항목 업데이트 함수들
  const updateProArgument = (index: number, value: string) => {
    const updated = [...proArguments];
    updated[index] = value;
    setProArguments(updated);
  };

  const updateConArgument = (index: number, value: string) => {
    const updated = [...conArguments];
    updated[index] = value;
    setConArguments(updated);
  };

  const updateKeyQuestion = (index: number, value: string) => {
    const updated = [...keyQuestions];
    updated[index] = value;
    setKeyQuestions(updated);
  };

  const updateExpectedOutcome = (index: number, value: string) => {
    const updated = [...expectedOutcomes];
    updated[index] = value;
    setExpectedOutcomes(updated);
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!background.trim()) {
      alert('배경 정보를 입력해주세요.');
      return;
    }

    if (proArguments.filter(arg => arg.trim()).length === 0) {
      alert('찬성 측 논거를 최소 1개 이상 입력해주세요.');
      return;
    }

    if (conArguments.filter(arg => arg.trim()).length === 0) {
      alert('반대 측 논거를 최소 1개 이상 입력해주세요.');
      return;
    }

    if (!teacherTips.trim()) {
      alert('교사 팁을 입력해주세요.');
      return;
    }

    if (keyQuestions.filter(q => q.trim()).length === 0) {
      alert('핵심 질문을 최소 1개 이상 입력해주세요.');
      return;
    }

    if (expectedOutcomes.filter(outcome => outcome.trim()).length === 0) {
      alert('기대 학습 성과를 최소 1개 이상 입력해주세요.');
      return;
    }

    if (subjects.length === 0) {
      alert('관련 과목을 최소 1개 이상 선택해주세요.');
      return;
    }

    if (!grade.trim()) {
      alert('학년/수준을 입력해주세요.');
      return;
    }

    // 주제 업데이트 API 호출
    setIsSaving(true);
    try {
      const updatedTopic = {
        ...topic,
        title,
        background,
        proArguments: proArguments.filter(arg => arg.trim()),
        conArguments: conArguments.filter(arg => arg.trim()),
        teacherTips,
        keyQuestions: keyQuestions.filter(q => q.trim()),
        expectedOutcomes: expectedOutcomes.filter(outcome => outcome.trim()),
        subjects,
        grade
      };

      const response = await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTopic),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '토론 주제를 업데이트하는데 실패했습니다.');
      }

      alert('토론 주제가 성공적으로 업데이트되었습니다.');
      router.push(`/topics/${id}`);
    } catch (err) {
      console.error('토론 주제 업데이트 오류:', err);
      alert(err instanceof Error ? err.message : '토론 주제를 업데이트하는데 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">토론 주제 수정</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-center py-10">토론 주제를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">토론 주제 수정</h1>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-center py-10 text-red-500">{error}</p>
            <div className="flex justify-center mt-4">
              <Link 
                href="/topics"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                토론 주제 목록으로 돌아가기
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">토론 주제 수정</h1>
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          {/* 기본 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                학년/수준 <span className="text-red-500">*</span>
              </label>
              <select
                id="grade"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                required
              >
                <option value="">학년/수준 선택</option>
                <option value="초등 저학년">초등 저학년</option>
                <option value="초등 고학년">초등 고학년</option>
                <option value="중학교">중학교</option>
                <option value="고등학교">고등학교</option>
                <option value="대학/성인">대학/성인</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                관련 과목 <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {subjects.map((subject, index) => (
                  <div key={index} className="bg-blue-100 px-3 py-1 rounded-full flex items-center">
                    <span>{subject}</span>
                    <button
                      type="button"
                      className="ml-2 text-red-500 hover:text-red-700"
                      onClick={() => removeSubject(index)}
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="새 과목 추가"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                  onClick={addSubject}
                >
                  추가
                </button>
              </div>
            </div>
          </div>

          {/* 배경 정보 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">배경 정보</h2>
            <div className="mb-4">
              <label htmlFor="background" className="block text-sm font-medium text-gray-700 mb-1">
                배경 정보 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="background"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={5}
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 토론 논거 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">토론 논거</h2>
            
            {/* 찬성 측 논거 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                찬성 측 논거 <span className="text-red-500">*</span>
              </label>
              {proArguments.map((argument, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={argument}
                    onChange={(e) => updateProArgument(index, e.target.value)}
                    placeholder={`찬성 논거 ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                    onClick={() => removeProArgument(index)}
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={addProArgument}
              >
                찬성 논거 추가
              </button>
            </div>

            {/* 반대 측 논거 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                반대 측 논거 <span className="text-red-500">*</span>
              </label>
              {conArguments.map((argument, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={argument}
                    onChange={(e) => updateConArgument(index, e.target.value)}
                    placeholder={`반대 논거 ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                    onClick={() => removeConArgument(index)}
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={addConArgument}
              >
                반대 논거 추가
              </button>
            </div>
          </div>

          {/* 교사 팁 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">교사 팁</h2>
            <div className="mb-4">
              <label htmlFor="teacherTips" className="block text-sm font-medium text-gray-700 mb-1">
                교사 팁 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="teacherTips"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                rows={4}
                value={teacherTips}
                onChange={(e) => setTeacherTips(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 핵심 질문 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">핵심 질문</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                핵심 질문 <span className="text-red-500">*</span>
              </label>
              {keyQuestions.map((question, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={question}
                    onChange={(e) => updateKeyQuestion(index, e.target.value)}
                    placeholder={`핵심 질문 ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                    onClick={() => removeKeyQuestion(index)}
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={addKeyQuestion}
              >
                핵심 질문 추가
              </button>
            </div>
          </div>

          {/* 기대 학습 성과 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">기대 학습 성과</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                기대 학습 성과 <span className="text-red-500">*</span>
              </label>
              {expectedOutcomes.map((outcome, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={outcome}
                    onChange={(e) => updateExpectedOutcome(index, e.target.value)}
                    placeholder={`기대 학습 성과 ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500 text-white rounded-r-md hover:bg-red-600"
                    onClick={() => removeExpectedOutcome(index)}
                  >
                    삭제
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="mt-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                onClick={addExpectedOutcome}
              >
                기대 학습 성과 추가
              </button>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-end gap-4 mt-8">
            <Link
              href={`/topics/${id}`}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100"
            >
              취소
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
              disabled={isSaving}
            >
              {isSaving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 