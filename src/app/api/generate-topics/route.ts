import { NextResponse } from 'next/server';

// Gemini API 키 (환경변수에서 가져오거나 여기에 직접 설정)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '프롬프트가 제공되지 않았습니다' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      console.error('Gemini API 키가 환경변수에 설정되어 있지 않습니다.');
      return NextResponse.json(
        { error: 'API 키가 설정되지 않았습니다. 서버 환경 변수에 GEMINI_API_KEY를 추가해주세요.' },
        { status: 500 }
      );
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API 오류:', errorData);
      return NextResponse.json(
        { error: 'Gemini API 오류가 발생했습니다' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Gemini API 응답에서 텍스트 추출
    const generatedText = data.candidates[0]?.content?.parts[0]?.text || '추천 주제를 생성할 수 없습니다.';

    return NextResponse.json({ response: generatedText });
  } catch (error) {
    console.error('서버 오류:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
} 