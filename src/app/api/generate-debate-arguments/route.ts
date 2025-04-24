import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { NextRequest } from 'next/server';
import { getEnvVar } from '@/utils/envUtils';

// Google Gemini API 초기화
let genAI: GoogleGenerativeAI | null = null;

// 찬반 논거 생성 프롬프트
const DEBATE_ARGUMENTS_PROMPT = `
# 역할: 초등학교 {학년군}학생들을 위한 토론 논거 생성 도우미
# 목표: 주어진 토론 주제에 대해 찬성과 반대 양측의 논거를 초등학교 {학년군}학생 수준에 맞게 제시한다.

# 지침:
- 주어진 토론 주제: {topic}
- 모든 내용은 초등학교 {학년군} 학생이 이해할 수 있는 수준으로 작성한다.
- 논거는 명확하고 구체적이며 논리적이어야 한다.
- 각 논거에는 간단한 근거나 예시를 포함한다.
- 각 측에 3-5개의 논거를 제시한다.
- 너무 추상적이거나 철학적인 개념은 피하고 실제적인 상황과 연결시킨다.
- 각 측의 관점을 균형있게 표현한다.

# 출력 형식 JSON:
{
  "proArguments": [
    {
      "title": "논거 제목 1",
      "content": "구체적인 설명 및 근거",
      "example": "실생활 예시나 상황"
    },
    {
      "title": "논거 제목 2",
      "content": "구체적인 설명 및 근거",
      "example": "실생활 예시나 상황"
    },
    {
      "title": "논거 제목 3",
      "content": "구체적인 설명 및 근거",
      "example": "실생활 예시나 상황"
    }
  ],
  "conArguments": [
    {
      "title": "논거 제목 1",
      "content": "구체적인 설명 및 근거",
      "example": "실생활 예시나 상황"
    },
    {
      "title": "논거 제목 2",
      "content": "구체적인 설명 및 근거",
      "example": "실생활 예시나 상황"
    },
    {
      "title": "논거 제목 3",
      "content": "구체적인 설명 및 근거",
      "example": "실생활 예시나 상황"
    }
  ],
  "debatePoints": [
    "토론 시 고려해야 할 중요한 질문이나 관점",
    "논쟁이 될 수 있는 핵심 요소",
    "다양한 관점에서 생각해 볼 수 있는 질문"
  ]
}

JSON 형식만 출력하세요. 바깥에 Markdown이나 설명 텍스트를 추가하지 마세요.
`;

export async function POST(request: NextRequest) {
  try {
    const { topic, gradeGroup } = await request.json();

    if (!topic) {
      return NextResponse.json(
        { error: '토론 주제를 입력해주세요' },
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
          temperature: 0.7,
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
    let finalPrompt = DEBATE_ARGUMENTS_PROMPT
      .replace('{학년군}', gradeGroup || '초등학교')
      .replace('{topic}', topic);

    // API 호출에 타임아웃 적용
    const timeoutMs = 30000; // 30초 타임아웃
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
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        generatedText = jsonMatch[0];
      }

      try {
        // JSON 파싱 및 검증
        const debateArguments = JSON.parse(generatedText);
        
        if (!debateArguments.proArguments || !debateArguments.conArguments || !debateArguments.debatePoints) {
          throw new Error('유효한 논거가 생성되지 않았습니다.');
        }
        
        return NextResponse.json({ 
          success: true, 
          data: debateArguments
        });
      } catch (jsonError) {
        console.error('JSON 파싱 오류:', jsonError, generatedText);
        return NextResponse.json(
          { 
            error: 'AI가 생성한 논거를 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.',
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