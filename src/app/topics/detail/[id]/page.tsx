'use client';

import { useEffect, useState } from 'react';
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
  FileDown
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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
    </div>
  );
}