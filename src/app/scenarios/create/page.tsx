'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ScenarioFormData } from '@/types/scenario';
import { createNewScenario, saveScenario } from '@/utils/scenarioUtils';

// 샘플 토론 주제 목록
const sampleTopics = [
  '초등학교에 휴대폰을 가지고 와야 한다',
  '초등학생의 SNS 사용은 제한해야 한다',
  '급식에 채식 메뉴가 더 많아져야 한다',
  '학교에서 교복을 입어야 한다',
  '학생들에게 일정 금액의 용돈이 필요하다',
  '반려동물은 공동주택에서 키워도 된다',
  '학교에서 영어 과목은 필수여야 한다',
  '초등학생에게 숙제를 내야 한다',
  '쓰레기 종량제는 필요하다',
  '일회용 비닐봉지는 사용을 금지해야 한다'
];

// 학년 옵션
const gradeOptions = [
  '',
  '1-2학년',
  '3-4학년',
  '5-6학년',
  '1학년',
  '2학년',
  '3학년',
  '4학년',
  '5학년',
  '6학년'
];

// 교과 옵션
const subjectOptions = [
  '',
  '국어',
  '사회',
  '과학',
  '도덕',
  '실과',
  '체육',
  '미술',
  '음악',
  '창의적 체험활동'
];

