'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateTopicPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState('');
  const [grade, setGrade] = useState('');
  const [proArguments, setProArguments] = useState<string[]>(['']);
  const [conArguments, setConArguments] = useState<string[]>(['']);
  const [teacherTips, setTeacherTips] = useState('');
  const [expectedOutcomes, setExpectedOutcomes] = useState<string[]>(['']);
  const [keyQuestions, setKeyQuestions] = useState<string[]>(['']);
  const [subjects, setSubjects] = useState<string[]>(['']);
  const [newSubject, setNewSubject] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 입력 필드 배열에 항목 추가
  const addField = (field: 'pro' | 'con' | 'outcomes' | 'questions' | 'subjects') => {
    switch (field) {
      case 'pro':
        setProArguments([...proArguments, '']);
        break;
      case 'con':
        setConArguments([...conArguments, '']);
        break;
      case 'outcomes':
        setExpectedOutcomes([...expectedOutcomes, '']);
        break;
      case 'questions':
        setKeyQuestions([...keyQuestions, '']);
        break;
      case 'subjects':
        if (newSubject.trim()) {
          setSubjects([...subjects, newSubject.trim()]);
          setNewSubject('');
        }
        break;
    }
  };

  // 입력 필드 배열에서 항목 제거
  const removeField = (field: 'pro' | 'con' | 'outcomes' | 'questions' | 'subjects', index: number) => {
    switch (field) {
      case 'pro':
        if (proArguments.length > 1) {
          setProArguments(proArguments.filter((_, i) => i !== index));
        }
        break;
      case 'con':
        if (conArguments.length > 1) {
          setConArguments(conArguments.filter((_, i) => i !== index));
        }
        break;
      case 'outcomes':
        if (expectedOutcomes.length > 1) {
          setExpectedOutcomes(expectedOutcomes.filter((_, i) => i !== index));
        }
        break;
      case 'questions':
        if (keyQuestions.length > 1) {
          setKeyQuestions(keyQuestions.filter((_, i) => i !== index));
        }
        break;
      case 'subjects':
        setSubjects(subjects.filter((_, i) => i !== index));
        break;
    }
  };

  // 입력 필드 배열의 항목 업데이트
  const updateField = (field: 'pro' | 'con' | 'outcomes' | 'questions', index: number, value: string) => {
    switch (field) {
      case 'pro':
        const newProArgs = [...proArguments];
        newProArgs[index] = value;
        setProArguments(newProArgs);
        break;
      case 'con':
        const newConArgs = [...conArguments];
        newConArgs[index] = value;
        setConArguments(newConArgs);
        break;
      case 'outcomes':
        const newOutcomes = [...expectedOutcomes];
        newOutcomes[index] = value;
        setExpectedOutcomes(newOutcomes);
        break;
      case 'questions':
        const newQuestions = [...keyQuestions];
        newQuestions[index] = value;
        setKeyQuestions(newQuestions);
        break;
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    // 오류 초기화
    const newErrors: Record<string, string> = {};
    
    // 필수 필드 검증
    if (!title.trim()) newErrors.title = '제목은 필수 입력 항목입니다.';
    if (!background.trim()) newErrors.background = '배경 정보는 필수 입력 항목입니다.';
    if (!grade.trim()) newErrors.grade = '학년군은 필수 선택 항목입니다.';
    if (!teacherTips.trim()) newErrors.teacherTips = '교사 팁은 필수 입력 항목입니다.';
    
    // 배열 필드 검증
    const filteredProArgs = proArguments.filter(item => item.trim() !== '');
    const filteredConArgs = conArguments.filter(item => item.trim() !== '');
    const filteredOutcomes = expectedOutcomes.filter(item => item.trim() !== '');
    const filteredQuestions = keyQuestions.filter(item => item.trim() !== '');
    
    if (filteredProArgs.length === 0) newErrors.proArguments = '찬성 주장은 최소 하나 이상 입력해야 합니다.';
    if (filteredConArgs.length === 0) newErrors.conArguments = '반대 주장은 최소 하나 이상 입력해야 합니다.';
    if (filteredOutcomes.length === 0) newErrors.expectedOutcomes = '예상 결과는 최소 하나 이상 입력해야 합니다.';
    if (filteredQuestions.length === 0) newErrors.keyQuestions = '핵심 질문은 최소 하나 이상 입력해야 합니다.';
    if (subjects.length === 0) newErrors.subjects = '관련 교과는 최소 하나 이상 입력해야 합니다.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      // 새 토론 주제 객체 생성
      const newTopic = {
        title: title.trim(),
        background: background.trim(),
        grade,
        proArguments: filteredProArgs,
        conArguments: filteredConArgs,
        teacherTips: teacherTips.trim(),
        expectedOutcomes: filteredOutcomes,
        keyQuestions: filteredQuestions,
        subjects: subjects.filter(s => s.trim() !== '')
      };
      
      // API 호출
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTopic),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || '토론 주제를 생성하는데 실패했습니다.');
      }
      
      // 생성 성공 시 목록 페이지로 이동
      router.push('/topics');
      
    } catch (error: any) {
      console.error('토론 주제 생성 오류:', error);
      setSubmitError(error.message || '토론 주제를 생성하는 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">토론 주제 생성</h1>
        <Link href="/topics">
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">
            목록으로 돌아가기
          </button>
        </Link>
      </div>

      {submitError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-red-700">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* 기본 정보 섹션 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">기본 정보</h2>
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="토론 주제를 입력하세요 (예: 인공지능 기술은 학교 교육에 도입되어야 하는가?)"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="grade" className="block text-sm font-medium mb-1">
              대상 학년군 <span className="text-red-500">*</span>
            </label>
            <select
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.grade ? 'border-red-500' : 'border-gray-300'}`}
            >
              <option value="">학년군을 선택하세요</option>
              <option value="초등학교 저학년(1-3학년)">초등학교 저학년(1-3학년)</option>
              <option value="초등학교 고학년(4-6학년)">초등학교 고학년(4-6학년)</option>
              <option value="중학교(1-3학년)">중학교(1-3학년)</option>
              <option value="고등학교(1-3학년)">고등학교(1-3학년)</option>
            </select>
            {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              관련 교과 <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {subjects.map((subject, index) => (
                <div key={index} className="bg-blue-100 px-3 py-1 rounded-full flex items-center">
                  <span>{subject}</span>
                  <button
                    type="button"
                    onClick={() => removeField('subjects', index)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div className="flex">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className={`flex-grow p-2 border rounded-l-md ${errors.subjects ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="교과 입력 (예: 사회, 도덕, 국어 등)"
              />
              <button
                type="button"
                onClick={() => addField('subjects')}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
              >
                추가
              </button>
            </div>
            {errors.subjects && <p className="text-red-500 text-sm mt-1">{errors.subjects}</p>}
          </div>
        </div>
        
        {/* 배경 정보 섹션 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">배경 정보</h2>
          
          <div className="mb-4">
            <label htmlFor="background" className="block text-sm font-medium mb-1">
              토론 배경 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="background"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.background ? 'border-red-500' : 'border-gray-300'} min-h-[150px]`}
              placeholder="이 토론의 배경이 되는 상황이나 맥락을 설명해주세요."
            />
            {errors.background && <p className="text-red-500 text-sm mt-1">{errors.background}</p>}
          </div>
        </div>
        
        {/* 찬반 논쟁 섹션 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">찬반 논쟁</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              찬성 주장 <span className="text-red-500">*</span>
            </label>
            {proArguments.map((argument, index) => (
              <div key={index} className="flex mb-2">
                <textarea
                  value={argument}
                  onChange={(e) => updateField('pro', index, e.target.value)}
                  className={`flex-grow p-2 border rounded-l-md ${errors.proArguments ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="찬성 측 주장을 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => removeField('pro', index)}
                  disabled={proArguments.length <= 1}
                  className={`px-3 bg-red-500 text-white ${proArguments.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField('pro')}
              className="mt-2 px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              + 찬성 주장 추가
            </button>
            {errors.proArguments && <p className="text-red-500 text-sm mt-1">{errors.proArguments}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              반대 주장 <span className="text-red-500">*</span>
            </label>
            {conArguments.map((argument, index) => (
              <div key={index} className="flex mb-2">
                <textarea
                  value={argument}
                  onChange={(e) => updateField('con', index, e.target.value)}
                  className={`flex-grow p-2 border rounded-l-md ${errors.conArguments ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="반대 측 주장을 입력하세요"
                />
                <button
                  type="button"
                  onClick={() => removeField('con', index)}
                  disabled={conArguments.length <= 1}
                  className={`px-3 bg-red-500 text-white ${conArguments.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField('con')}
              className="mt-2 px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              + 반대 주장 추가
            </button>
            {errors.conArguments && <p className="text-red-500 text-sm mt-1">{errors.conArguments}</p>}
          </div>
        </div>
        
        {/* 교사 지도 팁 섹션 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">교사 지도 팁</h2>
          
          <div className="mb-4">
            <label htmlFor="teacherTips" className="block text-sm font-medium mb-1">
              교사 지도 노트 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="teacherTips"
              value={teacherTips}
              onChange={(e) => setTeacherTips(e.target.value)}
              className={`w-full p-2 border rounded-md ${errors.teacherTips ? 'border-red-500' : 'border-gray-300'} min-h-[150px]`}
              placeholder="교사를 위한 지도 팁과 조언을 입력하세요."
            />
            {errors.teacherTips && <p className="text-red-500 text-sm mt-1">{errors.teacherTips}</p>}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              핵심 질문 <span className="text-red-500">*</span>
            </label>
            {keyQuestions.map((question, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => updateField('questions', index, e.target.value)}
                  className={`flex-grow p-2 border rounded-l-md ${errors.keyQuestions ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="토론 중 학생들에게 던질 수 있는 핵심 질문"
                />
                <button
                  type="button"
                  onClick={() => removeField('questions', index)}
                  disabled={keyQuestions.length <= 1}
                  className={`px-3 bg-red-500 text-white ${keyQuestions.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField('questions')}
              className="mt-2 px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              + 질문 추가
            </button>
            {errors.keyQuestions && <p className="text-red-500 text-sm mt-1">{errors.keyQuestions}</p>}
          </div>
        </div>
        
        {/* 기대 결과 섹션 */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">기대 학습 결과</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              기대 학습 성과 <span className="text-red-500">*</span>
            </label>
            {expectedOutcomes.map((outcome, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => updateField('outcomes', index, e.target.value)}
                  className={`flex-grow p-2 border rounded-l-md ${errors.expectedOutcomes ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="이 토론을 통해 학생들이 얻을 수 있는 학습 성과"
                />
                <button
                  type="button"
                  onClick={() => removeField('outcomes', index)}
                  disabled={expectedOutcomes.length <= 1}
                  className={`px-3 bg-red-500 text-white ${expectedOutcomes.length <= 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                >
                  -
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addField('outcomes')}
              className="mt-2 px-4 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm"
            >
              + 결과 추가
            </button>
            {errors.expectedOutcomes && <p className="text-red-500 text-sm mt-1">{errors.expectedOutcomes}</p>}
          </div>
        </div>
        
        {/* 제출 버튼 */}
        <div className="flex justify-between">
          <Link href="/topics">
            <button type="button" className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400">
              취소
            </button>
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="inline-block mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                저장 중...
              </>
            ) : '토론 주제 저장'}
          </button>
        </div>
      </form>
    </div>
  );
} 