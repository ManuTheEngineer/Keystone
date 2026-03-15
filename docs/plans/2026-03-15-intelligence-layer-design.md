# Intelligence Layer Design — AI Assistant + Financial Engine

**Date:** 2026-03-15
**Status:** Approved
**Scope:** Firebase Cloud Function AI proxy, AI system prompts package, financial calculators package, financial dashboard page, enhanced AI assistant

---

## 1. Firebase Cloud Function — AI Proxy

### Architecture

```
Client (AI Assistant page)
  → POST /aiChat with Firebase Auth token + request body
  → Cloud Function:
    1. Verify Firebase Auth token
    2. Check rate limit (plan-based: Foundation 10/day, Builder 50/day, Dev/Enterprise unlimited)
    3. Build system prompt from project context + market data
    4. Call Claude API (claude-sonnet-4-20250514 default, claude-opus-4-6 for complex)
    5. Stream response via SSE
  → Client renders streamed response
```

### Cloud Function Setup

- Location: `functions/` directory at project root
- Runtime: Node.js 20
- Framework: Firebase Functions v2 (2nd gen, supports streaming)
- Dependencies: `@anthropic-ai/sdk`, `firebase-functions`, `firebase-admin`
- Environment: Claude API key stored in Firebase Secret Manager

### Endpoints

- `POST /aiChat` — Main chat endpoint. Body: `{ messages, projectContext, mode? }`
  - mode: "general" (default), "budget", "schedule", "risk", "contract"
  - Each mode loads a different system prompt
- `GET /aiUsage` — Returns user's daily AI usage count

### Rate Limiting

Stored in RTDB at `/aiUsage/{userId}/{date}`:
```json
{ "count": 5, "lastUsed": "2026-03-15T14:30:00Z" }
```

Plan limits:
- FOUNDATION: 10 queries/day
- BUILDER: 50 queries/day
- DEVELOPER: unlimited
- ENTERPRISE: unlimited

---

## 2. AI System Prompts — `packages/ai/`

### Package Structure

```
packages/ai/
  package.json
  tsconfig.json
  src/
    index.ts
    types.ts
    client.ts              # Claude API client wrapper
    prompts/
      system-base.ts       # Base system prompt (role, safety, disclaimers)
      construction-qa.ts   # General construction Q&A
      budget-advisor.ts    # Budget analysis and recommendations
      schedule-advisor.ts  # Timeline and scheduling advice
      risk-analyzer.ts     # Project risk identification
      contract-reviewer.ts # Contract review for red flags
    context/
      builder.ts           # Builds full context string from project data
      market-injector.ts   # Injects market-specific data into prompts
    tools/
      calculator-tools.ts  # Tool definitions for Claude function calling
```

### System Prompt Structure

Every prompt includes:
1. Role definition ("You are Keystone, an AI construction advisor...")
2. Market context (construction method, regulations, terminology)
3. Project context (phase, budget, timeline, recent activity)
4. Safety guardrails (disclaimers for structural/legal/financial)
5. Output format instructions (structured for UI rendering)
6. Mode-specific instructions (budget analysis, risk flagging, etc.)

### AI Response Format

```typescript
interface AIResponse {
  type: "text" | "checklist" | "table" | "warning" | "recommendation";
  content: string;
  confidence: "high" | "medium" | "low";
  sources?: string[];
  disclaimer?: string;
  actions?: AIAction[];
}

interface AIAction {
  label: string;
  type: "navigate" | "calculate" | "generate";
  target: string;
}
```

---

## 3. Financial Engine — `packages/core/`

### Package Structure

```
packages/core/
  package.json
  tsconfig.json
  src/
    index.ts
    types.ts
    calculators/
      loan-qualification.ts    # DTI, max loan, monthly payment
      budget-estimator.ts      # sqft/sqm → budget breakdown
      rental-yield.ts          # Cap rate, cash-on-cash, monthly cash flow
      draw-schedule.ts         # Budget + milestones → payment schedule
      currency-converter.ts    # USD↔CFA↔GHS with rate
      contingency.ts           # Risk-adjusted contingency calculator
      mortgage.ts              # Amortization schedule generator
    formatters/
      financial-display.ts     # Format numbers for display with formulas
```

