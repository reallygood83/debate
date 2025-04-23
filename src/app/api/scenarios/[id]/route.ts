import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Scenario from '@/models/Scenario';

// 응답 제한 시간 설정 (ms)
const RESPONSE_TIMEOUT = 7000; // 7초

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
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    // 타임아웃 적용하여 단일 문서 조회
    // findById 대신 find를 사용하여 lean() 최적화 활용
    const scenario = await withTimeout(
      Scenario.findById(params.id).lean().exec(),
      RESPONSE_TIMEOUT
    );
    
    if (!scenario) {
      return NextResponse.json(
        { error: '시나리오를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: scenario
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
    
    // 유효하지 않은 ID 형식 처리
    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { error: '유효하지 않은 시나리오 ID입니다.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '시나리오 조회 중 오류가 발생했습니다.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 특정 ID의 시나리오 수정
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    await dbConnect();
    
    // 업데이트 시간 추가
    const updateData = {
      ...body,
      updatedAt: new Date()
    };
    
    // 타임아웃 적용하여 문서 업데이트
    // 유효성 검사 실행하고 새 문서 반환
    const updatedScenario = await withTimeout(
      Scenario.findByIdAndUpdate(
        params.id,
        updateData,
        { 
          new: true, 
          runValidators: true,
          // 전체 문서를 반환하기보다 간소화된 객체 반환
          lean: true 
        }
      ).exec(),
      RESPONSE_TIMEOUT
    );
    
    if (!updatedScenario) {
      return NextResponse.json(
        { error: '시나리오를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: updatedScenario
    });
  } catch (error: unknown) {
    console.error('시나리오 수정 오류:', error);
    
    // 타임아웃 에러 감지
    if (error instanceof Error && error.message.includes('시간이 초과')) {
      return NextResponse.json(
        { error: '요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.' },
        { status: 408 }
      );
    }
    
    // 유효성 검사 실패 처리
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: '시나리오 데이터가 유효하지 않습니다.', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '시나리오 수정 중 오류가 발생했습니다.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

// 특정 ID의 시나리오 삭제
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await dbConnect();
    
    // 타임아웃 적용하여 문서 삭제
    const deletedScenario = await withTimeout(
      Scenario.findByIdAndDelete(params.id).lean().exec(),
      RESPONSE_TIMEOUT
    );
    
    if (!deletedScenario) {
      return NextResponse.json(
        { error: '시나리오를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: '시나리오가 성공적으로 삭제되었습니다.'
    });
  } catch (error: unknown) {
    console.error('시나리오 삭제 오류:', error);
    
    // 타임아웃 에러 감지
    if (error instanceof Error && error.message.includes('시간이 초과')) {
      return NextResponse.json(
        { error: '요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.' },
        { status: 408 }
      );
    }
    
    // 유효하지 않은 ID 형식 처리
    if (error instanceof Error && error.name === 'CastError') {
      return NextResponse.json(
        { error: '유효하지 않은 시나리오 ID입니다.' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: '시나리오 삭제 중 오류가 발생했습니다.', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 