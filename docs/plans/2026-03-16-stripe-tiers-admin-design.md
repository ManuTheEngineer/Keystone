# Keystone Monetization: Stripe, Tiers, Admin & Trial Codes

**Date:** 2026-03-16
**Status:** Approved
**Author:** ManuTheEngineer + Claude

---

## Overview

Implement Stripe-powered subscription billing with 4 tiers, admin system, usage-based overages with volume discounts, and trial code generation. Admin account (ManuTheEngineer) gets Enterprise tier permanently, never billed.

---

## Tier Pricing

| Tier | Monthly | Annual (20% off) | Effective Monthly |
|---|---|---|---|
| **Foundation** | Free | Free | Free |
| **Builder** | $19/mo | $182/yr | $15.17/mo |
| **Developer** | $49/mo | $470/yr | $39.17/mo |
| **Enterprise** | $149/mo | $1,430/yr | $119.17/mo |

---

## Tier Feature Matrix

| Feature | Foundation | Builder | Developer | Enterprise |
|---|---|---|---|---|
| Active projects | 1 | 3 | Unlimited | Unlimited |
| AI queries/day | 10 | 50 | Unlimited | Unlimited |
| Photo storage | 50 photos | 500 photos | Unlimited | Unlimited |
| Document generation | No | Yes | Yes | Yes |
| PDF/CSV export | No | Yes | Yes | Yes |
| Financial modeling | Basic | Basic | Advanced | Advanced |
| Cost benchmarks | View only | Full + compare | Full + compare | Full + compare |
| Market data | Single market | All markets | All markets | All markets |
| Priority support | No | No | Yes | Yes |
| Team collaboration | No | No | No | Yes |
| SSO / Audit logging | No | No | No | Yes |

---

## Usage-Based Overages (Claude-style)

Users are NOT hard-blocked when exceeding limits. They get billed for overages at declining per-unit rates:

| Overage | Base Rate | >100 units | >500 units |
|---|---|---|---|
| AI queries beyond tier | $0.05/query | $0.03/query | $0.02/query |
| Photos beyond tier | $0.02/photo | $0.01/photo | $0.01/photo |
| Storage beyond 1GB | $0.50/GB/mo | $0.30/GB/mo | $0.30/GB/mo |

Tier-based overage discounts:
- Foundation: Full price
- Builder+: 20% off overages
- Enterprise: 40% off overages

---

## Admin System

### Admin Account
- Email: ManuTheEngineer's account (identified by UID in Firebase)
- Profile fields: `role: "admin"`, `plan: "ENTERPRISE"`
- Billing: Completely bypassed (no Stripe customer created)
- Access: All features, all tiers, no limits

### Admin-Only Features (in Settings page)
1. **Generate Trial Code**
   - Select tier: Builder or Developer
   - Select duration: 48 hours, 3 days, 7 days
   - Select max uses: 1, 5, or unlimited
   - Generates code format: `KEY-{DURATION}-{TIER}-{RANDOM}` (e.g., `KEY-7D-DEV-X8F2`)
2. **View Active Codes** - table showing code, tier, duration, uses/max, expiry, status
3. **Revoke Codes** - deactivate a code immediately

---

## Trial Code Flow

### Data Model (Firebase)
```
trialCodes/{codeId}:
  code: "KEY-7D-DEV-X8F2"
  tier: "DEVELOPER"
  durationHours: 168
  maxUses: 5
  usedCount: 2
  usedBy: ["uid1", "uid2"]
  createdAt: "2026-03-16T..."
  expiresAt: "2026-03-23T..."
  revokedAt: null
  createdBy: "admin-uid"
```

### Redemption Flow
1. New user registers (gets Foundation)
2. Enters trial code in Settings > "Redeem Code" section
3. System validates: code exists, not expired, not revoked, uses remaining, user hasn't already used it
4. On success: user's profile updated with `plan`, `trialExpiresAt`, `trialCodeUsed`
5. User sees banner: "Trial expires in X days"
6. On expiry: Firebase scheduled function reverts plan to Foundation

### User Profile Extension
```typescript
interface UserProfile {
  // ... existing fields ...
  plan: "FOUNDATION" | "BUILDER" | "DEVELOPER" | "ENTERPRISE";
  role?: "admin" | "user";
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  subscriptionStatus?: "active" | "past_due" | "canceled" | "trialing";
  billingInterval?: "monthly" | "annual";
  trialExpiresAt?: string;
  trialCodeUsed?: string;
}
```

---

## Stripe Integration

### Products & Prices (to create in Stripe Dashboard)
- Product: "Keystone Builder" - 2 prices (monthly $19, annual $182)
- Product: "Keystone Developer" - 2 prices (monthly $49, annual $470)
- Product: "Keystone Enterprise" - 2 prices (monthly $149, annual $1430)

### Checkout Flow
1. User clicks "Upgrade" on Settings page
2. Select tier + monthly/annual toggle
3. Redirect to Stripe Checkout (hosted page)
4. On success: webhook fires, updates Firebase profile with plan + Stripe IDs
5. User redirected back to Settings with success toast

### Stripe Customer Portal
- Accessible from Settings > "Manage Subscription"
- Handles: change plan, switch billing interval, update payment method, cancel, view invoices

### Webhooks (Firebase Cloud Function)
Listen for these events:
- `checkout.session.completed` - initial subscription created
- `invoice.paid` - recurring payment succeeded
- `customer.subscription.updated` - plan changed
- `customer.subscription.deleted` - subscription canceled (revert to Foundation)
- `invoice.payment_failed` - payment failed (mark as past_due)

### Webhook Handler Path
`POST /api/stripe/webhook` (Next.js API route or Firebase Cloud Function)

---

## Plan Enforcement Points

| Check | Location | Logic |
|---|---|---|
| Project creation limit | `new-project/page.tsx` | Count user's projects vs tier limit |
| AI query rate limit | `functions/ai-chat.ts` | Already exists, keep as-is |
| Photo upload limit | `photos/_client.tsx` | Count photos vs tier limit |
| Document generation | `documents/_client.tsx` | Check plan includes doc gen |
| Export functionality | `ExportModal.tsx` | Check plan includes export |
| Financial modeling | `financials/_client.tsx` | Basic vs Advanced by plan |
| Admin features | `settings/_client.tsx` | Check `role === "admin"` |

---

## Annual Discount Display

Settings upgrade UI shows both options with savings highlighted:
```
Builder:    $19/mo  |  $182/yr (save $46)
Developer:  $49/mo  |  $470/yr (save $118)
Enterprise: $149/mo | $1,430/yr (save $358)
```

Toggle between monthly/annual with the annual price showing a "Save 20%" badge.

---

## Implementation Sequence

1. Install Stripe SDK, set up products/prices in Stripe Dashboard
2. Add `role` and Stripe fields to UserProfile type
3. Set admin account to `role: "admin"`, `plan: "ENTERPRISE"` in Firebase
4. Build Settings page upgrade UI with tier cards + monthly/annual toggle
5. Implement Stripe Checkout redirect
6. Implement webhook handler (Cloud Function)
7. Build admin trial code generator UI
8. Build trial code redemption flow
9. Add plan enforcement to project creation, photos, docs, exports
10. Add trial expiry banner + auto-revert logic
