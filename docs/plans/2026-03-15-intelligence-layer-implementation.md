# Intelligence Layer Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an AI-powered construction advisor (via Claude API through Firebase Cloud Functions) and a financial calculator engine with a dedicated dashboard page.

**Architecture:** Firebase Cloud Function proxies Claude API calls with auth verification and rate limiting. Two new shared packages (`packages/ai/` for prompts, `packages/core/` for calculators) consumed by both the Cloud Function and the web app. Financial dashboard page renders calculator results client-side.

**Tech Stack:** Firebase Functions v2, Anthropic Claude SDK, TypeScript, React

---

## Task 1: Financial Engine Package — Types and Core Calculators

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/types.ts`
- Create: `packages/core/src/calculators/loan-qualification.ts`
- Create: `packages/core/src/calculators/mortgage.ts`
- Create: `packages/core/src/calculators/rental-yield.ts`
- Create: `packages/core/src/calculators/budget-estimator.ts`
- Create: `packages/core/src/calculators/draw-schedule.ts`
- Create: `packages/core/src/calculators/currency-converter.ts`
- Create: `packages/core/src/calculators/contingency.ts`
- Create: `packages/core/src/formatters/financial-display.ts`
- Create: `packages/core/src/index.ts`
- Modify: `apps/web/package.json` — add `"@keystone/core": "*"`
- Modify: `apps/web/next.config.ts` — add `"@keystone/core"` to `transpilePackages`
- Modify: `apps/web/tsconfig.json` — add path alias for `@keystone/core`

**Step 1: Create package scaffolding**

`packages/core/package.json`:
```json
{
  "name": "@keystone/core",
  "version": "0.1.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*"
  }
}
```

`packages/core/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"]
}
```

**Step 2: Create types.ts**

All calculator input/output interfaces as specified in the design doc. Include `LoanQualificationInput`, `LoanQualificationResult`, `RentalYieldInput`, `RentalYieldResult`, `DrawScheduleInput`, `DrawScheduleResult`, `BudgetEstimateInput`, `BudgetEstimateResult`, `MortgageInput`, `MortgageResult`, `CurrencyConversionInput`, `CurrencyConversionResult`, `ContingencyInput`, `ContingencyResult`.

Every result interface MUST include a `formula: string` field for auditability.

**Step 3: Create loan-qualification.ts**

Pure function `calculateLoanQualification(input: LoanQualificationInput): LoanQualificationResult`.

Logic:
- Calculate monthly income: `annualIncome / 12`
- Calculate monthly mortgage payment using amortization formula: `P * [r(1+r)^n] / [(1+r)^n - 1]`
- Calculate monthly property tax: `(maxHomePrice * propertyTaxRate) / 12`
- Calculate monthly insurance: `insuranceAnnual / 12`
- Calculate PITI: `mortgage + tax + insurance`
- Calculate front-end DTI: `PITI / monthlyIncome`
- Calculate back-end DTI: `(PITI + monthlyDebts) / monthlyIncome`
- Qualified if back-end DTI <= 0.43 (conventional) or 0.50 (FHA)
- Max loan = solve for P where back-end DTI = 0.43
- Formula string shows the full calculation chain

**Step 4: Create mortgage.ts**

Pure function `calculateMortgage(input: MortgageInput): MortgageResult`.

Generates full amortization schedule: for each month, calculate principal portion, interest portion, remaining balance. Return monthly payment, total interest, total cost, and the schedule array.

**Step 5: Create rental-yield.ts**

Pure function `calculateRentalYield(input: RentalYieldInput): RentalYieldResult`.

Logic:
- Gross annual income: `monthlyRent * 12`
- Effective income: `grossAnnual * (1 - vacancyRatePct/100)`
- Annual expenses: `totalCost * (annualExpensesPct/100)`
- NOI (Net Operating Income): `effectiveIncome - annualExpenses`
- Cap rate: `NOI / totalCost * 100`
- Cash flow: `NOI/12 - (financingCost ?? 0)`
- Cash-on-cash: if financed, `annualCashFlow / downPayment * 100`
- Break-even months: `totalCost / monthlyCashFlow`

**Step 6: Create budget-estimator.ts**

Pure function `estimateBudget(input: BudgetEstimateInput): BudgetEstimateResult`.

Imports `getCostBenchmarks` from `@keystone/market-data`. Multiplies each benchmark's low/mid/high range by the input size. Returns line items with per-unit costs, subtotal, contingency amount, and total.

**Step 7: Create draw-schedule.ts**

Pure function `generateDrawSchedule(input: DrawScheduleInput): DrawScheduleResult`.

Takes milestone payment percentages and total budget, produces a draw schedule with cumulative amounts, retainage (5%), and contingency reserve.

**Step 8: Create currency-converter.ts**

Pure function `convertCurrency(input: CurrencyConversionInput): CurrencyConversionResult`.

Converts between USD, XOF (CFA), and GHS using provided exchange rates. Default rates: 1 USD = 615 XOF, 1 USD = 15.5 GHS. Shows conversion formula.

**Step 9: Create contingency.ts**

Pure function `calculateContingency(input: ContingencyInput): ContingencyResult`.

Risk-adjusted contingency based on: project complexity (simple/moderate/complex), market (USA lower risk, Togo higher), current phase (earlier phases = higher contingency), owner experience (first-time = higher). Base 10% adjusted up to 25%.

**Step 10: Create financial-display.ts**

Formatter utilities:
- `formatWithFormula(value: number, formula: string, currency: CurrencyConfig): string` — returns formatted value with expandable formula
- `formatPercent(value: number, decimals?: number): string`
- `formatMonths(months: number): string` — "2 years 3 months"

**Step 11: Create index.ts and wire into web app**

Export all calculators and types from `packages/core/src/index.ts`. Update `apps/web/package.json`, `next.config.ts`, and `tsconfig.json` to add `@keystone/core` as a workspace dependency.

Run `npm install` from root to link the package.

**Step 12: Verify build**

```bash
cd /c/Users/ManuT/OneDrive/Documents/GitHub/Keystone && npm run build
```

**Step 13: Commit**

```bash
git add packages/core/ apps/web/package.json apps/web/next.config.ts apps/web/tsconfig.json
git commit -m "feat: add financial engine package with 7 calculators"
```

---

## Task 2: Financial Dashboard Page

**Files:**
- Create: `apps/web/src/app/(dashboard)/project/[id]/financials/page.tsx`
- Create: `apps/web/src/app/(dashboard)/project/[id]/financials/_client.tsx`
- Modify: `apps/web/src/components/layout/Sidebar.tsx` — add Financials nav item
- Modify: `apps/web/src/app/(dashboard)/layout.tsx` — add financials route

**Step 1: Create page.tsx**

```tsx
import { FinancialsClient } from "./_client";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function FinancialsPage() {
  return <FinancialsClient />;
}
```

**Step 2: Create _client.tsx**

Full financials dashboard page:

- Subscribe to project data from Firebase
- Detect market and purpose to show relevant calculators
- **USA projects:** Loan qualification form (income, debts, credit score, down payment, rate, term) → results with DTI, max loan, monthly PITI. Draw schedule generator. If purpose=RENT: rental yield calculator.
- **Togo projects:** Phased funding tracker (total needed per phase from market data, amount saved input). Currency converter (USD→CFA). If purpose=RENT: rental yield calculator in CFA.
- **All projects:** Contingency analysis widget. Budget estimate summary from market benchmarks.
- Every number shows its formula when user clicks "Show formula" link
- Use `StatCard`, `Card`, `SectionLabel`, `ProgressBar` components
- Use `formatCurrency` from market-data for all money display
- Use calculator functions from `@keystone/core`

Each calculator section is a collapsible card with an interactive form and results display.

**Step 3: Add Sidebar nav and route mapping**

In `Sidebar.tsx`: add `{ id: "financials", label: "Financials", icon: <Calculator size={16} /> }` to `projectNav` after "budget". Import `Calculator` from lucide-react.

In `layout.tsx`: add `if (pathname.includes("/financials")) return "financials";` to `getActiveSectionFromPath` and `financials: \`/project/${pid}/financials\`` to `sectionToRoute`.

