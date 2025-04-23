'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getScenarioById, saveScenario } from '@/utils/scenarioUtils';
import { Scenario } from '@/types/scenario';

// 폼 데이터 타입 정의
interface FormData {
  title: string;
  topic: string;
  grade: string;
  subject: string;
  affirmative: string;
  negative: string;
  background: string;
  teacherNotes: string;
  materials: string;
  expectedOutcomes: string;
}

// 예시 시나리오 데이터 (실제로는 API나 데이터 스토어에서 가져옴)
const exampleScenarios: Scenario[] = [
  {
    id: '1',
    title: '기초 연금 지급 대상 확대',
    topic: '기초 연금 지급 대상 확대에 찬성한다 vs 반대한다',
    grade: '6학년',
    subject: '사회',
    totalDurationMinutes: 45,
    createdAt: new Date('2023-08-15'),
    updatedAt: new Date('2023-08-15'),
    stages: {
      stage1: { id: '1', title: '다름과 마주하기', activities: [] },
      stage2: { id: '2', title: '다름을 이해하기', activities: [] },
      stage3: { id: '3', title: '다름과 공존하기', activities: [] }
    },
    scenarioDetails: {
      background: '현재 대한민국의 기초 연금은 만 65세 이상 노인 중 소득과 재산이 일정 기준 이하인 분들에게 지급되고 있습니다. 이 제도는 노인 빈곤 문제를 해결하기 위해 도입되었지만, 지급 대상과 금액에 대한 논쟁이 계속되고 있습니다.',
      proArguments: ['기초 연금 지급 대상을 확대하면 더 많은 노인들에게 경제적 지원을 제공할 수 있다. 이는 노인 빈곤율을 낮추고 노인들의 삶의 질을 향상시키는 데 도움이 된다.'],
      conArguments: ['기초 연금 지급 대상을 확대하면 재정 부담이 커진다. 이는 미래 세대에게 더 큰 부담을 주며, 정부의 재정적 지속 가능성을 위협할 수 있다.'],
      teacherTips: '이 토론은 복지 정책의 확대와 재정적 지속 가능성 사이의 균형에 대해 학생들이 생각해볼 수 있는 기회를 제공합니다. 학생들에게 양측의 주장을 모두 이해하고, 증거에 기반한 논증을 할 수 있도록 지도하세요.',
      materials: ['정부 복지 정책 관련 자료', '노인 빈곤율 통계 자료', '국가 재정 현황 자료', '인구 고령화 추세 자료'],
      expectedOutcomes: ['복지 정책의 목적과 효과에 대한 이해', '재정적 지속 가능성의 중요성 인식', '사회적 가치와 경제적 현실 사이의 균형 고려 능력', '증거 기반 논증 능력 향상']
    }
  },
  // 다른 시나리오들은 생략...
];

