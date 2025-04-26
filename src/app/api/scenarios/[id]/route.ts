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
      
      // 요청 헤더에서 클라이언트가 로컬 데이터 동기화를 원하는지 확인
      const allowLocalSync = request.headers.get('X-Allow-Local-Sync') === 'true';
      
      if (allowLocalSync) {
        // 클라이언트가 로컬 데이터 동기화를 원하면 특수 응답 반환
        return NextResponse.json({
          success: false,
          error: '시나리오를 찾을 수 없습니다.',
          localSync: true  // 클라이언트에게 로컬 데이터를 사용하라고 알림
        }, { status: 404 });
      }
      
      // 클라이언트가 빈 시나리오 템플릿을 요청할 수 있는 플래그
      const createTemplate = request.nextUrl.searchParams.get('createTemplate') === 'true';
      
      if (createTemplate) {
        // 빈 시나리오 템플릿 생성
        const templateScenario = {
          _id: params.id,
          title: '새 토론 시나리오',
          totalDurationMinutes: 45,
          groupCount: 4,
          createdAt: new Date(),
          updatedAt: new Date(),
          stages: {
            stage1: { id: 'stage1', title: '준비 단계', activities: [] },
            stage2: { id: 'stage2', title: '토론 단계', activities: [] },
            stage3: { id: 'stage3', title: '정리 단계', activities: [] }
          },
          aiGenerated: false,
          scenarioDetails: {
            background: '',
            proArguments: [],
            conArguments: [],
            teacherTips: '',
            keyQuestions: []
          }
        };
        
        console.log(`ID: ${params.id}의 템플릿 시나리오 생성`);
        return NextResponse.json({
          success: true,
          data: templateScenario,
          isTemplate: true
        });
      }
      
      // 기본적으로는 404 반환
      return NextResponse.json(
        { 
          success: false,
          error: '시나리오를 찾을 수 없습니다.',
          suggestLocalSync: true  // 클라이언트에게 로컬 동기화 옵션이 있음을 알림
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
      _id: params.id, // 명시적으로 ID 설정
      updatedAt: new Date()
    };
    
    console.log(`ID: ${params.id}의 시나리오 업데이트 또는 생성 중...`);
    
    // UUID 형식의 ID를 처리하기 위해 findOneAndUpdate 사용
    // upsert:true 옵션으로 문서가 없으면 새로 생성
    let updatedScenario;
    try {
      updatedScenario = await withTimeout(
        Scenario.findOneAndUpdate(
          { _id: params.id },
          updateData,
          { 
            new: true, 
            runValidators: true,
            lean: true,
            upsert: true // 문서가 없으면 새로 생성
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
      console.log(`ID: ${params.id}의 시나리오 생성 또는 업데이트 실패`);
      return NextResponse.json(
        { 
          success: false,
          error: '시나리오를 생성 또는 업데이트하지 못했습니다.' 
        },
        { status: 500 }
      );
    }
    
    const isNewlyCreated = !body._id;
    console.log(`ID: ${params.id}의 시나리오 ${isNewlyCreated ? '생성' : '업데이트'} 성공`);
    console.log(`====== PUT /api/scenarios/${params.id} 성공적으로 완료 ======`);
    
    return NextResponse.json({
      success: true,
      data: updatedScenario,
      isNewlyCreated
    }, { status: isNewlyCreated ? 201 : 200 });
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
  console.log(`요청 URL: ${request.url}`);
  console.log(`요청 헤더:`, Object.fromEntries([...request.headers.entries()]));
  
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
    
    // 삭제 전에 시나리오가 실제로 존재하는지 먼저 확인
    console.log(`ID: ${params.id}의 시나리오 존재 여부 확인 중...`);
    
    let existingScenario;
    try {
      existingScenario = await Scenario.findOne({ _id: params.id }).lean().exec();
    } catch (findError) {
      console.error(`시나리오 조회 중 오류:`, findError);
      // 오류가 발생해도 계속 진행
    }
    
    if (!existingScenario) {
      console.log(`ID: ${params.id}의 시나리오가 이미 존재하지 않습니다.`);
      return NextResponse.json({
        success: true,
        message: '시나리오가 이미 존재하지 않습니다.'
      });
    }
    
    console.log(`ID: ${params.id}의 시나리오가 존재함을 확인. 삭제 시도...`);
    console.log('시나리오 정보:', JSON.stringify(existingScenario));
    
    // 강제 삭제 모드 체크
    const forceDelete = request.nextUrl.searchParams.get('force') === 'true' || 
                        request.headers.get('X-Force-Delete') === 'true';
    
    console.log(`강제 삭제 모드: ${forceDelete ? '활성화' : '비활성화'}`);
    
    console.log(`ID: ${params.id}의 시나리오 삭제 중...`);
    // UUID 형식의 ID를 처리하기 위해 findOneAndDelete 사용
    let deletedScenario;
    try {
      if (forceDelete) {
        // 강제 삭제 모드: deleteOne 사용
        console.log(`강제 삭제 모드로 deleteOne 사용...`);
        const deleteResult = await withTimeout(
          Scenario.deleteOne({ _id: params.id }).exec(),
          RESPONSE_TIMEOUT
        );
        
        console.log(`deleteOne 결과:`, deleteResult);
        
        if (deleteResult.deletedCount === 0) {
          console.warn(`deleteOne 결과: 삭제된 문서 없음`);
        } else {
          console.log(`deleteOne 결과: ${deleteResult.deletedCount}개 문서 삭제됨`);
          deletedScenario = existingScenario; // 이미 조회했던 문서 사용
        }
      } else {
        // 기본 모드: findOneAndDelete 사용
        deletedScenario = await withTimeout(
          Scenario.findOneAndDelete({ _id: params.id }).lean().exec(),
          RESPONSE_TIMEOUT
        );
      }
    } catch (deleteError) {
      // CastError가 발생한 경우 (ID 형식 불일치)
      if (deleteError instanceof Error && deleteError.name === 'CastError') {
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
      console.error(`삭제 작업 중 오류 발생:`, deleteError);
      throw deleteError; // 다른 오류는 다시 던짐
    }
    
    // 실제로 삭제되었는지 확인
    console.log(`삭제 작업 후 ID: ${params.id}의 시나리오 존재 여부 다시 확인 중...`);
    const checkAfterDelete = await Scenario.findOne({ _id: params.id }).lean().exec();
    
    if (checkAfterDelete) {
      console.error(`경고: 삭제 작업 후에도 ID: ${params.id}의 시나리오가 여전히 존재합니다!`);
      console.log(`삭제 실패한 시나리오 데이터:`, JSON.stringify(checkAfterDelete));
      
      if (forceDelete) {
        // 강제 삭제가 실패한 경우, 더 강력한 방법 시도
        console.log(`마지막 시도: deleteMany 사용...`);
        try {
          const finalDeleteResult = await Scenario.deleteMany({ _id: params.id }).exec();
          console.log(`deleteMany 결과:`, finalDeleteResult);
          
          if (finalDeleteResult.deletedCount === 0) {
            console.error(`deleteMany 실패: 삭제된 문서 없음`);
            return NextResponse.json(
              { 
                success: false,
                error: '시나리오 삭제에 실패했습니다. 데이터베이스 오류가 발생했습니다.',
                details: '여러 번의 삭제 시도가 모두 실패했습니다.'
              },
              { status: 500 }
            );
          }
          
          console.log(`deleteMany 성공: ${finalDeleteResult.deletedCount}개 문서 삭제됨`);
        } catch (finalError) {
          console.error(`deleteMany 오류:`, finalError);
        }
      }
    } else {
      console.log(`확인 완료: ID: ${params.id}의 시나리오가 성공적으로 삭제되었습니다.`);
    }
    
    // 시나리오가 없어도 성공으로 처리 (멱등성 보장)
    if (!deletedScenario && !forceDelete) {
      console.log(`ID: ${params.id}의 시나리오를 찾을 수 없지만, 삭제 요청은 성공으로 처리`);
      return NextResponse.json({
        success: true,
        message: '시나리오가 이미 존재하지 않거나 성공적으로 삭제되었습니다.'
      });
    }
    
    console.log(`ID: ${params.id}의 시나리오 삭제 성공`);
    console.log(`====== DELETE /api/scenarios/${params.id} 성공적으로 완료 ======`);
    
    // 캐시 방지 헤더 추가
    const headers = new Headers();
    headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('Surrogate-Control', 'no-store');
    
    return NextResponse.json({
      success: true,
      message: '시나리오가 성공적으로 삭제되었습니다.',
      id: params.id,
      timestamp: Date.now()
    }, { headers });
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