# eCollabs Implementation Plan

## Full Plan Location

The complete 12-phase implementation plan is at:
`.claude/plans/lucky-zooming-canyon.md`

Any agent continuing work MUST read that file for detailed specifications.

## Summary

Transform eCollabs from a music file-sharing app into a full creative ecosystem with AI intelligence. 12 phases covering notification wiring, messaging, multi-track audio, visual artist support, credits system, and 4 tiers of AI features.

## Tech Stack
- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Convex (serverless functions, real-time database)
- **Auth**: Clerk
- **Styling**: Glassmorphism design system (`glassmorphism`, `surface-elevated`, `glass-hover`)
- **Payments**: BlockRadar (crypto)

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
| 8 | AI Tier 1 — Quick AI Wins | **NEXT** | Phases 1-7 |
| 9 | AI Tier 2 — Collaboration Intelligence | PENDING | Phase 8 |
| 10 | AI Tier 3 — Advanced Audio AI | PENDING | Phase 9 |
| 11 | AI Tier 4 — Visual AI | PENDING | Phase 10 |
| 12 | README & Documentation | PENDING | All |

## Key Conventions

- Convex functions: queries use `query()`, mutations use `mutation()`, node actions use `action()` with `"use node"`
- Notifications: `ctx.db.insert("notifications", { userId, type, title, message, isRead: false, createdAt: Date.now() })`
- Activity log: `ctx.db.insert("activityLog", { projectId, userId, userName, userImageUrl, action, details, createdAt: Date.now() })`
- Components use glassmorphism classes: `glassmorphism`, `surface-elevated`, `glass-hover`
- All dialogs use `<DialogContent className="glassmorphism border-0">`
- File uploads use Convex storage pattern: `generateUploadUrl` → POST file → get storageId → pass to mutation
