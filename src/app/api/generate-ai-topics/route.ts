import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { NextRequest } from 'next/server';
import { getEnvVar } from '@/utils/envUtils';

// Google Gemini API 초기화
let genAI: GoogleGenerativeAI | null = null;

// 응답 데이터 타입 정의
interface TopicSuggestion {
  title: string;
  description: string;
  proView?: string;
  conView?: string;
}

// 토론 주제 추천 프롬프트
const TOPIC_RECOMMENDATION_PROMPT = `
# 역할: 초등학교 학생들을 위한 토론 주제 추천 도우미
# 목표: 학생들의 학습 수준과 관심사에 적합한 토론 주제를 추천하되, 경기 토론 수업 모형의 '다름'과 '공존'에 초점을 맞춘 주제를 제안한다.

# 지침:
- 사용자가 선택한 {학년군} 수준에 적합한 토론 주제를 추천한다 (너무 어렵거나 전문적인 주제는 피한다).
- {학년군}학생들이 자신과 다른 의견을 가진 사람들의 입장도 이해할 수 있는 주제를 선정한다.
- 찬성/반대 입장이 분명하게 나뉠 수 있는 주제를 선정한다.
- {학년군}학생들의 일상생활이나 학교생활과 관련된 주제를 포함시킨다.
- 사회적, 윤리적 사고를 촉진하는 주제를 포함한다.
- 제안하는 각 주제에 대해 그 주제가 왜 좋은 토론 주제인지 간단히 설명한다.
{category_instruction}

JSON 형식으로 다음과 같이 응답해주세요:
[
  {
    "title": "토론 주제 1",
    "description": "이 주제가 좋은 토론 주제인 이유와 어떤 점을 생각해볼 수 있는지 간단한 설명",
    "proView": "찬성 측 관점을 한 문장으로 요약",
    "conView": "반대 측 관점을 한 문장으로 요약"
  },
  {
    "title": "토론 주제 2",
    "description": "이 주제가 좋은 토론 주제인 이유와 어떤 점을 생각해볼 수 있는지 간단한 설명",
    "proView": "찬성 측 관점을 한 문장으로 요약",
    "conView": "반대 측 관점을 한 문장으로 요약"
  },
  {
    "title": "토론 주제 3",
    "description": "이 주제가 좋은 토론 주제인 이유와 어떤 점을 생각해볼 수 있는지 간단한 설명",
    "proView": "찬성 측 관점을 한 문장으로 요약",
    "conView": "반대 측 관점을 한 문장으로 요약"
  }
]

JSON 형식만 출력하세요. 바깥에 Markdown이나 설명 텍스트를 추가하지 마세요.
`;

export async function POST(request: NextRequest) {
  try {
    const { subject, gradeGroup, keywords } = await request.json();

    if (!subject && !keywords) {
      return NextResponse.json(
        { error: '최소한 교과 또는 키워드를 입력해주세요' },
        { status: 400 }
      );
    }

    // 환경 변수 유틸리티 사용
    let apiKey: string;
    try {
      apiKey = getEnvVar('GEMINI_API_KEY', true);
    } catch (error) {
      console.error('API 키 가져오기 오류:', error);
      return NextResponse.json(
        { error: 'API 키를 가져오는 중 오류가 발생했습니다. 서버 환경 변수를 확인하세요.' },
        { status: 500 }
      );
    }
    
    // API 키가 있을 때만 Gemini API 클라이언트 초기화
    if (!genAI) {
      try {
        genAI = new GoogleGenerativeAI(apiKey);
      } catch (error) {
        console.error('Gemini API 클라이언트 초기화 오류:', error);
        return NextResponse.json(
          { error: 'Gemini API 클라이언트를 초기화하는 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }
    
    // 사용할 모델 설정
    const modelName = "gemini-2.0-flash";
    let model;
    try {
      model = genAI.getGenerativeModel({
        model: modelName,
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        },
      });
    } catch (error) {
      console.error('모델 설정 오류:', error);
      return NextResponse.json(
        { error: `Gemini 모델 "${modelName}"을 설정하는 중 오류가 발생했습니다.` },
        { status: 500 }
      );
    }

    // 프롬프트 구성
    let categoryInstruction = '';
    if (subject) {
      categoryInstruction = `
- 다음 분야에 초점을 맞춰 토론 주제를 추천한다: ${subject}
- 이 분야와 관련된 초등학생이 이해할 수 있는 토론 주제를 선정한다.
- 분야는 넓게 해석하여 관련된 다양한 측면의 주제를 포함한다.
      `;
    }
    
    if (keywords) {
      categoryInstruction += `
- 다음 키워드와 관련된 토론 주제를 추천한다: ${keywords}
- 이 키워드와 관련하여 다양한 관점에서 논의할 수 있는 주제를 선정한다.
      `;
    }
    
    let finalPrompt = TOPIC_RECOMMENDATION_PROMPT
      .replace('{학년군}', gradeGroup || '초등학교')
      .replace('{category_instruction}', categoryInstruction);
    
    // API 호출에 타임아웃 적용
    const timeoutMs = 25000; // 25초 타임아웃
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API 요청 시간 초과')), timeoutMs);
    });

    // Gemini API 호출
    try {
      const resultPromise = model.generateContent(finalPrompt);
      const result = await Promise.race([resultPromise, timeoutPromise]);
      const response = result.response;
      let generatedText = response.text();

      // JSON 형식만 추출
      const jsonMatch = generatedText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
        generatedText = jsonMatch[0];
      }

      try {
        // JSON 파싱 및 검증
        const topics: TopicSuggestion[] = JSON.parse(generatedText);
        
        if (!Array.isArray(topics) || topics.length === 0) {
          throw new Error('유효한 토론 주제가 생성되지 않았습니다.');
        }
        
        // 최대 3개의 주제만 반환
        const filteredTopics = topics.slice(0, 3);
        
        return NextResponse.json({ 
          success: true, 
          topics: filteredTopics 
        });
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError, generatedText);
        return NextResponse.json(
          { 
            error: 'AI가 생성한 주제를 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.',
            rawText: generatedText
          },
          { status: 500 }
        );
      }
    } catch (apiError) {
      console.error('Gemini API 호출 오류:', apiError);
      
      // API 키 문제인지 확인
      if (apiError instanceof Error && apiError.message.includes('API key not valid')) {
        return NextResponse.json(
          { 
            error: 'API 키가 유효하지 않습니다. 올바른 API 키를 환경 변수에 설정했는지 확인하세요.',
            details: apiError.message 
          },
          { status: 401 }
        );
      }
      
      throw apiError; // 다른 오류는 아래의 catch 블록에서 처리
    }
  } catch (error) {
    console.error('서버 오류:', error);
    
    // 타임아웃 오류 특별 처리
    if (error instanceof Error && error.message.includes('시간 초과')) {
      return NextResponse.json(
        { 
          error: 'AI 응답 생성에 시간이 너무 오래 걸립니다. 나중에 다시 시도해 주세요.',
          details: '요청 시간 초과' 
        },
        { status: 408 }
      );
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `서버 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
} 