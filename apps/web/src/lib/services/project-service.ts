import {
  ref,
  push,
  set,
  get,
  update,
  remove,
  query,
  orderByChild,
  equalTo,
  onValue,
  type Unsubscribe,
} from "firebase/database";
import { db } from "@/lib/firebase";

export type Market = "USA" | "TOGO" | "GHANA" | "BENIN";
export type BuildPurpose = "OCCUPY" | "RENT" | "SELL";
export type PropertyType = "SFH" | "DUPLEX" | "TRIPLEX" | "FOURPLEX" | "APARTMENT";
export type ProjectPhase = "DEFINE" | "FINANCE" | "LAND" | "DESIGN" | "APPROVE" | "ASSEMBLE" | "BUILD" | "VERIFY" | "OPERATE";
export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";

export interface ProjectData {
  id?: string;
  userId: string;
  name: string;
  market: Market;
  purpose: BuildPurpose;
  propertyType: PropertyType;
  sizeRange: string;
  currentPhase: number;
  completedPhases: number;
  phaseName: string;
  progress: number;
  status: ProjectStatus;
  totalBudget: number;
  totalSpent: number;
  currency: string;
  currentWeek: number;
  totalWeeks: number;
  openItems: number;
  subPhase: string;
  details: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetItemData {
  id?: string;
  projectId: string;
  category: string;
  estimated: number;
  actual: number;
  status: "on-track" | "over" | "under" | "not-started";
}

export interface ContactData {
  id?: string;
  projectId: string;
  name: string;
  initials: string;
  role: string;
  rating: number;
  phone?: string;
  email?: string;
  whatsapp?: string;
}

export interface DailyLogData {
  id?: string;
  projectId: string;
  date: string;
  day: number;
  weather: string;
  crew: number;
  content: string;
  createdAt: string;
}

export interface DocumentData {
  id?: string;
  projectId: string;
  name: string;
  phase: string;
  date: string;
  fileUrl?: string;
  type: string;
}

export interface PhotoData {
  id?: string;
  projectId: string;
  fileUrl: string;
  thumbnailUrl?: string;
  phase: string;
  caption?: string;
  date: string;
  latitude?: number;
  longitude?: number;
}

export interface TaskData {
  id?: string;
  projectId: string;
  label: string;
  status: "done" | "in-progress" | "upcoming";
  done: boolean;
  order: number;
}

// --- Project CRUD ---

export async function createProject(data: Omit<ProjectData, "id" | "createdAt" | "updatedAt">): Promise<string> {
  const projectsRef = ref(db, "projects");
  const newRef = push(projectsRef);
  const now = new Date().toISOString();
  await set(newRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return newRef.key!;
}

export async function getProject(projectId: string): Promise<ProjectData | null> {
  const snapshot = await get(ref(db, `projects/${projectId}`));
  if (snapshot.exists()) {
    return { id: projectId, ...snapshot.val() } as ProjectData;
  }
  return null;
}

export async function getUserProjects(userId: string): Promise<ProjectData[]> {
  const projectsRef = query(
    ref(db, "projects"),
    orderByChild("userId"),
    equalTo(userId)
  );
  const snapshot = await get(projectsRef);
  if (!snapshot.exists()) return [];

  const projects: ProjectData[] = [];
  snapshot.forEach((child) => {
    projects.push({ id: child.key!, ...child.val() });
  });
  return projects;
}

export function subscribeToProject(
  projectId: string,
  callback: (project: ProjectData | null) => void
): Unsubscribe {
  const projectRef = ref(db, `projects/${projectId}`);
  return onValue(projectRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: projectId, ...snapshot.val() });
    } else {
      callback(null);
    }
  });
}

export function subscribeToUserProjects(
  userId: string,
  callback: (projects: ProjectData[]) => void
): Unsubscribe {
  const projectsRef = query(
    ref(db, "projects"),
    orderByChild("userId"),
    equalTo(userId)
  );
  return onValue(projectsRef, (snapshot) => {
    const projects: ProjectData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        projects.push({ id: child.key!, ...child.val() });
      });
    }
    callback(projects);
  });
}

export async function updateProject(
  projectId: string,
  data: Partial<ProjectData>
): Promise<void> {
  await update(ref(db, `projects/${projectId}`), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  await remove(ref(db, `projects/${projectId}`));
}

// --- Budget Items ---

export async function addBudgetItem(data: Omit<BudgetItemData, "id">): Promise<string> {
  const itemRef = push(ref(db, `budgetItems/${data.projectId}`));
  await set(itemRef, data);
  return itemRef.key!;
}

export function subscribeToBudgetItems(
  projectId: string,
  callback: (items: BudgetItemData[]) => void
): Unsubscribe {
  return onValue(ref(db, `budgetItems/${projectId}`), (snapshot) => {
    const items: BudgetItemData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        items.push({ id: child.key!, ...child.val() });
      });
    }
    callback(items);
  });
}

