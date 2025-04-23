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
}

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
    let prompt = `
      당신은 초등학교 교사를 위한 토론 주제 생성 전문가입니다.
      다음 조건에 맞는 토론 주제 3가지를 생성해주세요:
      
      ${subject ? `관련 교과: ${subject}` : ''}
      ${gradeGroup ? `학년군: ${gradeGroup}` : ''}
      ${keywords ? `관련 키워드: ${keywords}` : ''}
      
      각 토론 주제는 다음 요건을 충족해야 합니다:
      1. 초등학생이 이해할 수 있는 수준이어야 함
      2. 찬반 의견이 팽팽하게 나뉠 수 있는 주제여야 함
      3. 교과 과정과 연계되어야 함
      4. 교육적 가치가 있어야 함
      5. 현재 사회적 이슈와 관련이 있으면 더 좋음
      
      다음 형식으로 JSON 형태로 응답해주세요:
      [
        {
          "title": "토론 주제 제목 (예: 학교에서 휴대폰 사용을 허용해야 한다)",
          "description": "해당 주제에 대한 간략한 설명 (100자 이내)"
        },
        {
          "title": "토론 주제 제목 2",
          "description": "설명 2"
        },
        {
          "title": "토론 주제 제목 3",
          "description": "설명 3"
        }
      ]
      
      JSON 형식만 출력하세요. 바깥에 Markdown이나 설명 텍스트를 추가하지 마세요.
    `;
    
    // API 호출에 타임아웃 적용
    const timeoutMs = 25000; // 25초 타임아웃
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Gemini API 요청 시간 초과')), timeoutMs);
    });

    // Gemini API 호출
    try {
      const resultPromise = model.generateContent(prompt);
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