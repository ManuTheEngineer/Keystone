export interface Project {
  id: string;
  name: string;
  market: "USA" | "TOGO" | "GHANA" | "BENIN";
  details: string;
  purpose: "OCCUPY" | "RENT" | "SELL";
  currentPhase: number;
  completedPhases: number;
  phaseName: string;
  progress: number;
  totalBudget: string;
  totalSpent: string;
  remaining: string;
  variance: string;
  duration: string;
  currentWeek: number;
  totalWeeks: number;
  openItems: number;
  currency: string;
  subPhase: string;
}

export interface BudgetItem {
  category: string;
  estimated: number;
  actual: number;
  status: "on-track" | "over" | "under" | "not-started";
}

export interface ScheduleItem {
  name: string;
  startWeek: number;
  endWeek: number;
  color: string;
}

export interface Contact {
  initials: string;
  name: string;
  role: string;
  rating: string;
  bgColor: string;
  textColor: string;
}

export interface DocumentItem {
  name: string;
  phase: string;
  date: string;
  variant: "info" | "success" | "warning" | "danger";
}

export interface DailyLogEntry {
  date: string;
  day: number;
  weather: string;
  crew: number;
  content: string;
}

export interface TaskItem {
  label: string;
  status: "done" | "in-progress" | "upcoming";
  done: boolean;
}

export interface LearnModule {
  title: string;
  category: string;
  variant: "info" | "warning" | "success" | "danger";
}

export const PROJECTS: Project[] = [
  {
    id: "robinson",
    name: "Robinson residence",
    market: "USA",
    details: "4 bed / 3 bath / 2,200 sf / Houston, TX",
    purpose: "OCCUPY",
    currentPhase: 6,
    completedPhases: 5,
    phaseName: "Phase 6: Build",
    progress: 62,
    totalBudget: "$385K",
    totalSpent: "$239K",
    remaining: "$146K",
    variance: "-0.8%",
    duration: "8.5 mo",
    currentWeek: 24,
    totalWeeks: 37,
    openItems: 3,
    currency: "USD",
    subPhase: "Mechanical rough-in",
  },
  {
    id: "lome-duplex",
    name: "Lome rental duplex",
    market: "TOGO",
    details: "2x 2-bed / 180 m2 / Adidogome, Lome, Togo",
    purpose: "RENT",
    currentPhase: 2,
    completedPhases: 1,
    phaseName: "Phase 2: Land",
    progress: 18,
    totalBudget: "CFA 42M",
    totalSpent: "CFA 7.5M",
    remaining: "CFA 34.5M",
    variance: "+2.1%",
    duration: "7 mo",
    currentWeek: 8,
    totalWeeks: 52,
    openItems: 5,
    currency: "XOF",
    subPhase: "Land acquisition",
  },
];

export const ROBINSON_BUDGET: BudgetItem[] = [
  { category: "Site prep", estimated: 8.5, actual: 8.2, status: "on-track" },
  { category: "Foundation", estimated: 22, actual: 21.8, status: "on-track" },
  { category: "Framing", estimated: 48, actual: 49.2, status: "over" },
  { category: "Envelope", estimated: 52, actual: 51.5, status: "on-track" },
  { category: "Rough-in", estimated: 42, actual: 38, status: "under" },
  { category: "Insulation/drywall", estimated: 28, actual: 0, status: "not-started" },
  { category: "Interior finishes", estimated: 118, actual: 55, status: "under" },
  { category: "Exterior", estimated: 24, actual: 0, status: "not-started" },
  { category: "Permits/fees", estimated: 9.5, actual: 9.5, status: "on-track" },
  { category: "Contingency (15%)", estimated: 57.75, actual: 5.5, status: "under" },
];

export const ROBINSON_SCHEDULE: ScheduleItem[] = [
  { name: "Site prep", startWeek: 0, endWeek: 8, color: "#059669" },
  { name: "Foundation", startWeek: 3, endWeek: 14, color: "#1B4965" },
  { name: "Framing", startWeek: 8, endWeek: 20, color: "#7C3AED" },
  { name: "Envelope", startWeek: 14, endWeek: 26, color: "#9B2226" },
  { name: "Rough-in", startWeek: 20, endWeek: 30, color: "#BC6C25" },
  { name: "Insul./drywall", startWeek: 26, endWeek: 33, color: "#059669" },
  { name: "Int. finishes", startWeek: 30, endWeek: 37, color: "#8B4513" },
  { name: "Exterior", startWeek: 34, endWeek: 38, color: "#3A3A3A" },
];

