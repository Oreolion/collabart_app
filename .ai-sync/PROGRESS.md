# eCollabs Implementation Progress

## Phase 1: Notification & Activity Log Wiring — COMPLETE
- [x] `convex/collaborations.ts` — sendProjectInvite → notify invitee + log
- [x] `convex/collaborations.ts` — respondToInvite → notify owner + log
- [x] `convex/collaborations.ts` — removeCollaborator → notify removed user + log
- [x] `convex/projects.ts` — addProjectComment → notify owner + log
- [x] `convex/projects.ts` — addProjectFile → notify owner (if collaborator) + log
- [x] `convex/projects.ts` — listProjectForSale → log
- [x] `convex/projects.ts` — updateProjectStatus → log
- [x] `convex/projects.ts` — transferOwnership → notify both + log
- [x] `convex/lyrics.ts` — submitLyrics → notify owner + log
- [x] `convex/lyrics.ts` — approveSubmission → notify author + log
- [x] `convex/lyrics.ts` — rejectSubmission → notify author + log
- [x] `convex/lyrics.ts` — setProjectLyrics → log
- [x] `convex/likes.ts` — toggleLike → notify owner on like + log

## Phase 2: Lyric Feedback + File Versioning — COMPLETE
- [x] Schema: `feedback` on lyricSubmissions
- [x] Schema: `version`, `parentFileId`, `isArchived`, `fileType` on projectFile
- [x] Schema: `by_project_and_version` index
- [x] `approveSubmission` + `rejectSubmission` accept optional feedback arg
- [x] `addProjectFile` auto-assigns version number
- [x] `getProjectFile` filters out archived files
- [x] New `deleteProjectFile` mutation (soft-delete)
- [x] New `getFileVersionHistory` query
- [x] `LyricsSubmissionCard.tsx` — feedback textarea + display

## Phase 3: Project Messaging / Chat — COMPLETE
- [x] Schema: `messages` table with indexes
- [x] `convex/messages.ts` — sendMessage, getProjectMessages, editMessage, deleteMessage
- [x] `verifyChatAccess` helper (owner or accepted invite)
- [x] `components/ChatMessage.tsx` — message bubble with avatar, edit/delete
- [x] `components/ProjectChat.tsx` — chat panel with auto-scroll, input

## Phase 4: Multi-Track Audio Player — COMPLETE
- [x] `components/WaveformTrack.tsx` — wavesurfer.js dynamic import, controls
- [x] `components/MultiTrackPlayer.tsx` — global transport, master volume

## Phase 5: Visual Artists Ecosystem — COMPLETE
- [x] Schema: `coverArtUrl`, `coverArtStorageId` on projects
- [x] Schema: `visualPortfolio` on users
- [x] Schema: image fields on projectFile
- [x] Schema: `visualSubmissions` table with indexes
- [x] `convex/visuals.ts` — full CRUD + approval workflow
- [x] `components/VisualAssetGallery.tsx` — grid with lightbox
- [x] `components/VisualSubmissionCard.tsx` — review card
- [x] `components/VisualUploadDialog.tsx` — upload dialog
- [x] `components/VisualPortfolio.tsx` — portfolio grid
- [x] `components/CoverArtSelector.tsx` — cover art selector
- [x] Project detail page — Visual Assets card integration

## Phase 6: Search & Filter Overhaul — COMPLETE
- [x] `components/SearchFilters.tsx` — dropdown filters
- [x] `ProjectsClient.tsx` — dropdown filter state + sort logic

## Phase 7: Credits & Attribution — COMPLETE
- [x] Schema: `credits` table with indexes
- [x] `convex/credits.ts` — addCredit, updateCredit, removeCredit, getProjectCredits, confirmCredit, getMyCredits
- [x] `components/CreditsManager.tsx` — owner panel with pie chart
- [x] `components/CreditsList.tsx` — public display
- [x] Project detail page — Credits integration

