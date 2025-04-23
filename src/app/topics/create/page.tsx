'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateTopicPage() {
  const router = useRouter();
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 동적으로 관리할 인풋 필드
  const [proArguments, setProArguments] = useState<string[]>(['']);
  const [conArguments, setConArguments] = useState<string[]>(['']);
  const [expectedOutcomes, setExpectedOutcomes] = useState<string[]>(['']);
  const [keyQuestions, setKeyQuestions] = useState<string[]>(['']);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');

  // 동적 필드 관리 함수들
  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>, values: string[]) => {
    setter([...values, '']);
  };

  const removeField = (setter: React.Dispatch<React.SetStateAction<string[]>>, values: string[], index: number) => {
    if (values.length > 1) {
      setter(values.filter((_, i) => i !== index));
    }
  };

  const updateField = (setter: React.Dispatch<React.SetStateAction<string[]>>, values: string[], index: number, value: string) => {
    setter(values.map((item, i) => i === index ? value : item));
  };

  const addSubject = () => {
    if (newSubject.trim() && !subjects.includes(newSubject.trim())) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    setSubjects(subjects.filter(subject => subject !== subjectToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError(null);
      
      const response = await fetch('/api/topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: e.target.title.value,
          background: e.target.background.value,
          proArguments,
          conArguments,
          teacherTips: e.target.teacherTips.value,
          keyQuestions,
          expectedOutcomes,
          subjects
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '토론 주제 생성에 실패했습니다.');
      }
      
      const topic = await response.json();
      alert('토론 주제가 성공적으로 생성되었습니다!');
      router.push('/topics');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/topics" className="text-blue-500 hover:text-blue-700">
          ← 토론 주제 목록으로 돌아가기
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold mb-4">새 토론 주제 만들기</h1>
        </div>

        {error && (
          <div className="mx-6 mt-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
              <p className="font-bold">오류</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6">
          {/* 기본 정보 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
            
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                주제 제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 우리나라를 지키기 위한 전쟁, 어떤 경우에도 정당화될 수 있을까?"
              />
            </div>
            
            {/* 교과 선택 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                관련 교과
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {subjects.map((subject, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                    <span>{subject}</span>
                    <button 
                      type="button"
                      onClick={() => removeSubject(subject)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
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
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="교과 추가 (예: 도덕, 사회)"
                />
                <button
                  type="button"
                  onClick={addSubject}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600"
                >
                  추가
                </button>
              </div>
            </div>
            
            {/* 학년 선택 */}
            <div className="mb-4">
              <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">
                대상 학년 <span className="text-red-500">*</span>
              </label>
              <select
                id="grade"
                name="grade"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">학년을 선택하세요</option>
                <option value="초등학교 저학년(1-3학년)">초등학교 저학년(1-3학년)</option>
                <option value="초등학교 고학년(4-6학년)">초등학교 고학년(4-6학년)</option>
                <option value="중학교">중학교</option>
                <option value="고등학교">고등학교</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                작성자
              </label>
              <input
                type="text"
                id="author"
                name="author"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="예: 김교사"
              />
            </div>
          </section>
          
          {/* 배경 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">배경</h2>
            <textarea
              id="background"
              name="background"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="토론 주제의 배경과 맥락을 설명해주세요"
            />
          </section>
          
          {/* 찬성/반대 논점 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">주요 논점 <span className="text-red-500">*</span></h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 찬성 논점 */}
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="text-lg font-medium text-green-800 mb-2">
                  찬성 측 논점
                </h3>
                
                {proArguments.map((arg, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={arg}
                      onChange={(e) => updateField(setProArguments, proArguments, index, e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="찬성 측 논점을 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={() => removeField(setProArguments, proArguments, index)}
                      className="bg-red-500 text-white px-3 py-2 rounded-r-md hover:bg-red-600"
                      disabled={proArguments.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addField(setProArguments, proArguments)}
                  className="bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 w-full mt-2"
                >
                  + 찬성 논점 추가
                </button>
              </div>
              
              {/* 반대 논점 */}
              <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                <h3 className="text-lg font-medium text-red-800 mb-2">
                  반대 측 논점
                </h3>
                
                {conArguments.map((arg, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={arg}
                      onChange={(e) => updateField(setConArguments, conArguments, index, e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="반대 측 논점을 입력하세요"
                    />
                    <button
                      type="button"
                      onClick={() => removeField(setConArguments, conArguments, index)}
                      className="bg-red-500 text-white px-3 py-2 rounded-r-md hover:bg-red-600"
                      disabled={conArguments.length <= 1}
                    >
                      ×
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => addField(setConArguments, conArguments)}
                  className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 w-full mt-2"
                >
                  + 반대 논점 추가
                </button>
              </div>
            </div>
          </section>
          
          {/* 교사용 팁 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">교사용 팁</h2>
            <textarea
              id="teacherTips"
              name="teacherTips"
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="교사가 토론을 진행할 때 참고할 수 있는 팁을 작성해주세요"
            />
          </section>
          
          {/* 핵심 질문 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">핵심 질문</h2>
            
            {keyQuestions.map((question, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => updateField(setKeyQuestions, keyQuestions, index, e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="토론 중 학생들에게 던질 수 있는 핵심 질문"
                />
                <button
                  type="button"
                  onClick={() => removeField(setKeyQuestions, keyQuestions, index)}
                  className="bg-red-500 text-white px-3 py-2 rounded-r-md hover:bg-red-600"
                  disabled={keyQuestions.length <= 1}
                >
                  ×
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addField(setKeyQuestions, keyQuestions)}
              className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 w-full mt-2"
            >
              + 핵심 질문 추가
            </button>
          </section>
          
          {/* 기대 성과 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">기대 성과</h2>
            
            {expectedOutcomes.map((outcome, index) => (
              <div key={index} className="flex mb-2">
                <input
                  type="text"
                  value={outcome}
                  onChange={(e) => updateField(setExpectedOutcomes, expectedOutcomes, index, e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="토론을 통해 기대할 수 있는 학습 성과"
                />
                <button
                  type="button"
                  onClick={() => removeField(setExpectedOutcomes, expectedOutcomes, index)}
                  className="bg-red-500 text-white px-3 py-2 rounded-r-md hover:bg-red-600"
                  disabled={expectedOutcomes.length <= 1}
                >
                  ×
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={() => addField(setExpectedOutcomes, expectedOutcomes)}
              className="bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 w-full mt-2"
            >
              + 기대 성과 추가
            </button>
          </section>
          
          {/* 버튼 그룹 */}
          <div className="flex justify-end gap-4">
            <Link
              href="/topics"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSaving && <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>}
              {isSaving ? '생성 중...' : '주제 생성하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 