import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Scenario from '@/models/Scenario';
import type { NextRequest } from 'next/server';

// 응답 제한 시간 설정 (ms)
const RESPONSE_TIMEOUT = 30000; // 30초

// 타임아웃 처리 함수
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(`요청 시간이 ${timeoutMs}ms를 초과했습니다.`)), timeoutMs)
    )
  ]) as Promise<T>;
};

// 모든 시나리오 조회
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // URL 쿼리 매개변수 파싱
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10); // 기본 20개
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const search = url.searchParams.get('search');
    
    // 페이지네이션 계산
    const skip = (page - 1) * limit;
    
    // 쿼리 빌더 초기화
    let query = Scenario.find();
    
    // 제목 검색 필터 추가
    if (search) {
      query = query.find({ $text: { $search: search } });
    }
    
    // 필요한 필드만 선택 (프로젝션)
    query = query.select('title totalDurationMinutes groupCount createdAt updatedAt aiGenerated scenarioDetails.background');
    
    // 정렬, 페이지네이션 적용
    query = query.sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    // 타임아웃 적용하여 쿼리 실행
    const scenarios = await withTimeout(query.exec(), RESPONSE_TIMEOUT);
    
    // 전체 문서 수 쿼리도 타임아웃 적용
    const totalCount = await withTimeout(
      Scenario.countDocuments(search ? { $text: { $search: search } } : {}),
      RESPONSE_TIMEOUT
    );
    
    return NextResponse.json({
      success: true,
      data: scenarios,
      meta: {
        total: totalCount,
        page,
        limit,
        pages: Math.ceil(totalCount / limit)
      }
    });
  } catch (error: unknown) {
    console.error('시나리오 조회 오류:', error);
    // 타임아웃 에러 감지
    if (error instanceof Error && error.message.includes('시간이 초과')) {
      return NextResponse.json(
        { error: '요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: '시나리오 조회 중 오류가 발생했습니다.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 새 시나리오 저장
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await dbConnect();
    
    // 시나리오 생성
    const scenario = new Scenario({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // 타임아웃 적용하여 저장
    const savedScenario = await withTimeout(scenario.save(), RESPONSE_TIMEOUT);
    
    return NextResponse.json({
      success: true,
      data: savedScenario
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('시나리오 저장 오류:', error);
    
    // 타임아웃 에러 감지
    if (error instanceof Error && error.message.includes('시간이 초과')) {
      return NextResponse.json(
        { error: '요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.' },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { error: '시나리오 저장 중 오류가 발생했습니다.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 