// 날짜 포맷 헬퍼 함수 추가
const formatDate = (date: Date | string | undefined) => {
  if (!date) return '날짜 없음';
  
  try {
    // 문자열인 경우 Date 객체로 변환
    const dateObj = date instanceof Date ? date : new Date(date);
    
    // 유효한 날짜인지 확인
    if (isNaN(dateObj.getTime())) {
      return '날짜 형식 오류';
    }
    
    return dateObj.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch (error) {
    console.error('날짜 포맷 오류:', error);
    return '날짜 처리 오류';
  }
};

export default function ScenarioEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // 폼 상태 관리
  const [formData, setFormData] = useState<FormData>({
    title: '',
    topic: '',
    grade: '',
    subject: '',
    affirmative: '',
    negative: '',
    background: '',
    teacherNotes: '',
    materials: '',
    expectedOutcomes: ''
  });
  
  // 유효성 검사 오류 상태
  const [errors, setErrors] = useState<{
    title?: string;
    topic?: string;
    grade?: string;
    subject?: string;
  }>({});
  
  // 시나리오 데이터 로드
  useEffect(() => {
    const loadScenario = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // 1. 로컬 스토리지에서 시나리오 찾기
        const localScenario = getScenarioById(id);
        if (localScenario) {
          setScenario(localScenario);
          
          // 폼 데이터 초기화
          setFormData({
            title: localScenario.title,
            topic: localScenario.topic || '',
            grade: localScenario.grade || '',
            subject: localScenario.subject || '',
            affirmative: localScenario.scenarioDetails?.proArguments?.join('\n\n') || '',
            negative: localScenario.scenarioDetails?.conArguments?.join('\n\n') || '',
            background: localScenario.scenarioDetails?.background || '',
            teacherNotes: localScenario.scenarioDetails?.teacherTips || '',
            materials: localScenario.scenarioDetails?.materials?.join('\n') || '',
            expectedOutcomes: localScenario.scenarioDetails?.expectedOutcomes?.join('\n') || ''
          });
          
          setLoading(false);
          return;
        }

        // 2. 예시 데이터에서 시나리오 찾기
        const exampleScenario = exampleScenarios.find(s => s.id === id);
        if (exampleScenario) {
          setScenario(exampleScenario);
      
      // 폼 데이터 초기화
      setFormData({
            title: exampleScenario.title,
            topic: exampleScenario.topic || '',
            grade: exampleScenario.grade || '',
            subject: exampleScenario.subject || '',
            affirmative: exampleScenario.scenarioDetails?.proArguments?.join('\n\n') || '',
            negative: exampleScenario.scenarioDetails?.conArguments?.join('\n\n') || '',
            background: exampleScenario.scenarioDetails?.background || '',
            teacherNotes: exampleScenario.scenarioDetails?.teacherTips || '',
            materials: exampleScenario.scenarioDetails?.materials?.join('\n') || '',
            expectedOutcomes: exampleScenario.scenarioDetails?.expectedOutcomes?.join('\n') || ''
          });
          
          setLoading(false);
          return;
        }
        
        // 3. 서버에서 시나리오 불러오기
        const response = await fetch(`/api/scenarios/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('시나리오를 찾을 수 없습니다.');
          }
          throw new Error('서버에서 시나리오를 불러오는 중 오류가 발생했습니다.');
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || '서버 응답 오류');
        }
        
        // MongoDB 데이터 형식을 Scenario 형식으로 변환
        const serverData = result.data;
        const formattedScenario: Scenario = {
          id: serverData._id,
          title: serverData.title,
          topic: serverData.topic || '',
          grade: serverData.grade || '',
          subject: serverData.subject || '',
          createdAt: serverData.createdAt, // 날짜 문자열 그대로 유지
          updatedAt: serverData.updatedAt, // 날짜 문자열 그대로 유지
          totalDurationMinutes: serverData.totalDurationMinutes || 45,
          stages: serverData.stages || {
            stage1: { id: '1', title: '다름과 마주하기', activities: [] },
            stage2: { id: '2', title: '다름을 이해하기', activities: [] },
            stage3: { id: '3', title: '다름과 공존하기', activities: [] }
          },
          scenarioDetails: {
            background: serverData.scenarioDetails?.background || '',
            proArguments: serverData.scenarioDetails?.proArguments?.join('\n\n') || [],
            conArguments: serverData.scenarioDetails?.conArguments?.join('\n\n') || [],
            teacherTips: serverData.scenarioDetails?.teacherTips || '',
            materials: serverData.scenarioDetails?.materials || [],
            expectedOutcomes: serverData.scenarioDetails?.expectedOutcomes || []
          }
        };
        
        setScenario(formattedScenario);
        
        // 폼 데이터 초기화
        setFormData({
          title: formattedScenario.title,
          topic: formattedScenario.topic || '',
          grade: formattedScenario.grade || '',
          subject: formattedScenario.subject || '',
          affirmative: Array.isArray(formattedScenario.scenarioDetails?.proArguments) 
            ? formattedScenario.scenarioDetails.proArguments.join('\n\n') 
            : formattedScenario.scenarioDetails?.proArguments || '',
          negative: Array.isArray(formattedScenario.scenarioDetails?.conArguments) 
            ? formattedScenario.scenarioDetails.conArguments.join('\n\n') 
            : formattedScenario.scenarioDetails?.conArguments || '',
          background: formattedScenario.scenarioDetails?.background || '',
          teacherNotes: formattedScenario.scenarioDetails?.teacherTips || '',
          materials: Array.isArray(formattedScenario.scenarioDetails?.materials) 
            ? formattedScenario.scenarioDetails.materials.join('\n') 
            : formattedScenario.scenarioDetails?.materials || '',
          expectedOutcomes: Array.isArray(formattedScenario.scenarioDetails?.expectedOutcomes) 
            ? formattedScenario.scenarioDetails.expectedOutcomes.join('\n') 
            : formattedScenario.scenarioDetails?.expectedOutcomes || ''
      });
      } catch (error: any) {
        console.error('시나리오 불러오기 오류:', error);
        setError(error.message || '시나리오를 불러오는 중 오류가 발생했습니다.');
      } finally {
    setLoading(false);
      }
    };
    
    loadScenario();
  }, [id]);
  
  // 입력값 변경 처리
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    const newErrors: typeof errors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = '시나리오 제목을 입력해주세요.';
    }
    
    if (!formData.topic.trim()) {
      newErrors.topic = '토론 주제를 입력해주세요.';
    }
    
    if (!formData.grade.trim()) {
      newErrors.grade = '학년을 선택해주세요.';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = '교과를 입력해주세요.';
    }
    
    // 오류가 있으면 제출 중단
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    try {
      // 줄바꿈으로 구분된 문자열을 배열로 변환
      const materials = formData.materials
        .split('\n')
        .map(item => item.trim())
        .filter(item => item !== '');
      
      const expectedOutcomes = formData.expectedOutcomes
        .split('\n')
        .map(item => item.trim())
        .filter(item => item !== '');
      
      if (!scenario) {
        throw new Error('시나리오 정보가 없습니다.');
      }
      
      // 업데이트된 시나리오 객체 생성
      const updatedScenario: Scenario = {
        ...scenario,
        title: formData.title,
        topic: formData.topic,
        grade: formData.grade,
        subject: formData.subject,
        updatedAt: new Date(),
        scenarioDetails: {
          ...scenario.scenarioDetails,
          background: formData.background,
          proArguments: formData.affirmative.split('\n\n').filter(p => p.trim() !== ''),
          conArguments: formData.negative.split('\n\n').filter(p => p.trim() !== ''),
          teacherTips: formData.teacherNotes,
          materials: materials,
          expectedOutcomes: expectedOutcomes
        }
      };
      
      // MongoDB ID로 시작하는 경우 (서버 시나리오)
      if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
        // 서버에 저장
        const response = await fetch(`/api/scenarios/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            topic: formData.topic,
            grade: formData.grade,
            subject: formData.subject,
            scenarioDetails: {
              background: formData.background,
              proArguments: formData.affirmative.split('\n\n').filter(p => p.trim() !== ''),
              conArguments: formData.negative.split('\n\n').filter(p => p.trim() !== ''),
              teacherTips: formData.teacherNotes,
              materials: materials,
              expectedOutcomes: expectedOutcomes
            }
          }),
        });
        
        if (!response.ok) {
          throw new Error('시나리오 저장 중 오류가 발생했습니다.');
        }
      } else {
        // 로컬 스토리지에 저장
        saveScenario(updatedScenario);
      }
      
    alert('시나리오가 성공적으로 수정되었습니다.');
    router.push(`/scenarios/${id}`);
    } catch (error: any) {
      console.error('시나리오 저장 오류:', error);
      alert(error.message || '시나리오 저장 중 오류가 발생했습니다.');
    }
  };
  
  // 로딩 상태 표시
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-xl text-blue-700">로딩 중...</div>
      </div>
    );
  }
  
  // 시나리오를 찾지 못한 경우
  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="container mx-auto py-8 px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">시나리오를 찾을 수 없습니다</h2>
            <p className="text-gray-600 mb-6">요청하신 시나리오가 존재하지 않거나 삭제되었을 수 있습니다.</p>
            <Link href="/scenarios">
              <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow transition-colors">
                시나리오 목록으로 돌아가기
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-blue-700 text-white">
        <div className="container mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold">시나리오 수정</h1>
          <p className="mt-2 text-blue-100">토론 시나리오 정보를 수정합니다.</p>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="container mx-auto py-8 px-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <form onSubmit={handleSubmit}>
            {/* 기본 정보 섹션 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4">기본 정보</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                    시나리오 제목
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                </div>
                
                <div>
                  <label htmlFor="topic" className="block text-gray-700 font-medium mb-2">
                    토론 주제
                  </label>
                  <input
                    type="text"
                    id="topic"
                    name="topic"
                    value={formData.topic}
                    onChange={handleChange}
                    placeholder="예: 인공지능은 인간의 일자리를 빼앗는다 vs 새로운 일자리를 만든다"
                    className={`w-full p-3 border rounded-md ${errors.topic ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.topic && <p className="text-red-500 text-sm mt-1">{errors.topic}</p>}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="grade" className="block text-gray-700 font-medium mb-2">
                    대상 학년
                  </label>
                  <select
                    id="grade"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className={`w-full p-3 border rounded-md ${errors.grade ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">학년 선택</option>
                    <option value="1학년">1학년</option>
                    <option value="2학년">2학년</option>
                    <option value="3학년">3학년</option>
                    <option value="4학년">4학년</option>
                    <option value="5학년">5학년</option>
                    <option value="6학년">6학년</option>
                    <option value="3-4학년">3-4학년</option>
                    <option value="5-6학년">5-6학년</option>
                    <option value="1-6학년">전체 학년</option>
                  </select>
                  {errors.grade && <p className="text-red-500 text-sm mt-1">{errors.grade}</p>}
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-gray-700 font-medium mb-2">
                    관련 교과
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="예: 사회, 도덕"
                    className={`w-full p-3 border rounded-md ${errors.subject ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject}</p>}
                </div>
              </div>
            </div>
            
            {/* 토론 내용 섹션 */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-blue-800 mb-4">토론 내용</h2>
              
              <div className="mb-4">
                <label htmlFor="background" className="block text-gray-700 font-medium mb-2">
                  토론 배경
                </label>
                <textarea
                  id="background"
                  name="background"
                  value={formData.background}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="토론 주제에 대한 배경 정보와 맥락을 설명해주세요."
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="affirmative" className="block text-gray-700 font-medium mb-2">
                    찬성 입장
                  </label>
                  <textarea
                    id="affirmative"
                    name="affirmative"
                    value={formData.affirmative}
                    onChange={handleChange}
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder="찬성 측의 주요 주장과 근거를 작성해주세요."
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="negative" className="block text-gray-700 font-medium mb-2">
                    반대 입장
                  </label>
                  <textarea
                    id="negative"
                    name="negative"
                    value={formData.negative}
                    onChange={handleChange}
                    rows={5}
                    className="w-full p-3 border border-gray-300 rounded-md"
                    placeholder="반대 측의 주요 주장과 근거를 작성해주세요."
                  ></textarea>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="teacherNotes" className="block text-gray-700 font-medium mb-2">
                  교사 지도 노트
                </label>
                <textarea
                  id="teacherNotes"
                  name="teacherNotes"
                  value={formData.teacherNotes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="토론 진행 시 교사가 참고할 수 있는 지도 노트를 작성해주세요."
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label htmlFor="materials" className="block text-gray-700 font-medium mb-2">
                  준비물 (각 항목을 줄바꿈으로 구분)
                </label>
                <textarea
                  id="materials"
                  name="materials"
                  value={formData.materials}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="예시:&#10;토론 주제 관련 뉴스 기사&#10;토론 규칙 안내문&#10;타이머"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="expectedOutcomes" className="block text-gray-700 font-medium mb-2">
                  기대 학습 성과 (각 항목을 줄바꿈으로 구분)
                </label>
                <textarea
                  id="expectedOutcomes"
                  name="expectedOutcomes"
                  value={formData.expectedOutcomes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-md"
                  placeholder="예시:&#10;비판적 사고력 향상&#10;논리적 표현력 신장&#10;다양한 관점 이해 능력 함양"
                ></textarea>
              </div>
            </div>
            
            {/* 버튼 영역 */}
            <div className="flex justify-between mt-8">
              <Link href={`/scenarios/${id}`}>
                <button type="button" className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 shadow transition-colors">
                  취소
                </button>
              </Link>
              
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow transition-colors"
              >
                변경사항 저장
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 