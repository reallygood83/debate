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
  console.log("====== GET /api/scenarios 실행 시작 ======");
  try {
    console.log("MongoDB 연결 시도 중...");
    const conn = await dbConnect();
    
    // MongoDB 연결 상태 확인
    if (!conn || conn.connection.readyState !== 1) {
      console.error("MongoDB 연결 실패 - 연결 상태:", conn ? conn.connection.readyState : 'connection null');
      return NextResponse.json(
        { 
          success: false,
          error: 'MongoDB 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' 
        },
        { status: 503 }  // Service Unavailable
      );
    }
    
    console.log("MongoDB 연결 성공!");
    
    // URL 쿼리 매개변수 파싱
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10); // 기본 20개
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const search = url.searchParams.get('search');
    
    console.log(`요청 파라미터: page=${page}, limit=${limit}, search=${search || '없음'}`);
    
    // 페이지네이션 계산
    const skip = (page - 1) * limit;
    
    // 쿼리 빌더 초기화
    let query = Scenario.find();
    
    // 제목 검색 필터 추가
    if (search) {
      console.log(`검색어 '${search}'로 필터링 적용`);
      query = query.find({ $text: { $search: search } });
    }
    
    // 필요한 필드만 선택 (프로젝션)
    query = query.select('title totalDurationMinutes groupCount createdAt updatedAt aiGenerated scenarioDetails.background');
    
    // 정렬, 페이지네이션 적용
    query = query.sort({ createdAt: -1 }).skip(skip).limit(limit);
    
    console.log("시나리오 데이터 쿼리 실행 중...");
    // 타임아웃 적용하여 쿼리 실행
    const scenarios = await withTimeout(query.exec(), RESPONSE_TIMEOUT);
    console.log(`쿼리 성공: ${scenarios.length}개의 시나리오를 가져옴`);
    
    console.log("전체 문서 수 쿼리 실행 중...");
    
    // 전체 문서 수 확인 전에 다시 한 번 연결 상태 확인
    if (conn.connection.readyState !== 1) {
      throw new Error('MongoDB 연결이 중간에 끊어졌습니다.');
    }
    
    // 전체 문서 수 쿼리도 타임아웃 적용
    const totalCount = await withTimeout(
      Scenario.countDocuments(search ? { $text: { $search: search } } : {}),
      RESPONSE_TIMEOUT
    );
    console.log(`전체 문서 수 쿼리 성공: 총 ${totalCount}개 문서 확인`);
    
    console.log("====== GET /api/scenarios 성공적으로 완료 ======");
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
    console.error("====== GET /api/scenarios 오류 발생 ======");
    console.error('시나리오 조회 오류 세부 정보:', error instanceof Error ? error.stack : String(error));
    
    // MongoNotConnectedError 특별 처리
    if (error instanceof Error && 
        (error.name === 'MongoNotConnectedError' || 
         error.message.includes('Client must be connected')) ) {
      console.error("MongoDB 연결 문제 발생");
      return NextResponse.json(
        { 
          success: false,
          error: 'MongoDB 연결 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          details: error.message
        },
        { status: 503 }
      );
    }
    
    // 타임아웃 에러 감지
    if (error instanceof Error && error.message.includes('시간이 초과')) {
      console.error("API 타임아웃 발생");
      return NextResponse.json(
        { 
          success: false,
          error: '요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.' 
        },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: '시나리오 조회 중 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

// 새 시나리오 저장
export async function POST(request: NextRequest) {
  console.log("====== POST /api/scenarios 실행 시작 ======");
  try {
    const body = await request.json();
    console.log("MongoDB 연결 시도 중...");
    const conn = await dbConnect();
    
    // MongoDB 연결 상태 확인
    if (!conn || conn.connection.readyState !== 1) {
      console.error("MongoDB 연결 실패 - 연결 상태:", conn ? conn.connection.readyState : 'connection null');
      return NextResponse.json(
        { 
          success: false,
          error: 'MongoDB 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' 
        },
        { status: 503 }
      );
    }
    
    console.log("MongoDB 연결 성공!");
    
    // 시나리오 생성
    console.log("새 시나리오 생성 중...");
    const scenario = new Scenario({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    // 타임아웃 적용하여 저장
    console.log("시나리오 데이터베이스 저장 중...");
    const savedScenario = await withTimeout(scenario.save(), RESPONSE_TIMEOUT);
    console.log(`시나리오 저장 성공: ID=${savedScenario._id}`);
    
    console.log("====== POST /api/scenarios 성공적으로 완료 ======");
    return NextResponse.json({
      success: true,
      data: savedScenario
    }, { status: 201 });
  } catch (error: unknown) {
    console.error("====== POST /api/scenarios 오류 발생 ======");
    console.error('시나리오 저장 오류 세부 정보:', error instanceof Error ? error.stack : String(error));
    
    // MongoNotConnectedError 특별 처리
    if (error instanceof Error && 
        (error.name === 'MongoNotConnectedError' || 
         error.message.includes('Client must be connected')) ) {
      console.error("MongoDB 연결 문제 발생");
      return NextResponse.json(
        { 
          success: false,
          error: 'MongoDB 연결 문제가 발생했습니다. 잠시 후 다시 시도해주세요.',
          details: error.message
        },
        { status: 503 }
      );
    }
    
    // 타임아웃 에러 감지
    if (error instanceof Error && error.message.includes('시간이 초과')) {
      console.error("API 타임아웃 발생");
      return NextResponse.json(
        { 
          success: false,
          error: '요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.' 
        },
        { status: 408 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: '시나리오 저장 중 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 