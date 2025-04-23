import { Scenario, ScenarioFormData } from '../types/scenario';
import { defaultStageTemplate, calculateTimings } from '../data/scenarioTemplates';
import { v4 as uuidv4 } from 'uuid';

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

// 시나리오 저장하기
export function saveScenario(scenario: Scenario): void {
  if (typeof window === 'undefined') return;
  
  const currentScenarios = getSavedScenarios();
  
  // 기존 시나리오 업데이트 또는 새 시나리오 추가
  const updatedScenarios = currentScenarios.some(s => s.id === scenario.id)
    ? currentScenarios.map(s => s.id === scenario.id ? scenario : s)
    : [...currentScenarios, scenario];
  
  localStorage.setItem('scenarios', JSON.stringify(updatedScenarios));
}

// 시나리오 삭제하기
export function deleteScenario(scenarioId: string): void {
  if (typeof window === 'undefined') return;
  
  const currentScenarios = getSavedScenarios();
  const updatedScenarios = currentScenarios.filter(s => s.id !== scenarioId);
  
  localStorage.setItem('scenarios', JSON.stringify(updatedScenarios));
}

// ID로 시나리오 가져오기
export function getScenarioById(id: string): Scenario | undefined {
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
function parseScenario(scenario: Omit<Scenario, 'createdAt' | 'updatedAt'> & { 
  createdAt: string | Date; 
  updatedAt: string | Date; 
}): Scenario {
  return {
    ...scenario,
    createdAt: new Date(scenario.createdAt),
    updatedAt: new Date(scenario.updatedAt)
  };
} 