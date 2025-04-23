'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash, Save } from 'lucide-react';

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
}

export default function EditTopicPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 토론 주제 데이터
  const [title, setTitle] = useState('');
  const [background, setBackground] = useState('');
  const [proArguments, setProArguments] = useState<string[]>(['']);
  const [conArguments, setConArguments] = useState<string[]>(['']);
  const [teacherTips, setTeacherTips] = useState('');
  const [keyQuestions, setKeyQuestions] = useState<string[]>(['']);
  const [expectedOutcomes, setExpectedOutcomes] = useState<string[]>(['']);
  const [subjects, setSubjects] = useState<string[]>(['']);
  const [newSubject, setNewSubject] = useState('');

  // 주제 데이터 불러오기
  useEffect(() => {
    async function fetchTopic() {
      try {
        setLoading(true);
        const response = await fetch(`/api/topics/${id}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '토론 주제를 불러오는데 실패했습니다.');
        }
        
        const topic: Topic = await response.json();
        
        // 데이터 설정
        setTitle(topic.title);
        setBackground(topic.background);
        setProArguments(topic.proArguments.length > 0 ? topic.proArguments : ['']);
        setConArguments(topic.conArguments.length > 0 ? topic.conArguments : ['']);
        setTeacherTips(topic.teacherTips || '');
        setKeyQuestions(topic.keyQuestions.length > 0 ? topic.keyQuestions : ['']);
        setExpectedOutcomes(topic.expectedOutcomes.length > 0 ? topic.expectedOutcomes : ['']);
        setSubjects(topic.subjects.length > 0 ? topic.subjects : ['']);
        
        setError(null);
      } catch (err: any) {
        setError(err.message || '토론 주제를 불러오는데 실패했습니다.');
        console.error('주제 불러오기 오류:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchTopic();
  }, [id]);

  // 배열 필드 추가
  const addField = (field: string) => {
    switch (field) {
      case 'proArguments':
        setProArguments([...proArguments, '']);
        break;
      case 'conArguments':
        setConArguments([...conArguments, '']);
        break;
      case 'keyQuestions':
        setKeyQuestions([...keyQuestions, '']);
        break;
      case 'expectedOutcomes':
        setExpectedOutcomes([...expectedOutcomes, '']);
        break;
    }
  };

  // 배열 필드 제거
  const removeField = (field: string, index: number) => {
    if (field === 'proArguments' && proArguments.length > 1) {
      setProArguments(proArguments.filter((_, i) => i !== index));
    } else if (field === 'conArguments' && conArguments.length > 1) {
      setConArguments(conArguments.filter((_, i) => i !== index));
    } else if (field === 'keyQuestions' && keyQuestions.length > 1) {
      setKeyQuestions(keyQuestions.filter((_, i) => i !== index));
    } else if (field === 'expectedOutcomes' && expectedOutcomes.length > 1) {
      setExpectedOutcomes(expectedOutcomes.filter((_, i) => i !== index));
    } else if (field === 'subjects') {
      setSubjects(subjects.filter((_, i) => i !== index));
    }
  };

  // 배열 필드 업데이트
  const updateField = (field: string, index: number, value: string) => {
    switch (field) {
      case 'proArguments':
        const newProArgs = [...proArguments];
        newProArgs[index] = value;
        setProArguments(newProArgs);
        break;
      case 'conArguments':
        const newConArgs = [...conArguments];
        newConArgs[index] = value;
        setConArguments(newConArgs);
        break;
      case 'keyQuestions':
        const newKeyQuestions = [...keyQuestions];
        newKeyQuestions[index] = value;
        setKeyQuestions(newKeyQuestions);
        break;
      case 'expectedOutcomes':
        const newOutcomes = [...expectedOutcomes];
        newOutcomes[index] = value;
        setExpectedOutcomes(newOutcomes);
        break;
    }
  };

  // 과목 추가
  const addSubject = () => {
    if (newSubject.trim()) {
      setSubjects([...subjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  // 폼 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 유효성 검사
    if (!title.trim()) {
      setError('토론 주제 제목은 필수입니다.');
      return;
    }
    
    if (!background.trim()) {
      setError('토론 배경 정보는 필수입니다.');
      return;
    }
    
    if (proArguments.filter(arg => arg.trim()).length === 0) {
      setError('최소 하나 이상의 찬성 논점이 필요합니다.');
      return;
    }
    
    if (conArguments.filter(arg => arg.trim()).length === 0) {
      setError('최소 하나 이상의 반대 논점이 필요합니다.');
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // 빈 항목 필터링
      const filteredProArgs = proArguments.filter(arg => arg.trim());
      const filteredConArgs = conArguments.filter(arg => arg.trim());
      const filteredKeyQuestions = keyQuestions.filter(q => q.trim());
      const filteredOutcomes = expectedOutcomes.filter(o => o.trim());
      
      const payload = {
        title: title.trim(),
        background: background.trim(),
        proArguments: filteredProArgs,
        conArguments: filteredConArgs,
        teacherTips: teacherTips.trim(),
        keyQuestions: filteredKeyQuestions,
        expectedOutcomes: filteredOutcomes,
        subjects: subjects.filter(s => s.trim())
      };
      
      const response = await fetch(`/api/topics/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '토론 주제 업데이트에 실패했습니다.');
      }
      
      router.push('/topics');
      
    } catch (err: any) {
      setError(err.message || '토론 주제 업데이트에 실패했습니다.');
      console.error('주제 업데이트 오류:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-lg">토론 주제를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/topics" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft className="w-4 h-4 mr-2" />
          토론 주제 목록으로 돌아가기
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">토론 주제 수정</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
          <p>{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        {/* 기본 정보 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
          
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              토론 주제 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        {/* 토론 배경 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">토론 배경</h2>
          
          <div className="mb-4">
            <label htmlFor="background" className="block text-sm font-medium text-gray-700 mb-1">
              배경 정보 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="background"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              rows={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>
        
        {/* 찬성 논점 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">찬성 논점</h2>
          
          {proArguments.map((arg, index) => (
            <div key={`pro-${index}`} className="flex items-start mb-3">
              <textarea
                value={arg}
                onChange={(e) => updateField('proArguments', index, e.target.value)}
                rows={2}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`찬성 논점 ${index + 1}`}
              />
              {proArguments.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField('proArguments', index)}
                  className="ml-2 p-2 text-red-500 hover:text-red-700"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => addField('proArguments')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            찬성 논점 추가
          </button>
        </div>
        
        {/* 반대 논점 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">반대 논점</h2>
          
          {conArguments.map((arg, index) => (
            <div key={`con-${index}`} className="flex items-start mb-3">
              <textarea
                value={arg}
                onChange={(e) => updateField('conArguments', index, e.target.value)}
                rows={2}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`반대 논점 ${index + 1}`}
              />
              {conArguments.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField('conArguments', index)}
                  className="ml-2 p-2 text-red-500 hover:text-red-700"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => addField('conArguments')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            반대 논점 추가
          </button>
        </div>
        
        {/* 교사 팁 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">교사 팁</h2>
          
          <div className="mb-4">
            <textarea
              value={teacherTips}
              onChange={(e) => setTeacherTips(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="교사를 위한 팁과 가이드"
            />
          </div>
        </div>
        
        {/* 핵심 질문 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">핵심 질문</h2>
          
          {keyQuestions.map((question, index) => (
            <div key={`question-${index}`} className="flex items-start mb-3">
              <input
                type="text"
                value={question}
                onChange={(e) => updateField('keyQuestions', index, e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`핵심 질문 ${index + 1}`}
              />
              {keyQuestions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField('keyQuestions', index)}
                  className="ml-2 p-2 text-red-500 hover:text-red-700"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => addField('keyQuestions')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            핵심 질문 추가
          </button>
        </div>
        
        {/* 기대 학습 성과 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">기대 학습 성과</h2>
          
          {expectedOutcomes.map((outcome, index) => (
            <div key={`outcome-${index}`} className="flex items-start mb-3">
              <input
                type="text"
                value={outcome}
                onChange={(e) => updateField('expectedOutcomes', index, e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`기대 학습 성과 ${index + 1}`}
              />
              {expectedOutcomes.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeField('expectedOutcomes', index)}
                  className="ml-2 p-2 text-red-500 hover:text-red-700"
                >
                  <Trash className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
          
          <button
            type="button"
            onClick={() => addField('expectedOutcomes')}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mt-2"
          >
            <Plus className="w-4 h-4 mr-1" />
            기대 학습 성과 추가
          </button>
        </div>
        
        {/* 관련 교과 */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">관련 교과</h2>
          
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-3">
              {subjects.map((subject, index) => (
                <div 
                  key={`subject-${index}`} 
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {subject}
                  <button
                    type="button"
                    onClick={() => removeField('subjects', index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="새 교과 추가"
              />
              <button
                type="button"
                onClick={addSubject}
                className="bg-blue-600 text-white px-4 py-2 rounded-r-md hover:bg-blue-700"
              >
                추가
              </button>
            </div>
          </div>
        </div>
        
        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <Link 
            href="/topics" 
            className="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            취소
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장하기
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}