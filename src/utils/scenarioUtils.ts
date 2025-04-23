import { Scenario, ScenarioFormData } from '../types/scenario';
import { defaultStageTemplate, calculateTimings } from '../data/scenarioTemplates';
import { v4 as uuidv4 } from 'uuid';

// API 요청 타임아웃 시간
const REQUEST_TIMEOUT = 30000; // 30초
const MAX_RETRIES = 3; // 최대 재시도 횟수

// 시간 초과 프로미스 생성
const createTimeoutPromise = (ms: number) => 
  new Promise((_, reject) => setTimeout(() => reject(new Error(`요청이 ${ms}ms 시간을 초과했습니다.`)), ms));

// API 요청 래퍼 (타임아웃 및 재시도 적용)
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 0): Promise<Response> {
  try {
    // 타임아웃 적용
    const fetchPromise = fetch(url, options);
    const response = await Promise.race([
      fetchPromise,
      createTimeoutPromise(REQUEST_TIMEOUT)
    ]) as Response;
    
    // 응답 성공 확인
    if (!response.ok) {
      throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    // 최대 재시도 횟수 확인
    if (retries >= MAX_RETRIES) {
      throw error;
    }
    
    // 지수 백오프로 재시도
    const delay = Math.pow(2, retries) * 1000;
    console.log(`API 요청 실패, ${retries + 1}번째 재시도 (${delay}ms 후)...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return fetchWithRetry(url, options, retries + 1);
  }
}

// 로컬 스토리지에서 모든 시나리오 가져오기
export function getSavedScenarios(): Scenario[] {
  if (typeof window === 'undefined') return [];
  
  const savedData = localStorage.getItem('scenarios');
  if (!savedData) return [];
  
  try {
    const parsed = JSON.parse(savedData);
    return Array.isArray(parsed) ? parsed.map(parseScenario) : [];
  } catch (error) {
    console.error('Failed to parse saved scenarios:', error);
    return [];
  }
}

// 서버에서 시나리오 가져오기
export async function fetchServerScenarios(page = 1, limit = 20, search = ''): Promise<{
  data: Scenario[],
  meta: { total: number, page: number, limit: number, pages: number }
}> {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    
    if (search) {
      queryParams.append('search', search);
    }
    
    const response = await fetchWithRetry(`/api/scenarios?${queryParams}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '서버에서 시나리오를 불러오는 중 오류가 발생했습니다.');
    }
    
    return {
      data: result.data.map(parseScenario),
      meta: result.meta
    };
  } catch (error) {
    console.error('Failed to load server scenarios:', error);
    throw new Error('서버에서 시나리오를 불러오는 중 오류가 발생했습니다.');
  }
}

