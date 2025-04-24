'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { XCircle } from 'lucide-react';

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

export default function EditTopicPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 동적 필드 관리를 위한 상태
  const [proArguments, setProArguments] = useState<string[]>([]);
  const [conArguments, setConArguments] = useState<string[]>([]);
  const [keyQuestions, setKeyQuestions] = useState<string[]>([]);
  const [expectedOutcomes, setExpectedOutcomes] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');

  // 기본 정보 관리를 위한 상태
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState('');
  const [teacherTips, setTeacherTips] = useState('');
  const [grade, setGrade] = useState('');

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
        const topicData = result.data;
        
        // 상태 업데이트
        setTopic(topicData);
        setTitle(topicData.title);
        setBackground(topicData.background);
        setProArguments(topicData.proArguments);
        setConArguments(topicData.conArguments);
        setTeacherTips(topicData.teacherTips);
        setKeyQuestions(topicData.keyQuestions);
        setExpectedOutcomes(topicData.expectedOutcomes);
        setSubjects(topicData.subjects);
        setGrade(topicData.grade);
        
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

  // 폼 제출 핸들러
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
    
    if (proArguments.length === 0) {
      alert('찬성측 논점을 최소 1개 이상 입력해주세요.');
      return;
    }
    
    if (conArguments.length === 0) {
      alert('반대 측 논점을 최소 1개 이상 입력해주세요.');
      return;
    }

    if (keyQuestions.length === 0) {
      alert('핵심 질문을 최소 1개 이상 입력해주세요.');
      return;
    }

    if (expectedOutcomes.length === 0) {
      alert('기대 학습 성과를 최소 1개 이상 입력해주세요.');
      return;
    }

    if (subjects.length === 0) {
      alert('관련 과목을 최소 1개 이상 입력해주세요.');
      return;
    }

    if (!grade) {
      alert('대상 학년을 선택해주세요.');
      return;
    }

    try {
      setIsSaving(true);
      
      const updatedTopic = {
        title,
        background,
        proArguments,
        conArguments,
        teacherTips,
        keyQuestions,
        expectedOutcomes,
        subjects,
        grade
      };
      
      const response = await fetch(`/api/topics/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTopic),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '토론 주제 수정에 실패했습니다.');
      }
      
      alert('토론 주제가 성공적으로 수정되었습니다.');
      router.push(`/topics/${params.id}`);
    } catch (err: any) {
      console.error('토론 주제 수정 오류:', err);
      alert(err.message || '토론 주제 수정 중 오류가 발생했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 배열 필드 관리 함수
  const handleAddItem = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    value: string = ''
  ) => {
    if (array.length < 10) {
      setArray([...array, value]);
    }
  };

  const handleRemoveItem = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    index: number
  ) => {
    if (array.length > 1) {
      setArray(array.filter((_, i) => i !== index));
    }
  };

  const handleUpdateItem = (
    array: string[],
    setArray: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setArray(newArray);
  };

  // 주제 관리 함수
  const handleAddSubject = () => {
    if (newSubject.trim() && subjects.length < 10) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleRemoveSubject = (index: number) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">토론 주제 수정</h1>
      
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        {/* 기본 정보 섹션 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">기본 정보</h2>
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="토론 주제 제목을 입력하세요"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="grade" className="block text-gray-700 text-sm font-bold mb-2">
              대상 학년 <span className="text-red-500">*</span>
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="">학년을 선택하세요</option>
              <option value="초등 저학년">초등 저학년 (1-3학년)</option>
              <option value="초등 고학년">초등 고학년 (4-6학년)</option>
              <option value="중학교">중학교</option>
              <option value="고등학교">고등학교</option>
            </select>
          </div>
          
          {/* 관련 과목 */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              관련 과목 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {subjects.map((subject, index) => (
                <div key={index} className="flex items-center bg-blue-100 rounded-full px-3 py-1">
                  <span className="text-sm">{subject}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(index)}
                    className="ml-2 text-red-500 hover:text-red-700"
                  >
                    <XCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="과목 추가 (예: 사회, 과학, 국어 등)"
              />
              <button
                type="button"
                onClick={handleAddSubject}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r"
                disabled={subjects.length >= 10}
              >
                추가
              </button>
            </div>
            {subjects.length >= 10 && (
              <p className="text-sm text-red-500 mt-1">최대 10개의 과목만 추가할 수 있습니다.</p>
            )}
          </div>
        </div>
        
        {/* 배경 정보 섹션 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">배경 정보</h2>
          
          <div className="mb-4">
            <label htmlFor="background" className="block text-gray-700 text-sm font-bold mb-2">
              배경 정보 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="background"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={5}
              placeholder="토론 주제의 배경 정보를 입력하세요"
              required
            />
          </div>
        </div>
        
        {/* 논점 섹션 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">논점</h2>
          
          {/* 찬성측 논점 */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              찬성측 논점 <span className="text-red-500">*</span>
            </label>
            {proArguments.map((argument, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={argument}
                  onChange={(e) => handleUpdateItem(proArguments, setProArguments, index, e.target.value)}
                  className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={`찬성측 논점 ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(proArguments, setProArguments, index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-r"
                  disabled={proArguments.length <= 1}
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem(proArguments, setProArguments)}
              className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
              disabled={proArguments.length >= 10}
            >
              찬성측 논점 추가
            </button>
            {proArguments.length >= 10 && (
              <p className="text-sm text-red-500 mt-1">최대 10개의 논점만 추가할 수 있습니다.</p>
            )}
          </div>
          
          {/* 반대측 논점 */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              반대측 논점 <span className="text-red-500">*</span>
            </label>
            {conArguments.map((argument, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={argument}
                  onChange={(e) => handleUpdateItem(conArguments, setConArguments, index, e.target.value)}
                  className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={`반대측 논점 ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(conArguments, setConArguments, index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-r"
                  disabled={conArguments.length <= 1}
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem(conArguments, setConArguments)}
              className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
              disabled={conArguments.length >= 10}
            >
              반대측 논점 추가
            </button>
            {conArguments.length >= 10 && (
              <p className="text-sm text-red-500 mt-1">최대 10개의 논점만 추가할 수 있습니다.</p>
            )}
          </div>
        </div>
        
        {/* 교사 지원 섹션 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 border-b pb-2">교사 지원</h2>
          
          <div className="mb-6">
            <label htmlFor="teacherTips" className="block text-gray-700 text-sm font-bold mb-2">
              교사 팁
            </label>
            <textarea
              id="teacherTips"
              value={teacherTips}
              onChange={(e) => setTeacherTips(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={4}
              placeholder="토론 진행시 교사를 위한 팁을 입력하세요"
            />
          </div>
          
          {/* 핵심 질문 */}
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              핵심 질문 <span className="text-red-500">*</span>
            </label>
            {keyQuestions.map((question, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => handleUpdateItem(keyQuestions, setKeyQuestions, index, e.target.value)}
                  className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={`핵심 질문 ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(keyQuestions, setKeyQuestions, index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-r"
                  disabled={keyQuestions.length <= 1}
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem(keyQuestions, setKeyQuestions)}
              className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
              disabled={keyQuestions.length >= 10}
            >
              핵심 질문 추가
            </button>
            {keyQuestions.length >= 10 && (
              <p className="text-sm text-red-500 mt-1">최대 10개의 질문만 추가할 수 있습니다.</p>
            )}
          </div>
          
          {/* 기대 학습 성과 */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              기대 학습 성과 <span className="text-red-500">*</span>
            </label>
            {expectedOutcomes.map((outcome, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => handleUpdateItem(expectedOutcomes, setExpectedOutcomes, index, e.target.value)}
                  className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder={`기대 학습 성과 ${index + 1}`}
                  required
                />
                <button
                  type="button"
                  onClick={() => handleRemoveItem(expectedOutcomes, setExpectedOutcomes, index)}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-r"
                  disabled={expectedOutcomes.length <= 1}
                >
                  삭제
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => handleAddItem(expectedOutcomes, setExpectedOutcomes)}
              className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full"
              disabled={expectedOutcomes.length >= 10}
            >
              기대 학습 성과 추가
            </button>
            {expectedOutcomes.length >= 10 && (
              <p className="text-sm text-red-500 mt-1">최대 10개의 학습 성과만 추가할 수 있습니다.</p>
            )}
          </div>
        </div>
        
        {/* 제출 버튼 */}
        <div className="flex justify-between">
          <Link href={`/topics/${params.id}`} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded">
            취소
          </Link>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
            disabled={isSaving}
          >
            {isSaving ? (
              <span className="flex items-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                저장 중...
              </span>
            ) : (
              '수정 완료'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}