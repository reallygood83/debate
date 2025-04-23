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
    // 쿼리 파라미터
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('q') || '';
    const subject = searchParams.get('subject') || '';
    
    // 페이지네이션 계산
    const skip = (page - 1) * limit;
    
    // MongoDB 컬렉션 가져오기
    const collection = await getCollection('topics');
    
    // 검색 쿼리 구성
    const filter: any = {};
    
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { background: { $regex: query, $options: 'i' } }
      ];
    }
    
    if (subject && subject !== 'all') {
      filter.subjects = { $in: [subject] };
    }
    
    // 토픽 가져오기
    const topics = await collection
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    
    // 전체 토픽 수 조회
    const total = await collection.countDocuments(filter);
    
    // 페이지네이션 정보 추가
    const totalPages = Math.ceil(total / limit);
    
    return NextResponse.json({
      topics,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
    
  } catch (error) {
    console.error('토론 주제 조회 오류:', error);
    return NextResponse.json(
      { message: '토론 주제를 조회하는 중 오류가 발생했습니다.' }, 
      { status: 500 }
    );
  }
} 