**Step 4: Verify build**

```bash
cd /c/Users/ManuT/OneDrive/Documents/GitHub/Keystone && npm run build
```

**Step 5: Commit**

```bash
git add apps/web/src/app/\\(dashboard\\)/project/\\[id\\]/financials/ apps/web/src/components/layout/Sidebar.tsx apps/web/src/app/\\(dashboard\\)/layout.tsx
git commit -m "feat: add financial dashboard page with loan qualification and rental yield calculators"
```

---

## Task 3: AI Prompts Package

**Files:**
- Create: `packages/ai/package.json`
- Create: `packages/ai/tsconfig.json`
- Create: `packages/ai/src/types.ts`
- Create: `packages/ai/src/prompts/system-base.ts`
- Create: `packages/ai/src/prompts/construction-qa.ts`
- Create: `packages/ai/src/prompts/budget-advisor.ts`
- Create: `packages/ai/src/prompts/schedule-advisor.ts`
- Create: `packages/ai/src/prompts/risk-analyzer.ts`
- Create: `packages/ai/src/prompts/contract-reviewer.ts`
- Create: `packages/ai/src/context/builder.ts`
- Create: `packages/ai/src/context/market-injector.ts`
- Create: `packages/ai/src/tools/calculator-tools.ts`
- Create: `packages/ai/src/index.ts`

