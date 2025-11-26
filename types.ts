
export enum Sender {
  USER = 'user',
  BOT = 'bot'
}

export enum ViewMode {
  LESSON = 'lesson',
  GA4_SIMULATOR = 'ga4_simulator',
  INTERVIEW_SIMULATOR = 'interview_simulator',
  AI_TUTOR = 'ai_tutor'
}

export interface ComparisonRow {
  feature: string;
  uaValue: string;
  ga4Value: string;
}

export interface ComparisonData {
  title: string;
  uaLabel: string; // Header for UA column
  ga4Label: string; // Header for GA4 column
  rows: ComparisonRow[];
  insight: string;
}

export interface QuizData {
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-based index
  explanation: string;
}

export interface SimulationRedirect {
  page: 'home' | 'reports' | 'explore' | 'advertising' | 'admin';
  subPage?: string;
  message: string; // Instruction for the user
}

// The structure we expect from the Gemini JSON response
export interface LessonContent {
  microLessonText: string;
  exampleTitle?: string;
  exampleContent?: string;
  comparison?: ComparisonData;
  quiz?: QuizData;
  practiceTask?: string; // Short prompt for the user
  taskOptions?: string[]; // List of selectable answer options for the practice task
  simulationRedirect?: SimulationRedirect; // Optional redirect to simulator
}

export interface Message {
  id: string;
  sender: Sender;
  content: LessonContent | string; // Bot sends LessonContent (JSON), User sends string
  timestamp: number;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  promptContext: string;
}
