import {
  ref,
  push,
  set,
  get,
  update,
  remove,
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
  isDemo?: boolean;
  priority?: number; // 1, 2, 3 (1 = highest)
  pinned?: boolean;
  lastActivityAt?: string;
  contactCount?: number;
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
  const projectsRef = ref(db, `users/${data.userId}/projects`);
  const newRef = push(projectsRef);
  const now = new Date().toISOString();
  await set(newRef, {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return newRef.key!;
}

export async function getProject(userId: string, projectId: string): Promise<ProjectData | null> {
  const snapshot = await get(ref(db, `users/${userId}/projects/${projectId}`));
  if (snapshot.exists()) {
    return { id: projectId, ...snapshot.val() } as ProjectData;
  }
  return null;
}

export async function getUserProjects(userId: string): Promise<ProjectData[]> {
  const snapshot = await get(ref(db, `users/${userId}/projects`));
  if (!snapshot.exists()) return [];

  const projects: ProjectData[] = [];
  snapshot.forEach((child) => {
    projects.push({ id: child.key!, ...child.val() });
  });
  return projects;
}

export function subscribeToProject(
  userId: string,
  projectId: string,
  callback: (project: ProjectData | null) => void
): Unsubscribe {
  const projectRef = ref(db, `users/${userId}/projects/${projectId}`);
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
  const projectsRef = ref(db, `users/${userId}/projects`);
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
  userId: string,
  projectId: string,
  data: Partial<ProjectData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}`), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteProject(userId: string, projectId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}`));
}

export async function updateProjectPriority(userId: string, projectId: string, priority: number | null): Promise<void> {
  if (priority === null) {
    await update(ref(db, `users/${userId}/projects/${projectId}`), {
      priority: null,
      pinned: false,
    });
  } else {
    await update(ref(db, `users/${userId}/projects/${projectId}`), {
      priority,
      pinned: priority === 1,
    });
  }
}

// --- Budget Items ---

export async function addBudgetItem(userId: string, data: Omit<BudgetItemData, "id">): Promise<string> {
  const itemRef = push(ref(db, `users/${userId}/projects/${data.projectId}/budgetItems`));
  await set(itemRef, data);
  return itemRef.key!;
}

export function subscribeToBudgetItems(
  userId: string,
  projectId: string,
  callback: (items: BudgetItemData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/budgetItems`), (snapshot) => {
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
  userId: string,
  projectId: string,
  itemId: string,
  data: Partial<BudgetItemData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/budgetItems/${itemId}`), data);
}

// --- Contacts ---

export async function addContact(userId: string, data: Omit<ContactData, "id">): Promise<string> {
  const contactRef = push(ref(db, `users/${userId}/projects/${data.projectId}/contacts`));
  await set(contactRef, data);
  return contactRef.key!;
}

