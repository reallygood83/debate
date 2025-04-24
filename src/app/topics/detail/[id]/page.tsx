'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Copy, 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Lightbulb, 
  HelpCircle, 
  Target,
  FileDown,
  Download,
  ExternalLink,
  Loader2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { v4 as uuidv4 } from 'uuid';

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
  createdAt: string;
  updatedAt: string;
}

interface ArgumentDetail {
  title: string;
  content: string;
  example: string;
}

interface AIGeneratedContent {
  proArguments: ArgumentDetail[];
  conArguments: ArgumentDetail[];
  debatePoints: string[];
}

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-10 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      
      <Skeleton className="h-24 w-full mb-6" />
      
      <Skeleton className="h-64 w-full mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
      
      <Skeleton className="h-40 w-full mb-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    </div>
  )
}

export default function TopicDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const [exporting, setExporting] = useState(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiContent, setAiContent] = useState<AIGeneratedContent | null>(null);
  const [showAiContent, setShowAiContent] = useState<boolean>(false);
  const topicContentRef = useRef<HTMLDivElement>(null);
  const aiContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!params.id) {
      setError('토픽 ID가 제공되지 않았습니다.');
      setLoading(false);
      return;
    }

    const fetchTopic = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/topics/${params.id}`);
        
        if (!response.ok) {
          throw new Error(`토픽을 가져오는데 실패했습니다: ${response.status}`);
        }
        
        const data = await response.json();
        setTopic(data.data);
      } catch (error) {
        console.error('토픽 로딩 오류:', error);
        setError('토픽을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, [params.id]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    });
  };

  const exportToPDF = async () => {
    if (!topic) return;
    
    setExporting(true);
    
    try {
      const contentElement = document.getElementById('topic-content');
      if (!contentElement) {
        throw new Error('내보낼 콘텐츠를 찾을 수 없습니다.');
      }
      
      const canvas = await html2canvas(contentElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      const fileName = `토론주제_${topic.title.substring(0, 20)}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('PDF 내보내기 오류:', error);
      alert('PDF 내보내기 중 오류가 발생했습니다.');
    } finally {
      setExporting(false);
    }
  };

  const generateAIArguments = async () => {
    if (!topic) return;

    setAiLoading(true);
    setAiError(null);
    
    try {
      const response = await fetch('/api/generate-debate-arguments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.title,
          gradeGroup: '3-4', // 기본값으로 3-4학년군 설정, 필요시 UI에서 선택할 수 있게 수정 가능
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '논거 생성에 실패했습니다.');
      }

      const data = await response.json();
      if (!data.success || !data.data) {
        throw new Error('AI가 유효한 논거를 생성하지 못했습니다.');
      }

      setAiContent(data.data);
      setShowAiContent(true);
    } catch (err) {
      console.error('AI 논거 생성 중 오류 발생:', err);
      setAiError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const exportAIContentToPDF = async () => {
    if (!aiContentRef.current || !aiContent || !topic) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(aiContentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`AI생성_논거_${topic.title}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('AI 논거 PDF 내보내기 중 오류 발생:', err);
      alert('PDF 내보내기에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !topic) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> 뒤로 가기
          </Button>
        </div>
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-red-500 text-lg mb-4">{error || '토픽을 찾을 수 없습니다.'}</p>
              <Link href="/topics">
                <Button>토픽 목록으로 돌아가기</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button variant="outline" onClick={() => router.back()} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> 뒤로 가기
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportToPDF}
            disabled={exporting}
            className="flex items-center gap-2"
          >
            <FileDown className="h-4 w-4" />
            {exporting ? '내보내는 중...' : 'PDF로 내보내기'}
          </Button>
          <Link href={`/session?scenario=${params.id}`}>
            <Button className="bg-blue-600 hover:bg-blue-700">이 주제로 토론 시작하기</Button>
          </Link>
        </div>
      </div>

      <div id="topic-content">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-2xl font-bold">{topic.title}</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(topic.title, 'title')}
                className="flex items-center gap-1 print:hidden"
              >
                {copiedField === 'title' ? '복사됨' : '복사'}
                {copiedField === 'title' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {topic.subjects.map((subject, index) => (
                <Badge key={index} variant="outline" className="bg-blue-50">
                  {subject}
                </Badge>
              ))}
              <Badge variant="outline" className="bg-green-50">
                {topic.grade}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">배경 정보</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(topic.background, 'background')}
                className="flex items-center gap-1 print:hidden"
              >
                {copiedField === 'background' ? '복사됨' : '복사'}
                {copiedField === 'background' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{topic.background}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" /> 찬성 논점
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(topic.proArguments.join('\n\n'), 'pro')}
                  className="flex items-center gap-1 print:hidden"
                >
                  {copiedField === 'pro' ? '복사됨' : '복사'}
                  {copiedField === 'pro' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {topic.proArguments.map((arg, index) => (
                  <li key={index}>{arg}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" /> 반대 논점
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(topic.conArguments.join('\n\n'), 'con')}
                  className="flex items-center gap-1 print:hidden"
                >
                  {copiedField === 'con' ? '복사됨' : '복사'}
                  {copiedField === 'con' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {topic.conArguments.map((arg, index) => (
                  <li key={index}>{arg}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" /> 교사 팁
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => copyToClipboard(topic.teacherTips, 'tips')}
                className="flex items-center gap-1 print:hidden"
              >
                {copiedField === 'tips' ? '복사됨' : '복사'}
                {copiedField === 'tips' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{topic.teacherTips}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-purple-600" /> 핵심 질문
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(topic.keyQuestions.join('\n\n'), 'questions')}
                  className="flex items-center gap-1 print:hidden"
                >
                  {copiedField === 'questions' ? '복사됨' : '복사'}
                  {copiedField === 'questions' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {topic.keyQuestions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" /> 기대 효과
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => copyToClipboard(topic.expectedOutcomes.join('\n\n'), 'outcomes')}
                  className="flex items-center gap-1 print:hidden"
                >
                  {copiedField === 'outcomes' ? '복사됨' : '복사'}
                  {copiedField === 'outcomes' ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-6 space-y-2">
                {topic.expectedOutcomes.map((outcome, index) => (
                  <li key={index}>{outcome}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-sm text-gray-500 mt-4 print:hidden">
          생성일: {new Date(topic.createdAt).toLocaleDateString('ko-KR')}
          {topic.updatedAt && topic.updatedAt !== topic.createdAt && 
            ` · 수정일: ${new Date(topic.updatedAt).toLocaleDateString('ko-KR')}`}
        </div>
      </div>

      <div className="mb-8">
        <div className="flex justify-center">
          <button
            onClick={generateAIArguments}
            disabled={aiLoading}
            className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-50 text-lg font-medium"
          >
            {aiLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> AI가 토론 논거 생성 중...
              </>
            ) : (
              <>
                AI로 상세 토론 논거 생성하기
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="mt-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{aiError}</p>
          </div>
        )}

        {showAiContent && aiContent && (
          <div className="mt-6">
            <div className="bg-purple-50 p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-purple-800">AI 생성 토론 논거</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(aiContent, null, 2))}
                    className="inline-flex items-center px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
                  >
                    <Copy className="mr-1 h-4 w-4" /> 복사
                  </button>
                  <button
                    onClick={exportAIContentToPDF}
                    disabled={exporting}
                    className="inline-flex items-center px-3 py-1 bg-primary text-white rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="mr-1 h-4 w-4 animate-spin" /> 내보내는 중...
                      </>
                    ) : (
                      <>
                        <Download className="mr-1 h-4 w-4" /> PDF로 저장
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div ref={aiContentRef} className="space-y-6">
                <div className="mb-4 text-center border-b pb-4">
                  <h3 className="text-xl font-bold text-purple-900 mb-2">"{topic.title}" 토론 논거</h3>
                  <p className="text-gray-600">AI가 생성한 상세 논거 및 토론 포인트</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <h4 className="text-lg font-semibold mb-3 text-green-800">찬성 논거</h4>
                    <div className="space-y-4">
                      {aiContent.proArguments.map((arg, index) => (
                        <div key={index} className="border-l-4 border-green-500 pl-3 py-1">
                          <h5 className="font-bold text-green-700">{arg.title}</h5>
                          <p className="text-gray-700 mb-1">{arg.content}</p>
                          <p className="text-sm text-gray-600 italic">예시: {arg.example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded border border-red-200">
                    <h4 className="text-lg font-semibold mb-3 text-red-800">반대 논거</h4>
                    <div className="space-y-4">
                      {aiContent.conArguments.map((arg, index) => (
                        <div key={index} className="border-l-4 border-red-500 pl-3 py-1">
                          <h5 className="font-bold text-red-700">{arg.title}</h5>
                          <p className="text-gray-700 mb-1">{arg.content}</p>
                          <p className="text-sm text-gray-600 italic">예시: {arg.example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded border border-blue-200">
                  <h4 className="text-lg font-semibold mb-3 text-blue-800">토론 포인트</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    {aiContent.debatePoints.map((point, index) => (
                      <li key={index} className="text-gray-700">{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}