import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

// 토론 주제 생성 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    const requiredFields = ['title', 'background', 'grade', 'proArguments', 'conArguments', 'teacherTips', 'keyQuestions', 'expectedOutcomes', 'subjects'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `다음 필드가 필요합니다: ${missingFields.join(', ')}` }, 
        { status: 400 }
      );
    }
    
    // 배열 필드 검증
    const arrayFields = ['proArguments', 'conArguments', 'keyQuestions', 'expectedOutcomes', 'subjects'];
    for (const field of arrayFields) {
      if (!Array.isArray(body[field]) || body[field].length === 0) {
        return NextResponse.json(
          { message: `${field}에는 최소 하나 이상의 항목이 필요합니다.` }, 
          { status: 400 }
        );
      }
    }
    
    // MongoDB 컬렉션 가져오기
    const collection = await getCollection('topics');
    
    // 새 토론 주제 생성
    const topic = {
      title: body.title,
      grade: body.grade,
      background: body.background,
      proArguments: body.proArguments,
      conArguments: body.conArguments,
      teacherTips: body.teacherTips,
      keyQuestions: body.keyQuestions,
      expectedOutcomes: body.expectedOutcomes,
      subjects: body.subjects,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      useCount: 0
    };
    
    const result = await collection.insertOne(topic);
    
    // 결과 반환
    return NextResponse.json({ 
      ...topic, 
      _id: result.insertedId 
    }, { status: 201 });
    
  } catch (error) {
    console.error('토론 주제 생성 오류:', error);
    return NextResponse.json(
      { message: '토론 주제를 생성하는 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
}

// 토론 주제 목록 조회 API
export async function GET(request: NextRequest) {
  try {
    // URL 검색 매개변수 가져오기
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const query = searchParams.get('query') || '';
    const subject = searchParams.get('subject') || '';
    const grade = searchParams.get('grade') || '';
    
    // 페이지네이션 계산
    const skip = (page - 1) * limit;
    
    // MongoDB 컬렉션 가져오기
    const collection = await getCollection('topics');
    
    // 검색 필터 구성
    const filter: any = {};
    
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { background: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (subject) {
      filter.subjects = { $in: [subject] };
    }
    
    if (grade && grade !== '전체') {
      filter.grade = grade;
    }
    
    // 토픽 총 개수 조회
    const totalTopics = await collection.countDocuments(filter);
    
    // 토픽 조회
    const topics = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 응답 반환
    return NextResponse.json({
      success: true,
      data: {
        topics,
        pagination: {
          total: totalTopics,
          page,
          limit,
          totalPages: Math.ceil(totalTopics / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('토론 주제 조회 오류:', error);
    return NextResponse.json(
      { 
        error: '토론 주제 조회 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
} 