export function subscribeToContacts(
  userId: string,
  projectId: string,
  callback: (contacts: ContactData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/contacts`), (snapshot) => {
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

export async function addDailyLog(userId: string, data: Omit<DailyLogData, "id" | "createdAt">): Promise<string> {
  const logRef = push(ref(db, `users/${userId}/projects/${data.projectId}/dailyLogs`));
  await set(logRef, { ...data, createdAt: new Date().toISOString() });
  return logRef.key!;
}

export function subscribeToDailyLogs(
  userId: string,
  projectId: string,
  callback: (logs: DailyLogData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/dailyLogs`), (snapshot) => {
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

export async function addTask(userId: string, data: Omit<TaskData, "id">): Promise<string> {
  const taskRef = push(ref(db, `users/${userId}/projects/${data.projectId}/tasks`));
  await set(taskRef, data);
  return taskRef.key!;
}

export function subscribeToTasks(
  userId: string,
  projectId: string,
  callback: (tasks: TaskData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/tasks`), (snapshot) => {
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
  userId: string,
  projectId: string,
  taskId: string,
  data: Partial<TaskData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`), data);
}

// --- Documents ---

export async function addDocument(userId: string, data: Omit<DocumentData, "id">): Promise<string> {
  const docRef = push(ref(db, `users/${userId}/projects/${data.projectId}/documents`));
  await set(docRef, data);
  return docRef.key!;
}

export function subscribeToDocuments(
  userId: string,
  projectId: string,
  callback: (docs: DocumentData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/documents`), (snapshot) => {
    const docs: DocumentData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        docs.push({ id: child.key!, ...child.val() });
      });
    }
    callback(docs);
  });
}

// --- Generated Documents ---

export async function addGeneratedDocument(userId: string, data: {
  projectId: string;
  name: string;
  type: string;
  phase: string;
  templateId: string;
  generatedAt: string;
}): Promise<string> {
  const docRef = push(ref(db, `users/${userId}/projects/${data.projectId}/documents`));
  await set(docRef, {
    ...data,
    date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  });
  return docRef.key!;
}

// --- Photos ---

export async function addPhoto(userId: string, data: Omit<PhotoData, "id">): Promise<string> {
  const photoRef = push(ref(db, `users/${userId}/projects/${data.projectId}/photos`));
  await set(photoRef, data);
  return photoRef.key!;
}

export function subscribeToPhotos(
  userId: string,
  projectId: string,
  callback: (photos: PhotoData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/photos`), (snapshot) => {
    const photos: PhotoData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        photos.push({ id: child.key!, ...child.val() });
      });
    }
    callback(photos);
  });
}

// --- Inspection Results ---

export interface InspectionResultData {
  id?: string;
  projectId: string;
  inspectionId: string;
  phase: string;
  completedItems: boolean[];
  passed: boolean;
  notes?: string;
  photoIds?: string[];
  completedAt?: string;
  updatedAt: string;
}

export async function addInspectionResult(userId: string, data: Omit<InspectionResultData, "id">): Promise<string> {
  const resultRef = push(ref(db, `users/${userId}/projects/${data.projectId}/inspectionResults`));
  await set(resultRef, data);
  return resultRef.key!;
}

export function subscribeToInspectionResults(
  userId: string,
  projectId: string,
  callback: (results: InspectionResultData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/inspectionResults`), (snapshot) => {
    const results: InspectionResultData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        results.push({ id: child.key!, ...child.val() });
      });
    }
    callback(results);
  });
}

export async function updateInspectionResult(
  userId: string,
  projectId: string,
  resultId: string,
  data: Partial<InspectionResultData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/inspectionResults/${resultId}`), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

// --- Punch List Items ---

export interface PunchListItemData {
  id?: string;
  projectId: string;
  description: string;
  trade: string;
  severity: "critical" | "major" | "minor";
  status: "open" | "in-progress" | "resolved";
  notes?: string;
  photoIds?: string[];
  createdAt: string;
  resolvedAt?: string;
}

export async function addPunchListItem(userId: string, data: Omit<PunchListItemData, "id" | "createdAt">): Promise<string> {
  const itemRef = push(ref(db, `users/${userId}/projects/${data.projectId}/punchListItems`));
  await set(itemRef, { ...data, createdAt: new Date().toISOString() });
  return itemRef.key!;
}

export function subscribeToPunchListItems(
  userId: string,
  projectId: string,
  callback: (items: PunchListItemData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/punchListItems`), (snapshot) => {
    const items: PunchListItemData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        items.push({ id: child.key!, ...child.val() });
      });
    }
    callback(items);
  });
}

export async function updatePunchListItem(
  userId: string,
  projectId: string,
  itemId: string,
  data: Partial<PunchListItemData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/punchListItems/${itemId}`), data);
}

// --- Materials ---

export interface MaterialData {
  id?: string;
  projectId: string;
  name: string;
  quantityOrdered: number;
  quantityDelivered: number;
  unitPrice: number;
  supplier?: string;
  status: "ordered" | "partial" | "delivered" | "verified";
  createdAt: string;
}

export async function addMaterial(userId: string, data: Omit<MaterialData, "id" | "createdAt">): Promise<string> {
  const materialRef = push(ref(db, `users/${userId}/projects/${data.projectId}/materials`));
  await set(materialRef, { ...data, createdAt: new Date().toISOString() });
  return materialRef.key!;
}

