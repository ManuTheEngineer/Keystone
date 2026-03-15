---
name: Keystone Current Build State
description: What's built vs planned in the Keystone construction management platform as of March 2026
type: project
---

Keystone is a construction project lifecycle management app (USA + West Africa markets). Currently a Next.js 16 static-export PWA deployed to Firebase Hosting.

**Stack in use:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Firebase (Auth + RTDB + Storage), Zustand, Lucide icons, next-pwa. Firebase project: keystone-21811.

**Fully built:**
- Auth (register/login/reset) with Firebase Auth
- Dashboard with project listing and activity feed
- 5-step project creation wizard (purpose → market → property type → size → name)
- Project workspace with 7 working sub-pages: overview, budget, daily-log, team, photos, learn, ai-assistant
- Phase tracker (9 phases: Define → Operate)
- Budget line items CRUD, daily logs CRUD, contacts/team CRUD, photo upload
- Learn page with 10 educational modules
- Responsive layout with sidebar + mobile hamburger
- Design system: earth/clay/sand palette, Instrument Serif + DM Sans + JetBrains Mono fonts

**Partially built / scaffolded:**
- Documents page (route exists, not fully implemented)
- Schedule page (route exists, not fully implemented)
- AI assistant (chat UI built, no endpoint configured)

**Not yet built (per CLAUDE.md plan):**
- packages/ directory (market-data, ai, documents, core)
- Prisma/PostgreSQL (using Firebase RTDB instead)
- Market-specific data modules (cost benchmarks, regulations, templates)
- Document generation engine
- Advanced financial modeling
- Inspection tracking, punch list
- Mobile app (React Native)
- Multi-language support (French, Ewe, etc.)
- Offline sync mechanism
- Real image compression for 2G

**Why:** MVP was built rapidly to establish core UI and Firebase integration. Next phase should focus on market-specific intelligence and backend migration.

**How to apply:** When building new features, work within the existing Firebase + static export architecture unless explicitly migrating. All new pages follow the `_client.tsx` pattern in `(dashboard)/project/[id]/`.
