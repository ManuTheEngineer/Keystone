# Contractor Portal Design

**Date:** 2026-03-17
**Status:** Approved
**Goal:** Let project owners share magic links with contractors. Contractors can view project status, mark tasks complete, and upload photos without creating an account.

## Access Model

- Magic link (no signup): `keystonebuild.vercel.app/contractor/[token]`
- 32-character random token, stored in Firebase
- Never expires, but owner can revoke anytime
- Tier limits: Foundation 1 link, Builder 3, Developer/Enterprise unlimited

## Contractor Can

- View: project name, phase, progress, milestone status
- Do: mark their assigned tasks complete, upload photos
- Read: recent daily logs (read-only)

## Contractor Cannot

- View: budget, financials, other contacts, documents
- Do: edit project settings, create tasks, modify budget

## Data Model

```
Firebase: contractorLinks/{token}
  token: string
  userId: string (owner UID)
  projectId: string
  contactId: string
  contactName: string
  contactRole: string
  createdAt: string
  revokedAt: string | null
```

## Routes

- `/contractor/[token]` — public page, no auth
- Team page: generate/revoke links

## Security

- Token is 32 random chars (unguessable)
- Firebase rules validate token exists and isn't revoked
- Contractor writes scoped to photos + task completions only

## Implementation

### Phase 1: Data + Link Generation
- Add contractorLinks node to Firebase
- Add generateContractorLink / revokeContractorLink to project-service
- Update Firebase rules for contractorLinks

### Phase 2: Team Page UI
- "Generate link" button per contact
- Active links list with copy + revoke
- Tier limit enforcement

### Phase 3: Contractor View Page
- /contractor/[token] route (outside dashboard layout)
- Minimal mobile-first UI
- Task list with checkboxes
- Photo upload
- Read-only daily logs
