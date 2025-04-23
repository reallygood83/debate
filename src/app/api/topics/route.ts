import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Topic from '@/models/Topic';

// GET /api/topics - 모든 토론 주제 조회
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    
    const skip = (page - 1) * limit;
    
    let filter = {};
    if (query) {
      filter = { $text: { $search: query } };
    }
    
    const topics = await Topic.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Topic.countDocuments(filter);
    
    return NextResponse.json({
      topics,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    console.error('토론 주제 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '토론 주제를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// POST /api/topics - 새로운 토론 주제 생성
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // 필수 필드 검증
    const requiredFields = [
      'title',
      'background',
      'proArguments',
      'conArguments',
      'teacherTips',
      'keyQuestions',
      'expectedOutcomes',
      'subjects'
    ];
    
    const missingFields = requiredFields.filter(field => !body[field]);
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `다음 필드가 누락되었습니다: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // 배열 필드의 최소 길이 검증
    const arrayFields = ['proArguments', 'conArguments', 'keyQuestions', 'expectedOutcomes', 'subjects'];
    const emptyArrays = arrayFields.filter(field => !Array.isArray(body[field]) || body[field].length === 0);
    if (emptyArrays.length > 0) {
      return NextResponse.json(
        { error: `다음 필드는 최소 1개 이상의 항목이 필요합니다: ${emptyArrays.join(', ')}` },
        { status: 400 }
      );
    }

    const topic = await Topic.create(body);
    return NextResponse.json(topic, { status: 201 });
  } catch (error: any) {
    console.error('토론 주제 생성 중 오류 발생:', error);
    return NextResponse.json(
      { error: '토론 주제를 생성하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 