export default function CreateScenarioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ScenarioFormData & { scenarioDetails?: any }>({
    title: '',
    totalDurationMinutes: 90,
    groupCount: undefined,
    grade: '',
    subject: ''
  });
  
  const [errors, setErrors] = useState<{
    title?: string;
    totalDurationMinutes?: string;
  }>({});
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGenerationStatus, setAiGenerationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [saveToServer, setSaveToServer] = useState(false);
  
  // 입력값 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // 숫자 필드인 경우 숫자로 변환
    if (name === 'totalDurationMinutes' || name === 'groupCount') {
      const numValue = parseInt(value);
      setFormData({
        ...formData,
        [name]: isNaN(numValue) ? '' : numValue
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // 체크박스 변경 처리
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSaveToServer(checked);
  };
  
  // AI로 시나리오 주제 생성
  const generateWithAI = async () => {
    setIsGenerating(true);
    setAiGenerationStatus('loading');
    
    try {
      // 사용자가 입력한 주제 또는 랜덤 주제 사용
      const topic = formData.title || sampleTopics[Math.floor(Math.random() * sampleTopics.length)];
      
      // API 호출
      const response = await fetch('/api/generate-scenario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          topic,
          grade: formData.grade || undefined,
          subject: formData.subject || undefined
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API 응답 오류: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success && result.error) {
        throw new Error(result.error);
      }
      
      // 랜덤한 토론 시간 (60~120분)
      const randomTime = Math.floor(Math.random() * 61) + 60;
      
      // 랜덤한 모둠 수 (2~6)
      const randomGroups = Math.floor(Math.random() * 5) + 2;
      
      // 폼 데이터 업데이트
      setFormData({
        title: result.data.title || topic,
        topic: result.data.topic,
        totalDurationMinutes: randomTime,
        groupCount: randomGroups,
        grade: result.data.grade || formData.grade,
        subject: Array.isArray(result.data.subject) ? result.data.subject.join(', ') : result.data.subject || formData.subject,
        keywords: result.data.keywords,
        scenarioDetails: result.data,
        aiGenerated: true
      });
      
      setAiGenerationStatus('success');
    } catch (error) {
      console.error('AI 생성 오류:', error);
      setAiGenerationStatus('error');
      alert('AI 시나리오 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    const newErrors: typeof errors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '토론 주제를 입력해주세요.';
    }
    
    if (!formData.totalDurationMinutes || formData.totalDurationMinutes < 10) {
      newErrors.totalDurationMinutes = '10분 이상의 시간을 입력해주세요.';
    }
    
    // 오류가 있으면 제출 중단
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // 새 시나리오 생성
      const newScenario = createNewScenario(formData);
      
      // AI 생성 정보 추가
      if (formData.scenarioDetails) {
        newScenario.aiGenerated = true;
        newScenario.scenarioDetails = formData.scenarioDetails;
      }
      
      // 추가 필드 복사
      newScenario.grade = formData.grade;
      newScenario.subject = formData.subject;
      newScenario.topic = formData.topic;
      newScenario.keywords = formData.keywords;
      
      // saveScenario 유틸리티 함수 호출 (로컬 및 서버 저장)
      const saveResult = await saveScenario(newScenario);
      
      // 저장 결과에 따른 메시지 표시
      if (saveResult.localSuccess) {
        if (saveResult.serverSuccess) {
          alert("시나리오가 성공적으로 저장되었습니다. (로컬 저장소 및 서버)");
        } else {
          alert("시나리오가 로컬에 저장되었습니다. 서버 저장에 실패했습니다.");
        }
        
        // 시나리오 메인 페이지로 이동
        router.push('/scenarios');
      } else {
        alert("시나리오 저장에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error('시나리오 저장 오류:', error);
      alert('시나리오를 저장하는 중 오류가 발생했습니다.');
    }
  };
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">새 토론 시나리오 만들기</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <div className="mb-6 flex justify-end">
          <button
            type="button"
            onClick={generateWithAI}
            disabled={isGenerating}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-300"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI가 생성 중...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI로 자동 생성
              </>
            )}
          </button>
        </div>
        
        {/* AI 생성 상태 표시 */}
        {aiGenerationStatus === 'success' && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md text-green-700">
            AI가 생성한 시나리오가 적용되었습니다. 내용을 검토하고 필요시 수정해주세요.
          </div>
        )}
        
        {aiGenerationStatus === 'error' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            AI 시나리오 생성 중 오류가 발생했습니다. 다시 시도해주세요.
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
              토론 주제
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="예: 초등학교에 휴대폰을 가지고 와야 한다"
              className={`w-full p-3 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="grade" className="block text-gray-700 font-medium mb-2">
                대상 학년
              </label>
              <select
                id="grade"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">학년 선택 (선택사항)</option>
                {gradeOptions.filter(grade => grade).map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                관련 교과
              </label>
              <select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md"
              >
                <option value="">교과 선택 (선택사항)</option>
                {subjectOptions.filter(subject => subject).map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label htmlFor="totalDurationMinutes" className="block text-gray-700 font-medium mb-2">
              총 토론 시간 (분)
            </label>
            <input
              type="number"
              id="totalDurationMinutes"
              name="totalDurationMinutes"
              value={formData.totalDurationMinutes || ''}
              onChange={handleChange}
              min="10"
              max="300"
              className={`w-full p-3 border rounded-md ${errors.totalDurationMinutes ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.totalDurationMinutes && <p className="text-red-500 text-sm mt-1">{errors.totalDurationMinutes}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="groupCount" className="block text-gray-700 font-medium mb-2">
              모둠 수 (선택사항)
            </label>
            <input
              type="number"
              id="groupCount"
              name="groupCount"
              value={formData.groupCount || ''}
              onChange={handleChange}
              min="2"
              max="10"
              placeholder="모둠 수를 입력하세요"
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>
          
          {/* 키워드 표시 (AI 생성 후) */}
          {formData.keywords && formData.keywords.length > 0 && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                키워드
              </label>
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* 기대 학습 성과 표시 (AI 생성 후) */}
          {formData.scenarioDetails?.expectedOutcomes && formData.scenarioDetails.expectedOutcomes.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <h3 className="text-lg font-medium text-yellow-800 mb-2">기대 학습 성과</h3>
              <ul className="list-disc pl-5 space-y-1">
                {formData.scenarioDetails.expectedOutcomes.map((outcome: string, index: number) => (
                  <li key={index} className="text-gray-700">{outcome}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* 토론 배경 표시 (AI 생성 후) */}
          {formData.scenarioDetails?.background && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-lg font-medium text-blue-800 mb-2">토론 배경</h3>
              <p className="text-gray-700 whitespace-pre-line">{formData.scenarioDetails.background}</p>
            </div>
          )}
          
          {/* 찬성/반대 입장 표시 (AI 생성 후) */}
          {formData.scenarioDetails?.proArguments && formData.scenarioDetails?.conArguments && (
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-lg font-medium text-green-800 mb-2">찬성 입장</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {formData.scenarioDetails.proArguments.map((arg: string, index: number) => (
                    <li key={index} className="text-gray-700">{arg}</li>
                  ))}
                </ul>
              </div>
              
              <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                <h3 className="text-lg font-medium text-red-800 mb-2">반대 입장</h3>
                <ul className="list-disc pl-5 space-y-1">
                  {formData.scenarioDetails.conArguments.map((arg: string, index: number) => (
                    <li key={index} className="text-gray-700">{arg}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {/* 교사 지도 노트 표시 (AI 생성 후) */}
          {formData.scenarioDetails?.teacherTips && (
            <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-md">
              <h3 className="text-lg font-medium text-purple-800 mb-2">교사 지도 노트</h3>
              <p className="text-gray-700 whitespace-pre-line">{formData.scenarioDetails.teacherTips}</p>
            </div>
          )}
          
          {/* 핵심 질문 표시 (AI 생성 후) */}
          {formData.scenarioDetails?.keyQuestions && formData.scenarioDetails.keyQuestions.length > 0 && (
            <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-md">
              <h3 className="text-lg font-medium text-indigo-800 mb-2">핵심 질문</h3>
              <ul className="list-disc pl-5 space-y-1">
                {formData.scenarioDetails.keyQuestions.map((question: string, index: number) => (
                  <li key={index} className="text-gray-700">{question}</li>
                ))}
              </ul>
            </div>
          )}
          
          {/* 준비물 표시 (AI 생성 후) */}
          {formData.scenarioDetails?.materials && formData.scenarioDetails.materials.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="text-lg font-medium text-gray-800 mb-2">준비물</h3>
              <ul className="list-disc pl-5 space-y-1">
                {formData.scenarioDetails.materials.map((material: string, index: number) => (
                  <li key={index} className="text-gray-700">{material}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="saveToServer"
                name="saveToServer"
                checked={saveToServer}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-blue-600"
              />
              <label htmlFor="saveToServer" className="ml-2 text-gray-700">
                서버에 저장 (MongoDB)
              </label>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => router.push('/scenarios')}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              취소
            </button>
            
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              시나리오 생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 