export function subscribeToMaterials(
  userId: string,
  projectId: string,
  callback: (materials: MaterialData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/materials`), (snapshot) => {
    const materials: MaterialData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        materials.push({ id: child.key!, ...child.val() });
      });
    }
    callback(materials);
  });
}

export async function updateMaterial(
  userId: string,
  projectId: string,
  materialId: string,
  data: Partial<MaterialData>
): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/materials/${materialId}`), data);
}

// --- Vault Files ---

export interface VaultFileData {
  id?: string;
  projectId: string;
  name: string;
  category: "architecture" | "legal" | "financial" | "photos" | "notes" | "reports" | "other";
  description?: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
}

export async function addVaultFile(userId: string, data: Omit<VaultFileData, "id">): Promise<string> {
  const fileRef = push(ref(db, `users/${userId}/projects/${data.projectId}/vault`));
  await set(fileRef, data);
  return fileRef.key!;
}

export function subscribeToVaultFiles(
  userId: string,
  projectId: string,
  callback: (files: VaultFileData[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/vault`), (snapshot) => {
    const files: VaultFileData[] = [];
    if (snapshot.exists()) {
      snapshot.forEach((child) => {
        files.push({ id: child.key!, ...child.val() });
      });
    }
    // Sort newest first
    files.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
    callback(files);
  });
}

export async function deleteVaultFile(userId: string, projectId: string, fileId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/vault/${fileId}`));
}

// --- Delete Budget Item ---

export async function deleteBudgetItem(userId: string, projectId: string, itemId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/budgetItems/${itemId}`));
}

// --- Update Contact ---

export async function updateContact(userId: string, projectId: string, contactId: string, data: Partial<ContactData>): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/contacts/${contactId}`), data);
}

// --- Delete Contact ---

export async function deleteContact(userId: string, projectId: string, contactId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/contacts/${contactId}`));
}

// --- Delete Task ---

export async function deleteTask(userId: string, projectId: string, taskId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/tasks/${taskId}`));
}

// --- Update Daily Log ---

export async function updateDailyLog(userId: string, projectId: string, logId: string, data: Partial<DailyLogData>): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}/dailyLogs/${logId}`), data);
}

// --- Delete Daily Log ---

export async function deleteDailyLog(userId: string, projectId: string, logId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/dailyLogs/${logId}`));
}

// --- Delete Photo ---

export async function deletePhoto(userId: string, projectId: string, photoId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/photos/${photoId}`));
}

// --- Delete Document ---

export async function deleteDocument(userId: string, projectId: string, docId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/documents/${docId}`));
}

// --- Milestone Progress ---

export async function getMilestoneProgress(userId: string, projectId: string, phase: string): Promise<boolean[]> {
  const snap = await get(ref(db, `users/${userId}/projects/${projectId}/milestoneProgress/${phase}`));
  return snap.exists() ? snap.val() : [];
}

export function subscribeToMilestoneProgress(
  userId: string,
  projectId: string,
  phase: string,
  callback: (progress: boolean[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/milestoneProgress/${phase}`), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : []);
  });
}

export function subscribeToAllMilestoneProgress(
  userId: string,
  projectId: string,
  callback: (progress: Record<string, boolean[]>) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/milestoneProgress`), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  });
}

export async function toggleMilestoneProgress(
  userId: string,
  projectId: string,
  phase: string,
  index: number,
  completed: boolean,
  totalMilestones: number
): Promise<void> {
  const progressRef = ref(db, `users/${userId}/projects/${projectId}/milestoneProgress/${phase}`);
  const snap = await get(progressRef);
  const current: boolean[] = snap.exists() ? snap.val() : new Array(totalMilestones).fill(false);
  current[index] = completed;
  await set(progressRef, current);
}

// --- AI Conversations ---

export async function saveConversation(
  userId: string,
  projectId: string,
  messages: { role: string; content: string }[]
): Promise<void> {
  await set(ref(db, `users/${userId}/projects/${projectId}/conversations/active`), {
    messages,
    updatedAt: new Date().toISOString(),
  });
}

