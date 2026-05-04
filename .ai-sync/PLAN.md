# eCollabs Implementation Plan

## Active Plan (current work)

**`.kimi/plans/spider-gwen-green-arrow-nova.md`** — Testing setup & implementation plan. Covers Vitest + React Testing Library + convex-test + Playwright configuration, unit tests, backend tests, component tests, E2E tests, and CI integration.

**`.claude/plans/human-first-elevenlabs-marketplace.md`** — Phases 8–13 of the post-AI-Tier-1 evolution. All phases COMPLETE.

## Historical plan

`.claude/plans/lucky-zooming-canyon.md` — original 12-phase plan. Phases 1–7 complete + original Phase 12 (README) complete.

## Summary

Transform eCollabs from a music file-sharing app into a full creative ecosystem. The platform's identity is **human multi-creator collaboration** (producer → artist → engineer → designer → publishing); AI is a clearly labeled auxiliary toolkit, never the main flow.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Convex (serverless functions, real-time database)
- **Auth**: Clerk
- **Styling**: Glassmorphism design system (`glassmorphism`, `surface-elevated`, `glass-hover`)
- **Payments**: BlockRadar (crypto)
- **Testing**: Vitest + React Testing Library + convex-test + Playwright

## Phase Overview

| Phase | Name | Status | Dependencies |
|-------|------|--------|-------------|
| 1 | Notification & Activity Log Wiring | COMPLETE | None |
| 2 | Lyric Feedback + File Versioning | COMPLETE | Phase 1 |
| 3 | Project Messaging / Chat | COMPLETE | Phase 2 |
| 4 | Multi-Track Audio Player | COMPLETE | None |
| 5 | Visual Artists Ecosystem | COMPLETE | None |
| 6 | Search & Filter Overhaul | COMPLETE | None |
| 7 | Credits & Attribution | COMPLETE | Phase 1 |
| 8 | Foundation: stage+origin+provenance, OriginBadge, default-hide AI | COMPLETE | Phases 1-7 |
| 9 | AI Lab surface (relocate ElevenLabs/Gemini, Promote-to-pipeline) | COMPLETE | Phase 8 |
| 10 | Studio Pipeline board (stage-grouped project view, handoff) | COMPLETE | Phase 8 |
| 11 | ElevenLabs Tier B (SFX, Composition Plan, bucket split) | COMPLETE | Phase 8 |
| 12 | Publishing (ElevenLabs Marketplace + DistroKid + Audiomack) | COMPLETE | Phases 8-11 |
| 13 (stretch) | Real C2PA signer worker | COMPLETE | Phase 12 |
| 14 | Testing Infrastructure | COMPLETE | All above |

## Key Conventions

- Convex functions: queries use `query()`, mutations use `mutation()`, node actions use `action()` with `"use node"`
- Notifications: `ctx.db.insert("notifications", { userId, type, title, message, isRead: false, createdAt: Date.now() })`
- Activity log: `ctx.db.insert("activityLog", { projectId, userId, userName, userImageUrl, action, details, createdAt: Date.now() })`
- Components use glassmorphism classes: `glassmorphism`, `surface-elevated`, `glass-hover`
- All dialogs use `<DialogContent className="glassmorphism border-0">`
- File uploads use Convex storage pattern: `generateUploadUrl` → POST file → get storageId → pass to mutation
- Tests are colocated with source files (e.g., `lib/utils.test.ts` beside `lib/utils.ts`)
- Backend tests use `convex-test` with a fresh `convexTest()` instance per test
