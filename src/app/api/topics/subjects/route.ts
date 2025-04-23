import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET() {
  try {
    const collection = await getCollection('topics');
    
    // topics 컬렉션의 모든 문서에서 고유한 subjects 값 추출
    const subjectsResult = await collection.aggregate([
      { $unwind: '$subjects' },
      { $group: { _id: '$subjects' } },
      { $sort: { _id: 1 } }
    ]).toArray();
    
    // _id 필드를 문자열로 변환하여 subjects 배열 생성
    const subjects = subjectsResult.map(doc => doc._id);
    
    return NextResponse.json({ subjects }, { status: 200 });
  } catch (error) {
    console.error('과목 목록 조회 중 오류 발생:', error);
    return NextResponse.json(
      { error: '과목 목록을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 