// ID로 서버에서 시나리오 가져오기
export async function getScenarioById(id: string) {
  // 로컬에서 먼저 확인
  const localScenario = getLocalScenarioById(id);
  if (localScenario) {
    return { success: true, data: localScenario };
  }
  
  try {
    const response = await fetchWithRetry(`/api/scenarios/${id}`);
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '시나리오를 찾을 수 없습니다.');
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to load scenario with ID ${id}:`, error);
    throw new Error('시나리오를 불러오는 중 오류가 발생했습니다.');
  }
}

// 시나리오 저장하기 (서버)
export async function saveScenarioToServer(scenario: Scenario): Promise<Scenario> {
  try {
    const method = scenario.id ? 'PUT' : 'POST';
    const url = scenario.id ? `/api/scenarios/${scenario.id}` : '/api/scenarios';
    
    const response = await fetchWithRetry(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenario),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '서버에 시나리오를 저장하는 중 오류가 발생했습니다.');
    }
    
    return parseScenario(result.data);
  } catch (error) {
    console.error('시나리오 저장 오류:', error);
    throw new Error('서버에 시나리오를 저장하는 중 오류가 발생했습니다.');
  }
}

// 서버에서 시나리오 삭제하기
export async function deleteScenarioFromServer(scenarioId: string): Promise<void> {
  try {
    const response = await fetchWithRetry(`/api/scenarios/${scenarioId}`, {
      method: 'DELETE',
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || '서버에서 시나리오를 삭제하는 중 오류가 발생했습니다.');
    }
  } catch (error) {
    console.error(`Failed to delete scenario with ID ${scenarioId}:`, error);
    throw new Error('서버에서 시나리오를 삭제하는 중 오류가 발생했습니다.');
  }
}

// 로컬 시나리오 저장하기
export function saveScenarioLocally(scenario: Scenario): void {
  if (typeof window === 'undefined') return;
  
  const currentScenarios = getSavedScenarios();
  
  // 기존 시나리오 업데이트 또는 새 시나리오 추가
  const updatedScenarios = currentScenarios.some(s => s.id === scenario.id)
    ? currentScenarios.map(s => s.id === scenario.id ? scenario : s)
    : [...currentScenarios, scenario];
  
  localStorage.setItem('scenarios', JSON.stringify(updatedScenarios));
}

// 로컬에서 시나리오 삭제하기
export function deleteScenarioLocally(scenarioId: string): void {
  if (typeof window === 'undefined') return;
  
  const currentScenarios = getSavedScenarios();
  const updatedScenarios = currentScenarios.filter(s => s.id !== scenarioId);
  
  localStorage.setItem('scenarios', JSON.stringify(updatedScenarios));
}

// 로컬에서 ID로 시나리오 가져오기
export function getLocalScenarioById(id: string): Scenario | undefined {
  return getSavedScenarios().find(s => s.id === id);
}

// 새 시나리오 생성하기
export function createNewScenario(formData: ScenarioFormData): Scenario {
  const now = new Date();
  
  // 기본 템플릿의 시간을 사용자 입력 시간에 맞게 조정
  const adjustedTemplate = calculateTimings(
    defaultStageTemplate, 
    formData.totalDurationMinutes
  );
  
  const newScenario: Scenario = {
    id: uuidv4(),
    title: formData.title,
    totalDurationMinutes: formData.totalDurationMinutes,
    groupCount: formData.groupCount,
    createdAt: now,
    updatedAt: now,
    stages: adjustedTemplate
  };
  
  return newScenario;
}

// JSON에서 Date 객체로 변환 (저장/로드 시 필요)
function parseScenario(scenario: any): Scenario {
  if (!scenario) return scenario;
  
  return {
    ...scenario,
    createdAt: new Date(scenario.createdAt),
    updatedAt: new Date(scenario.updatedAt)
  };
}

// 하위 호환성을 위한 함수들 - 기존 코드를 위한 별칭
export async function saveScenario(scenario: Scenario): Promise<{ localSuccess: boolean; serverSuccess: boolean }> {
  let localSuccess = false;
  let serverSuccess = false;
  
  try {
    // 로컬 스토리지에 저장
    saveScenarioLocally(scenario);
    localSuccess = true;
    console.log('시나리오를 로컬에 저장했습니다: ', scenario.title);
  } catch (localError) {
    console.error('로컬 저장 실패:', localError);
  }
  
  // 서버에 저장 시도 (실패해도 로컬에는 저장됨)
  if (typeof window !== 'undefined') {
    try {
      const savedScenario = await saveScenarioToServer(scenario);
      serverSuccess = true;
      console.log('시나리오를 서버에 저장했습니다: ', savedScenario.title);
    } catch (serverError) {
      console.error('서버 저장 실패:', serverError);
      // 서버 저장이 실패해도 오류를 던지지 않고 결과만 반환
    }
  }
  
  return { localSuccess, serverSuccess };
}

export function deleteScenario(scenarioId: string): void {
  // 로컬 스토리지에서 삭제
  deleteScenarioLocally(scenarioId);
  
  // 서버에서 삭제 시도
  if (typeof window !== 'undefined') {
    deleteScenarioFromServer(scenarioId).catch(error => {
      console.error('Failed to delete scenario from server:', error);
    });
  }
} 