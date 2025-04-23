'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { CopyIcon, CheckIcon } from '@radix-ui/react-icons';
import { Loader2 } from 'lucide-react';

export default function TopicsPage() {
  const { toast } = useToast();
  const [gradeGroup, setGradeGroup] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [keywords, setKeywords] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleRecommend = async () => {
    if (!gradeGroup) {
      toast({
        title: '학년군을 선택해주세요',
        variant: 'destructive',
      });
      return;
    }

    if (!topic) {
      toast({
        title: '주제 분야를 입력해주세요',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setRecommendations([]);

    try {
      // 프롬프트 구성
      const prompt = `당신은 학생들에게 맞는 토론 주제를 추천해주는 교육 전문가입니다.
다음 정보를 바탕으로 ${gradeGroup} 학생들에게 적합한 토론 주제 3가지를 추천해주세요.
주제 분야: ${topic}
${keywords ? `키워드: ${keywords}` : ''}

각 주제는 찬반 토론이 가능하도록 논쟁적이어야 합니다.
해당 연령대 학생들의 인지 및 언어 발달 수준을 고려해주세요.
교육적으로 가치 있고 학생들의 비판적 사고력을 키울 수 있는 주제를 추천해주세요.
각 주제는 간결하고 명확하게 한 문장으로 작성해주세요.

출력 형식:
1. [첫 번째 토론 주제]
2. [두 번째 토론 주제]
3. [세 번째 토론 주제]`;

      const response = await fetch('/api/generate-topics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
        }),
      });

      if (!response.ok) {
        throw new Error('주제 추천에 실패했습니다');
      }

      const data = await response.json();
      
      // 응답 텍스트에서 추천 주제 파싱
      const topics = data.response
        .split('\n')
        .filter((line: string) => line.trim().match(/^\d+\.\s/))
        .map((line: string) => line.replace(/^\d+\.\s/, '').trim());

      setRecommendations(topics);
    } catch (error) {
      console.error('주제 추천 오류:', error);
      toast({
        title: '주제 추천 중 오류가 발생했습니다',
        description: '잠시 후 다시 시도해주세요',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      title: '복사되었습니다',
      description: text,
    });
    
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">AI 토론 주제 추천</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>토론 주제 추천 받기</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="grade-group">학년군 선택</Label>
            <Select value={gradeGroup} onValueChange={setGradeGroup}>
              <SelectTrigger id="grade-group">
                <SelectValue placeholder="학년군을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="초등학교 저학년(1-3학년)">초등학교 저학년(1-3학년)</SelectItem>
                <SelectItem value="초등학교 고학년(4-6학년)">초등학교 고학년(4-6학년)</SelectItem>
                <SelectItem value="중학교(1-3학년)">중학교(1-3학년)</SelectItem>
                <SelectItem value="고등학교(1-3학년)">고등학교(1-3학년)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topic">주제 분야</Label>
            <Input
              id="topic"
              placeholder="예: 환경, 과학기술, 사회문제, 교육 등"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="keywords">키워드 (선택사항)</Label>
            <Textarea
              id="keywords"
              placeholder="관련 키워드를 입력하세요 (쉼표로 구분)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>
          
          <Button 
            onClick={handleRecommend} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                추천 중...
              </>
            ) : '토론 주제 추천받기'}
          </Button>
        </CardContent>
      </Card>
      
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>추천 토론 주제</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-md">
                  <p className="text-lg flex-grow">{recommendation}</p>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(recommendation, index)}
                  >
                    {copiedIndex === index ? (
                      <CheckIcon className="h-4 w-4 text-green-500" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 