export function subscribeToConversation(
  userId: string,
  projectId: string,
  callback: (messages: { role: string; content: string }[]) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/conversations/active`), (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val().messages ?? []);
    } else {
      callback([]);
    }
  });
}

export async function clearConversation(
  userId: string,
  projectId: string
): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/conversations/active`));
}

// --- Delete Punch List Item ---

export async function deletePunchListItem(userId: string, projectId: string, itemId: string): Promise<void> {
  await remove(ref(db, `users/${userId}/projects/${projectId}/punchListItems/${itemId}`));
}

// --- Advance Project Phase ---

export async function advanceProjectPhase(userId: string, projectId: string, newPhase: number, phaseName: string): Promise<void> {
  await update(ref(db, `users/${userId}/projects/${projectId}`), {
    currentPhase: newPhase,
    completedPhases: newPhase,
    phaseName: phaseName,
    updatedAt: new Date().toISOString(),
  });
}

// --- Phased Funding ---

export async function savePhasedFunding(userId: string, projectId: string, funding: Record<string, number>): Promise<void> {
  await set(ref(db, `users/${userId}/projects/${projectId}/phasedFunding`), funding);
}

export function subscribeToPhasedFunding(
  userId: string,
  projectId: string,
  callback: (funding: Record<string, number>) => void
): Unsubscribe {
  return onValue(ref(db, `users/${userId}/projects/${projectId}/phasedFunding`), (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : {});
  });
}

// --- Seed demo data ---

