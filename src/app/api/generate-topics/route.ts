import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import type { NextRequest } from 'next/server';
import { getEnvVar } from '@/utils/envUtils';

// Google Gemini API 초기화
let genAI: GoogleGenerativeAI | null = null;

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트가 제공되지 않았습니다' },
        { status: 400 }
      );
    }

    // 환경 변수 유틸리티 사용
    let apiKey: string;
    try {
      apiKey = getEnvVar('GEMINI_API_KEY', true);
      // API 키 마스킹하여 로깅 (처음 5자와 마지막 4자만 표시)
      if (apiKey.length > 10) {
        const maskedKey = `${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 4)}`;
        console.log('API 키 확인:', maskedKey);
      } else {
        console.log('API 키가 너무 짧습니다. 확인이 필요합니다.');
      }
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
        console.log('Gemini API 클라이언트 초기화 성공');
      } catch (error) {
        console.error('Gemini API 클라이언트 초기화 오류:', error);
        return NextResponse.json(
          { error: 'Gemini API 클라이언트를 초기화하는 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }
    
    // 사용할 모델 설정 - API 키와 호환되는 모델 사용
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
          maxOutputTokens: 1024,
        },
      });
      console.log(`모델 "${modelName}" 설정 성공`);
    } catch (error) {
      console.error('모델 설정 오류:', error);
      return NextResponse.json(
        { error: `Gemini 모델 "${modelName}"을 설정하는 중 오류가 발생했습니다.` },
        { status: 500 }
      );
    }

    console.log('Gemini API 요청 시작:', prompt.substring(0, 100) + '...');
    
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
      const generatedText = response.text();

      console.log('Gemini API 응답 생성 완료');

      return NextResponse.json({ response: generatedText });
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