export async function updateBudgetItem(
  projectId: string,
  itemId: string,
  data: Partial<BudgetItemData>
): Promise<void> {
  await update(ref(db, `budgetItems/${projectId}/${itemId}`), data);
}

// --- Contacts ---

export async function addContact(data: Omit<ContactData, "id">): Promise<string> {
  const contactRef = push(ref(db, `contacts/${data.projectId}`));
  await set(contactRef, data);
  return contactRef.key!;
}

export function subscribeToContacts(
  projectId: string,
  callback: (contacts: ContactData[]) => void
): Unsubscribe {
  return onValue(ref(db, `contacts/${projectId}`), (snapshot) => {
    const contacts: ContactData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        contacts.push({ id: child.key!, ...child.val() });
      });
    }
    callback(contacts);
  });
}

// --- Daily Logs ---

export async function addDailyLog(data: Omit<DailyLogData, "id" | "createdAt">): Promise<string> {
  const logRef = push(ref(db, `dailyLogs/${data.projectId}`));
  await set(logRef, { ...data, createdAt: new Date().toISOString() });
  return logRef.key!;
}

export function subscribeToDailyLogs(
  projectId: string,
  callback: (logs: DailyLogData[]) => void
): Unsubscribe {
  return onValue(ref(db, `dailyLogs/${projectId}`), (snapshot) => {
    const logs: DailyLogData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        logs.push({ id: child.key!, ...child.val() });
      });
    }
    callback(logs.reverse());
  });
}

// --- Tasks ---

export async function addTask(data: Omit<TaskData, "id">): Promise<string> {
  const taskRef = push(ref(db, `tasks/${data.projectId}`));
  await set(taskRef, data);
  return taskRef.key!;
}

export function subscribeToTasks(
  projectId: string,
  callback: (tasks: TaskData[]) => void
): Unsubscribe {
  return onValue(ref(db, `tasks/${projectId}`), (snapshot) => {
    const tasks: TaskData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        tasks.push({ id: child.key!, ...child.val() });
      });
    }
    callback(tasks.sort((a, b) => a.order - b.order));
  });
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: Partial<TaskData>
): Promise<void> {
  await update(ref(db, `tasks/${projectId}/${taskId}`), data);
}

// --- Documents ---

export async function addDocument(data: Omit<DocumentData, "id">): Promise<string> {
  const docRef = push(ref(db, `documents/${data.projectId}`));
  await set(docRef, data);
  return docRef.key!;
}

export function subscribeToDocuments(
  projectId: string,
  callback: (docs: DocumentData[]) => void
): Unsubscribe {
  return onValue(ref(db, `documents/${projectId}`), (snapshot) => {
    const docs: DocumentData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        docs.push({ id: child.key!, ...child.val() });
      });
    }
    callback(docs);
  });
}

// --- Photos ---

export async function addPhoto(data: Omit<PhotoData, "id">): Promise<string> {
  const photoRef = push(ref(db, `photos/${data.projectId}`));
  await set(photoRef, data);
  return photoRef.key!;
}

export function subscribeToPhotos(
  projectId: string,
  callback: (photos: PhotoData[]) => void
): Unsubscribe {
  return onValue(ref(db, `photos/${projectId}`), (snapshot) => {
    const photos: PhotoData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        photos.push({ id: child.key!, ...child.val() });
      });
    }
    callback(photos);
  });
}

// --- Seed demo data ---