**Step 1: Create package scaffolding**

Same pattern as other packages. Name: `@keystone/ai`.

**Step 2: Create types.ts**

```typescript
export interface AIMessage {
  role: "user" | "assistant" | "system";
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
```

**Step 3: Create system-base.ts**

Base system prompt that all modes build upon:

```typescript
export function getBaseSystemPrompt(): string {
  return `You are Keystone, an AI construction advisor built into a construction project management platform. You help first-time owner-builders navigate every phase of building a home.

CRITICAL RULES:
1. You are a guide, NOT an authority. Always include appropriate disclaimers for structural engineering, electrical systems, legal matters, or financial advice.
2. Never assume the user has construction knowledge. Explain terms in plain English.
3. When discussing costs, always specify the currency and note that prices vary by region and time.
4. For structural, electrical, or plumbing advice, always end with: "This is educational guidance. Consult a licensed professional for your specific situation."
5. Be concise but thorough. Use bullet points and numbered lists for clarity.
6. When you don't know something specific to the user's location, say so honestly.

RESPONSE FORMAT:
- Use markdown formatting for readability
- Use bullet points for lists
- Use **bold** for key terms and important warnings
- Include a disclaimer at the end of responses involving structural, legal, or financial advice`;
}
```

**Step 4: Create mode-specific prompts**

Each file exports a function that takes `AIRequestContext` and returns the mode-specific system prompt additions.

- `construction-qa.ts` — General Q&A about construction methods, materials, best practices. Adapts to market (wood-frame vs poteau-poutre).
- `budget-advisor.ts` — Analyzes budget data, flags overruns, suggests cost-saving opportunities. Includes cost benchmark context.
- `schedule-advisor.ts` — Advises on timeline, identifies critical path, suggests phase sequencing.
- `risk-analyzer.ts` — Identifies risks based on project data (budget overrun %, phase delays, missing inspections).
- `contract-reviewer.ts` — Reviews contract text for missing clauses, unfavorable terms, red flags.

**Step 5: Create context/builder.ts**

Function `buildProjectContext(context: AIRequestContext): string` that assembles the full project context string injected into every prompt. Includes market info, phase details, budget summary, timeline status.

**Step 6: Create context/market-injector.ts**

Function `injectMarketContext(market: string): string` that adds market-specific construction terminology, regulations, and practices to the prompt. Uses data from `@keystone/market-data`.

**Step 7: Create tools/calculator-tools.ts**

Claude tool definitions (for function calling) that map to the financial calculators:
- `calculate_loan_qualification` — calls loan-qualification calculator
- `estimate_budget` — calls budget-estimator
- `calculate_rental_yield` — calls rental-yield calculator
- `convert_currency` — calls currency-converter

Each tool definition includes name, description, and input schema.

**Step 8: Create index.ts**

Export all prompts, context builders, types, and tools.

**Step 9: Commit**

```bash
git add packages/ai/
git commit -m "feat: add AI prompts package with 5 modes, context builders, and calculator tools"
```

---

## Task 4: Firebase Cloud Function — AI Proxy

**Files:**
- Create: `functions/package.json`
- Create: `functions/tsconfig.json`
- Create: `functions/src/index.ts`
- Create: `functions/src/ai-chat.ts`
- Create: `functions/src/ai-usage.ts`
- Create: `functions/.gitignore`
- Modify: `firebase.json` — add functions configuration

**Step 1: Create functions scaffolding**

`functions/package.json`:
```json
{
  "name": "keystone-functions",
  "private": true,
  "main": "lib/index.js",
  "scripts": {
    "build": "tsc",
    "serve": "firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions"
  },
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "@anthropic-ai/sdk": "^0.39.0",
    "@keystone/ai": "*",
    "@keystone/core": "*",
    "@keystone/market-data": "*",
    "firebase-admin": "^13.0.0",
    "firebase-functions": "^6.3.0"
  },
  "devDependencies": {
    "typescript": "^5"
  }
}
```

