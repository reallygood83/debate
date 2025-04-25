export interface Activity {
  id: string;
  title: string;
  durationMinutes: number;
  description: string;
  teacherPrompts: string[];
  mediaUrl?: string;
}

export interface StageSection {
  id: string;
  title: string;
  activities: Activity[];
}

export interface Scenario {
  id: string;
  title: string;
  topic?: string;
  grade?: string;
  subject?: string;
  keywords?: string[];
  totalDurationMinutes: number;
  groupCount?: number;
  createdAt: Date;
  updatedAt: Date;
  stages: {
    stage1: StageSection; // 다름과 마주하기
    stage2: StageSection; // 다름을 이해하기
    stage3: StageSection; // 다름과 공존하기
  };
  aiGenerated?: boolean;
  scenarioDetails?: {
    background?: string;
    proArguments?: string[];
    conArguments?: string[];
    teacherTips?: string;
    keyQuestions?: string[];
    materials?: string[];
    expectedOutcomes?: string[];
  };
}

export type ScenarioFormData = {
  title: string;
  topic?: string;
  grade?: string;
  subject?: string;
  keywords?: string[];
  totalDurationMinutes: number;
  groupCount?: number;
  aiGenerated?: boolean;
  scenarioDetails?: {
    background?: string;
    proArguments?: string[];
    conArguments?: string[];
    teacherTips?: string;
    keyQuestions?: string[];
    materials?: string[];
    expectedOutcomes?: string[];
  };
}; 