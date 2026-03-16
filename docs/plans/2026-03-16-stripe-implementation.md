# Stripe Monetization Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Stripe billing, admin system, trial codes, plan enforcement, and upgrade UI to Keystone.

**Architecture:** Admin role stored in Firebase profile. Stripe Checkout for upgrades, webhooks via Next.js API route to sync subscription state back to Firebase. Trial codes stored in Firebase with expiry logic. Plan limits enforced client-side with server-side validation on AI queries.

**Tech Stack:** Stripe JS SDK, Next.js API routes, Firebase Realtime Database, React

---

### Task 1: Extend UserProfile type + set admin account

**Files:**
- Modify: `apps/web/src/lib/services/auth-service.ts`
- Modify: Firebase DB (manual or script)

**Step 1:** Add new fields to `UserProfile` interface:
```typescript
interface UserProfile {
  uid: string;
  email: string;
  name: string;
  timezone: string;
  locale: string;
  currency: string;
  plan: "FOUNDATION" | "BUILDER" | "DEVELOPER" | "ENTERPRISE";
  role?: "admin" | "user";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: "active" | "past_due" | "canceled" | "trialing";
  billingInterval?: "monthly" | "annual";
  trialExpiresAt?: string;
  trialCodeUsed?: string;
  createdAt: string;
}
```

**Step 2:** Create a one-time script/function to set the current user (ManuTheEngineer) as admin with Enterprise plan in Firebase.

**Step 3:** Commit.

---

### Task 2: Install Stripe + create pricing config

**Files:**
- Modify: `apps/web/package.json` (add `stripe` + `@stripe/stripe-js`)
- Create: `apps/web/src/lib/stripe.ts` (Stripe client config)
- Create: `apps/web/src/lib/stripe-config.ts` (pricing constants)

**Step 1:** Install Stripe packages.

**Step 2:** Create `stripe.ts` — server-side Stripe instance using `STRIPE_SECRET_KEY` env var.

**Step 3:** Create `stripe-config.ts` — export tier pricing constants:
```typescript
export const PLAN_PRICES = {
  BUILDER: { monthly: 1900, annual: 18200, monthlyPriceId: "price_xxx", annualPriceId: "price_xxx" },
  DEVELOPER: { monthly: 4900, annual: 47000, monthlyPriceId: "price_xxx", annualPriceId: "price_xxx" },
  ENTERPRISE: { monthly: 14900, annual: 143000, monthlyPriceId: "price_xxx", annualPriceId: "price_xxx" },
};

export const PLAN_LIMITS = {
  FOUNDATION: { projects: 1, aiPerDay: 10, photos: 50, docGen: false, export: false, advancedFinancials: false },
  BUILDER: { projects: 3, aiPerDay: 50, photos: 500, docGen: true, export: true, advancedFinancials: false },
  DEVELOPER: { projects: Infinity, aiPerDay: Infinity, photos: Infinity, docGen: true, export: true, advancedFinancials: true },
  ENTERPRISE: { projects: Infinity, aiPerDay: Infinity, photos: Infinity, docGen: true, export: true, advancedFinancials: true },
};
```

**Step 4:** Commit.

---

### Task 3: Stripe Checkout API route

**Files:**
- Create: `apps/web/src/app/api/stripe/checkout/route.ts`

**Step 1:** Create POST endpoint that:
- Validates user is authenticated
- Accepts `{ planTier, billingInterval }` body
- Skips if user is admin
- Creates or retrieves Stripe customer (by email)
- Creates Stripe Checkout Session with correct price ID
- Returns `{ url: session.url }`

**Step 2:** Commit.

---

### Task 4: Stripe Webhook API route

**Files:**
- Create: `apps/web/src/app/api/stripe/webhook/route.ts`

**Step 1:** Create POST endpoint that:
- Verifies Stripe signature using `STRIPE_WEBHOOK_SECRET`
- Handles events:
  - `checkout.session.completed` — update user profile with plan, stripeCustomerId, stripeSubscriptionId, subscriptionStatus
  - `invoice.paid` — confirm subscription active
  - `customer.subscription.updated` — sync plan changes
  - `customer.subscription.deleted` — revert to FOUNDATION
  - `invoice.payment_failed` — mark as past_due