## Phase 8: AI Tier 1 — Quick AI Wins — COMPLETE
- [x] Install `@google/generative-ai` dependency (Gemini instead of OpenAI)
- [x] Create `convex/ai.ts` with `"use node"` actions
- [x] `generateCreativeBrief` action — natural language → structured brief JSON
- [x] `suggestAudioTags` action — file context → BPM, key, instrument, tag suggestions
- [x] `assistLyricWriting` action — 4 modes: complete, rhyme, rewrite, generate
- [x] `semanticProjectSearch` action — natural language → structured filters
- [x] `components/AIBriefAssistant.tsx` — dialog with generate + apply to form
- [x] `components/AILyricAssistant.tsx` — tabbed panel with 4 modes + insert
- [x] `components/AITagSuggestions.tsx` — post-upload tag display
- [x] Integrated: AIBriefAssistant → AddProject (next to brief field)
- [x] Integrated: AILyricAssistant → project detail lyrics dialog
- [x] Integrated: AITagSuggestions → upload page (after file selected)
- [x] Verification: tsc clean + build clean

## Phase 9: AI Tier 2 — Collaboration Intelligence — COMPLETE
- [x] `generateCollaboratorRecommendations` action — project needs ↔ user profile matching via Gemini
- [x] `generateMixFeedback` action — genre-aware mixing suggestions per track
- [x] `translateFeedback` action — vague feedback → actionable technical notes
- [x] `suggestCreditSplits` action — activity log analysis → fair split percentages
- [x] `convex/users.ts` — added `getAllUsers` query for recommendation matching
- [x] `components/CollaboratorRecommendations.tsx` — match scores, talents, one-click invite
- [x] `components/AIMixFeedback.tsx` — per-track suggestions, mix tips, missing elements
- [x] `components/FeedbackTranslator.tsx` — "Translate" button on chat messages
- [x] `components/AICreditSuggestions.tsx` — "AI Suggest Splits" in CreditsManager
- [x] Integrated: CollaboratorRecommendations → project detail Collaborators card (owner)
- [x] Integrated: AIMixFeedback → below MultiTrackPlayer
- [x] Integrated: FeedbackTranslator → ChatMessage component (all non-system messages)
- [x] Integrated: AICreditSuggestions → CreditsManager below credits list
- [x] Skipped embedding tables — Gemini text analysis achieves same goal without vector DB overhead
- [x] Verification: tsc clean + build clean

## Phase 10: AI Tier 3 — Advanced Audio AI — COMPLETE
- [x] Schema: `fileAnnotations` table with `by_file` index
- [x] `convex/annotations.ts` — getFileAnnotations, addAnnotation, deleteAnnotation
- [x] `separateStems` action — Replicate/Demucs API (needs REPLICATE_API_TOKEN)
- [x] `checkStemStatus` action — poll Replicate prediction status
- [x] `suggestComplementaryStem` action — AI arrangement analysis, missing parts
- [x] `suggestMasteringChain` action — genre-aware mastering chain + settings
- [x] `components/StemSeparator.tsx` — start separation, poll status, download stems
- [x] `components/AIGenerateStem.tsx` — suggests missing instruments with priority
- [x] `components/WaveformAnnotation.tsx` — timestamped color-coded annotations per file
- [x] `components/MasteringPreview.tsx` — mastering chain, LUFS target, tips, reference track
- [x] Integrated: StemSeparator + WaveformAnnotation → per-file in Project Files
- [x] Integrated: AIGenerateStem + MasteringPreview → below MultiTrackPlayer
- [x] Verification: tsc clean + build clean

## Phase 11: AI Tier 4 — Visual AI — COMPLETE
- [x] `analyzeDesign` action — composition, color theory, typography, genre fit scoring
- [x] `generateSocialMockups` action — 4-platform mockup specs with captions, hashtags, layout
- [x] `components/AIDesignFeedback.tsx` — score bars, expandable critique per category, strengths, technical notes
- [x] `components/SocialMockupGenerator.tsx` — platform cards with copy-to-clipboard captions, color palette, font suggestions
- [x] Integrated: AIDesignFeedback → per visual submission in Pending Visual Submissions (owner)
- [x] Integrated: SocialMockupGenerator → Visual Assets card (owner)
- [x] Skipped `AICoverArtGenerator` — users choose their own art path (hire designers, upload own, or use AI elsewhere)
- [x] Verification: tsc clean + build clean

## Phase 12: README & Documentation — COMPLETE
- [x] Full `README.md` rewrite (comprehensive eCollabs docs — tech stack, features, architecture, schema, design system, deployment)
- [x] Type errors fixed across project (http.ts, CoverArtSelector, project page, projects.ts, profile pages)
- [ ] Update `CLAUDE.md` with all new tables/functions/components (optional — README covers this)

---

