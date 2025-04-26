'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
  
  // URL 쿼리에서 주제 가져오기
  useEffect(() => {
    // URLSearchParams를 사용하여 쿼리 파라미터 가져오기
    const queryParams = new URLSearchParams(window.location.search);
    const topicFromQuery = queryParams.get('topic');
    
    if (topicFromQuery) {
      setFormData(prev => ({
        ...prev,
        title: topicFromQuery,
        topic: topicFromQuery
      }));
    }
  }, []);
  
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
        console.log("AI 생성 콘텐츠 추가:", formData.scenarioDetails);
        newScenario.aiGenerated = true;
        newScenario.scenarioDetails = formData.scenarioDetails;
      }
      
      // 추가 필드 복사
      newScenario.grade = formData.grade;
      newScenario.subject = formData.subject;
      newScenario.topic = formData.topic;
      newScenario.keywords = formData.keywords;
      
      console.log("저장할 시나리오:", {
        ...newScenario,
        scenarioDetails: newScenario.scenarioDetails ? '(AI 생성 콘텐츠 포함)' : '없음'
      });
      
      // saveScenario 유틸리티 함수 호출 (로컬 및 서버 저장)
      const saveResult = await saveScenario(newScenario);
      
      // 저장 결과에 따른 메시지 표시
      if (saveResult.localSuccess) {
        if (saveResult.serverSuccess) {
          alert("시나리오가 성공적으로 저장되었습니다. (로컬 저장소 및 서버)");
        } else {
          console.error("서버 저장 실패 - 로컬에만 저장됨");
          alert("시나리오가 로컬에 저장되었습니다. 서버 저장에 실패했습니다.\n\n가능한 원인:\n1. 서버 연결 문제\n2. MongoDB 연결 문제\n3. 데이터 유효성 검사 실패");
        }
        
        // 시나리오 메인 페이지로 이동
        router.push('/scenarios');
      } else {
        alert("시나리오 저장에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error('시나리오 저장 오류:', error);
      alert('시나리오를 저장하는 중 오류가 발생했습니다: ' + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto p-6">
        <Link href="/scenarios" className="lovable-btn-secondary inline-flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          시나리오 목록으로
        </Link>
        
        <h1 className="section-title text-3xl font-bold mb-6" style={{ color: 'var(--color-text)' }}>새 토론 시나리오 생성</h1>
        <p className="text-gray-600 mt-2">학년, 교과, 주제에 맞는 맞춤형 토론 시나리오를 생성합니다.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* 입력 폼 */}
        <div className="md:col-span-1">
          <div className="lovable-card p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
              시나리오 기본 정보
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  토론 주제 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="예: 초등학생의 SNS 사용은 제한해야 한다"
                  style={{ borderColor: 'rgba(238, 92, 92, 0.3)', outline: 'none' }}
                  required
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  학년
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  style={{ borderColor: 'rgba(238, 92, 92, 0.3)', outline: 'none' }}
                >
                  {gradeOptions.map(grade => (
                    <option key={grade} value={grade}>{grade || '학년 선택 (선택사항)'}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  교과
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  style={{ borderColor: 'rgba(238, 92, 92, 0.3)', outline: 'none' }}
                >
                  {subjectOptions.map(subject => (
                    <option key={subject} value={subject}>{subject || '교과 선택 (선택사항)'}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  토론 시간 <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="totalDurationMinutes"
                  value={formData.totalDurationMinutes}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="토론 총 시간(분)"
                  min="10"
                  style={{ borderColor: 'rgba(238, 92, 92, 0.3)', outline: 'none' }}
                  required
                />
                {errors.totalDurationMinutes && (
                  <p className="text-red-500 text-sm mt-1">{errors.totalDurationMinutes}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  모둠 수
                </label>
                <input
                  type="number"
                  name="groupCount"
                  value={formData.groupCount || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="모둠 수 (선택사항)"
                  min="2"
                  style={{ borderColor: 'rgba(238, 92, 92, 0.3)', outline: 'none' }}
                />
              </div>
              
              <div className="flex items-center pt-3">
                <input
                  type="checkbox"
                  id="saveToServer"
                  name="saveToServer"
                  checked={saveToServer}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <label htmlFor="saveToServer" className="ml-2 text-sm text-gray-700">
                  서버에 시나리오 저장하기
                </label>
              </div>
              
              <div className="pt-3 flex space-x-2">
                <button
                  type="button"
                  onClick={generateWithAI}
                  disabled={isGenerating}
                  className="lovable-btn-secondary px-4 py-2 flex-1"
                >
                  {isGenerating ? 'AI 생성 중...' : 'AI로 시나리오 생성하기'}
                </button>
                
                <button
                  type="submit"
                  className="lovable-btn-primary px-4 py-2 flex-1"
                >
                  시나리오 만들기
                </button>
              </div>
              
              {aiGenerationStatus === 'success' && (
                <div className="bg-green-50 text-green-700 p-3 rounded-md mt-4" style={{ borderLeft: '3px solid var(--color-primary)' }}>
                  AI가 시나리오를 생성했습니다! '시나리오 만들기' 버튼을 클릭하여 진행하세요.
                </div>
              )}
              
              {aiGenerationStatus === 'error' && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md mt-4" style={{ borderLeft: '3px solid var(--color-primary)' }}>
                  AI 생성 중 오류가 발생했습니다. 다시 시도해주세요.
                </div>
              )}
            </form>
          </div>
          
          <div className="lovable-card p-6 mt-6">
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-primary)' }}>사용 안내</h3>
            <ul className="lovable-list space-y-2">
              <li>토론 주제와 시간은 필수 입력 항목입니다.</li>
              <li>AI 생성 기능을 사용하면 주제에 맞는 완성된 시나리오를 자동으로 만들어줍니다.</li>
              <li>서버에 저장하면 다음에도 동일한 시나리오를 사용할 수 있습니다.</li>
            </ul>
          </div>
        </div>
        
        {/* 예시 및 추천 주제 */}
        <div className="md:col-span-2">
          <div className="lovable-card p-6" style={{ backgroundColor: 'var(--color-accent)' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
              추천 토론 주제
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sampleTopics.slice(0, 6).map((topic, index) => (
                <div 
                  key={index}
                  className="bg-white p-3 rounded-md cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setFormData({ ...formData, title: topic })}
                  style={{ borderLeft: '3px solid var(--color-primary)' }}
                >
                  <p>{topic}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6">
              <Link href="/topics/ai-topics" className="lovable-btn-primary py-2 px-4 inline-flex items-center">
                AI로 새로운 토론 주제 찾기
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
          
          <div className="lovable-card p-6 mt-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--color-primary)' }}>
              토론 시나리오란?
            </h2>
            
            <p className="text-gray-700 mb-4">
              토론 시나리오는 교사가 토론 수업을 체계적으로 진행할 수 있도록 돕는 안내서입니다. 
              토론의 주제, 배경 지식, 진행 단계, 활동 내용 등을 포함하고 있습니다.
            </p>
            
            <h3 className="text-lg font-semibold mt-4 mb-2" style={{ color: 'var(--color-primary)' }}>
              시나리오 구성 요소
            </h3>
            
            <ul className="lovable-list space-y-2">
              <li><strong>토론 주제:</strong> 학생들이 찬반 의견을 나눌 수 있는 논제입니다.</li>
              <li><strong>토론 단계:</strong> '다름과 마주하기', '다름을 이해하기', '다름과 공존하기' 3단계로 구성됩니다.</li>
              <li><strong>활동 내용:</strong> 각 단계별 세부 활동과 교사 가이드를 제공합니다.</li>
              <li><strong>시간 안내:</strong> 각 활동별 권장 소요 시간을 안내합니다.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 