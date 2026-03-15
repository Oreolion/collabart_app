# eCollabs

A collaborative music and creative arts platform where musicians, producers, vocalists, graphic designers, and visual artists work together remotely on projects.

[![Next.js](https://img.shields.io/badge/Next-14.x-000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-007acc?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Convex](https://img.shields.io/badge/Convex-Serverless-ff6b35?style=flat-square)](https://convex.dev)
[![License: MIT](https://img.shields.io/github/license/Oreolion/collabart_app?style=flat-square)](./LICENSE)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Backend** | Convex (serverless functions, real-time database, file storage) |
| **Auth** | Clerk (webhooks sync to Convex via Svix) |
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

### Visual Arts Ecosystem
- **Visual Asset Uploads** — Submit cover art, promotional images, social media assets, branding materials
- **Submission Review** — Owner approves/rejects visual submissions with feedback
- **Cover Art Selection** — Choose from approved visuals as project cover
- **Visual Portfolio** — User profile portfolio grid with lightbox

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
```

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
├── schema.ts          # Database schema (13 tables)
├── projects.ts        # Project CRUD, comments, files, search
├── users.ts           # User lifecycle (Clerk webhook sync)
├── collaborations.ts  # Invites, audition settings
├── lyrics.ts          # Lyric submission workflow
├── messages.ts        # Real-time project chat
├── visuals.ts         # Visual asset submission/review
├── credits.ts         # Credits & attribution
├── likes.ts           # Like/unlike with notifications
├── file.ts            # Upload URL generation
├── actions.ts         # BlockRadar payment links (node action)
└── http.ts            # Webhook endpoints (/clerk, /blockradar)

components/
├── ui/                        # shadcn/ui primitives
├── MultiTrackPlayer.tsx       # Multi-track audio player
├── WaveformTrack.tsx          # Single track waveform
├── ProjectChat.tsx            # Chat panel
├── CreditsManager.tsx         # Credits management
├── VisualAssetGallery.tsx     # Visual gallery with lightbox
├── SearchFilters.tsx          # Dropdown filter bar
├── NotificationsPanel.tsx     # Notification popover
├── ActivityFeed.tsx           # Activity timeline
└── ...                        # 30+ components
```

## Database Schema

| Table | Purpose |
|-------|---------|
| `projects` | Project metadata, settings, cover art |
| `users` | User profiles synced from Clerk |
| `projectFile` | Audio/image files with versioning |
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

## Design System

Custom glassmorphism system built on Tailwind:

| Class | Effect |
|-------|--------|
| `glassmorphism` | Frosted glass panel with backdrop blur |
| `glassmorphism-black` | Dark variant for nav/player |
| `surface-elevated` | Elevated card surface |
| `glass-hover` | Hover effect with border glow |
| `ambient-bg` | Animated gradient background |

## Deployment

| Service | Purpose |
|---------|---------|
| [Vercel](https://vercel.com) | Frontend hosting (automatic Next.js deployment) |
| [Convex](https://convex.dev) | Backend (automatic via `npx convex deploy`) |
| [Clerk](https://clerk.com) | Auth (webhook to `<convex-url>.convex.site/clerk`) |

## Roadmap

- [ ] AI Creative Brief Builder (OpenAI)
- [ ] AI Lyric Workshop (rhyme suggestions, verse generation)
- [ ] AI Audio Analysis (BPM/key detection, auto-tagging)
- [ ] Collaborator Recommendations (embedding-based matching)
- [ ] Stem Separation (Demucs/Replicate)
- [ ] AI Cover Art Generation (DALL-E/Stability AI)
- [ ] Social Media Mockup Generator

## Contributing

1. Fork and create a branch: `feature/your-feature`
2. Install deps and run dev server locally
3. Add focused commits with clear PR descriptions
4. Open issues first for larger features

## License

MIT
