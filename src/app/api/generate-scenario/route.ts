import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { NextRequest } from 'next/server';
import { getEnvVar } from '@/utils/envUtils';

// API 키 검증
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Google Gemini API 초기화 - 필요시 초기화 방식으로 변경
let genAI: GoogleGenerativeAI | null = null;

// 응답 데이터 타입 정의
interface ScenarioData {
  title: string;
  topic: string;
  keywords?: string[];
  grade?: string;
  subject?: string | string[];
  background: string;
  proArguments: string[];
  conArguments: string[];
  teacherTips: string;
  keyQuestions?: string[];
  expectedOutcomes: string[];
  materials?: string[];
  [key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    // 환경 변수 유틸리티 사용
    const apiKey = getEnvVar('GEMINI_API_KEY', true);
    
    // API 키가 있을 때만 Gemini API 클라이언트 초기화
    if (!genAI) {
      genAI = new GoogleGenerativeAI(apiKey);
    }

    // 요청에서 토론 주제 추출
    const body = await request.json();
    const { topic, grade, subject } = body;
    
    if (!topic) {
      return NextResponse.json(
        { error: '토론 주제가 제공되지 않았습니다.' },
        { status: 400 }
      );
    }
    
    // Gemini 모델 설정
    const modelName = "gemini-2.0-flash";
    const model = genAI.getGenerativeModel({
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
        temperature: 0.5,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      },
    });
    
    // 안내 시스템 메시지 생성
    const systemMessage = `
      당신은 초등학교 토론 교육을 위한 전문가입니다. 
      경기초등토론교육모형에 맞는 토론 시나리오를 생성해 주세요.
      응답은 JSON 형식으로 제공해야 하며, 누락된 필드 없이 모든 요구되는 필드를 포함해야 합니다.
      각 필드는 반드시 제공되어야 하며, 특히 background, proArguments, conArguments, teacherTips, expectedOutcomes를
      포함한 모든 필드를 반드시 응답에 포함해야 합니다.
    `;
    
    // 사용자 프롬프트 생성
    const userPrompt = `
      다음 주제에 대한 토론 시나리오를 만들어주세요: "${topic}"
      
      ${grade ? `대상 학년: ${grade}` : ''}
      ${subject ? `관련 교과: ${subject}` : ''}

      다음 정보를 JSON 형식으로 포함해주세요 (모든 필드는 반드시 포함되어야 합니다):
      1. "title": 토론의 명확한 주제 (예: "학교에 휴대폰을 가지고 오는 것의 찬반")
      2. "topic": 토론 주장 형식 (예: "초등학생은 학교에 휴대폰을 가지고 와야 한다 vs 가지고 오면 안 된다")
      3. "keywords": 주요 키워드 (최대 5개 배열)
      4. "grade": 추천 학년 (예: "5-6학년", "3-4학년"${grade ? ` - 입력된 값: ${grade}` : ''})
      5. "subject": 관련 교과목 (최대 3개 배열, 예: ["사회", "도덕"]${subject ? ` - 입력된 값: ${subject}` : ''})
      6. "background": 토론 배경 설명 (300자 내외) - 이 필드는 반드시 포함되어야 합니다
      7. "proArguments": 찬성측 주요 논점 3가지 (배열) - 이 필드는 반드시 포함되어야 합니다
      8. "conArguments": 반대측 주요 논점 3가지 (배열) - 이 필드는 반드시 포함되어야 합니다
      9. "teacherTips": 교사용 지도 팁 (300자 내외) - 이 필드는 반드시 포함되어야 합니다
      10. "keyQuestions": 학생들이 고려해야 할 핵심 질문 5개 (배열)
      11. "expectedOutcomes": 기대 학습 성과 4-5개 (배열, 학생들이 이 토론을 통해 얻게 될 역량) - 이 필드는 반드시 포함되어야 합니다
      12. "materials": 토론에 필요한 준비물 목록 (배열)
      
      각 필드를 모두 포함하여 빠짐없이 작성해 주세요. 특히 background, proArguments, conArguments, teacherTips, expectedOutcomes는
      반드시 포함되어야 합니다.
      
      학생들의 사고력과 토론 능력을 향상시킬 수 있는 교육적으로 가치 있는 내용을 제공해 주세요.
      초등학생 수준에 맞게 이해하기 쉬운 내용으로 작성해 주세요.
      응답은 반드시 한국어로 작성해 주세요.
      
      만약 사용자가 학년이나 교과를 입력했다면, 그에 맞게 조정해 주세요.
      입력되지 않은 경우, 토론 주제에 가장 적합한 학년과 교과를 추천해 주세요.

      주의: 응답을 반드시 JSON 형식으로 제공해야 합니다. 외부 마크다운이나 설명 없이 오직 JSON 객체만 반환해주세요.
    `;

    // API 호출에 타임아웃 적용
    const timeoutMs = 25000; // 25초 타임아웃
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API 요청 시간 초과')), timeoutMs);
    });

    // Gemini API 호출
    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: systemMessage }],
        },
        {
          role: "model",
          parts: [{ text: "이해했습니다. 초등학교 토론 교육을 위한 시나리오를 JSON 형식으로 작성하겠습니다. 모든 필수 필드를 포함하도록 하겠습니다." }],
        },
      ],
    });

    // 타임아웃 처리
    const resultPromise = chat.sendMessage(userPrompt);
    const result = await Promise.race([resultPromise, timeoutPromise]) as any;
    const content = result.response.text();
    let scenarioData: ScenarioData;
    
    try {
      // JSON 형식 추출 (경우에 따라 Gemini가 마크다운 코드 블록 안에 JSON을 반환할 수 있음)
      let jsonContent = content;
      
      // 마크다운 코드 블록에서 JSON 추출
      const jsonMatch = content.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonContent = jsonMatch[1];
      }
      
      scenarioData = JSON.parse(jsonContent) as ScenarioData;
      
      // 필수 필드 확인
      const requiredFields = ['title', 'topic', 'background', 'proArguments', 'conArguments', 'teacherTips', 'expectedOutcomes'];
      const missingFields = requiredFields.filter(field => !scenarioData[field]);
      
      if (missingFields.length > 0) {
        console.error('누락된 필드:', missingFields);
        return NextResponse.json(
          { 
            error: '시나리오 생성이 불완전합니다. 누락된 필드가 있습니다.',
            missingFields,
            partialData: scenarioData
          },
          { status: 400 }
        );
      }
      
    } catch (err: unknown) {
      console.error('JSON 파싱 오류:', content);
      return NextResponse.json(
        { error: 'AI 응답을 파싱하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }
    
    // 성공적인 응답 반환
    return NextResponse.json({
      success: true,
      data: scenarioData
    });
    
  } catch (err: unknown) {
    console.error('시나리오 생성 오류:', err);
    // 타임아웃 오류 특별 처리
    if (err instanceof Error && err.message.includes('시간 초과')) {
      return NextResponse.json(
        { 
          error: 'AI 응답 생성에 시간이 너무 오래 걸립니다. 나중에 다시 시도해 주세요.',
          details: '요청 시간 초과' 
        },
        { status: 408 }
      );
    }
    const errorMessage = err instanceof Error ? err.message : '알 수 없는 오류';
    return NextResponse.json(
      { 
        error: '시나리오 생성 중 오류가 발생했습니다.',
        details: errorMessage 
      },
      { status: 500 }
    );
  }
} 