### Calculator Interfaces

```typescript
// Loan Qualification
interface LoanQualificationInput {
  annualIncome: number;
  monthlyDebts: number;
  creditScore?: number;
  downPaymentPct: number;
  interestRate: number;
  loanTermYears: number;
  propertyTaxRate: number;
  insuranceAnnual: number;
}

interface LoanQualificationResult {
  maxLoanAmount: number;
  maxHomePrice: number;
  monthlyPayment: number;
  monthlyPITI: number;        // Principal + Interest + Tax + Insurance
  dtiRatio: number;
  totalInterest: number;
  qualified: boolean;
  disqualifyReasons: string[];
  formula: string;             // Auditable formula string
}

// Rental Yield
interface RentalYieldInput {
  totalCost: number;           // Land + construction + fees
  monthlyRent: number;
  vacancyRatePct: number;
  annualExpensesPct: number;   // Maintenance, taxes, insurance
  financingCost?: number;      // Monthly loan payment if financed
}

interface RentalYieldResult {
  grossYield: number;
  netYield: number;
  capRate: number;
  cashOnCashReturn: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  breakEvenMonths: number;
  formula: string;
}

// Draw Schedule
interface DrawScheduleInput {
  totalBudget: number;
  milestones: { name: string; paymentPct: number; phase: string }[];
  contingencyPct: number;
}

interface DrawScheduleResult {
  draws: { milestone: string; amount: number; cumulative: number; pct: number }[];
  retainage: number;
  contingencyReserve: number;
}

// Budget Estimator
interface BudgetEstimateInput {
  market: Market;
  propertyType: PropertyType;
  size: number;                // sqft or sqm depending on market
  qualityLevel: "low" | "mid" | "high";
  contingencyPct: number;
}

interface BudgetEstimateResult {
  lineItems: { category: string; amount: number; perUnit: number }[];
  subtotal: number;
  contingency: number;
  total: number;
  perUnitCost: number;         // per sqft or sqm
  formula: string;
}
```

### Key Design Decisions

1. **Every result includes a `formula` field** — shows the math so users can verify
2. **All calculators are pure functions** — no side effects, easily testable
3. **Market-aware** — loan calc for USA, phased funding tracker for Togo
4. **Currency-aware** — uses CurrencyConfig from market-data package

---

## 4. Financial Dashboard Page

### Route: `/project/[id]/financials`

### Sections (adaptive by market and purpose)

**USA projects:**
- Loan qualification calculator (interactive form → results)
- Budget vs actuals bar chart
- Draw schedule timeline
- If RENT: Rental yield calculator
- If SELL: Profit projection

**Togo projects:**
- Phased funding tracker (how much saved, how much needed per phase)
- Budget vs actuals bar chart (CFA)
- Currency conversion widget (USD→CFA for diaspora)
- If RENT: Rental yield calculator (CFA monthly)

**All projects:**
- Contingency analysis
- Cash flow projection
- Auditable formulas shown for every number

---

## 5. Enhanced AI Assistant

### Streaming Responses

- Use Server-Sent Events (SSE) from the Cloud Function
- Client-side: `EventSource` or `fetch` with `ReadableStream`
- Display tokens as they arrive for real-time feel

### Context-Aware Suggestions

Suggestions change based on:
- Current project phase
- Market (USA vs Togo)
- Recent activity (if budget is over, suggest budget review)
- Current page (if on budget page, suggest budget-related questions)

### Conversation Persistence

Stored in Firebase RTDB at `/conversations/{projectId}/{conversationId}`:
```json
{
  "messages": [...],
  "createdAt": "...",
  "updatedAt": "..."
}
```

### Tool Use (Claude Function Calling)

The AI can invoke calculators:
- "Calculate my DTI ratio" → calls loan-qualification calculator
- "Estimate my budget for 2000 sqft" → calls budget-estimator
- "What's my rental yield at $1,800/month?" → calls rental-yield

Results are formatted inline in the chat response.

---

## 6. Navigation Updates

- Add "Financials" to sidebar projectNav with `Calculator` icon
- Add route mapping for `/project/[id]/financials`
