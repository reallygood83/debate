import { NextResponse } from 'next/server';
import connectDB from '@/utils/db';
import Topic from '@/models/Topic';

// GET /api/topics/[id] - 특정 토론 주제 조회
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // MongoDB URI가 없거나 연결에 실패했을 경우 오류 반환
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB URI가 설정되지 않았습니다. 토론 주제를 조회할 수 없습니다.' },
        { status: 503 }
      );
    }
    
    const topic = await Topic.findById(params.id);
    
    if (!topic) {
      return NextResponse.json(
        { error: '해당 토론 주제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('토론 주제 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '토론 주제를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// PUT /api/topics/[id] - 토론 주제 수정
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    await connectDB();
    
    // MongoDB URI가 없거나 연결에 실패했을 경우 오류 반환
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB URI가 설정되지 않았습니다. 토론 주제를 수정할 수 없습니다.' },
        { status: 503 }
      );
    }
    
    const topic = await Topic.findByIdAndUpdate(
      params.id,
      { ...body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!topic) {
      return NextResponse.json(
        { error: '해당 토론 주제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ topic });
  } catch (error) {
    console.error('토론 주제 수정 중 오류 발생:', error);
    return NextResponse.json(
      { error: '토론 주제를 수정하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// DELETE /api/topics/[id] - 토론 주제 삭제
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    
    // MongoDB URI가 없거나 연결에 실패했을 경우 오류 반환
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MongoDB URI가 설정되지 않았습니다. 토론 주제를 삭제할 수 없습니다.' },
        { status: 503 }
      );
    }
    
    const topic = await Topic.findByIdAndDelete(params.id);

    if (!topic) {
      return NextResponse.json(
        { error: '해당 토론 주제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: '토론 주제가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('토론 주제 삭제 중 오류 발생:', error);
    return NextResponse.json(
      { error: '토론 주제를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 