# NEW PLAN: human-first-elevenlabs-marketplace.md (supersedes AI Tier rollout)

## Phase 8 (new): Foundation — stage + origin + provenance — COMPLETE
- [x] Schema: `stage`, `origin`, `reviewState`, `provenance` added to `projectFile` with new indexes
- [x] Schema: `elevenlabsMarketplace` added to `projects`
- [x] Schema: `distributionTargets`, `royaltyLedger`, `creditOverrides` tables added
- [x] `convex/migrations.ts` — `backfillOriginAndStage` mutation (admin-gated, dry-run capable)
- [x] `components/OriginBadge.tsx` — canonical badge + `originFromLegacy` helper
- [x] `components/AiVisibilityPills.tsx` — Human only / + AI-assisted / + AI-generated toggle
- [x] `lib/projectOrigin.ts` — `projectAggregateOrigin`, `passesAiVisibility` helpers
- [x] `components/WaveformTrack.tsx` — replaced ad-hoc AI badge with OriginBadge
- [x] `components/ProjectsClient.tsx` + `components/MyProjectsClient.tsx` — AI visibility filter (default Human only)
- [x] `npx tsc --noEmit` clean
- [x] `npm run build` clean

## Phase 9 (new): AI Lab surface — COMPLETE
- [x] `app/(root)/ai-lab/page.tsx` — global AI Lab landing page with project list + draft counts
- [x] `app/(root)/project/[projectId]/ai-lab/page.tsx` — project-specific AI Lab with all AI tools
- [x] Navigation: AI Lab added to `DashboardNav.tsx` + `MobileDashBoardNav.tsx` with violet active state
- [x] `middleware.ts` — `/ai-lab` added to dashboard route matcher
- [x] Project detail page cleaned: removed `AIMixFeedback`, `AIGenerateStem`, `MasteringPreview`, `StemSeparator`, `AIDesignFeedback`, `SocialMockupGenerator`, `CollaboratorRecommendations`, `AILyricAssistant`
- [x] `PromoteToPipelineDialog.tsx` — already existed; wired into project AI Lab draft list
- [x] `convex/projects.ts` — `promoteAiFileToPipeline` + `getAiLabDrafts` already existed from prior session
- [x] AI save paths already set `origin="ai_generated"`, `reviewState="draft"`, `provenance` from Phase 8
- [x] `npx tsc --noEmit` clean
- [x] `npm run build` clean
## Phase 10 (new): Studio Pipeline board — COMPLETE
- [x] `convex/projects.ts` — `handoffFileStage` mutation with auth guard, stage validation, activity logging
- [x] `components/StudioPipelineBoard.tsx` — kanban-style board with 9 stage columns (Beat → Topline → Lyrics → Vocal Take → Edit → Mix → Master → Artwork → Reference)
- [x] Pipeline filters: only shows files where `origin="human"` OR `reviewState="in_pipeline"` (hides raw AI drafts by default)
- [x] Stage filter pills showing file count per stage
- [x] Per-card: title, version badge, origin badge, contributor, waveform annotations, "Hand off to next stage" button
- [x] `computePipelineProgress` — derives % from 8 core stages (excludes reference)
- [x] Project page: replaced flat Project Files list with Studio Pipeline Board
- [x] MultiTrackPlayer now filters to pipeline-visible audio only
- [x] `npx tsc --noEmit` clean
- [x] `npm run build` clean
## Phase 11 (new): ElevenLabs Tier B (SFX, Composition Plan) — COMPLETE
- [x] `convex/elevenlabsSfxActions.ts` — `generateSoundEffect` action calling `POST /v1/sound-generation` (`eleven_text_to_sound_v2`)
- [x] `convex/elevenlabsActions.ts` — `generateCompositionPlan` action for >60s structured arrangements with plan JSON persisted in metadata
- [x] Rate-limit bucket split: `music: 8/day`, `sfx: 20/day`, `gemini: 50/day` in `convex/elevenlabs.ts`
- [x] `components/SfxPanel.tsx` — prompt, duration slider, prompt-influence slider, preview, save
- [x] `components/CompositionPlanPanel.tsx` — brief input, target-duration slider, plan JSON display, preview, save
- [x] Both panels added to project AI Lab page under Audio Generation card
- [x] `lib/elevenlabs-types.ts` — added `sfx` and `composition_plan` to `GenerationType`
- [x] `components/AIQuotaDisplay.tsx` — updated to show 3 buckets (Music / SFX / AI assists)
- [x] `saveGenerationAsFile` stage mapping updated for `sfx` → `edit`, `composition_plan` → `beat`
- [x] `npx tsc --noEmit` clean
- [x] `npm run build` clean
## Phase 12 (new): Publishing (ElevenLabs Marketplace + DistroKid + Audiomack) — COMPLETE
- [x] `convex/elevenlabsMarketplace.ts` — `checkPublishEligibility` query (status, master, credits, cover art, splits, mutual-exclusivity)
- [x] `convex/elevenlabsMarketplace.ts` — `publishToElevenLabsMarketplace` action with server-side eligibility re-check, AI-license guard, split validation, mock/live API call, local persistence
- [x] `convex/elevenlabsMarketplace.ts` — `syncMarketplaceRoyalties` cron-ready action with creditOverrides support
- [x] `convex/elevenlabsMarketplace.ts` — `setCreditOverride` mutation for per-tier split overrides
- [x] `convex/distribution/index.ts` — `DistributionAdapter` interface + `validateSplits` helper
- [x] `convex/distribution/distrokid.ts` — DistroKid adapter (`validate`, `submit`, `pollStatus`) with AI disclosure tags
- [x] `convex/distribution/audiomack.ts` — Audiomack adapter (`validate`, `submit`, `pollStatus`) with AI disclosure tags
- [x] `convex/distributionActions.ts` — `submitToDistroKid`, `submitToAudiomack`, `pollDistributionStatus` actions + internal helpers
- [x] `lib/aiDisclosureMap.ts` — DSP-specific AI disclosure tag mappings
- [x] `components/PublishChecklist.tsx` — eligibility checklist UI with pass/warn states
- [x] `app/(root)/project/[projectId]/publish/page.tsx` — full publish page: checklist, tier picker, splits preview, territories, explicit toggle, AI disclosure block, DistroKid + Audiomack distribution cards
- [x] `app/(root)/project/[projectId]/page.tsx` — added "Publish" button links (owner only) alongside AI Lab
- [x] Mutual-exclusivity guards: `listProjectForSale` rejects if `elevenlabsMarketplace.status === "live"`; `transferOwnership` rejects if `elevenlabsMarketplace.status === "live"`; publish action forces `isListed=false`
- [x] `npx tsc --noEmit` clean
- [x] `npm run build` clean
## Phase 13 (stretch): Real C2PA signer — COMPLETE
- [x] `lib/c2paManifestBuilder.ts` — generates C2PA 2.2 spec-compliant manifest JSON from eCollabs provenance metadata (origin, model, prompt, contributors, parent chain, digital source type)
- [x] `convex/c2paSigner.ts` — `signProjectFile` action with dual-path architecture:
  - **Embedded path**: uses `@contentauth/c2pa-node` `Builder.sign()` + `LocalSigner` when a valid CA-signed cert is configured (`C2PA_CERT_PEM` / `C2PA_KEY_PEM` env vars)
  - **Sidecar path**: when cert is missing/self-signed/invalid, generates a JWS-signed JSON sidecar manifest stored in Convex storage; auto-fallback from embedded on cert error
  - `verifyC2pa` action — reads embedded manifests via C2PA Reader or verifies sidecar JWS signature
  - `checkC2paCredentials` query — reports whether signing credentials are configured
- [x] `scripts/generate-c2pa-cert-chain.js` — OpenSSL-based CA + end-entity cert generator for testing
- [x] Schema: `c2paManifestStorageId`, `c2paMode` ("embedded" | "sidecar"), `c2paManifestJson` added to `projectFile`
- [x] `components/C2PABadge.tsx` — shows embedded (green) vs sidecar (amber) status
- [x] `components/C2PAVerifyDialog.tsx` — runs verification, displays manifest JSON, shows signature validity
- [x] `components/StudioPipelineBoard.tsx` — C2PA badge on cards, "Verify" button, "Sign C2PA" button for owner on unsigned files
- [x] `components/PromoteToPipelineDialog.tsx` — auto-signs file after successful promotion (best-effort, non-blocking)
- [x] `convex/elevenlabsMarketplace.ts` — auto-signs master file after Marketplace publish (best-effort, non-blocking)
- [x] `npx tsc --noEmit` clean
- [x] `npm run build` clean