Note: The functions directory is NOT part of the npm workspaces (it deploys separately). It references the packages via relative paths or we copy them. For simplicity, we'll use file: references.

Actually, Firebase Cloud Functions need compiled JS. The packages export raw TS. For the Cloud Function, we'll inline the needed prompt logic rather than importing from packages (which would need a build step). The packages are consumed by the web app (via transpilePackages) and the function will import the compiled versions or duplicate the needed code.

**Simpler approach:** The Cloud Function only needs the system prompts and context builders. We'll keep those self-contained in the functions directory and have the packages/ai be the source of truth that the function copies from.

`functions/src/index.ts`:
```typescript
export { aiChat } from "./ai-chat";
export { aiUsage } from "./ai-usage";
```

**Step 2: Create ai-chat.ts**

The main Cloud Function:

```typescript
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Anthropic from "@anthropic-ai/sdk";

const CLAUDE_API_KEY = defineSecret("CLAUDE_API_KEY");

if (!admin.apps.length) admin.initializeApp();
const db = admin.database();

export const aiChat = onRequest(
  { cors: true, secrets: [CLAUDE_API_KEY] },
  async (req, res) => {
    // 1. Verify auth token
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const token = authHeader.split("Bearer ")[1];
    let uid: string;
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      uid = decoded.uid;
    } catch {
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    // 2. Check rate limit
    const today = new Date().toISOString().split("T")[0];
    const usageRef = db.ref(`aiUsage/${uid}/${today}`);
    const usageSnap = await usageRef.get();
    const currentCount = usageSnap.exists() ? usageSnap.val().count : 0;

    // Get user plan
    const profileSnap = await db.ref(`users/${uid}`).get();
    const plan = profileSnap.exists() ? profileSnap.val().plan : "FOUNDATION";
    const limits = { FOUNDATION: 10, BUILDER: 50, DEVELOPER: 9999, ENTERPRISE: 9999 };
    const limit = limits[plan as keyof typeof limits] ?? 10;

    if (currentCount >= limit) {
      res.status(429).json({ error: "Daily AI limit reached", limit, used: currentCount });
      return;
    }

    // 3. Parse request
    const { messages, projectContext, mode = "general" } = req.body;

    // 4. Build system prompt
    const systemPrompt = buildSystemPrompt(projectContext, mode);

    // 5. Call Claude API
    const client = new Anthropic({ apiKey: CLAUDE_API_KEY.value() });

    try {
      const response = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      });

      // 6. Update usage count
      await usageRef.set({ count: currentCount + 1, lastUsed: new Date().toISOString() });

      // 7. Return response
      const textContent = response.content.find((c: any) => c.type === "text");
      res.json({
        message: textContent?.text ?? "No response generated.",
        usage: { used: currentCount + 1, limit },
      });
    } catch (error: any) {
      res.status(500).json({ error: "AI service error", details: error.message });
    }
  }
);
```

Include the `buildSystemPrompt` function inline in the same file — it takes `projectContext` and `mode`, returns the full system prompt string. This avoids needing to import from packages.

**Step 3: Create ai-usage.ts**

```typescript
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();

export const aiUsage = onRequest({ cors: true }, async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const today = new Date().toISOString().split("T")[0];
    const usageSnap = await admin.database().ref(`aiUsage/${decoded.uid}/${today}`).get();
    const count = usageSnap.exists() ? usageSnap.val().count : 0;

    const profileSnap = await admin.database().ref(`users/${decoded.uid}`).get();
    const plan = profileSnap.exists() ? profileSnap.val().plan : "FOUNDATION";
    const limits: Record<string, number> = { FOUNDATION: 10, BUILDER: 50, DEVELOPER: 9999, ENTERPRISE: 9999 };

    res.json({ used: count, limit: limits[plan] ?? 10, plan });
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
});
```

**Step 4: Create functions/.gitignore**

```
lib/
node_modules/
```

**Step 5: Update firebase.json**

Read `apps/web/firebase.json` first. Add functions configuration alongside existing hosting config.

**Step 6: Install functions dependencies**

```bash
cd functions && npm install
```

**Step 7: Build and verify**

```bash
cd functions && npm run build
```

**Step 8: Set the Claude API key secret**

```bash
firebase functions:secrets:set CLAUDE_API_KEY
```
(User will need to enter their Anthropic API key interactively)

**Step 9: Commit**

```bash
git add functions/ firebase.json
git commit -m "feat: add Firebase Cloud Function for AI chat proxy with rate limiting"
```

---

## Task 5: Enhanced AI Assistant — Wire to Cloud Function

