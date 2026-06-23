export enum SubjectId {
  INTERNAL = "internal", // 内科护理学
  SURGICAL = "surgical", // 外科护理学
  BASIC = "basic",       // 基础护理学
  INTRO = "intro"        // 护理学导论
}

export interface SubjectInfo {
  id: SubjectId;
  name: string;
  iconName: string;
  color: string;
  description: string;
  ratio: string; // Assessment ratio on the 308 exam (typically 30%, 30%, 30%, 10%)
  totalSections: number;
}

export interface PracticeQuestion {
  id: string;
  subjectId: SubjectId;
  type: "A1" | "A2" | "A3" | "B"; // A1: 单句单选, A2: 病例单选, A3: 组题病例, B: 配伍题
  question: string;
  options: string[]; // Options usually A, B, C, D, E in Chinese medical exams
  correctAnswer: number; // Index 0-4 for A-E
  explanation: string;
  topic?: string;
}

export interface Flashcard {
  id: string;
  subjectId: SubjectId;
  category: string; // e.g. 临床表现, 护理措施, 治疗要点, 口诀
  front: string; // Knowledge point/Question/Concept name
  back: string; // Detailed description/Mnemonic/Standard values
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface UserCustomCard {
  id: string;
  userId?: string; // For cloud sync identification
  subjectId: SubjectId;
  type: "noun" | "cloze"; // noun: 名词解释, cloze: 挖空填空
  title: string; // The noun itself OR the question prompt with blanks
  answer: string; // The explanation of the noun OR the exact correct blank content
  hint?: string; // Optional mnemonic or course notes
  createdAt: number;
  ebbinghausStage?: number; // 0 to 8: Ebbinghaus forgetting intervals
  nextReviewTime?: number;  // ms timestamp for next review due
  recyclesCount?: number;   // number of memory slip corrections
}

export interface UserCustomQuestion {
  id: string;
  userId?: string; // For cloud sync identification
  subjectId: SubjectId;
  chapter: string; // 按章节分类
  question: string;
  options: string[]; // Options choices e.g. A, B, C, D
  correctAnswer: number; // 0-based index of correcto opt
  explanation: string;
  createdAt: number;
}
