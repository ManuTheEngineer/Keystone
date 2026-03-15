---
name: Keystone Current Build State
description: What's built vs planned in the Keystone construction management platform as of March 2026
type: project
---

Keystone is a construction project lifecycle management app (USA + West Africa markets). Monorepo with Turborepo + npm workspaces.

**Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, Firebase (Auth + RTDB + Storage + Hosting), Zustand, Lucide icons. Firebase project: keystone-21811. Live URL: https://keystone-21811.web.app

**Packages:**
- `@keystone/market-data` — Comprehensive USA + Togo construction data (costs, phases, trades, inspections, financing, education, templates, glossary)
- `@keystone/core` — 7 financial calculators (loan qualification, mortgage, rental yield, budget estimator, draw schedule, currency converter, contingency)
- `@keystone/ai` — 5 AI prompt modes (general, budget, schedule, risk, contract) with context builders and Claude tool definitions

**Pages (21 routes):**
- Auth: login, register, forgot-password
- Dashboard with market badges
- New project wizard with market preview and budget estimates
- Project workspace: overview, budget, schedule, financials, team, documents, photos, daily-log, inspections, punch-list, ai-assistant
- Learn page (10 education modules)

**Cloud Function:** `functions/` directory with AI proxy (auth + rate limiting). NOT YET DEPLOYED — needs `npm install`, API key secret, and `firebase deploy --only functions`.

**RTDB Rules:** Deployed with per-user and per-project ownership rules.

**Not yet built:**
- Document generation engine (PDF output from templates)
- Offline-first sync mechanism
- Multi-language (French)
- Mobile app (React Native)
- Real photo compression for 2G

**Known issues resolved this session:**
- SWC patcher infinite loop with npm workspaces (fix: copy root lockfile to apps/web, set turbopack.root)
- RTDB rules were default deny-all (fix: deployed proper rules)
- setTopbar infinite re-render (fix: useCallback)
- Missing packageManager field for Turborepo 2.8+

**Why:** MVP is now feature-rich with market intelligence and financial tools. Next priority: document generation engine.

**How to apply:** When building, use the existing monorepo pattern (add to packages/ for shared logic, transpilePackages for web consumption). All new pages follow the page.tsx + _client.tsx pattern.