export const ROBINSON_CONTACTS: Contact[] = [
  { initials: "JM", name: "Martinez Framing LLC", role: "Framing contractor", rating: "4.8", bgColor: "var(--color-info-bg)", textColor: "var(--color-info)" },
  { initials: "RW", name: "R. Williams Plumbing", role: "Plumber (rough + trim)", rating: "4.5", bgColor: "var(--color-success-bg)", textColor: "var(--color-success)" },
  { initials: "DL", name: "Delta Electric Co.", role: "Electrician", rating: "4.7", bgColor: "var(--color-warning-bg)", textColor: "var(--color-warning)" },
  { initials: "AC", name: "AirComfort HVAC", role: "HVAC contractor", rating: "4.3", bgColor: "var(--color-danger-bg)", textColor: "var(--color-danger)" },
  { initials: "TS", name: "TexStar Concrete", role: "Foundation + flatwork", rating: "4.6", bgColor: "var(--color-info-bg)", textColor: "var(--color-info)" },
  { initials: "KB", name: "K. Brown Architecture", role: "Architect", rating: "4.9", bgColor: "var(--color-success-bg)", textColor: "var(--color-success)" },
];

export const ROBINSON_DOCUMENTS: DocumentItem[] = [
  { name: "Construction loan agreement", phase: "Phase 1: Finance", date: "Mar 2", variant: "info" },
  { name: "Land purchase agreement", phase: "Phase 2: Land", date: "Feb 15", variant: "success" },
  { name: "Building plans (full set)", phase: "Phase 3: Design", date: "Feb 28", variant: "warning" },
  { name: "Building permit #BP-2026-4421", phase: "Phase 4: Approve", date: "Mar 8", variant: "danger" },
  { name: "Martinez Framing contract", phase: "Phase 5: Assemble", date: "Mar 10", variant: "info" },
  { name: "Draw request #4 (approved)", phase: "Phase 6: Build", date: "Mar 12", variant: "success" },
  { name: "Framing inspection passed", phase: "Phase 6: Build", date: "Mar 14", variant: "warning" },
  { name: "Change order #2 windows", phase: "Phase 6: Build", date: "Mar 15", variant: "danger" },
];

export const ROBINSON_DAILY_LOG: DailyLogEntry[] = [
  {
    date: "Mar 15, 2026",
    day: 142,
    weather: "Partly cloudy 72F",
    crew: 4,
    content: "Electrician (Delta Electric) continued rough-in on second floor. All bedroom circuits wired. Kitchen island conduit connected to panel. Need to schedule inspection for early next week. Plumber came back to fix a leaking PEX connection near master bath -- resolved same day, no charge under warranty.",
  },
  {
    date: "Mar 14, 2026",
    day: 141,
    weather: "Sunny 75F",
    crew: 6,
    content: "Electrician started rough-in. 200A panel mounted. First floor wiring 80% complete. Verified outlet box locations against electrical plan -- two missing in garage, corrected on site. 4 photos uploaded. Draw request #5 prepared for lender submission Monday.",
  },
  {
    date: "Mar 13, 2026",
    day: 140,
    weather: "Sunny 70F",
    crew: 3,
    content: "Plumbing rough-in completed. PEX supply lines pressure tested 80 PSI for 30 min -- no drop. PVC drain slope verified with level. Water heater placed in utility closet. Bathtubs set in all 3 bathrooms. Ready for electrical rough-in.",
  },
];

export const ROBINSON_TASKS: { active: TaskItem[]; completed: TaskItem[] } = {
  active: [
    { label: "Electrical: run all branch circuits", status: "in-progress", done: false },
    { label: "Electrical: outlet and switch boxes", status: "in-progress", done: false },
    { label: "Schedule rough-in inspection", status: "upcoming", done: false },
    { label: "Pass mechanical rough-in inspection", status: "upcoming", done: false },
    { label: "Insulation: spray foam walls (R-21)", status: "upcoming", done: false },
    { label: "Insulation: blown attic (R-49)", status: "upcoming", done: false },
  ],
  completed: [
    { label: "HVAC ductwork installation", status: "done", done: true },
    { label: "Plumbing supply lines (PEX)", status: "done", done: true },
    { label: "Plumbing drain/vent lines (PVC)", status: "done", done: true },
    { label: "Bathtub installation (3 units)", status: "done", done: true },
    { label: "Water heater placed in utility closet", status: "done", done: true },
  ],
};

export const LEARN_MODULES: LearnModule[] = [
  { title: "Construction loan types explained", category: "Finance", variant: "info" },
  { title: "How to read a floor plan", category: "Design", variant: "warning" },
  { title: "The 12 trades: who does what and when", category: "Team", variant: "success" },
  { title: "Understanding DTI and loan qualification", category: "Finance", variant: "info" },
  { title: "West African land tenure systems", category: "Land", variant: "danger" },
  { title: "Concrete block vs. wood frame construction", category: "Build", variant: "warning" },
  { title: "What building inspectors actually check", category: "Quality", variant: "success" },
  { title: "Payment schedules that protect you", category: "Budget", variant: "info" },
  { title: "Designing for tropical climates", category: "Design", variant: "warning" },
  { title: "The titre foncier process: 6 steps", category: "Land", variant: "danger" },
];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}