export async function seedDemoProject(userId: string): Promise<string> {
  const projectId = await createProject({
    userId,
    name: "Robinson residence",
    market: "USA",
    purpose: "OCCUPY",
    propertyType: "SFH",
    sizeRange: "medium",
    currentPhase: 6,
    completedPhases: 5,
    phaseName: "Phase 6: Build",
    progress: 62,
    status: "ACTIVE",
    totalBudget: 385000,
    totalSpent: 239000,
    currency: "USD",
    currentWeek: 24,
    totalWeeks: 37,
    openItems: 3,
    subPhase: "Mechanical rough-in",
    details: "4 bed / 3 bath / 2,200 sf / Houston, TX",
  });

  // Seed budget items
  const budgetItems = [
    { category: "Site prep", estimated: 8500, actual: 8200, status: "on-track" as const },
    { category: "Foundation", estimated: 22000, actual: 21800, status: "on-track" as const },
    { category: "Framing", estimated: 48000, actual: 49200, status: "over" as const },
    { category: "Envelope", estimated: 52000, actual: 51500, status: "on-track" as const },
    { category: "Rough-in", estimated: 42000, actual: 38000, status: "under" as const },
    { category: "Insulation/drywall", estimated: 28000, actual: 0, status: "not-started" as const },
    { category: "Interior finishes", estimated: 118000, actual: 55000, status: "under" as const },
    { category: "Exterior", estimated: 24000, actual: 0, status: "not-started" as const },
    { category: "Permits/fees", estimated: 9500, actual: 9500, status: "on-track" as const },
    { category: "Contingency (15%)", estimated: 57750, actual: 5500, status: "under" as const },
  ];
  for (const item of budgetItems) {
    await addBudgetItem({ projectId, ...item });
  }

  // Seed contacts
  const contacts = [
    { name: "Martinez Framing LLC", initials: "JM", role: "Framing contractor", rating: 4.8 },
    { name: "R. Williams Plumbing", initials: "RW", role: "Plumber (rough + trim)", rating: 4.5 },
    { name: "Delta Electric Co.", initials: "DL", role: "Electrician", rating: 4.7 },
    { name: "AirComfort HVAC", initials: "AC", role: "HVAC contractor", rating: 4.3 },
    { name: "TexStar Concrete", initials: "TS", role: "Foundation + flatwork", rating: 4.6 },
    { name: "K. Brown Architecture", initials: "KB", role: "Architect", rating: 4.9 },
  ];
  for (const c of contacts) {
    await addContact({ projectId, ...c });
  }

  // Seed tasks
  const tasks = [
    { label: "HVAC ductwork installation", status: "done" as const, done: true, order: 0 },
    { label: "Plumbing supply lines (PEX)", status: "done" as const, done: true, order: 1 },
    { label: "Plumbing drain/vent lines (PVC)", status: "done" as const, done: true, order: 2 },
    { label: "Bathtub installation (3 units)", status: "done" as const, done: true, order: 3 },
    { label: "Water heater placed in utility closet", status: "done" as const, done: true, order: 4 },
    { label: "Electrical: run all branch circuits", status: "in-progress" as const, done: false, order: 5 },
    { label: "Electrical: outlet and switch boxes", status: "in-progress" as const, done: false, order: 6 },
    { label: "Schedule rough-in inspection", status: "upcoming" as const, done: false, order: 7 },
    { label: "Pass mechanical rough-in inspection", status: "upcoming" as const, done: false, order: 8 },
    { label: "Insulation: spray foam walls (R-21)", status: "upcoming" as const, done: false, order: 9 },
    { label: "Insulation: blown attic (R-49)", status: "upcoming" as const, done: false, order: 10 },
  ];
  for (const t of tasks) {
    await addTask({ projectId, ...t });
  }

  // Seed daily logs
  const logs = [
    { date: "Mar 15, 2026", day: 142, weather: "Partly cloudy 72F", crew: 4, content: "Electrician (Delta Electric) continued rough-in on second floor. All bedroom circuits wired. Kitchen island conduit connected to panel. Need to schedule inspection for early next week. Plumber came back to fix a leaking PEX connection near master bath -- resolved same day, no charge under warranty." },
    { date: "Mar 14, 2026", day: 141, weather: "Sunny 75F", crew: 6, content: "Electrician started rough-in. 200A panel mounted. First floor wiring 80% complete. Verified outlet box locations against electrical plan -- two missing in garage, corrected on site. 4 photos uploaded. Draw request #5 prepared for lender submission Monday." },
    { date: "Mar 13, 2026", day: 140, weather: "Sunny 70F", crew: 3, content: "Plumbing rough-in completed. PEX supply lines pressure tested 80 PSI for 30 min -- no drop. PVC drain slope verified with level. Water heater placed in utility closet. Bathtubs set in all 3 bathrooms. Ready for electrical rough-in." },
  ];
  for (const l of logs) {
    await addDailyLog({ projectId, ...l });
  }

  // Seed documents
  const docs = [
    { name: "Construction loan agreement", phase: "Phase 1: Finance", date: "Mar 2", type: "CONTRACT" },
    { name: "Land purchase agreement", phase: "Phase 2: Land", date: "Feb 15", type: "LEGAL" },
    { name: "Building plans (full set)", phase: "Phase 3: Design", date: "Feb 28", type: "PLAN" },
    { name: "Building permit #BP-2026-4421", phase: "Phase 4: Approve", date: "Mar 8", type: "PERMIT" },
    { name: "Martinez Framing contract", phase: "Phase 5: Assemble", date: "Mar 10", type: "CONTRACT" },
    { name: "Draw request #4 (approved)", phase: "Phase 6: Build", date: "Mar 12", type: "INVOICE" },
    { name: "Framing inspection passed", phase: "Phase 6: Build", date: "Mar 14", type: "REPORT" },
    { name: "Change order #2 windows", phase: "Phase 6: Build", date: "Mar 15", type: "CONTRACT" },
  ];
  for (const d of docs) {
    await addDocument({ projectId, ...d });
  }

  return projectId;
}