**Files:**
- Modify: `apps/web/src/app/(dashboard)/project/[id]/ai-assistant/_client.tsx`
- Create: `apps/web/src/lib/services/ai-service.ts`
- Modify: `apps/web/src/lib/services/project-service.ts` — add conversation CRUD

**Step 1: Create ai-service.ts**

```typescript
import { auth } from "@/lib/firebase";

const AI_ENDPOINT = process.env.NEXT_PUBLIC_AI_ENDPOINT;

export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIUsage {
  used: number;
  limit: number;
  plan: string;
}

export async function sendAIMessage(
  messages: AIMessage[],
  projectContext: Record<string, any>,
  mode: string = "general"
): Promise<{ message: string; usage: AIUsage }> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();
  const endpoint = AI_ENDPOINT;

  if (!endpoint) {
    throw new Error("AI endpoint not configured");
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ messages, projectContext, mode }),
  });

  if (res.status === 429) {
    const data = await res.json();
    throw new Error(`Daily AI limit reached (${data.used}/${data.limit}). Upgrade your plan for more queries.`);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? "AI service error");
  }

  return res.json();
}

export async function getAIUsage(): Promise<AIUsage> {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const token = await user.getIdToken();
  const endpoint = AI_ENDPOINT?.replace("/aiChat", "/aiUsage");
  if (!endpoint) return { used: 0, limit: 10, plan: "FOUNDATION" };

  const res = await fetch(endpoint, {
    headers: { "Authorization": `Bearer ${token}` },
  });

  if (!res.ok) return { used: 0, limit: 10, plan: "FOUNDATION" };
  return res.json();
}
```

**Step 2: Add conversation CRUD to project-service.ts**

Add interfaces and functions for persisting conversation history:

```typescript
export interface ConversationData {
  id?: string;
  projectId: string;
  messages: { role: string; content: string }[];
  createdAt: string;
  updatedAt: string;
}

export async function saveConversation(data: Omit<ConversationData, "id">): Promise<string> { ... }
export function subscribeToConversation(projectId: string, conversationId: string, callback: ...): Unsubscribe { ... }
export async function updateConversation(projectId: string, conversationId: string, messages: ...): Promise<void> { ... }
```

**Step 3: Rewrite AI assistant _client.tsx**

Complete rewrite of the AI assistant page:
- Import `sendAIMessage`, `getAIUsage` from ai-service
- Show AI usage counter in topbar ("3/10 queries today")
- Build rich project context from market data (construction method, phase milestones, budget summary, cost benchmarks)
- Mode selector: General, Budget, Schedule, Risk (tabs or dropdown)
- On send: call `sendAIMessage` with auth token, display response
- Conversation history persisted to Firebase
- Error handling: rate limit exceeded shows upgrade prompt, endpoint not configured shows setup instructions
- Disclaimer on every AI response

**Step 4: Verify build**

```bash
cd /c/Users/ManuT/OneDrive/Documents/GitHub/Keystone && npm run build
```

**Step 5: Commit**

```bash
git add apps/web/src/lib/services/ai-service.ts apps/web/src/lib/services/project-service.ts apps/web/src/app/\\(dashboard\\)/project/\\[id\\]/ai-assistant/
git commit -m "feat: wire AI assistant to Cloud Function with rate limiting and conversation persistence"
```

---

## Task 6: Deploy and Test

**Step 1: Deploy Cloud Functions**

```bash
cd /c/Users/ManuT/OneDrive/Documents/GitHub/Keystone && firebase deploy --only functions
```

**Step 2: Get the deployed function URL**

The URL will be something like `https://aichat-xxxx.a.run.app`. Set it as an environment variable:

Create/update `apps/web/.env.local`:
```
NEXT_PUBLIC_AI_ENDPOINT=https://YOUR_FUNCTION_URL/aiChat
```

**Step 3: Deploy web app**

```bash
cd apps/web && npm run deploy
```

**Step 4: Verify end-to-end**

- Login to the app
- Open a project → AI Assistant
- Send a message
- Verify response arrives from Claude
- Check rate limit counter updates
- Check conversation persists on reload

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat: deploy intelligence layer — AI assistant and financial engine complete"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Financial engine package (7 calculators) | packages/core/ |
| 2 | Financial dashboard page | apps/web/.../financials/ |
| 3 | AI prompts package | packages/ai/ |
| 4 | Firebase Cloud Function (AI proxy) | functions/ |
| 5 | Enhanced AI assistant (wire to function) | apps/web/.../ai-assistant/ |
| 6 | Deploy and test | firebase deploy |