export async function seedDemoProject(userId: string): Promise<string> {
  const projectId = await createProject({
    userId,
    name: "Robinson Residence",
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
    totalWeeks: 46,
    openItems: 3,
    subPhase: "Mechanical rough-in",
    details: "4 bed / 3 bath / 2,200 sf / Houston, TX",
    isDemo: true,
  });

  // Seed budget items (10 categories)
  const budgetItems: Omit<BudgetItemData, "id">[] = [
    { projectId, category: "Site prep", estimated: 8500, actual: 8200, status: "on-track" },
    { projectId, category: "Foundation", estimated: 22000, actual: 21800, status: "on-track" },
    { projectId, category: "Framing", estimated: 48000, actual: 49200, status: "over" },
    { projectId, category: "Envelope", estimated: 52000, actual: 51500, status: "on-track" },
    { projectId, category: "Rough-in", estimated: 42000, actual: 38000, status: "under" },
    { projectId, category: "Insulation/drywall", estimated: 28000, actual: 0, status: "not-started" },
    { projectId, category: "Interior finishes", estimated: 118000, actual: 55000, status: "under" },
    { projectId, category: "Exterior", estimated: 24000, actual: 0, status: "not-started" },
    { projectId, category: "Permits/fees", estimated: 9500, actual: 9500, status: "on-track" },
    { projectId, category: "Contingency (15%)", estimated: 57750, actual: 5500, status: "under" },
  ];
  for (const item of budgetItems) {
    await addBudgetItem(userId, item);
  }

  // Seed contacts (6 trades)
  const contacts: Omit<ContactData, "id">[] = [
    { projectId, name: "Martinez Framing LLC", initials: "MF", role: "Framing", rating: 4.8, phone: "(713) 555-0142" },
    { projectId, name: "R. Williams Plumbing", initials: "RW", role: "Plumber", rating: 4.5, phone: "(713) 555-0198" },
    { projectId, name: "Delta Electric Co.", initials: "DE", role: "Electrician", rating: 4.7, phone: "(713) 555-0231" },
    { projectId, name: "AirComfort HVAC", initials: "AC", role: "HVAC", rating: 4.3, phone: "(713) 555-0317" },
    { projectId, name: "TexStar Concrete", initials: "TC", role: "Foundation", rating: 4.6, phone: "(713) 555-0405" },
    { projectId, name: "K. Brown Architecture", initials: "KB", role: "Architect", rating: 4.9, phone: "(713) 555-0178", email: "kbrown@kbarchitects.com" },
  ];
  for (const c of contacts) {
    await addContact(userId, c);
  }

  // Seed tasks (11 items: 5 done, 2 in-progress, 4 upcoming)
  const tasks: Omit<TaskData, "id">[] = [
    { projectId, label: "HVAC ductwork installation", status: "done", done: true, order: 0 },
    { projectId, label: "Plumbing supply lines (PEX)", status: "done", done: true, order: 1 },
    { projectId, label: "Plumbing drain/vent lines (PVC)", status: "done", done: true, order: 2 },
    { projectId, label: "Bathtub installation (3 units)", status: "done", done: true, order: 3 },
    { projectId, label: "Water heater placed in utility closet", status: "done", done: true, order: 4 },
    { projectId, label: "Electrical: run all branch circuits", status: "in-progress", done: false, order: 5 },
    { projectId, label: "Electrical: outlet and switch boxes", status: "in-progress", done: false, order: 6 },
    { projectId, label: "Schedule rough-in inspection", status: "upcoming", done: false, order: 7 },
    { projectId, label: "Pass mechanical rough-in inspection", status: "upcoming", done: false, order: 8 },
    { projectId, label: "Insulation: spray foam walls (R-21)", status: "upcoming", done: false, order: 9 },
    { projectId, label: "Insulation: blown attic (R-49)", status: "upcoming", done: false, order: 10 },
  ];
  for (const t of tasks) {
    await addTask(userId, t);
  }

  // Seed daily logs (3 recent days)
  const logs: Omit<DailyLogData, "id" | "createdAt">[] = [
    {
      projectId,
      date: "Mar 15, 2026",
      day: 142,
      weather: "Partly cloudy 72F",
      crew: 4,
      content: "Electrician (Delta Electric) continued rough-in on second floor. All bedroom circuits wired. Kitchen island conduit connected to panel. Need to schedule inspection for early next week. Plumber came back to fix a leaking PEX connection near master bath. Resolved same day, no charge under warranty.",
    },
    {
      projectId,
      date: "Mar 14, 2026",
      day: 141,
      weather: "Sunny 75F",
      crew: 6,
      content: "Electrician started rough-in. 200A panel mounted. First floor wiring 80% complete. Verified outlet box locations against electrical plan. Two missing in garage, corrected on site. 4 photos uploaded. Draw request #5 prepared for lender submission Monday.",
    },
    {
      projectId,
      date: "Mar 13, 2026",
      day: 140,
      weather: "Sunny 70F",
      crew: 3,
      content: "Plumbing rough-in completed. PEX supply lines pressure tested 80 PSI for 30 min with no drop. PVC drain slope verified with level. Water heater placed in utility closet. Bathtubs set in all 3 bathrooms. Ready for electrical rough-in.",
    },
  ];
  for (const l of logs) {
    await addDailyLog(userId, l);
  }

  // Seed documents (8 across multiple phases)
  const docs: Omit<DocumentData, "id">[] = [
    { projectId, name: "Construction loan agreement", phase: "Phase 1: Finance", date: "Mar 2", type: "CONTRACT" },
    { projectId, name: "Land purchase agreement", phase: "Phase 2: Land", date: "Feb 15", type: "LEGAL" },
    { projectId, name: "Building plans (full set)", phase: "Phase 3: Design", date: "Feb 28", type: "PLAN" },
    { projectId, name: "Building permit #BP-2026-4421", phase: "Phase 4: Approve", date: "Mar 8", type: "PERMIT" },
    { projectId, name: "Martinez Framing contract", phase: "Phase 5: Assemble", date: "Mar 10", type: "CONTRACT" },
    { projectId, name: "Draw request #4 (approved)", phase: "Phase 6: Build", date: "Mar 12", type: "INVOICE" },
    { projectId, name: "Framing inspection report", phase: "Phase 6: Build", date: "Mar 14", type: "REPORT" },
    { projectId, name: "Change order #2 windows", phase: "Phase 6: Build", date: "Mar 15", type: "CONTRACT" },
  ];
  for (const d of docs) {
    await addDocument(userId, d);
  }

  return projectId;
}
