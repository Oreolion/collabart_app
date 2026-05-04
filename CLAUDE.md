# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

eCollabs is a collaborative music platform where musicians and artists create projects, upload audio files, manage collaborations, submit/review lyrics, list projects for sale, and send collaboration invites. It runs on **Next.js 14 (App Router)** with **Convex** as the serverless backend and **Clerk** for authentication.

## Commands

```bash
npm run dev          # Start Next.js dev server
npx convex dev       # Start Convex dev server (run alongside npm run dev)
npm run build        # Production build
npm run lint         # ESLint
npx tsc --noEmit     # Type-check (note: next.config.mjs has ignoreBuildErrors: true)
```

Both `npm run dev` and `npx convex dev` must run simultaneously during development. Convex dev watches `convex/` for changes and pushes functions to the Convex cloud.

## Architecture

### Provider Chain (app/layout.tsx)

```
ConvexClerkProvider → AudioProvider → body
```

- **ConvexClerkProvider** (`app/providers/ConvexClerkProvider.tsx`): Wraps `ClerkProvider` + `ConvexProviderWithClerk`. Contains an `AuthRedirect` component that redirects signed-in users away from `/`, `/sign-in`, `/sign-up` to `/dashboard`.
- **AudioProvider** (`app/providers/AudioProvider.tsx`): Global audio state via React Context. Exposes `useAudio()` hook for `audio`, `setAudio`, `resetAudio`.

### Route Groups

- `app/(auth)/` — Clerk sign-in/sign-up pages (catch-all routes `[[...sign-in]]`, `[[...sign-up]]`)
- `app/(root)/` — Authenticated app pages. Layout wraps children in `DashboardLayout` + a sticky `ProjectPlayer` at the bottom.
- `app/page.tsx` — Public landing page (Hero, carousels, feature sections)

### Convex Backend (`convex/`)

All server-side logic lives in Convex functions (no Next.js API routes):

| File | Purpose |
|------|---------|
| `schema.ts` | Database schema: `projects`, `users`, `projectFile`, `comments`, `savedProjects`, `lyricSubmissions`, `projectInvites` |
| `projects.ts` | CRUD for projects, search (3 search indexes), comments, listing for sale, ownership transfer, genre/mood/talent updates |
| `users.ts` | Internal mutations for user lifecycle (created/updated/deleted via Clerk webhooks) |
| `collaborations.ts` | Audition settings, sending project invites |
| `lyrics.ts` | Lyric submission workflow: owner sets lyrics, non-owners submit for review, owner approves/rejects |
| `file.ts` | `generateUploadUrl` mutation for Convex storage uploads |
| `actions.ts` | `"use node"` action for creating BlockRadar payment links (crypto payments) |
| `http.ts` | HTTP router with webhook endpoints: `/clerk` (user sync via Svix) and `/blockradar` (payment confirmation → ownership transfer) |
| `auth.config.ts` | Clerk domain config for Convex auth |

### Auth Flow

- **Clerk middleware** (`middleware.ts`): Public routes are `/`, `/sign-in`, `/sign-up`. All other routes require authentication. Dashboard routes redirect to `/sign-in` if unauthenticated.
- **Clerk webhooks** → Convex `http.ts` → `users.ts` internal mutations keep the Convex `users` table in sync with Clerk.
- Convex functions use `ctx.auth.getUserIdentity()` for auth; ownership checks compare `project.authorId` against `identity.subject` (Clerk user ID).

### Styling

Hybrid approach:
- **Tailwind CSS** + **shadcn/ui** (new-york style, CSS variables, zinc base color) for UI primitives in `components/ui/`
- **CSS Modules** (`styles/*.module.css`) for page/component-specific styles (hero, dashboard, navbar, etc.)
- `animate.css` and `framer-motion` for animations

### Key Patterns

- **Path alias**: `@/*` maps to project root (e.g., `@/components/...`, `@/types/...`)
- **Shared types**: `types/index.ts` — `ProjectProps`, `ProjectFileType`, `AudioProps`, `AudioContextType`, union types for project settings
- **Constants**: `constants/index.ts` — carousel slides, feature section data, navbar link definitions (with inline SVG)
- **shadcn/ui config**: `components.json` — RSC enabled, aliases configured for `@/components`, `@/lib/utils`, `@/components/ui`
- **Convex queries/mutations** are called client-side via `useQuery`/`useMutation` from `convex/react`
- **File uploads**: Use Convex storage — call `file.generateUploadUrl`, POST the file, get a `storageId`, then pass it to a mutation

### Payment Flow (BlockRadar)

1. Client calls `actions.createBlockradarPaymentLinkAction` (Convex action) to generate a payment link
2. User pays via BlockRadar
3. BlockRadar sends webhook to `/blockradar` endpoint in `convex/http.ts`
4. Webhook triggers `projects.transferOwnership` mutation to transfer project to buyer

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CONVEX_URL`

Required in Convex dashboard environment:
- `CLERK_WEBHOOK_SECRET` (for Svix webhook verification)
- `BLOCKRADAR_API_KEY` (for payment link creation)

## Notes

- `next.config.mjs` has `typescript.ignoreBuildErrors: true` and `eslint.ignoreDuringBuilds: true` — the build won't fail on type/lint errors, so always run `npx tsc --noEmit` separately
- Remote images are allowed from `img.clerk.com` only (configured in `next.config.mjs`)
- The `convex/_generated/` directory is auto-generated by the Convex CLI — do not edit manually
- `convex/users.ts` has a stale reference to a `podcasts` table in `updateUser` — this is a known leftover from a template and should be cleaned up

## Cross-Agent Synchronization

This project uses the `.ai-sync/` protocol for cross-platform AI agent handoff (Claude Code, Codex, Cursor, Aider, OpenCode, etc.).

- **Before starting work**: Read `.ai-sync/HANDOFF.md` for current state and next steps
- **Before stopping**: Update `.ai-sync/HANDOFF.md` with progress and specific next steps
- **Track progress**: Update `.ai-sync/PROGRESS.md` as tasks complete
- **Full plan**: `.claude/plans/lucky-zooming-canyon.md` (also referenced from `.ai-sync/PLAN.md`)
- **Adapter files**: `AGENTS.md` (Codex), `.cursorrules` (Cursor), `.clinerules` (Cline)

Use `/handoff` to write handoff state before switching agents. Use `/sync-status` to check current state.

- think creative on how to integrate eleven labs creative music studio and their new techs through api best in the app.
- can these arts be published to elevenlabs marketplace
- i think its best we seperate concerns and clarify, in the sense that ai creeated or assisted art is different from the main goal of this app to solve and serve as a platform where multiple creators of different talents can put a fully made songs together, where artist can download beats uploaded by producer and also record and reupload for producers feedback, also soundengineer can download and make edits that are needed and reupload for the next person in that trend, designers can also create arts too into a full and complete songs that can be uploaded to tidal, deno, audiomack or other music publishing platforms
- we can then think seperately about how AI can help in this process and integrated, but AI content and creations have to be labeled.