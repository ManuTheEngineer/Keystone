export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export type AIMode = "general" | "budget" | "schedule" | "risk" | "contract";

export interface AIRequestContext {
  projectName: string;
  market: string;
  phase: string;
  phaseName: string;
  propertyType: string;
  purpose: string;
  totalBudget: number;
  totalSpent: number;
  currency: string;
  currentWeek: number;
  totalWeeks: number;
  progress: number;
  constructionMethod: string;
  recentActivity?: string;
  milestones?: string[];
  costSummary?: string;
}

export interface AIResponse {
  type: "text" | "checklist" | "table" | "warning" | "recommendation";
  content: string;
  confidence: "high" | "medium" | "low";
  sources?: string[];
  disclaimer?: string;
  actions?: AIAction[];
}

export interface AIAction {
  label: string;
  type: "navigate" | "calculate" | "generate";
  target: string;
}
