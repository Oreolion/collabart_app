# eCollabs — AI Agent Instructions

## Cross-Agent Synchronization (MANDATORY)

This project uses the `.ai-sync/` protocol for cross-platform AI agent handoff.

**BEFORE starting any work:**
1. Read `.ai-sync/HANDOFF.md` — current state, what was last done, what to do next
2. Read `.ai-sync/PROGRESS.md` — what's complete vs pending
3. Read `.ai-sync/PLAN.md` — overview + pointer to full plan
4. Read the full plan at `.claude/plans/lucky-zooming-canyon.md` for detailed specs

**BEFORE stopping for any reason:**
1. Update `.ai-sync/HANDOFF.md` with what you completed and exact next steps
2. Update `.ai-sync/PROGRESS.md` — check off completed items
3. Run `npx tsc --noEmit` and `npm run build` to verify no breakage

**RULES:**
- Follow the plan exactly. Do not add features not in the plan.
- Do not redo completed work. Check PROGRESS.md first.
- Read surrounding code before writing new code to match patterns.
- Use existing design system classes: `glassmorphism`, `surface-elevated`, `glass-hover`
- All dialogs: `<DialogContent className="glassmorphism border-0">`

## Project Overview

eCollabs is a collaborative music platform. Next.js 14 (App Router) + Convex (serverless backend) + Clerk (auth).

## Development Commands

```bash
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex dev server (run alongside npm run dev)
npm run build        # Production build
npx tsc --noEmit     # Type-check
```

## Architecture

- **Frontend**: React components in `components/`, pages in `app/`
- **Backend**: Convex functions in `convex/` (queries, mutations, node actions)
- **Auth**: Clerk webhooks → Convex `http.ts` → `users.ts` for user sync
- **Storage**: Convex file storage for audio/image uploads
- **Styling**: Tailwind CSS + shadcn/ui + glassmorphism design system

## Key Patterns

- Convex queries: `useQuery(api.module.functionName, { args })`
- Convex mutations: `useMutation(api.module.functionName)`
- File uploads: `generateUploadUrl` → POST file → get storageId → pass to mutation
- Notifications: `ctx.db.insert("notifications", { userId, type, title, message, isRead: false, createdAt: Date.now() })`
- Path alias: `@/*` maps to project root

## Important Notes

- `next.config.mjs` has `ignoreBuildErrors: true` — always run `npx tsc --noEmit` separately
- `convex/_generated/` is auto-generated — do not edit manually
- New Convex modules need `npx convex dev` running to generate TypeScript types
- Remote images allowed from `img.clerk.com` only
