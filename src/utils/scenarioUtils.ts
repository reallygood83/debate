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
    // 템플릿 생성 요청 플래그 추가
    const url = `/api/scenarios/${id}?createTemplate=true`;
    
    const response = await fetchWithRetry(url);
    const result = await response.json();
    
    if (!result.success) {
      // 서버가 템플릿을 반환했는지 확인
      if (result.suggestLocalSync) {
        // 로컬 스토리지에 시나리오가 있는지 다시 확인
        const savedScenario = getLocalScenarioById(id);
        if (savedScenario) {
          return { success: true, data: savedScenario, isLocalOnly: true };
        }
      }
      throw new Error(result.error || '시나리오를 찾을 수 없습니다.');
    }
    
    // 템플릿 시나리오인 경우에도 성공으로 처리
    if (result.isTemplate) {
      console.log('서버에서 템플릿 시나리오를 받았습니다:', result.data);
      
      // 템플릿을 로컬에 저장
      const templateScenario = parseScenario(result.data);
      saveScenarioLocally(templateScenario);
      
      return { 
        success: true, 
        data: templateScenario,
        isTemplate: true
      };
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to load scenario with ID ${id}:`, error);
    
    // 다른 모든 방법이 실패한 경우 빈 시나리오 템플릿 생성
    const fallbackTemplate = createEmptyTemplateScenario(id);
    console.log('서버 로드 실패, 빈 템플릿 생성:', fallbackTemplate);
    
    // 로컬에 저장
    saveScenarioLocally(fallbackTemplate);
    
    return { 
      success: true, 
      data: fallbackTemplate,
      isTemplate: true,
      note: '서버 로드 실패로 로컬 템플릿 생성'
    };
  }
}

// 실패 시 사용할 빈 템플릿 시나리오 생성 함수
function createEmptyTemplateScenario(id: string): Scenario {
  const now = new Date();
  return {
    id: id,
    title: '새 토론 시나리오',
    totalDurationMinutes: 45,
    groupCount: 4,
    createdAt: now,
    updatedAt: now,
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
}

// 시나리오 저장하기 (서버)
export async function saveScenarioToServer(scenario: Scenario): Promise<Scenario> {
  try {
    const method = scenario.id ? 'PUT' : 'POST';
    const url = scenario.id ? `/api/scenarios/${scenario.id}` : '/api/scenarios';
    
    console.log(`서버에 시나리오 저장 시도 (${method}):`, url);
    console.log('저장할 시나리오 데이터:', JSON.stringify({
      ...scenario,
      // 로그에서 중요 내용만 표시
      scenarioDetails: scenario.scenarioDetails ? '(AI 생성 콘텐츠 포함)' : '없음'
    }, null, 2));
    
    const response = await fetchWithRetry(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scenario),
    });
    
    const result = await response.json();
    
    if (!result.success) {
      console.error('서버 응답이 success: false를 반환:', result);
      throw new Error(result.error || '서버에 시나리오를 저장하는 중 오류가 발생했습니다.');
    }
    
    console.log('서버 저장 성공 응답:', result.data._id || result.data.id);
    return parseScenario(result.data);
  } catch (error) {
    console.error('시나리오 서버 저장 오류 세부 정보:', error instanceof Error ? error.stack : String(error));
    throw new Error(error instanceof Error ? error.message : '서버에 시나리오를 저장하는 중 오류가 발생했습니다.');
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
      // 404 오류는 무시 (시나리오가 이미 없는 경우)
      if (response.status === 404) {
        console.log(`시나리오 ID ${scenarioId}가 서버에 존재하지 않아 삭제할 필요 없음`);
        return;
      }
      throw new Error(result.error || '서버에서 시나리오를 삭제하는 중 오류가 발생했습니다.');
    }
  } catch (error) {
    // 서버 오류 발생 시 로컬에서만 삭제되었음을 로그로 남김
    console.error(`Failed to delete scenario with ID ${scenarioId} from server:`, error);
    console.warn(`시나리오 ID ${scenarioId}가 로컬에서만 삭제되었습니다.`);
    
    // 오류를 다시 던져서 호출자가 처리할 수 있게 함
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
      console.log('서버 저장 시도 시작');
      const savedScenario = await saveScenarioToServer(scenario);
      serverSuccess = true;
      console.log('시나리오를 서버에 저장했습니다: ', savedScenario.title);
      
      // AI 생성된 콘텐츠가 있는 경우, 로컬에도 서버 ID로 업데이트
      if (serverSuccess && scenario.aiGenerated) {
        const serverScenario = {
          ...scenario,
          id: savedScenario.id, // 서버에서 받은 ID로 업데이트
        };
        saveScenarioLocally(serverScenario);
        console.log('로컬 시나리오를 서버 ID로 업데이트:', serverScenario.id);
      }
    } catch (serverError) {
      console.error('서버 저장 실패 세부 정보:', serverError);
      // 서버 저장이 실패해도 오류를 던지지 않고 결과만 반환
    }
  }
  
  return { localSuccess, serverSuccess };
}

export function deleteScenario(scenarioId: string): void {
  // 로컬 스토리지에서 삭제
  deleteScenarioLocally(scenarioId);
  
  // 서버에서 삭제 시도 (실패해도 로컬에서는 삭제됨)
  if (typeof window !== 'undefined') {
    deleteScenarioFromServer(scenarioId).catch(error => {
      console.error('Failed to delete scenario from server:', error);
      console.log('시나리오가 로컬에서는 삭제되었지만 서버에서는 삭제되지 않았을 수 있습니다.');
      // 오류를 무시하고 로컬 삭제는 유지
    });
  }
} 