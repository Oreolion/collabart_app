# eCollabs

A collaborative music and creative arts platform where musicians, producers, vocalists, graphic designers, and visual artists work together remotely on projects — powered by AI intelligence.

[![Next.js](https://img.shields.io/badge/Next-14.x-000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-007acc?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Convex](https://img.shields.io/badge/Convex-Serverless-ff6b35?style=flat-square)](https://convex.dev)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.0_Flash-4285f4?style=flat-square&logo=google)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/github/license/Oreolion/collabart_app?style=flat-square)](./LICENSE)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Backend** | Convex (serverless functions, real-time database, file storage) |
| **Auth** | Clerk (webhooks sync to Convex via Svix) |
| **AI** | Google Gemini 2.0 Flash (`@google/generative-ai`) |
| **Stem Separation** | Replicate (Demucs model) |
| **Styling** | Tailwind CSS + shadcn/ui + custom glassmorphism design system |
| **Animations** | Framer Motion + animate.css |
| **Audio** | wavesurfer.js (multi-track waveform rendering) |
| **Payments** | BlockRadar (crypto payment links + webhook-driven ownership transfer) |

## Features

### Core Collaboration
- **Project Management** — Create, edit, publish projects with metadata (genre, mood, talents, BPM, key, sample rate, bit depth)
- **Collaboration Invites** — Send invites, accept/reject, manage collaborators with audition privacy
- **Real-time Chat** — Per-project messaging with edit/delete and access control
- **Lyric Workflow** — Submit lyrics for review, owner approves/rejects with written feedback
- **File Management** — Upload audio files with auto-versioning, soft-delete, version history
- **Comments** — Project-level discussion threads

### Audio
- **Multi-Track Player** — Synchronized waveform playback with global transport controls
- **Per-Track Controls** — Solo, mute, volume slider per track
- **Waveform Visualization** — wavesurfer.js rendering with individual play/pause
- **Waveform Annotations** — Timestamped, color-coded notes pinned to specific moments in a track
- **Stem Separation** — Split any audio file into vocals, drums, bass, and other stems via Demucs/Replicate

### Visual Arts Ecosystem
- **Visual Asset Uploads** — Submit cover art, promotional images, social media assets, branding materials
- **Submission Review** — Owner approves/rejects visual submissions with feedback
- **Cover Art Selection** — Choose from approved visuals as project cover
- **Visual Portfolio** — User profile portfolio grid with lightbox

### AI Features

#### Tier 1 — Creative Assistance
- **AI Creative Brief Builder** — Describe your project in natural language, AI generates structured brief (genres, moods, talents needed, tempo, key suggestions) and auto-fills the project form
- **AI Lyric Workshop** — Four modes: complete next line, suggest rhymes, rewrite for tone, generate verse from theme
- **AI Audio Tag Suggestions** — Post-upload AI analysis suggesting BPM, key, instruments, and tags
- **Smart Search** — Natural language queries ("moody jazz piano piece") converted to structured filters

#### Tier 2 — Collaboration Intelligence
- **Collaborator Recommendations** — AI matches project needs against user profiles with match scores, talents, and one-click invite
- **AI Mix Feedback** — Genre-aware mixing suggestions per track, general mix tips, missing elements, and reference track recommendations
- **Feedback Translator** — Converts vague chat feedback ("make it more punchy") into actionable technical notes with suggested actions
- **AI Credit Suggestions** — Analyzes activity log to suggest fair contribution split percentages

#### Tier 3 — Advanced Audio AI
- **Stem Separation** — Split audio into 4 stems (vocals, drums, bass, other) via Replicate's Demucs model with status polling and download links
- **Missing Parts Suggestions** — AI analyzes existing tracks and suggests complementary instruments with priority rankings (essential/recommended/optional)
- **AI Mastering Guide** — Genre-aware mastering chain recommendations with numbered signal chain, per-step plugin/settings/purpose, LUFS target, headroom, tips, and reference tracks

#### Tier 4 — Visual AI
- **AI Design Feedback** — Composition, color theory, typography, and genre-fit analysis with 1-10 scores, expandable critiques, strengths, and technical notes for submitted visuals
- **Social Media Mockup Generator** — Platform-specific mockup specs for Instagram Post/Story, Twitter/X, and Facebook with text overlay, captions, hashtags, color palettes, font suggestions, and release copy variants

### Credits & Attribution
- **Credits Manager** — Track contributions with role, type, and split percentage
- **Pie Chart** — Visual split breakdown using CSS conic gradients
- **Credit Confirmation** — Collaborators confirm their credits
- **Contribution Types** — Composition, performance, production, visual, engineering, lyrics

### Notifications & Activity
- **Real-time Notifications** — Every collaborative action fires a notification
- **Activity Feed** — Timeline with action-typed icons for project history
- **Unread Badges** — Glowing indicator with mark-as-read

### Search & Discovery
- **Full-text Search** — Search by title, author, description
- **Dropdown Filters** — Genre, mood, talent, project type, sort by views/likes
- **Text Filters** — Inline search by title, talent, genre, mood

### Marketplace
- **List for Sale** — Set price and list projects
- **Crypto Payments** — BlockRadar payment links with webhook-driven ownership transfer
- **Saved Projects** — Bookmark projects for later

### User Experience
- **Glassmorphism UI** — Dark music-platform theme with frosted glass effects
- **Responsive Design** — Mobile-first with collapsible sidebar navigation
- **Onboarding Checklist** — 5-step guided setup
- **Skeleton Loading** — Shimmer placeholders during data fetching
- **Page Transitions** — CSS fade+slide animations on route changes

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- [Convex](https://convex.dev) account
- [Clerk](https://clerk.com) account

### Installation

```bash
git clone https://github.com/Oreolion/collabart_app.git
cd collabart_app
npm install
```

### Environment Variables

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

Set in Convex dashboard (Settings > Environment Variables):

```
CLERK_WEBHOOK_SECRET=whsec_...
BLOCKRADAR_API_KEY=your_key
GEMINI_API_KEY=your_gemini_api_key
REPLICATE_API_TOKEN=your_replicate_token
```

| Variable | Required | Purpose |
|----------|----------|---------|
| `CLERK_WEBHOOK_SECRET` | Yes | Svix webhook verification for user sync |
| `BLOCKRADAR_API_KEY` | Yes | Crypto payment link creation |
| `GEMINI_API_KEY` | For AI features | Google Gemini 2.0 Flash — powers all AI actions |
| `REPLICATE_API_TOKEN` | For stem separation | Replicate API — Demucs stem separation model |

### Development

Run both servers simultaneously:

```bash
# Terminal 1: Next.js dev server
npm run dev

# Terminal 2: Convex dev server
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── (auth)/                    # Clerk sign-in/sign-up
├── (root)/                    # Authenticated app (DashboardLayout + ProjectPlayer)
│   ├── dashboard/             # Main dashboard with tabs
│   ├── project/[projectId]/   # Project detail hub
│   ├── my-profile/            # User profile management
│   └── add-project/           # Create new project
├── providers/                 # ConvexClerkProvider, AudioProvider
├── page.tsx                   # Public landing page
└── layout.tsx                 # Root layout

convex/
├── schema.ts          # Database schema (14 tables)
├── projects.ts        # Project CRUD, comments, files, search
├── users.ts           # User lifecycle (Clerk webhook sync)
├── collaborations.ts  # Invites, audition settings
├── lyrics.ts          # Lyric submission workflow
├── messages.ts        # Real-time project chat
├── visuals.ts         # Visual asset submission/review
├── credits.ts         # Credits & attribution
├── annotations.ts     # Waveform timestamped annotations
├── ai.ts              # AI actions (Gemini + Replicate, "use node")
├── likes.ts           # Like/unlike with notifications
├── file.ts            # Upload URL generation
├── actions.ts         # BlockRadar payment links (node action)
└── http.ts            # Webhook endpoints (/clerk, /blockradar)

components/
├── ui/                            # shadcn/ui primitives
│
├── # Audio
├── MultiTrackPlayer.tsx           # Multi-track audio player with global transport
├── WaveformTrack.tsx              # Single track waveform (wavesurfer.js)
├── WaveformAnnotation.tsx         # Timestamped color-coded annotations per file
├── StemSeparator.tsx              # Demucs stem separation (Replicate API)
│
├── # Visual Arts
├── VisualAssetGallery.tsx         # Visual gallery with lightbox
├── VisualSubmissionCard.tsx       # Visual review card (approve/reject)
├── VisualUploadDialog.tsx         # Visual upload dialog
├── VisualPortfolio.tsx            # User portfolio grid
├── CoverArtSelector.tsx           # Cover art selector from approved visuals
│
├── # AI — Tier 1
├── AIBriefAssistant.tsx           # Natural language → structured project brief
├── AILyricAssistant.tsx           # 4-mode lyric writing assistant
├── AITagSuggestions.tsx           # Post-upload AI tag suggestions
│
├── # AI — Tier 2
├── CollaboratorRecommendations.tsx # AI-matched collaborators with scores
├── AIMixFeedback.tsx              # Per-track mix feedback + missing elements
├── FeedbackTranslator.tsx         # Vague feedback → technical actions
├── AICreditSuggestions.tsx        # AI-suggested credit splits
│
├── # AI — Tier 3
├── AIGenerateStem.tsx             # Missing instrument suggestions with priority
├── MasteringPreview.tsx           # AI mastering chain guide
│
├── # AI — Tier 4
├── AIDesignFeedback.tsx           # Design critique with score bars
├── SocialMockupGenerator.tsx      # Social media mockup specs with copy
│
├── # Collaboration
├── ProjectChat.tsx                # Chat panel with auto-scroll
├── ChatMessage.tsx                # Message bubble with avatar, edit/delete
├── CreditsManager.tsx             # Credits management with pie chart
├── CreditsList.tsx                # Public credits display
├── SearchFilters.tsx              # Dropdown filter bar
│
├── # Platform
├── NotificationsPanel.tsx         # Notification popover with unread badge
├── ActivityFeed.tsx               # Activity timeline with action icons
├── OnboardingChecklist.tsx        # 5-step guided onboarding
├── Skeleton.tsx                   # Shimmer loading placeholders
├── PageTransition.tsx             # CSS fade+slide route transitions
└── ...                            # 40+ total components
```

## AI Architecture

All AI features run as Convex `"use node"` actions in `convex/ai.ts`, keeping API keys server-side and leveraging Convex's built-in query/mutation access from within actions.

```
User Action → Component → useAction(api.ai.*)
                              ↓
                    Convex Node Action
                              ↓
                  ┌──────────────────────┐
                  │  Google Gemini 2.0   │ ← Creative brief, lyrics, tags,
                  │  Flash API           │   search, recommendations, mix
                  │                      │   feedback, credit splits,
                  │                      │   mastering, stem suggestions
                  └──────────────────────┘
                  ┌──────────────────────┐
                  │  Replicate API       │ ← Demucs stem separation
                  │  (Demucs model)      │   (vocals, drums, bass, other)
                  └──────────────────────┘
```

**AI Actions (13 total):**

| Action | Tier | Purpose |
|--------|------|---------|
| `generateCreativeBrief` | 1 | Natural language → structured project brief JSON |
| `assistLyricWriting` | 1 | 4 modes: complete, rhyme, rewrite, generate |
| `suggestAudioTags` | 1 | File context → BPM, key, instrument, tag suggestions |
| `semanticProjectSearch` | 1 | Natural language → structured search filters |
| `generateCollaboratorRecommendations` | 2 | Project needs vs user profiles → match scores |
| `generateMixFeedback` | 2 | Genre-aware per-track mixing suggestions |
| `translateFeedback` | 2 | Vague feedback → actionable technical notes |
| `suggestCreditSplits` | 2 | Activity log analysis → fair split percentages |
| `separateStems` | 3 | Audio → Demucs via Replicate → 4 stems |
| `suggestComplementaryStem` | 3 | Arrangement analysis → missing instrument suggestions |
| `suggestMasteringChain` | 3 | Genre-aware mastering chain + LUFS target |
| `analyzeDesign` | 4 | Design critique — composition, color, typography, genre fit |
| `generateSocialMockups` | 4 | 4-platform social media mockup specs with copy |

## Database Schema

| Table | Purpose |
|-------|---------|
| `projects` | Project metadata, settings, cover art |
| `users` | User profiles synced from Clerk |
| `projectFile` | Audio/image files with versioning and soft-delete |
| `comments` | Project comments |
| `savedProjects` | Bookmarked projects |
| `lyricSubmissions` | Lyric submissions with approval + feedback |
| `projectInvites` | Collaboration invites |
| `notifications` | User notifications |
| `activityLog` | Project activity timeline |
| `likes` | Project likes |
| `messages` | Real-time project chat |
| `visualSubmissions` | Visual asset submissions with review |
| `credits` | Contribution credits with splits |
| `fileAnnotations` | Timestamped waveform annotations per file |

## Design System

Custom glassmorphism system built on Tailwind:

| Class | Effect |
|-------|--------|
| `glassmorphism` | Frosted glass panel with backdrop blur |
| `glassmorphism-black` | Dark variant for nav/player |
| `surface-elevated` | Elevated card surface |
| `glass-hover` | Hover effect with border glow |
| `ambient-bg` | Animated gradient background |
| `hover-lift` | TranslateY + shadow on hover |

## Deployment

| Service | Purpose |
|---------|---------|
| [Vercel](https://vercel.com) | Frontend hosting (automatic Next.js deployment) |
| [Convex](https://convex.dev) | Backend (automatic via `npx convex deploy`) |
| [Clerk](https://clerk.com) | Auth (webhook to `<convex-url>.convex.site/clerk`) |

## Cross-Agent Development

This project uses the `.ai-sync/` protocol for cross-platform AI agent synchronization. Multiple AI coding tools (Claude Code, Codex, OpenCode, Cursor) can work on this project sequentially with seamless handoff.

- `.ai-sync/HANDOFF.md` — Current state and next steps
- `.ai-sync/PROGRESS.md` — Phase/task completion tracking
- `.ai-sync/PLAN.md` — Full implementation plan
- `AGENTS.md` — Instructions for Codex/OpenCode

## Roadmap

- [x] AI Creative Brief Builder (Gemini)
- [x] AI Lyric Workshop (rhyme, complete, rewrite, generate)
- [x] AI Audio Tag Suggestions (BPM, key, instruments)
- [x] AI Collaborator Recommendations (profile matching)
- [x] AI Mix Feedback (per-track suggestions)
- [x] AI Feedback Translator (vague → technical)
- [x] AI Credit Split Suggestions (activity-based)
- [x] Stem Separation (Demucs/Replicate)
- [x] AI Missing Parts Suggestions (arrangement analysis)
- [x] AI Mastering Guide (signal chain + LUFS)
- [x] Waveform Annotations (timestamped, color-coded)
- [x] AI Design Feedback (composition, color, typography analysis)
- [x] Social Media Mockup Generator (platform-specific specs, captions, hashtags)

## Contributing

1. Fork and create a branch: `feature/your-feature`
2. Install deps and run dev server locally
3. Add focused commits with clear PR descriptions
4. Open issues first for larger features

## License

MIT