- Writes updates to Firebase `users/{uid}/profile`

**Step 2:** Commit.

---

### Task 5: Stripe Customer Portal API route

**Files:**
- Create: `apps/web/src/app/api/stripe/portal/route.ts`

**Step 1:** Create POST endpoint that:
- Gets user's stripeCustomerId from Firebase profile
- Creates Stripe Billing Portal session
- Returns `{ url: session.url }`

**Step 2:** Commit.

---

### Task 6: Trial code service functions

**Files:**
- Modify: `apps/web/src/lib/services/project-service.ts` (or create `apps/web/src/lib/services/trial-service.ts`)

**Step 1:** Create functions:
- `generateTrialCode(adminUid, tier, durationHours, maxUses)` — writes to `trialCodes/{code}` in Firebase
- `redeemTrialCode(userId, code)` — validates and applies trial
- `subscribeToTrialCodes(adminUid, callback)` — admin-only subscription
- `revokeTrialCode(adminUid, code)` — sets revokedAt
- `checkTrialExpiry(userId)` — checks if trial expired, reverts to Foundation

**Step 2:** Commit.

---

### Task 7: Settings page — Upgrade UI with tier cards

**Files:**
- Modify: `apps/web/src/app/(dashboard)/settings/_client.tsx`

**Step 1:** Replace "Upgrades coming soon" with full upgrade UI:
- Monthly/annual toggle with "Save 20%" badge on annual
- 4 tier cards showing features, price, current plan highlight
- "Upgrade" button → calls checkout API → redirects to Stripe
- "Manage Subscription" button → calls portal API → redirects to Stripe portal
- Admin sees "Enterprise (Admin)" badge instead of upgrade buttons
- Trial users see "Trial expires in X days" banner

**Step 2:** Commit.

---

### Task 8: Settings page — Admin trial code generator

**Files:**
- Modify: `apps/web/src/app/(dashboard)/settings/_client.tsx`

**Step 1:** Add admin-only section (visible when `profile.role === "admin"`):
- "Generate Trial Code" form: tier dropdown, duration dropdown, max uses dropdown
- Generate button → calls `generateTrialCode()` → shows code in a copyable field
- Active codes table showing: code, tier, duration, uses/max, expiry, revoke button
- Subscribes to `subscribeToTrialCodes()` for real-time updates

**Step 2:** Commit.

---

### Task 9: Trial code redemption UI

**Files:**
- Modify: `apps/web/src/app/(dashboard)/settings/_client.tsx`

**Step 1:** Add "Redeem Code" section for non-admin users:
- Text input for trial code
- "Redeem" button → calls `redeemTrialCode()` → shows success/error toast
- If on trial: show expiry date and current trial tier

**Step 2:** Commit.

---

### Task 10: Plan enforcement — project creation

**Files:**
- Modify: `apps/web/src/app/(dashboard)/new-project/page.tsx`

**Step 1:** Before `createProject()`:
- Count user's existing projects
- Check against `PLAN_LIMITS[plan].projects`
- If at limit: show modal explaining limit and upgrade CTA
- Admin bypasses all limits

**Step 2:** Commit.

---

### Task 11: Plan enforcement — photos, docs, exports

**Files:**
- Modify: `apps/web/src/app/(dashboard)/project/[id]/photos/_client.tsx`
- Modify: `apps/web/src/app/(dashboard)/project/[id]/documents/_client.tsx`
- Modify: `apps/web/src/components/ui/ExportModal.tsx`

**Step 1:** Photo upload: check photo count vs `PLAN_LIMITS[plan].photos`.
**Step 2:** Document generation: check `PLAN_LIMITS[plan].docGen`.
**Step 3:** Export: check `PLAN_LIMITS[plan].export`.
Each shows upgrade prompt if limit reached. Admin bypasses.

**Step 4:** Commit.

---

### Task 12: Trial expiry banner + auto-revert

**Files:**
- Modify: `apps/web/src/app/(dashboard)/layout.tsx`

**Step 1:** In dashboard layout, check `profile.trialExpiresAt`:
- If trial active: show banner with countdown "Trial expires in X days"
- If trial expired: call `checkTrialExpiry()` to revert to Foundation, show "Trial ended" toast

**Step 2:** Commit.
