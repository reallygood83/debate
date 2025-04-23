'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

interface TopicDetail {
  id: string;
  title: string;
  subject: string[];
  grade: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  background: string;
  proArguments: string[];
  conArguments: string[];
  teacherTips: string;
  expectedOutcomes: string[];
  keyQuestions: string[];
}

export default function EditTopicPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topic, setTopic] = useState<TopicDetail | null>(null);

  // 동적으로 관리할 인풋 필드
  const [proArguments, setProArguments] = useState<string[]>([]);
  const [conArguments, setConArguments] = useState<string[]>([]);
  const [expectedOutcomes, setExpectedOutcomes] = useState<string[]>([]);
  const [keyQuestions, setKeyQuestions] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [newSubject, setNewSubject] = useState('');

  useEffect(() => {
    // 실제로는 API에서, 지금은 더미 데이터로 설정
    const fetchTopic = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // API 호출 시뮬레이션 (실제로는 fetch 사용)
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // 샘플 데이터
        if (id) {
          const sampleData = {
            id,
            title: '우리나라를 지키기 위한 전쟁, 어떤 경우에도 정당화될 수 있을까?',
            subject: ['도덕', '사회'],
            grade: '초등학교 고학년(4-6학년)',
            createdAt: '2025년 4월 24일',
            updatedAt: '2025년 4월 24일',
            author: '김교사',
            background: "전쟁은 인류 역사에서 가장 파괴적인 갈등 형태 중 하나입니다. 국가 방어를 위한 전쟁은 종종 '정당한 전쟁'으로 간주되지만, 이에 대한 의견은 다양합니다. 이 토론은 학생들이 전쟁의 윤리적 측면과 국가 방어의 정당성에 대해 생각해볼 수 있는 기회를 제공합니다.",
            proArguments: [
              '국가 존립과 국민 보호는 정부의 가장 기본적인 의무이므로 방어 전쟁은 정당화됨',
              '침략에 대응하지 않으면 더 큰 희생과 피해가 발생할 수 있음',
              '국제법에서도 자기 방어권을 인정하고 있음'
            ],
            conArguments: [
              '전쟁은 항상 무고한 시민들의 희생을 초래함',
              '대화와 외교적 해결책을 먼저 모색해야 함',
              '전쟁은 또 다른 폭력과 갈등의 순환을 야기함'
            ],
            teacherTips: '이 주제는 학생들이 평화, 안보, 국가, 인권 등 다양한 가치에 대해 생각해볼 수 있는 기회를 제공합니다. 토론 전에 현대 분쟁의 몇 가지 사례를 간략히 검토하고, 학생들이 전쟁의 실제 영향에 대해 이해할 수 있도록 안내하세요. 민감한 주제이므로 모든 의견이 존중받을 수 있는 안전한 토론 환경을 조성하는 것이 중요합니다.',
            expectedOutcomes: [
              '평화와 안보의 가치에 대한 이해 증진',
              '윤리적 딜레마 상황에서 다양한 관점을 고려하는 능력 향상',
              '복잡한 문제에 대한 비판적 사고력 개발'
            ],
            keyQuestions: [
              '국가 방어를 위한 전쟁이 정당화될 수 있는 조건은 무엇인가?',
              '전쟁의 대안으로서 외교적 해결책의 한계는 무엇인가?',
              '전쟁이 불가피할 때, 어떻게 하면 민간인 피해를 최소화할 수 있는가?'
            ]
          };
          
          setTopic(sampleData);
          setProArguments(sampleData.proArguments);
          setConArguments(sampleData.conArguments);
          setExpectedOutcomes(sampleData.expectedOutcomes);
          setKeyQuestions(sampleData.keyQuestions);
          setSubjects(sampleData.subject);
        }
      } catch (err) {
        console.error('토론 주제를 불러오는 중 오류 발생:', err);
        setError('토론 주제를 불러오는 데 실패했습니다. 다시 시도해주세요.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopic();
  }, [id]);

  // 동적 필드 관리 함수들
  const addField = (setter: React.Dispatch<React.SetStateAction<string[]>>, values: string[]) => {
    setter([...values, '']);
  };

  const removeField = (setter: React.Dispatch<React.SetStateAction<string[]>>, values: string[], index: number) => {
    setter(values.filter((_, i) => i !== index));
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
    
    if (!topic) return;
    
    try {
      setIsSaving(true);
      
      // Form 데이터에서 업데이트된 주제 정보 가져오기
      const form = e.target as HTMLFormElement;
      const formData = new FormData(form);
      
      const updatedTopic = {
        ...topic,
        title: formData.get('title') as string,
        grade: formData.get('grade') as string,
        author: formData.get('author') as string,
        background: formData.get('background') as string,
        teacherTips: formData.get('teacherTips') as string,
        subject: subjects,
        proArguments: proArguments.filter(arg => arg.trim() !== ''),
        conArguments: conArguments.filter(arg => arg.trim() !== ''),
        expectedOutcomes: expectedOutcomes.filter(outcome => outcome.trim() !== ''),
        keyQuestions: keyQuestions.filter(question => question.trim() !== ''),
        updatedAt: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      };
      
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 실제로는 API 호출하여 저장
      console.log('Saved topic:', updatedTopic);
      
      // 성공 알림
      alert('토론 주제가 성공적으로 업데이트되었습니다.');
      
      // 상세 페이지로 이동
      router.push(`/topics/${id}`);
      
    } catch (err) {
      console.error('토론 주제 저장 중 오류 발생:', err);
      setError('토론 주제를 저장하는 데 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <p className="font-bold">오류</p>
          <p>{error}</p>
          <Link href="/topics" className="text-red-700 underline mt-2 inline-block">
            토론 주제 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <p className="font-bold">주제를 찾을 수 없음</p>
          <p>요청하신 토론 주제를 찾을 수 없습니다.</p>
          <Link href="/topics" className="text-yellow-700 underline mt-2 inline-block">
            토론 주제 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href={`/topics/${id}`} className="text-blue-500 hover:text-blue-700">
          ← 토론 주제 상세 페이지로 돌아가기
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-3xl font-bold mb-4">토론 주제 편집</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* 기본 정보 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
            
            <div className="mb-4">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                주제 제목
              </label>
              <input
                type="text"
                id="title"
                name="title"
                defaultValue={topic.title}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                대상 학년
              </label>
              <select
                id="grade"
                name="grade"
                defaultValue={topic.grade}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
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
                defaultValue={topic.author}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              defaultValue={topic.background}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="토론 주제의 배경과 맥락을 설명해주세요"
            />
          </section>
          
          {/* 찬성/반대 논점 */}
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">주요 논점</h2>
            
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
                    />
                    <button
                      type="button"
                      onClick={() => removeField(setProArguments, proArguments, index)}
                      className="bg-red-500 text-white px-3 py-2 rounded-r-md hover:bg-red-600"
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
                    />
                    <button
                      type="button"
                      onClick={() => removeField(setConArguments, conArguments, index)}
                      className="bg-red-500 text-white px-3 py-2 rounded-r-md hover:bg-red-600"
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
              defaultValue={topic.teacherTips}
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
              href={`/topics/${id}`}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-6 rounded"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded flex items-center ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isSaving ? '저장 중...' : '저장하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 