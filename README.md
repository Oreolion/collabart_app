
# CollabArt — Collaborative Music & Art Projects

[![License: MIT](https://img.shields.io/github/license/Oreolion/collabart_app?style=flat-square)](./LICENSE) [![Next.js](https://img.shields.io/badge/Next-14.x-000?style=flat-square&logo=next.js)](https://nextjs.org/) [![TypeScript](https://img.shields.io/badge/TypeScript-5.x-007acc?style=flat-square&logo=typescript)](https://www.typescriptlang.org/) [![Node](https://img.shields.io/badge/Node-18.x-339933?style=flat-square&logo=node.js)](https://nodejs.org/)

CollabArt is a modern Next.js application for musicians and visual artists to collaborate on creative projects. It provides project creation, media upload/playback, user profiles, a dashboard for managing collaborations, and integrations with authentication and a serverless database.

This repository contains the frontend and backend functions (Convex) used by the app.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Demo / Screenshots](#demo--screenshots)
- [Getting Started](#getting-started)

  - [Prerequisites](#prerequisites)
  - [Install](#install)
  - [Environment variables](#environment-variables)
  - [Run locally](#run-locally)
- [Project Structure](#project-structure)
- [Key Components & Pages](#key-components--pages)
- [Convex (backend) notes](#convex-backend-notes)
- [Testing & Linting](#testing--linting)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- Create and manage creative projects (audio/video/image uploads)
- Dashboard with project management and collaborations
- User profiles and Clerk-based authentication
- Audio playback and project preview UI
- Responsive design using Tailwind CSS

## Tech Stack

- Next.js 14 (app directory)
- React 18
- Convex (serverless DB + functions)
- Clerk for authentication (`@clerk/nextjs`)
- Tailwind CSS for styling
- Embla Carousel, Framer Motion for UI interactions
- TypeScript throughout

## Demo / Screenshots

See the `public/assets` folder for any screenshots and demo media used in the repo. If you want to add a demo GIF or hosted preview, place it in `public/` and reference it here.

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn
- (Optional) Convex CLI if you want to run Convex locally

### Install

Clone the repo and install dependencies:

```bash
git clone <repo-url>
cd collabart_app
npm install
```

Or with yarn/pnpm:

```bash
yarn install
# or
pnpm install
```

### Environment variables

The app uses a few external services (Convex, Clerk, third-party uploads). Create a `.env.local` in the project root and add the variables you need. Example placeholders:

```env
# Clerk
NEXT_PUBLIC_CLERK_FRONTEND_API=your-clerk-frontend-api
CLERK_API_KEY=your-clerk-api-key

# Convex (if using hosted Convex)
NEXT_PUBLIC_CONVEX_URL=https://your-convex-app.convex.cloud

# Upload / 3rd-party services
NEXT_PUBLIC_UPLOAD_URL=...
```

Note: The project may contain provider components in `providers/` which expect certain env vars. Search the `convex/` and `providers/` folders if you need to confirm exact names.

### Run locally

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
npm run start
```

Lint the project:

```bash
npm run lint
```

## Project Structure

Top-level folders you will work with frequently:

- `app/` — Next.js app routes and layouts (app-wide styles in `globals.css`). The project uses the app router with nested routes.
- `components/` — React components used across pages (Navbar, ProjectCard, Dashboard, Player, etc.).
- `components/ui/` — Shared UI primitives and design-system components (button, input, dialog, toast, etc.).
- `convex/` — Convex functions, schema, and HTTP helpers (serverless backend code).
- `providers/` — React context/providers like `ConvexClerkProvider.tsx` and `AudioProvider.tsx`.
- `styles/` — CSS Modules for page/component-specific styling.
- `hooks/` — Custom hooks (e.g., `useDebounce`, `use-toast`).
- `lib/` — Utility functions (time formatting, helpers).
- `public/` — Static assets.
- `types/` — Shared TypeScript types.

Example important files:

- `app/page.tsx` — main landing page
- `app/(root)/create-project/` — project creation UI
- `components/Dashboard.tsx` and `components/DashboardLayout.tsx` — user dashboard and layout
- `convex/projects.ts`, `convex/users.ts` — Convex functions dealing with persistent data

## Key Components & Pages

- Navbar (`components/Navbar.tsx`) — top navigation and auth buttons
- ProjectCard (`components/ProjectCard.tsx`) — card preview used in lists
- ProjectPlayer / PlayerWrapper — audio playback components
- Dashboard (`components/Dashboard.tsx`) — user-specific project management
- AddProject / Create Project pages — forms and upload flows

Explore the `components/` folder to find small, reusable UI pieces (avatar, badge, form controls) under `components/ui/`.

## Convex (backend) notes

This project uses Convex for backend functions and storage. The `convex/` folder contains:

- `schema.ts` — Convex schema definitions
- `projects.ts`, `users.ts` — server-side functions invoked by the client

To run Convex locally, install the Convex CLI and follow Convex documentation (e.g., `convex dev`). If you're using hosted Convex, set `NEXT_PUBLIC_CONVEX_URL` accordingly.

## Testing & Linting

This repository includes linting via ESLint (see `npm run lint`). There are no automated test scripts included by default; consider adding unit tests with Jest/Testing Library or Playwright/E2E if needed.

## Deployment

Recommended hosting is Vercel since the app is a Next.js application. Basic steps:

1. Push your repository to GitHub.
2. Connect your repo in Vercel and set environment variables in the Vercel dashboard.
3. Use the default build command (`npm run build`) and the output will be a Next.js serverless app.

If you use another host, ensure you provide the environment variables and host any Convex-related endpoints as required.

## Contributing

Contributions are welcome. A suggested workflow:

1. Fork the repository and create a branch: `feature/your-feature` or `fix/issue`
2. Install dependencies and run the dev server locally.
3. Add focused commits and a clear PR description.
4. Keep changes small and add tests where applicable.

Please open issues for feature requests or bugs. If you'd like to contribute larger features, open an issue first so we can coordinate design and scope.

## License

This project is released under the MIT License. See the `LICENSE` file for details.

---

I added the following helper files to this repository to get contributors started:

- `.env.example` — Example environment variables to copy to `.env.local` and fill in before running the app.
- `CONTRIBUTING.md` — Contribution guidelines and a PR checklist.
- `CODE_OF_CONDUCT.md` — Short code of conduct (Contributor Covenant reference).

You can open those files directly in the repo to view examples and next steps. Next I can:

- Add real CI / deployment badges (Vercel, GitHub Actions) if you tell me which services you use.
- Add a small architecture diagram or a `docs/` folder with screenshots and usage examples.
- Run a quick markdown lint and a TypeScript check across the repo.

