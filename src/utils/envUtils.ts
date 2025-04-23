/**
 * 환경 변수 관리 유틸리티
 * 
 * Vercel 배포 시 환경 변수 관련 문제를 미리 감지하고 명확한 오류 메시지를 제공합니다.
 */

/**
 * 필수 환경 변수를 검증합니다.
 * 누락된 환경 변수가 있으면 오류를 발생시킵니다.
 */
export function validateRequiredEnvVars(vars: string[]): void {
  const missing = vars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    const missingVars = missing.join(', ');
    console.error(`필수 환경 변수가 누락되었습니다: ${missingVars}`);
    throw new Error(`환경 변수 오류: ${missingVars} 설정이 필요합니다.`);
  }
}

/**
 * 환경 변수를 안전하게 가져옵니다.
 * 환경 변수가 없으면 기본값을 반환하거나 오류를 발생시킵니다.
 * 
 * @param varName 환경 변수 이름
 * @param required 필수 여부 (기본값: true)
 * @param defaultValue 기본값 (required가 false일 때만 사용)
 * @returns 환경 변수 값
 */
export function getEnvVar(
  varName: string, 
  required: boolean = true, 
  defaultValue: string = ''
): string {
  const value = process.env[varName];
  
  if (!value && required) {
    console.error(`필수 환경 변수가 누락되었습니다: ${varName}`);
    throw new Error(`환경 변수 오류: ${varName} 설정이 필요합니다.`);
  }
  
  return value || defaultValue;
}

/**
 * 애플리케이션에 필요한 모든 필수 환경 변수를 검증합니다.
 * 서버 시작 시 한 번 호출하는 것이 좋습니다.
 */
export function validateAppEnvironment(): void {
  try {
    // 애플리케이션에 필요한 모든 필수 환경 변수 목록
    const requiredVars = [
      'MONGODB_URI',
      'GEMINI_API_KEY'
    ];
    
    validateRequiredEnvVars(requiredVars);
    console.log('✅ 모든 필수 환경 변수가 설정되었습니다.');
  } catch (error) {
    console.error('❌ 환경 변수 검증 실패:', error);
    // 오류를 다시 throw하여 애플리케이션이 오류 상태로 시작하는 것을 방지할 수 있음
    // 또는 여기서 처리하고 계속 진행하도록 할 수 있음
    throw error;
  }
}

/**
 * Vercel 배포 환경인지 확인합니다.
 */
export function isVercelProduction(): boolean {
  return process.env.VERCEL_ENV === 'production';
}

/**
 * Vercel 프리뷰 환경인지 확인합니다.
 */
export function isVercelPreview(): boolean {
  return process.env.VERCEL_ENV === 'preview';
}

/**
 * Vercel 개발 환경인지 확인합니다.
 */
export function isVercelDevelopment(): boolean {
  return process.env.VERCEL_ENV === 'development';
} 