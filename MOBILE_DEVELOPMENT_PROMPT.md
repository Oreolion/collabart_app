# eCollabs Mobile App - React Native Development Prompt

> Production-ready implementation guide for building the eCollabs mobile app using React Native (Expo). This document covers every feature, architectural decision, and deployment requirement for a mobile version that shares the same Convex backend and Clerk auth as the web app.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Project Setup & Structure](#3-project-setup--structure)
4. [Authentication (Clerk)](#4-authentication-clerk)
5. [Backend Integration (Convex)](#5-backend-integration-convex)
6. [Navigation Architecture](#6-navigation-architecture)
7. [Screen-by-Screen Specification](#7-screen-by-screen-specification)
8. [Audio System](#8-audio-system)
9. [AI Features](#9-ai-features)
10. [Real-Time Features](#10-real-time-features)
11. [File Upload & Storage](#11-file-upload--storage)
12. [Payments (BlockRadar)](#12-payments-blockradar)
13. [Push Notifications](#13-push-notifications)
14. [Offline Support](#14-offline-support)
15. [Design System & Theming](#15-design-system--theming)
16. [Performance Optimization](#16-performance-optimization)
17. [Security](#17-security)
18. [Testing Strategy](#18-testing-strategy)
19. [CI/CD & Deployment](#19-cicd--deployment)
20. [Environment Variables](#20-environment-variables)
21. [Git Branching Strategy](#21-git-branching-strategy)
22. [Migration Checklist](#22-migration-checklist)

---

## 1. Project Overview

**eCollabs** is a collaborative music platform where musicians create projects, upload audio files, manage collaborations, submit/review lyrics, list projects for sale, send collaboration invites, and leverage AI tools for music creation. The mobile app is a full-featured companion to the web app, sharing the same backend.

### Core Value Propositions
- Create and manage music collaboration projects on the go
- Upload audio stems and files from mobile recording setups
- Real-time project chat with collaborators
- AI-powered beat generation, lyric writing, and mix feedback
- Browse, audition, and purchase music projects
- Push notifications for invites, comments, and project updates

### Shared Infrastructure
- **Backend**: Convex (same deployment as web)
- **Auth**: Clerk (same instance, mobile SDK)
- **Storage**: Convex file storage (same buckets)
- **AI APIs**: Google Gemini 2.0 Flash + ElevenLabs (called via Convex actions)
- **Payments**: BlockRadar crypto payments (via Convex actions + webhooks)

---

## 2. Tech Stack

### Core Framework
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Expo SDK** | 52+ | Managed workflow, OTA updates, EAS Build |
| **React Native** | 0.76+ | UI framework |
| **TypeScript** | 5.x | Type safety |
| **Expo Router** | 4.x | File-based navigation (mirrors Next.js App Router) |

### State & Data
| Technology | Purpose |
|-----------|---------|
| **Convex React Native** | Real-time queries, mutations, actions |
| **React Context** | Audio player state, auth state |
| **AsyncStorage** | Local preferences, offline cache |
| **MMKV** | High-performance key-value storage for tokens/settings |

### Authentication
| Technology | Purpose |
|-----------|---------|
| **@clerk/clerk-expo** | Mobile auth (sign-in, sign-up, session management) |
| **expo-secure-store** | Secure token storage for Clerk |
| **expo-auth-session** | OAuth flows (Google, Apple, GitHub) |
| **expo-local-authentication** | Biometric auth (Face ID, fingerprint) |

### Audio
| Technology | Purpose |
|-----------|---------|
| **expo-av** | Audio playback, recording |
| **react-native-track-player** | Background audio playback with controls |
| **expo-file-system** | Audio file management |

### UI
| Technology | Purpose |
|-----------|---------|
| **NativeWind** (Tailwind for RN) | Styling (matches web Tailwind classes) |
| **React Native Reanimated** | Smooth animations (replaces framer-motion) |
| **React Native Gesture Handler** | Swipe, pan, pinch gestures |
| **expo-haptics** | Haptic feedback |
| **expo-blur** | Glassmorphism effects |
| **expo-linear-gradient** | Gradient backgrounds |
| **react-native-safe-area-context** | Safe area insets |

### Dev & Build
| Technology | Purpose |
|-----------|---------|
| **EAS Build** | Cloud builds for iOS and Android |
| **EAS Submit** | App Store / Play Store submission |
| **EAS Update** | OTA updates without store review |
| **expo-dev-client** | Custom dev builds |

---

## 3. Project Setup & Structure

### Initial Setup

```bash
# Create new Expo project in the mobile-app branch worktree
npx create-expo-app@latest ecollabs-mobile --template tabs
cd ecollabs-mobile

# Install core dependencies
npx expo install expo-router expo-secure-store expo-av expo-file-system expo-haptics expo-blur expo-linear-gradient expo-local-authentication expo-image-picker expo-document-picker expo-notifications expo-updates

# Install Clerk
npm install @clerk/clerk-expo

# Install Convex
npm install convex

# Install UI
npm install nativewind tailwindcss react-native-reanimated react-native-gesture-handler react-native-safe-area-context

# Install audio
npm install react-native-track-player

# Install storage
npm install @react-native-async-storage/async-storage react-native-mmkv
```

### Directory Structure

```
ecollabs-mobile/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx               # Root layout (providers)
│   ├── index.tsx                 # Landing / auth redirect
│   ├── (auth)/                   # Auth group
│   │   ├── _layout.tsx
│   │   ├── sign-in.tsx
│   │   └── sign-up.tsx
│   ├── (tabs)/                   # Main tab navigator
│   │   ├── _layout.tsx           # Tab bar config
│   │   ├── dashboard.tsx
│   │   ├── projects.tsx
│   │   ├── create.tsx
│   │   ├── my-projects.tsx
│   │   └── profile.tsx
│   ├── project/
│   │   ├── [id]/
│   │   │   ├── index.tsx         # Project detail
│   │   │   ├── upload.tsx        # Upload files
│   │   │   ├── chat.tsx          # Project chat
│   │   │   ├── lyrics.tsx        # Lyrics editor
│   │   │   ├── files.tsx         # File browser
│   │   │   ├── settings.tsx      # Project settings
│   │   │   └── ai.tsx            # AI tools panel
│   │   └── _layout.tsx
│   └── modals/
│       ├── audio-player.tsx      # Full-screen player
│       ├── notifications.tsx     # Notifications panel
│       ├── ai-generator.tsx      # AI beat generator modal
│       └── search.tsx            # Global search
├── components/
│   ├── ui/                       # Shared UI primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Avatar.tsx
│   │   ├── BottomSheet.tsx
│   │   ├── Skeleton.tsx
│   │   ├── Toast.tsx
│   │   └── GlassmorphicView.tsx
│   ├── audio/
│   │   ├── MiniPlayer.tsx        # Persistent bottom player
│   │   ├── FullPlayer.tsx        # Full-screen player
│   │   ├── WaveformView.tsx      # Audio waveform
│   │   ├── TrackList.tsx         # Multi-track list
│   │   └── RecordButton.tsx      # Audio recording
│   ├── ai/
│   │   ├── AIBeatGenerator.tsx
│   │   ├── AILyricAssistant.tsx
│   │   ├── AIMixFeedback.tsx
│   │   ├── AIQuotaDisplay.tsx
│   │   ├── AIErrorDisplay.tsx
│   │   └── AIGenerationLoader.tsx
│   ├── project/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectHeader.tsx
│   │   ├── FileUploadCard.tsx
│   │   ├── CollaboratorList.tsx
│   │   ├── LyricsEditor.tsx
│   │   └── CreditsList.tsx
│   └── shared/
│       ├── OnboardingChecklist.tsx
│       ├── ActivityFeed.tsx
│       ├── NotificationItem.tsx
│       └── SearchBar.tsx
├── providers/
│   ├── ConvexClerkProvider.tsx    # Convex + Clerk wrapper
│   ├── AudioProvider.tsx          # Audio playback context
│   └── NotificationProvider.tsx   # Push notification handler
├── hooks/
│   ├── useAudio.ts
│   ├── useProject.ts
│   ├── useNotifications.ts
│   ├── useAIQuota.ts
│   └── useBiometricAuth.ts
├── lib/
│   ├── convex.ts                 # Convex client config
│   ├── clerk.ts                  # Clerk config
│   ├── audio-utils.ts
│   ├── ai-error-utils.ts
│   └── constants.ts
├── convex/                       # Symlink or copy from web app
│   └── _generated/
├── types/
│   └── index.ts                  # Shared types (from web app)
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
├── tailwind.config.js            # NativeWind config
└── tsconfig.json
```

### Convex Integration

The mobile app uses the **same Convex deployment** as the web app. Share the `convex/` directory:

```typescript
// lib/convex.ts
import { ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(
  process.env.EXPO_PUBLIC_CONVEX_URL!
);

export default convex;
```

The `convex/_generated/` files must be kept in sync. Options:
1. **Symlink**: `ln -s ../collabart_app/convex ./convex` (dev only)
2. **Git submodule**: Share `convex/` as a submodule
3. **Monorepo**: Use Turborepo/Nx with shared `packages/convex` workspace
4. **Copy script**: `cp -r ../collabart_app/convex/_generated ./convex/_generated` in CI

**Recommended**: Monorepo with shared workspace for `convex/` and `types/`.

---

## 4. Authentication (Clerk)

### Provider Setup

```typescript
// providers/ConvexClerkProvider.tsx
import { ClerkProvider, useAuth } from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import * as SecureStore from "expo-secure-store";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  async clearToken(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};

export default function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

### Auth Screens
- **Sign In**: Email/password + OAuth (Google, Apple) + biometric unlock for returning users
- **Sign Up**: Email/password + OAuth + onboarding flow
- **Biometric**: Optional Face ID / fingerprint for quick re-auth after first login
- **Auth Redirect**: Same logic as web — redirect signed-in users away from auth screens

### OAuth Configuration
- Register OAuth redirect URIs in Clerk dashboard for `exp://` and custom scheme `ecollabs://`
- Apple Sign In: requires Apple Developer membership + associated domains
- Google Sign In: configure in Google Cloud Console with iOS/Android client IDs

### Session Management
- Clerk handles session tokens automatically via `expo-secure-store`
- Token refresh is automatic
- Convex auth uses the same `ctx.auth.getUserIdentity()` — no backend changes needed

---

## 5. Backend Integration (Convex)

### Shared Backend — No Duplication

The mobile app calls the **exact same Convex functions** as the web app:

| Web Pattern | Mobile Equivalent |
|------------|-------------------|
| `useQuery(api.projects.getTrendingProjects)` | Same — `useQuery(api.projects.getTrendingProjects)` |
| `useMutation(api.projects.createProject)` | Same — `useMutation(api.projects.createProject)` |
| `useAction(api.ai.generateCreativeBrief)` | Same — `useAction(api.ai.generateCreativeBrief)` |

### Convex Functions Used (Complete List)

**Projects** (`convex/projects.ts`):
- `getProjectById`, `getTrendingProjects`, `getProjectsByAuthorId`
- `createProject`, `updateProject`, `deleteProject`
- `addComment`, `getProjectComments`
- `getProjectFile`, `createProjectFile`, `deleteProjectFile`
- `updateProjectGenres`, `updateProjectMoods`, `updateProjectTalents`
- `updateProjectLyrics`, `listProjectForSale`, `transferOwnership`

**Users** (`convex/users.ts`):
- `getUserByClerkId`, `getUserById`, `updateUser`, `getAllUsers`

**Collaborations** (`convex/collaborations.ts`):
- `updateAuditionSettings`, `sendProjectInvite`
- `getProjectInvites`, `updateInviteStatus`

**Lyrics** (`convex/lyrics.ts`):
- `submitLyrics`, `getLyricSubmissions`, `reviewLyricSubmission`

**Notifications** (`convex/notifications.ts`):
- `getUserNotifications`, `markAsRead`, `markAllAsRead`

**Activity Log** (`convex/activityLog.ts`):
- `getProjectActivity`, `logActivity`

**Messages/Chat** (`convex/messages.ts`):
- `getProjectMessages`, `sendMessage`, `editMessage`

**Credits** (`convex/credits.ts`):
- `getProjectCredits`, `addCredit`, `updateCredit`

**Likes** (`convex/likes.ts`):
- `toggleLike`, `getUserLikeStatus`

**AI** (`convex/ai.ts`):
- `generateCreativeBrief`, `assistLyricWriting`, `suggestAudioTags`
- `semanticProjectSearch`, `generateCollaboratorRecommendations`
- `generateMixFeedback`, `translateFeedback`, `suggestCreditSplits`
- `separateStems`, `checkStemStatus`, `suggestComplementaryStem`
- `suggestMasteringChain`, `analyzeDesign`, `generateSocialMockups`

**ElevenLabs** (`convex/elevenlabsActions.ts`):
- `generateTrack`, `generateStemAudio`, `previewLyricsAsSong`
- `generateMoodReference`, `saveGenerationAsFile`

**Rate Limiting** (`convex/elevenlabs.ts`):
- `checkRateLimit`, `recordGeneration`

**File Upload** (`convex/file.ts`):
- `generateUploadUrl`

**Visual Submissions** (`convex/visualSubmissions.ts`):
- `submitVisual`, `getProjectVisuals`, `reviewVisualSubmission`

### Real-Time Subscriptions

Convex queries are **reactive by default**. The mobile app gets real-time updates automatically:
- New messages appear instantly in project chat
- Notification count updates live
- Project file list updates when collaborators upload
- Activity feed updates in real-time

---

## 6. Navigation Architecture

### Tab Navigator (Main App)

```
(tabs)/
├── Dashboard      — Home feed, trending, activity
├── Projects       — Browse all public/member projects
├── Create (+)     — Create new project (center FAB)
├── My Projects    — User's own projects
└── Profile        — User profile, settings, balance
```

### Stack Screens (Per Tab)

```
Dashboard → Project Detail → Upload / Chat / Lyrics / AI Tools
Projects  → Project Detail → Purchase Flow
My Projects → Project Detail → Settings / Manage Collaborators
Profile → Edit Profile → Onboarding
```

### Modal Screens

```
Audio Player (full-screen)
Notifications Panel
AI Beat Generator
Search (semantic + filtered)
Image Viewer (cover art, visual submissions)
```

### Deep Linking

Configure for `ecollabs://` custom scheme:
- `ecollabs://project/{id}` — Open project detail
- `ecollabs://dashboard` — Open dashboard
- `ecollabs://invite/{inviteId}` — Open invite acceptance
- `ecollabs://notifications` — Open notifications

Universal links for web-to-app handoff:
- `https://ecollabs.com/project/{id}` → app if installed

---

## 7. Screen-by-Screen Specification

### 7.1 Dashboard (`(tabs)/dashboard.tsx`)
- **Header**: User avatar, notification bell (with unread count badge), AI quota display
- **Onboarding checklist**: Same as web — profile, first project, first upload
- **Trending projects carousel**: Horizontal scroll of trending project cards
- **Recent activity feed**: Real-time activity from user's projects
- **Quick actions**: Create project, browse projects, AI beat generator
- **Pull-to-refresh**: Reload trending + activity

### 7.2 Projects Browser (`(tabs)/projects.tsx`)
- **Search bar**: Text search + AI semantic search toggle
- **Filter chips**: Genre, mood, talent, project type (scrollable horizontal)
- **Sort options**: Trending, newest, most liked
- **Project grid/list toggle**: Card view or compact list
- **Infinite scroll**: Paginated loading
- **Pull-to-refresh**

### 7.3 Create Project (`(tabs)/create.tsx`)
- **Multi-step form** (bottom-sheet wizard or paged scroll):
  1. **Basics**: Title, type, description, brief
  2. **Audio settings**: Bit depth, sample rate, audition privacy
  3. **Tags**: Genres (multi-select), moods (multi-select), talents needed (multi-select)
  4. **AI Brief Assistant**: Optional — describe idea in natural language, AI fills fields
  5. **Mood Reference Track**: Optional — generate AI mood reference with ElevenLabs
  6. **Initial file upload**: Optional — upload first stem/track
  7. **Review & create**
- **AI Brief Assistant integration**: Same as web `AIBriefAssistant` component
- **AI Mood Reference**: Same as web `AIMoodReferenceTrack` component

### 7.4 Project Detail (`project/[id]/index.tsx`)
- **Header**: Cover art (or gradient placeholder), title, author, status badge
- **Tab bar** (horizontal scrollable tabs within the screen):
  - **Overview**: Description, brief, genres/moods/talents badges, collaboration agreement
  - **Files**: Audio file list with inline playback, AI-generated badge, upload button
  - **Lyrics**: Lyrics viewer/editor, lyric submissions list, AI lyric assistant
  - **Chat**: Real-time project messages with file references
  - **Activity**: Activity log timeline
  - **Credits**: Collaborator credits and split percentages
  - **AI Tools**: Full AI suite panel (owner only)
- **Sticky mini player**: When playing a project file, mini player appears above tab bar
- **Actions menu** (bottom sheet): Share, bookmark, like, report, invite collaborators

### 7.5 Project Upload (`project/[id]/upload.tsx`)
- **File picker**: Audio files from device (expo-document-picker)
- **Recording**: In-app audio recording (expo-av)
- **Upload form**: Title, label, explicit lyrics toggle, loops toggle, copyright confirm
- **AI tag suggestions**: After file selection, AI suggests metadata
- **AI beat generator**: Generate AI audio instead of uploading
- **Progress indicator**: Upload progress bar
- **Multi-file upload**: Queue multiple files

### 7.6 Project Chat (`project/[id]/chat.tsx`)
- **Message list**: Scrollable, newest at bottom, auto-scroll on new messages
- **Message types**: Text, system messages, file references (tappable to play)
- **Input bar**: Text input + attachment button (reference a project file)
- **Typing indicators**: Optional
- **Message editing**: Long-press to edit own messages

### 7.7 AI Tools Panel (`project/[id]/ai.tsx`)
- **Sections** (collapsible accordion):
  - Beat Generator (ElevenLabs)
  - Lyric Assistant
  - Audio Tag Suggestions
  - Collaborator Recommendations
  - Mix Feedback
  - Feedback Translator
  - Credit Split Suggestions
  - Stem Separation
  - Complementary Stem Suggestions
  - Mastering Chain Builder
  - Design Critique (for cover art)
  - Social Mockup Generator
- **AI Quota Display**: Always visible at top
- **Rate limit handling**: Graceful error display when limits hit

### 7.8 My Projects (`(tabs)/my-projects.tsx`)
- **Tabs**: All / Active / Draft / Completed / Listed for Sale
- **Project cards**: With status badges, collaborator count, file count
- **Swipe actions**: Archive, delete (with confirmation)
- **Empty state**: Prompt to create first project

### 7.9 Profile (`(tabs)/profile.tsx`)
- **Profile header**: Avatar, name, bio, genres, talents
- **Stats**: Projects count, collaborations, credits earned
- **Visual portfolio**: Image grid (for visual artists)
- **Edit profile**: Bottom sheet with form fields
- **Settings section**: Notifications, biometric auth, theme, sign out
- **Balance**: Crypto wallet balance and transaction history

### 7.10 Notifications (`modals/notifications.tsx`)
- **Grouped by date**: Today, yesterday, this week, older
- **Notification types**: Invites, comments, lyric submissions, file uploads, system
- **Swipe to dismiss / mark read**
- **Tap to navigate**: Deep link to relevant screen
- **Mark all as read**: Header action

### 7.11 Search (`modals/search.tsx`)
- **Text search**: Standard project search
- **AI semantic search**: Toggle to use `semanticProjectSearch` action
- **Recent searches**: Persisted locally
- **Filter bottom sheet**: Genres, moods, talents, project type
- **Results**: Project cards with highlights

---

## 8. Audio System

### Playback Architecture

Use `react-native-track-player` for robust background audio:

```typescript
// Audio service setup (app/_layout.tsx)
import TrackPlayer, { Capability } from "react-native-track-player";

TrackPlayer.setupPlayer();
TrackPlayer.updateOptions({
  capabilities: [
    Capability.Play,
    Capability.Pause,
    Capability.SkipToNext,
    Capability.SkipToPrevious,
    Capability.SeekTo,
    Capability.Stop,
  ],
  compactCapabilities: [Capability.Play, Capability.Pause],
  // Lock screen / notification controls
});
```

### Audio Context (matches web)

```typescript
interface AudioContextType {
  audio: AudioProps | undefined;
  setAudio: (audio: AudioProps | undefined) => void;
  resetAudio: () => void;
  isPlaying: boolean;
  position: number;
  duration: number;
  seekTo: (seconds: number) => void;
  togglePlayback: () => void;
}
```

### Mini Player
- Persistent at bottom of screen (above tab bar)
- Shows: track title, author, play/pause, progress bar
- Tap to expand to full-screen player
- Swipe down to dismiss

### Full-Screen Player
- Cover art / waveform visualization
- Scrubber with time display
- Play/pause, skip forward/back 15s
- Speed control (0.5x, 1x, 1.5x, 2x)
- Share button
- Queue management (for multi-track playback)

### Audio Recording
- Use `expo-av` for in-app recording
- Recording quality presets matching project settings (sample rate, bit depth)
- Waveform visualization during recording
- Review before uploading
- Auto-save to prevent data loss

### Waveform Rendering
- Use a custom canvas-based or SVG-based waveform component
- Generate waveform data client-side from audio buffer
- Support tap-to-seek on waveform
- File annotations: timestamp markers from `fileAnnotations` table

---

## 9. AI Features

All AI features call the same Convex actions as the web app. The mobile implementation focuses on adapted UI for touch interactions.

### AI Tier 1: Creative Studio
| Feature | Convex Action | Mobile UX Notes |
|---------|---------------|-----------------|
| Beat Generator | `elevenlabsActions.generateTrack` | Full-screen modal with duration picker, instrumental toggle, prompt input. Play preview inline. Save-to-project flow. |
| Lyric Assistant | `ai.assistLyricWriting` | Inline in lyrics editor. Mode selector (complete/rhyme/rewrite/generate). Results appear as suggestions below current text. |
| Creative Brief AI | `ai.generateCreativeBrief` | Bottom sheet in create-project flow. Natural language input → auto-fills form fields with animation. |
| Audio Tag Suggestions | `ai.suggestAudioTags` | Inline chips after file upload. Tap to accept/reject each suggestion. |
| Semantic Search | `ai.semanticProjectSearch` | Toggle in search screen. Natural language query → structured results. |

### AI Tier 2: Collaboration Intelligence
| Feature | Convex Action | Mobile UX Notes |
|---------|---------------|-----------------|
| Collaborator Matching | `ai.generateCollaboratorRecommendations` | Card stack or list with match scores. Tap to view profile, invite button. |
| Mix Feedback | `ai.generateMixFeedback` | Expandable sections: overall assessment, per-track notes, missing elements. |
| Feedback Translator | `ai.translateFeedback` | Inline in chat or comments. Long-press feedback text → "Translate to technical" action. |
| Credit Split Suggestions | `ai.suggestCreditSplits` | Visual pie chart + editable sliders. AI-suggested values pre-filled. |

### AI Tier 3: Advanced Audio
| Feature | Convex Action | Mobile UX Notes |
|---------|---------------|-----------------|
| Stem Separation | `ai.separateStems` + `ai.checkStemStatus` | Progress indicator during processing. Results: 4 stem cards with individual playback. Save each to project. |
| Complementary Stems | `ai.suggestComplementaryStem` | Suggestion cards with priority badges (essential/recommended/optional). |
| Mastering Chain | `ai.suggestMasteringChain` | Vertical chain visualization. Each plugin as a card with settings. |
| Lyrics-to-Song | `elevenlabsActions.previewLyricsAsSong` | Inline in lyrics editor. "Preview as song" button. Duration auto-calculated. |

### AI Tier 4: Visual & Design
| Feature | Convex Action | Mobile UX Notes |
|---------|---------------|-----------------|
| Design Critique | `ai.analyzeDesign` | After cover art upload. Scored radar chart + improvement suggestions list. |
| Social Mockups | `ai.generateSocialMockups` | Platform tabs (Instagram/Twitter/Facebook). Copy specs, captions, hashtags. |

### Rate Limiting UI
- **AIQuotaDisplay component**: Always visible in AI tools panel header
- Format: `3/10 music | 25/50 AI assists`
- Color-coded: green (plenty), yellow (low), red (at limit)
- Rate limit error: Show friendly message with reset time countdown
- Same quotas as web: 10 ElevenLabs/day, 50 Gemini/day

### AI Audio Preview
- Inline audio player for generated tracks
- Play/pause, duration display
- "Save to Project" button
- "Regenerate" button
- Download to device option

---

## 10. Real-Time Features

### Convex Subscriptions (Automatic)
All `useQuery` hooks are real-time by default:
- Project messages update instantly across all connected clients
- Notification counts update live
- Project file lists refresh when collaborators upload
- Activity feed updates in real-time
- Lyric submission status changes propagate immediately

### Optimistic Updates
Apply optimistic updates for:
- Sending messages (show immediately, confirm on server response)
- Toggling likes
- Marking notifications as read

### Connection Status
- Show connection indicator when Convex WebSocket disconnects
- Queue mutations during offline periods (see Offline Support)
- Auto-reconnect with exponential backoff

---

## 11. File Upload & Storage

### Upload Flow (matches web)
1. Call `useMutation(api.file.generateUploadUrl)` to get a signed upload URL
2. `POST` the file to the URL using `expo-file-system`
3. Receive `storageId` from response
4. Pass `storageId` to the relevant mutation (e.g., `createProjectFile`)

### Mobile-Specific Considerations
- **File picker**: `expo-document-picker` for audio files from device storage
- **Image picker**: `expo-image-picker` for cover art and visual submissions
- **Camera**: `expo-camera` for capturing visual content
- **Audio recording**: `expo-av` for recording directly in-app
- **File size limits**: Show clear feedback for files exceeding limits
- **Background upload**: Use `expo-file-system` background upload for large files
- **Upload progress**: Show progress bar per file
- **Retry logic**: Auto-retry failed uploads with exponential backoff
- **Supported formats**: WAV, MP3, FLAC, AIFF, OGG (audio); PNG, JPG, SVG (images)

### Upload Code Pattern

```typescript
import * as FileSystem from "expo-file-system";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const generateUploadUrl = useMutation(api.file.generateUploadUrl);

async function uploadFile(fileUri: string, mimeType: string) {
  const uploadUrl = await generateUploadUrl();

  const response = await FileSystem.uploadAsync(uploadUrl, fileUri, {
    httpMethod: "POST",
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { "Content-Type": mimeType },
  });

  const { storageId } = JSON.parse(response.body);
  return storageId;
}
```

---

## 12. Payments (BlockRadar)

### Purchase Flow (Same as Web)
1. User taps "Buy" on a listed project
2. App calls `useAction(api.actions.createBlockradarPaymentLinkAction)` with project details
3. Open payment link in `expo-web-browser` (in-app browser)
4. User completes crypto payment on BlockRadar
5. BlockRadar webhook → `convex/http.ts` `/blockradar` endpoint → `transferOwnership` mutation
6. App receives real-time update via Convex subscription — project owner changes

### Mobile UX
- Show payment link in `WebBrowser.openBrowserAsync()` (in-app)
- Show "Payment pending..." state with polling/subscription
- Confirm ownership transfer with success animation
- Handle timeouts gracefully

---

## 13. Push Notifications

### Setup with Expo Notifications

```typescript
// providers/NotificationProvider.tsx
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

async function registerForPushNotifications() {
  if (!Device.isDevice) return null;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") return null;

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  // Store token in Convex user record for server-side push
  return token;
}
```

### Notification Types (mirror web notifications table)
| Type | Trigger | Action on Tap |
|------|---------|---------------|
| `invite_received` | New project invite | Navigate to project |
| `invite_accepted` | Collaborator accepted invite | Navigate to project |
| `comment_added` | New comment on project | Navigate to project comments |
| `file_uploaded` | Collaborator uploaded a file | Navigate to project files |
| `lyric_submitted` | Lyric submission received | Navigate to lyrics review |
| `lyric_reviewed` | Your lyrics were reviewed | Navigate to lyrics |
| `project_sold` | Your project was purchased | Navigate to balance |
| `ai_generation_complete` | AI generation finished | Navigate to AI tools |

### Notification Channels (Android)
- **Collaboration**: Invites, comments, file uploads
- **AI**: Generation completions
- **Commerce**: Sales, purchases, balance updates
- **System**: Account, platform updates

### Badge Count
- Update app badge count based on unread notifications count
- Clear badge on app open or when notifications are marked read

---

## 14. Offline Support

### Strategy: Cache-First with Sync

| Data Type | Offline Strategy |
|-----------|-----------------|
| Project list | Cache last loaded list in AsyncStorage |
| Project details | Cache viewed projects |
| Messages | Cache recent messages, queue outgoing |
| Audio files | Stream only (no offline audio cache by default) |
| AI features | Require connectivity (server-side processing) |
| Notifications | Cache last loaded set |
| User profile | Cache in MMKV |

### Implementation
- Use `@tanstack/react-query` or custom hook wrapper around Convex queries for caching
- Show stale data with "Last updated X ago" indicator
- Queue mutations (messages, likes, comments) and sync when back online
- Disable AI features with clear "Requires internet" message
- Show offline banner at top of screen

---

## 15. Design System & Theming

### Color Palette (matches web)

The web app uses CSS variables. Map to React Native:

```typescript
// lib/theme.ts
export const theme = {
  colors: {
    background: "#09090b",       // zinc-950
    foreground: "#fafafa",       // zinc-50
    card: "#18181b",             // zinc-900
    cardForeground: "#fafafa",
    primary: "#ef4444",          // red-500 (eCollabs brand)
    primaryForeground: "#fafafa",
    secondary: "#27272a",        // zinc-800
    muted: "#27272a",
    mutedForeground: "#a1a1aa",  // zinc-400
    accent: "#27272a",
    border: "#27272a",
    success: "#22c55e",
    warning: "#eab308",
    destructive: "#dc2626",
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    "2xl": 20,
  },
};
```

### Glassmorphism Effects

```typescript
// components/ui/GlassmorphicView.tsx
import { BlurView } from "expo-blur";

export function GlassmorphicView({ children, intensity = 20 }) {
  return (
    <BlurView
      intensity={intensity}
      tint="dark"
      style={{
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.06)",
        overflow: "hidden",
      }}
    >
      {children}
    </BlurView>
  );
}
```

### Typography Scale
- Heading 1: 32px bold
- Heading 2: 24px bold
- Heading 3: 20px semibold
- Body: 16px regular
- Body small: 14px regular
- Caption: 12px regular
- Label: 10px semibold uppercase tracking-wider

### Animation Patterns (Reanimated equivalents)
| Web (Framer Motion) | Mobile (Reanimated) |
|---------------------|---------------------|
| `motion.div` fade-in | `FadeIn` entering animation |
| `AnimatePresence` | `Layout` animation with `exiting` |
| Spring transitions | `withSpring()` |
| Scroll-triggered animations | `useAnimatedScrollHandler` |
| Gesture-driven | `react-native-gesture-handler` |

### Haptic Feedback
Add haptic feedback for:
- Button presses: light impact
- Successful actions (upload, save): success notification
- Errors: error notification
- Pull-to-refresh threshold: light impact
- AI generation complete: success notification

---

## 16. Performance Optimization

### List Performance
- Use `FlashList` (from `@shopify/flash-list`) instead of `FlatList` for all long lists
- Implement `estimatedItemSize` for each list
- Use `React.memo` for list item components
- Avoid inline styles in list items

### Image Optimization
- Use `expo-image` (built on SDWebImage/Glide) for all images
- Set explicit `width` and `height` for all images
- Use `contentFit="cover"` and `placeholder` for loading states
- Cache policy: disk + memory

### Bundle Size
- Use `babel-plugin-module-resolver` for tree shaking
- Lazy-load heavy screens with `React.lazy` + `Suspense`
- Split AI tools panel into individual lazy-loaded components
- Use Hermes engine (default in Expo SDK 52+)

### Memory Management
- Unload audio resources when navigating away
- Clean up Convex subscriptions in cleanup functions
- Limit cached items in AsyncStorage
- Use `InteractionManager.runAfterInteractions` for heavy computations

### Startup Performance
- Minimize work in root `_layout.tsx`
- Load fonts and assets in splash screen phase
- Defer non-critical initialization (analytics, push token)
- Target: <2s cold start, <500ms warm start

---

## 17. Security

### Token Storage
- Use `expo-secure-store` for Clerk tokens (Keychain on iOS, Keystore on Android)
- Never store tokens in AsyncStorage (unencrypted)
- Clear tokens on sign out

### API Security
- All API calls go through Convex (authenticated via Clerk JWT)
- No direct API keys stored on device
- AI API keys (Gemini, ElevenLabs, Replicate) are only in Convex server environment
- BlockRadar API key is only in Convex server environment

### Input Validation
- Validate all user inputs client-side before sending to Convex
- Use Zod schemas matching web app validation
- Sanitize file names before upload

### Certificate Pinning (Production)
- Enable SSL certificate pinning for Convex and Clerk endpoints
- Prevents MITM attacks on authenticated traffic

### Biometric Auth
- Optional biometric unlock for returning users
- Stores encrypted session token in Secure Store
- Falls back to Clerk re-authentication if biometric fails

### Code Security
- Enable Hermes bytecode (obfuscated by default)
- Do not include source maps in production builds
- Use `expo-updates` code signing for OTA updates

---

## 18. Testing Strategy

### Unit Tests
- **Framework**: Jest + React Native Testing Library
- **Scope**: Hooks, utilities, pure components
- **Key files**:
  - `hooks/useAudio.test.ts`
  - `lib/ai-error-utils.test.ts`
  - `components/ui/*.test.tsx`

### Integration Tests
- **Framework**: Detox or Maestro
- **Scope**: Navigation flows, auth flow, upload flow
- **Key flows**:
  - Sign up → onboarding → create project → upload file
  - Browse projects → view detail → play audio
  - AI beat generation → preview → save to project
  - Send message in project chat

### E2E Tests
- **Framework**: Maestro (YAML-based, no flaky selectors)
- **Scope**: Critical user journeys
- **Key journeys**:
  - Full project creation with AI brief assistant
  - Collaboration invite flow
  - Project purchase flow (mocked BlockRadar)

### Snapshot Tests
- Visual regression for key screens
- Use `react-native-testing-library` + snapshots

---

## 19. CI/CD & Deployment

### EAS Configuration

```json
// eas.json
{
  "cli": { "version": ">= 12.0.0" },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": { "simulator": true },
      "env": {
        "EXPO_PUBLIC_CONVEX_URL": "https://your-dev.convex.cloud",
        "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY": "pk_test_..."
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_CONVEX_URL": "https://your-staging.convex.cloud",
        "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY": "pk_test_..."
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_CONVEX_URL": "https://your-prod.convex.cloud",
        "EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY": "pk_live_..."
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### CI Pipeline (GitHub Actions)

```yaml
# .github/workflows/mobile-ci.yml
name: Mobile CI
on:
  push:
    branches: [mobile-app]
  pull_request:
    branches: [master]

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npx tsc --noEmit
      - run: npx eslint . --ext .ts,.tsx

  test:
    runs-on: ubuntu-latest
    needs: lint-and-type-check
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm test

  build-preview:
    runs-on: ubuntu-latest
    needs: test
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with: { eas-version: latest, token: ${{ secrets.EXPO_TOKEN }} }
      - run: npm ci
      - run: eas build --platform all --profile preview --non-interactive

  build-production:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/mobile-app' && github.event_name == 'push'
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with: { eas-version: latest, token: ${{ secrets.EXPO_TOKEN }} }
      - run: npm ci
      - run: eas build --platform all --profile production --non-interactive
```

### Deployment Flow
1. **Development**: `eas build --profile development` → install on physical device
2. **Preview**: `eas build --profile preview` → internal TestFlight / Play Store internal track
3. **OTA Update**: `eas update --branch production` → instant update without store review
4. **Production**: `eas build --profile production` → `eas submit` to App Store / Play Store

### Store Submission Checklist
- [ ] App icons (all required sizes, generated from eCollabs logo)
- [ ] Splash screen (eCollabs branding, dark background)
- [ ] Screenshots (6.7" iPhone, 6.5" iPhone, iPad, Android phone, Android tablet)
- [ ] App Store description and keywords
- [ ] Privacy policy URL
- [ ] Terms of service URL
- [ ] Content rating questionnaire
- [ ] Export compliance (no encryption beyond HTTPS)
- [ ] Apple: App Review notes (test account credentials)
- [ ] Android: Target API level compliance
- [ ] Android: Data safety section

---

## 20. Environment Variables

### Expo Public (compiled into client bundle)
```bash
EXPO_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

### EAS Secrets (build-time only)
```bash
EXPO_TOKEN=...                    # EAS authentication
SENTRY_AUTH_TOKEN=...             # Error tracking (optional)
```

### Convex Dashboard (server-side, shared with web)
```bash
CLERK_WEBHOOK_SECRET=...          # Clerk webhook verification
BLOCKRADAR_API_KEY=...            # Payment link generation
GEMINI_API_KEY=...                # Google Gemini AI
ELEVENLABS_API_KEY=...            # ElevenLabs music generation
REPLICATE_API_TOKEN=...           # Stem separation (optional)
```

> Note: AI API keys and payment keys live ONLY on the Convex server. The mobile app never touches them directly.

---

## 21. Git Branching Strategy

### Branch Structure
```
master                    ← Production web app (current)
├── mobile-app            ← Mobile app development branch
│   ├── mobile/feature/*  ← Feature branches off mobile-app
│   ├── mobile/fix/*      ← Bug fix branches
│   └── mobile/release/*  ← Release prep branches
```

### Worktree Setup
```bash
# Create mobile-app branch and worktree
git branch mobile-app
git worktree add ../ecollabs-mobile mobile-app

# Work in the mobile worktree
cd ../ecollabs-mobile

# Merge web changes into mobile periodically
git fetch origin
git merge origin/master --no-edit
```

### Merge Strategy
1. Develop mobile app on `mobile-app` branch in a separate worktree
2. Shared code (`convex/`, `types/`) changes on `master` are merged into `mobile-app`
3. Mobile-only code lives in `ecollabs-mobile/` directory (not in web app paths)
4. Before merging `mobile-app` → `master`:
   - Run full web test suite (`npm run build`, `npx tsc --noEmit`)
   - Run full mobile test suite
   - Security audit
   - Performance benchmarks
   - Code review

### Shared Code Management
Files shared between web and mobile:
- `convex/` — All Convex functions, schema, generated types
- `types/index.ts` — Shared TypeScript interfaces
- `lib/ai-error-utils.ts` — AI error classification (pure logic, no UI)

Consider extracting shared code to a `packages/shared` workspace in a monorepo structure for cleaner dependency management.

---

## 22. Migration Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Initialize Expo project with Expo Router
- [ ] Set up NativeWind / Tailwind for React Native
- [ ] Configure Clerk authentication (sign-in, sign-up, OAuth)
- [ ] Configure Convex client and provider
- [ ] Implement token caching with expo-secure-store
- [ ] Create root layout with providers
- [ ] Set up tab navigator with placeholder screens
- [ ] Implement deep linking configuration
- [ ] Set up EAS Build profiles (dev, preview, production)

### Phase 2: Core Screens (Week 3-4)
- [ ] Dashboard screen (trending, activity, quick actions)
- [ ] Projects browser with search and filters
- [ ] Project detail screen with tabbed content
- [ ] Create project multi-step form
- [ ] My projects list with status filters
- [ ] Profile screen with edit capability
- [ ] Notifications panel

### Phase 3: Audio System (Week 5)
- [ ] Set up react-native-track-player
- [ ] Mini player component (persistent bottom bar)
- [ ] Full-screen player modal
- [ ] Audio recording with expo-av
- [ ] Waveform visualization
- [ ] Multi-track playback (ProjectPlayer equivalent)

### Phase 4: File Management (Week 5-6)
- [ ] File upload with expo-document-picker
- [ ] Image upload with expo-image-picker
- [ ] Upload progress indicators
- [ ] Background upload support
- [ ] File list with inline playback

### Phase 5: Collaboration Features (Week 6-7)
- [ ] Project chat (real-time messages)
- [ ] Lyrics editor and submission flow
- [ ] Collaboration invites (send, accept, reject)
- [ ] Activity feed
- [ ] Credits management
- [ ] Visual submissions

### Phase 6: AI Features (Week 7-8)
- [ ] AI Beat Generator (ElevenLabs)
- [ ] AI Lyric Assistant
- [ ] AI Creative Brief
- [ ] AI Audio Tag Suggestions
- [ ] AI Collaborator Matching
- [ ] AI Mix Feedback
- [ ] AI Feedback Translator
- [ ] AI Credit Split Suggestions
- [ ] Stem Separation
- [ ] Mastering Chain Builder
- [ ] Design Critique
- [ ] Social Mockup Generator
- [ ] Rate limiting UI (AIQuotaDisplay)

### Phase 7: Payments & Commerce (Week 8-9)
- [ ] Project listing for sale
- [ ] Purchase flow with BlockRadar
- [ ] Balance and transaction history
- [ ] Ownership transfer confirmation

### Phase 8: Push Notifications (Week 9)
- [ ] Expo Notifications setup
- [ ] Push token registration in Convex
- [ ] Server-side push sending (Convex action)
- [ ] Notification channels (Android)
- [ ] Badge count management
- [ ] Notification tap → deep link navigation

### Phase 9: Polish & Optimization (Week 10-11)
- [ ] Offline support (caching, mutation queuing)
- [ ] Loading skeletons for all screens
- [ ] Empty states for all lists
- [ ] Error boundaries
- [ ] Haptic feedback
- [ ] Animations (entering, exiting, layout)
- [ ] Pull-to-refresh on all data screens
- [ ] Performance profiling (FlashList, memo, lazy loading)
- [ ] Biometric authentication
- [ ] Accessibility (screen reader labels, contrast ratios, touch targets)

### Phase 10: Testing & Launch (Week 11-12)
- [ ] Unit tests for hooks and utilities
- [ ] Integration tests for critical flows
- [ ] E2E tests with Maestro
- [ ] Security audit (token storage, API surface, certificate pinning)
- [ ] Performance benchmarks (<2s cold start, 60fps scrolling)
- [ ] App Store assets (icons, screenshots, descriptions)
- [ ] Privacy policy and terms of service
- [ ] TestFlight / internal track beta
- [ ] Beta tester feedback round
- [ ] Production build and store submission

---

## Appendix A: Convex Schema Reference

The complete database schema (shared with web) includes these tables:

| Table | Purpose | Key Indexes |
|-------|---------|-------------|
| `projects` | Music projects | `search_author`, `search_title`, `search_body` |
| `users` | User profiles | `by_clerk_id` |
| `projectFile` | Audio/visual files per project | `by_project`, `by_project_and_version` |
| `comments` | Project comments | `by_project` |
| `savedProjects` | Bookmarked projects | — |
| `lyricSubmissions` | Lyric submissions for review | `by_projectId`, `by_status`, `by_project_and_status` |
| `projectInvites` | Collaboration invites | `by_projectId`, `by_inviteeEmail`, `by_project_and_status` |
| `notifications` | User notifications | `by_user`, `by_user_and_read` |
| `activityLog` | Project activity timeline | `by_project` |
| `likes` | Project likes | `by_project`, `by_user_and_project` |
| `credits` | Collaborator credits/splits | `by_project`, `by_user` |
| `messages` | Project chat messages | `by_project`, `by_project_and_time` |
| `visualSubmissions` | Design/art submissions | `by_project`, `by_project_and_status`, `by_author` |
| `aiGenerations` | AI generation tracking & rate limits | `by_project`, `by_user` |
| `fileAnnotations` | Waveform timestamp markers | `by_file` |

## Appendix B: Type Definitions (Shared)

Key interfaces to share between web and mobile:

```typescript
// types/index.ts (shared)
interface ProjectProps { ... }        // Full project object
interface ProjectFileType { ... }     // Project file with AI fields
interface NotificationProps { ... }   // Notification object
interface ActivityLogProps { ... }    // Activity log entry
interface AudioProps { ... }          // Audio playback state
interface AudioContextType { ... }    // Audio context shape

type ProjectStatus = "draft" | "in_progress" | "mixing" | "mastering" | "complete";
type projectType = "Public" | "Member" | "Private (Premium Add-on)";
type projectSampleRate = "22.05KHz" | "44.1KHz" | "48KHz" | "88.2KHz" | "96KHz" | "176.4KHz" | "192KHz";
type projectBitDepth = "8 bits" | "16 bits" | "24 bits" | "32 bits";
```

## Appendix C: App Store Metadata

### App Name
**eCollabs - Music Collaboration**

### Subtitle (iOS) / Short Description (Android)
Create, collaborate, and produce music with AI

### Category
- Primary: Music
- Secondary: Productivity

### Keywords
music collaboration, beat maker, AI music, stem separation, songwriting, music production, audio recording, lyric writing, remix, online studio

### Age Rating
12+ (Infrequent/Mild: Mature/Suggestive Themes — user-generated music content)

---

*This document serves as the complete implementation reference for the eCollabs mobile app. All Convex backend functions, Clerk auth, and AI capabilities are already built and production-ready on the web. The mobile app's job is to provide a native-quality experience that connects to the same infrastructure.*
