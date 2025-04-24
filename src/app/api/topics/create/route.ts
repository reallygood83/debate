import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    
    // 필수 필드 검증
    const requiredFields = [
      'title', 
      'background', 
      'proArguments', 
      'conArguments', 
      'teacherTips', 
      'keyQuestions', 
      'expectedOutcomes',
      'subjects',
      'grade'
    ];
    
    const missingFields = requiredFields.filter(field => !reqBody[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: '필수 필드가 누락되었습니다.', 
          missingFields 
        }, 
        { status: 400 }
      );
    }
    
    // 배열 필드 최소 길이 검증
    const arrayFields = {
      proArguments: 1,
      conArguments: 1,
      keyQuestions: 1,
      expectedOutcomes: 1,
      subjects: 1
    };
    
    const invalidArrayFields = Object.entries(arrayFields)
      .filter(([field, minLength]) => 
        !Array.isArray(reqBody[field]) || reqBody[field].length < minLength
      )
      .map(([field]) => field);
    
    if (invalidArrayFields.length > 0) {
      return NextResponse.json(
        { 
          error: '유효하지 않은 배열 필드가 있습니다.', 
          invalidArrayFields 
        }, 
        { status: 400 }
      );
    }
    
    // MongoDB 컬렉션 가져오기
    const collection = await getCollection('topics');
    
    // 새 토픽 생성
    const newTopic = {
      ...reqBody,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // DB에 저장
    const result = await collection.insertOne(newTopic);
    
    if (!result.acknowledged) {
      return NextResponse.json(
        { error: '토론 주제 생성에 실패했습니다.' }, 
        { status: 500 }
      );
    }
    
    // 생성된 토픽 반환
    return NextResponse.json(
      { 
        success: true, 
        message: '토론 주제가 성공적으로 생성되었습니다.',
        data: { 
          ...newTopic, 
          _id: result.insertedId 
        } 
      }, 
      { status: 201 }
    );
    
  } catch (error) {
    console.error('토론 주제 생성 오류:', error);
    return NextResponse.json(
      { 
        error: '토론 주제 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      }, 
      { status: 500 }
    );
  }
} 