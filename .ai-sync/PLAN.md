# eCollabs Implementation Plan

## Active Plan (current work)

**`.claude/plans/human-first-elevenlabs-marketplace.md`** — Phases 8–12 of the post-AI-Tier-1 evolution. Supersedes the AI Tier rollout in `lucky-zooming-canyon.md`. Any agent continuing AI / Marketplace / publishing work MUST read this file end-to-end first.

Topics: `stage`+`origin` taxonomy on `projectFile`, AI Lab surface separation, ElevenLabs Marketplace publishing (mutually exclusive with internal BlockRadar sale), DistroKid + Audiomack distribution adapters, C2PA provenance, EU AI Act compliance.

## Historical plan

`.claude/plans/lucky-zooming-canyon.md` — original 12-phase plan. Phases 1–7 complete + original Phase 12 (README) complete. Phase 8 onward is now governed by the active plan above.

## Summary

Transform eCollabs from a music file-sharing app into a full creative ecosystem. The platform's identity is **human multi-creator collaboration** (producer → artist → engineer → designer → publishing); AI is a clearly labeled auxiliary toolkit, never the main flow.

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
| 8 | Foundation: stage+origin+provenance, OriginBadge, default-hide AI | **IN PROGRESS** | Phases 1-7 |
| 9 | AI Lab surface (relocate ElevenLabs/Gemini, Promote-to-pipeline) | PENDING | Phase 8 |
| 10 | Studio Pipeline board (stage-grouped project view, handoff) | PENDING | Phase 8 |
| 11 | ElevenLabs Tier B (SFX, Composition Plan, bucket split) | PENDING | Phase 8 |
| 12 | Publishing (ElevenLabs Marketplace + DistroKid + Audiomack) | PENDING | Phases 8-11 |
| 13 (stretch) | Real C2PA signer worker | PENDING | Phase 12 |
| README | Documentation rewrite | COMPLETE | — |

## Key Conventions

- Convex functions: queries use `query()`, mutations use `mutation()`, node actions use `action()` with `"use node"`
- Notifications: `ctx.db.insert("notifications", { userId, type, title, message, isRead: false, createdAt: Date.now() })`
- Activity log: `ctx.db.insert("activityLog", { projectId, userId, userName, userImageUrl, action, details, createdAt: Date.now() })`
- Components use glassmorphism classes: `glassmorphism`, `surface-elevated`, `glass-hover`
- All dialogs use `<DialogContent className="glassmorphism border-0">`
- File uploads use Convex storage pattern: `generateUploadUrl` → POST file → get storageId → pass to mutation
