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

// 특정 ID의 시나리오 조회
// @ts-ignore - Next.js 15 타입 호환성 이슈
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`====== GET /api/scenarios/${params.id} 실행 시작 ======`);
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
    
    console.log(`ID: ${params.id}로 시나리오 조회 중...`);
    // 타임아웃 적용하여 단일 문서 조회
    let scenario;
    try {
      // findById 대신 find를 사용하여 String ID 처리
      scenario = await withTimeout(
        Scenario.findOne({ _id: params.id }).lean().exec(),
        RESPONSE_TIMEOUT
      );
    } catch (findError) {
      // CastError가 발생한 경우 (ID 형식 불일치)
      if (findError instanceof Error && findError.name === 'CastError') {
        console.error(`ID 형식 오류: ${params.id}는 유효한 MongoDB ID 형식이 아닙니다`);
        return NextResponse.json(
          { 
            success: false,
            error: '유효하지 않은 시나리오 ID 형식입니다.',
            details: `ID "${params.id}"는 유효한 ID 형식이 아닙니다.`
          },
          { status: 400 }
        );
      }
      throw findError; // 다른 오류는 다시 던짐
    }
    
    if (!scenario) {
      console.log(`ID: ${params.id}의 시나리오를 찾을 수 없음`);
      return NextResponse.json(
        { 
          success: false,
          error: '시나리오를 찾을 수 없습니다.' 
        },
        { status: 404 }
      );
    }
    
    console.log(`ID: ${params.id}의 시나리오 조회 성공`);
    console.log(`====== GET /api/scenarios/${params.id} 성공적으로 완료 ======`);
    return NextResponse.json({
      success: true,
      data: scenario
    });
  } catch (error: unknown) {
    console.error(`====== GET /api/scenarios/${params.id} 오류 발생 ======`);
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
    
    // 유효하지 않은 ID 형식 처리
    if (error instanceof Error && error.name === 'CastError') {
      console.error(`유효하지 않은 ID 형식: ${params.id}`);
      return NextResponse.json(
        { 
          success: false,
          error: '유효하지 않은 시나리오 ID입니다.' 
        },
        { status: 400 }
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

// 특정 ID의 시나리오 수정
// @ts-ignore - Next.js 15 타입 호환성 이슈
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`====== PUT /api/scenarios/${params.id} 실행 시작 ======`);
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
        { status: 503 }  // Service Unavailable
      );
    }
    
    console.log("MongoDB 연결 성공!");
    
    // 업데이트 시간 추가
    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    console.log(`ID: ${params.id}의 시나리오 업데이트 중...`);
    
    // UUID 형식의 ID를 처리하기 위해 findOneAndUpdate 사용
    let updatedScenario;
    try {
      updatedScenario = await withTimeout(
        Scenario.findOneAndUpdate(
          { _id: params.id },
          updateData,
          { 
            new: true, 
            runValidators: true,
            lean: true 
          }
        ).exec(),
        RESPONSE_TIMEOUT
      );
    } catch (updateError) {
      // CastError가 발생한 경우 (ID 형식 불일치)
      if (updateError instanceof Error && updateError.name === 'CastError') {
        console.error(`ID 형식 오류: ${params.id}는 유효한 ID 형식이 아닙니다`);
        return NextResponse.json(
          { 
            success: false,
            error: '유효하지 않은 시나리오 ID 형식입니다.',
            details: `ID "${params.id}"는 유효한 ID 형식이 아닙니다. 시나리오 스키마가 UUID를 지원하도록 수정해야 합니다.`
          },
          { status: 400 }
        );
      }
      throw updateError; // 다른 오류는 다시 던짐
    }
    
    if (!updatedScenario) {
      console.log(`ID: ${params.id}의 시나리오를 찾을 수 없음`);
      return NextResponse.json(
        { 
          success: false,
          error: '시나리오를 찾을 수 없습니다.' 
        },
        { status: 404 }
      );
    }
    
    console.log(`ID: ${params.id}의 시나리오 업데이트 성공`);
    console.log(`====== PUT /api/scenarios/${params.id} 성공적으로 완료 ======`);
    return NextResponse.json({
      success: true,
      data: updatedScenario
    });
  } catch (error: unknown) {
    console.error(`====== PUT /api/scenarios/${params.id} 오류 발생 ======`);
    console.error('시나리오 수정 오류 세부 정보:', error instanceof Error ? error.stack : String(error));
    
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
    
    // 유효성 검사 실패 처리
    if (error instanceof Error && error.name === 'ValidationError') {
      console.error("시나리오 데이터 유효성 검사 실패");
      return NextResponse.json(
        { 
          success: false,
          error: '시나리오 데이터가 유효하지 않습니다.', 
          details: error.message 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: '시나리오 수정 중 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

// 특정 ID의 시나리오 삭제
// @ts-ignore - Next.js 15 타입 호환성 이슈
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  console.log(`====== DELETE /api/scenarios/${params.id} 실행 시작 ======`);
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
    
    console.log(`ID: ${params.id}의 시나리오 삭제 중...`);
    // UUID 형식의 ID를 처리하기 위해 findOneAndDelete 사용
    let deletedScenario;
    try {
      deletedScenario = await withTimeout(
        Scenario.findOneAndDelete({ _id: params.id }).lean().exec(),
        RESPONSE_TIMEOUT
      );
    } catch (deleteError) {
      // CastError가 발생한 경우 (ID 형식 불일치)
      if (deleteError instanceof Error && deleteError.name === 'CastError') {
        console.error(`ID 형식 오류: ${params.id}는 유효한 ID 형식이 아닙니다`);
        return NextResponse.json(
          { 
            success: false,
            error: '유효하지 않은 시나리오 ID 형식입니다.',
            details: `ID "${params.id}"는 유효한 ID 형식이 아닙니다.`
          },
          { status: 400 }
        );
      }
      throw deleteError; // 다른 오류는 다시 던짐
    }
    
    if (!deletedScenario) {
      console.log(`ID: ${params.id}의 시나리오를 찾을 수 없음`);
      return NextResponse.json(
        { 
          success: false,
          error: '시나리오를 찾을 수 없습니다.' 
        },
        { status: 404 }
      );
    }
    
    console.log(`ID: ${params.id}의 시나리오 삭제 성공`);
    console.log(`====== DELETE /api/scenarios/${params.id} 성공적으로 완료 ======`);
    return NextResponse.json({
      success: true,
      message: '시나리오가 성공적으로 삭제되었습니다.'
    });
  } catch (error: unknown) {
    console.error(`====== DELETE /api/scenarios/${params.id} 오류 발생 ======`);
    console.error('시나리오 삭제 오류 세부 정보:', error instanceof Error ? error.stack : String(error));
    
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
    
    // 유효하지 않은 ID 형식 처리
    if (error instanceof Error && error.name === 'CastError') {
      console.error(`유효하지 않은 ID 형식: ${params.id}`);
      return NextResponse.json(
        { 
          success: false,
          error: '유효하지 않은 시나리오 ID입니다.' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: '시나리오 삭제 중 오류가 발생했습니다.', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 