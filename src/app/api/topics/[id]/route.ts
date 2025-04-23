import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getCollection } from '@/utils/mongodb';

/**
 * GET 요청 처리: ID로 토론 주제 조회
 * @param request NextRequest 객체
 * @param context 라우트 파라미터가 포함된 객체 (id)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: '유효하지 않은 주제 ID입니다.' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection('topics');
    const topic = await collection.findOne({ _id: new ObjectId(id) });

    if (!topic) {
      return NextResponse.json(
        { message: '주제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    return NextResponse.json(
      { message: '주제를 조회하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * PUT 요청 처리: ID로 토론 주제 업데이트
 * @param request NextRequest 객체
 * @param context 라우트 파라미터가 포함된 객체 (id)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: '유효하지 않은 주제 ID입니다.' },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    
    // 필수 필드 검증
    if (!body.title || !body.background) {
      return NextResponse.json(
        { message: '제목과 배경 정보는 필수 항목입니다.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.proArguments) || body.proArguments.length === 0) {
      return NextResponse.json(
        { message: '최소 하나 이상의 찬성 논거가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.conArguments) || body.conArguments.length === 0) {
      return NextResponse.json(
        { message: '최소 하나 이상의 반대 논거가 필요합니다.' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection('topics');
    
    // 업데이트 시간 추가
    const updateData = {
      ...body,
      updatedAt: new Date().toISOString()
    };
    
    delete updateData._id; // _id는 업데이트할 수 없음
    
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { message: '수정할 주제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    const updatedTopic = await collection.findOne({ _id: new ObjectId(id) });
    
    return NextResponse.json(updatedTopic);
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { message: '주제를 업데이트하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE 요청 처리: ID로 토론 주제 삭제
 * @param request NextRequest 객체
 * @param context 라우트 파라미터가 포함된 객체 (id)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: '유효하지 않은 주제 ID입니다.' },
        { status: 400 }
      );
    }
    
    const collection = await getCollection('topics');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: '삭제할 주제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { message: '주제가 성공적으로 삭제되었습니다.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { message: '주제를 삭제하는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 