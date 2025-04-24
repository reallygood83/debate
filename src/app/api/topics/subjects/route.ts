import { NextResponse } from 'next/server';
import { getCollection } from '@/utils/mongodb';

export async function GET() {
  try {
    const collection = await getCollection('topics');
    const subjects = await collection
      .aggregate([
        { $unwind: '$subjects' },
        { $group: { _id: '$subjects' } },
        { $project: { _id: 0, subject: '$_id' } },
        { $sort: { subject: 1 } }
      ])
      .toArray();

    const subjectList = subjects.map((item) => item.subject);

    // data 객체로 감싸서 일관된 응답 구조 유지
    return NextResponse.json({ 
      data: { 
        subjects: subjectList 
      } 
    });
  } catch (error) {
    console.error('주제 카테고리 조회 오류:', error);
    return NextResponse.json(
      { error: '주제 카테고리를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 