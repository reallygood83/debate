import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';
import { ObjectId } from 'mongodb';

/**
 * GET 요청 처리: ID로 토론 주제 조회
 * @param request NextRequest 객체
 * @param context 라우트 파라미터가 포함된 객체 (id)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ID 유효성 검사
    const id = params.id;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: '유효하지 않은 토론 주제 ID입니다.' },
        { status: 400 }
      );
    }

    // MongoDB에서 토론 주제 조회
    const collection = await getCollection('topics');
    const topic = await collection.findOne({ _id: new ObjectId(id) });

    if (!topic) {
      return NextResponse.json(
        { message: '해당 ID의 토론 주제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: topic }, { status: 200 });
  } catch (error) {
    console.error('토론 주제 조회 중 오류:', error);
    return NextResponse.json(
      { message: '토론 주제 조회 중 오류가 발생했습니다.' },
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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ID 유효성 검사
    const id = params.id;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: '유효하지 않은 토론 주제 ID입니다.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    
    // 필수 필드 검증
    const requiredFields = ['title', 'background', 'proArguments', 'conArguments', 'grade', 'subjects'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { message: `다음 필드가 필요합니다: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // 배열 필드 최소 길이 검증
    const arrayFields = [
      { name: 'proArguments', min: 1 },
      { name: 'conArguments', min: 1 },
      { name: 'subjects', min: 1 }
    ];
    
    for (const field of arrayFields) {
      if (!Array.isArray(body[field.name]) || body[field.name].length < field.min) {
        return NextResponse.json(
          { message: `${field.name}는 최소 ${field.min}개 이상의 항목이 필요합니다.` },
          { status: 400 }
        );
      }
    }
    
    // 업데이트할 데이터 생성
    const updateData = {
      title: body.title,
      background: body.background,
      proArguments: body.proArguments,
      conArguments: body.conArguments,
      teacherTips: body.teacherTips || '',
      keyQuestions: Array.isArray(body.keyQuestions) ? body.keyQuestions : [],
      expectedOutcomes: Array.isArray(body.expectedOutcomes) ? body.expectedOutcomes : [],
      subjects: body.subjects,
      grade: body.grade,
      updatedAt: new Date().toISOString()
    };
    
    const topicsCollection = await getCollection('topics');
    
    // 업데이트 전에 주제가 존재하는지 확인
    const topic = await topicsCollection.findOne({ _id: new ObjectId(id) });
    
    if (!topic) {
      return NextResponse.json(
        { message: '해당 토론 주제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    // 토론 주제 업데이트
    const result = await topicsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { message: '토론 주제 업데이트에 실패했습니다.' },
        { status: 500 }
      );
    }
    
    // 업데이트된 주제 조회
    const updatedTopic = await topicsCollection.findOne({ _id: new ObjectId(id) });
    
    return NextResponse.json(
      { message: '토론 주제가 성공적으로 업데이트되었습니다.', data: updatedTopic },
      { status: 200 }
    );
  } catch (error) {
    console.error('토론 주제 업데이트 오류:', error);
    return NextResponse.json(
      { message: '토론 주제를 업데이트하는 중 오류가 발생했습니다.' },
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
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // ID 유효성 검사
    const id = params.id;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: '유효하지 않은 토론 주제 ID입니다.' },
        { status: 400 }
      );
    }

    const topicsCollection = await getCollection('topics');
    
    // 삭제 전에 주제가 존재하는지 확인
    // MongoDB에서 토론 주제 삭제
    const collection = await getCollection('topics');
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { message: '해당 ID의 토론 주제를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: '토론 주제가 성공적으로 삭제되었습니다.' }, { status: 200 });
  } catch (error) {
    console.error('토론 주제 삭제 중 오류:', error);
    return NextResponse.json(
      { message: '토론 주제 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 