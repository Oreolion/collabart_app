# eCollabs — Human-First Collab + AI Lab + ElevenLabs Marketplace

> **Cross-agent canonical copy.** This plan supersedes the AI Tier rollout (old Phases 8–11) in `lucky-zooming-canyon.md` and is referenced from `.ai-sync/PLAN.md`. Any agent (Claude Code, Codex, Cursor, Aider, OpenCode, Cline) continuing work on AI / publishing / marketplace must read this end-to-end first.

## Context

eCollabs' core value is **human multi-creator collaboration**: a producer uploads a beat, an artist records vocals over it and reuploads, a sound engineer downloads-edits-reuploads, a designer creates cover art, and the finished song goes to Tidal / Audiomack / Deezer / Spotify. The user wants a clean architectural separation between this human pipeline and AI tooling, with all AI-generated or AI-assisted content **labeled** end-to-end. Separately, the user wants a deeper, creative integration of ElevenLabs' newer APIs — including publishing finished tracks to the **ElevenLabs Music Marketplace** (launched March 2026) for royalty-bearing distribution.

Today, ElevenLabs music generation is already wired through `convex/elevenlabsActions.ts` and Gemini through `convex/ai.ts`, with rate limits in `convex/elevenlabs.ts`. AI fields exist on `projectFile` (`isAIGenerated`, `aiGenerationType`, `aiPrompt`) but there is no enforced badge surface, no separation from the main pipeline, no provenance metadata, no marketplace publishing path, and no external DSP integration. Roles are implicit (no track-stage taxonomy). The credits system (`convex/credits.ts`) with `contributionType` + `splitPercentage` is the right foundation for royalty mapping.

**User decisions captured during planning:**
- **Marketplace vs internal sale: mutually exclusive.** Once published to ElevenLabs Marketplace, BlockRadar `transferOwnership` is disabled.
- **Voice Design: skipped this round.** Conflicts with the human-vocalist identity. Keep Music + SFX + Composition Plan + Gemini lyric assist.
- **First DSP adapters: DistroKid AND Audiomack.** Generic `DistributionTarget` abstraction with both adapters in Phase 12.
- **Scope: full Phases 8–12.**

---

## 1. Conceptual model — `stage` + `origin`

Two orthogonal axes added to `projectFile`:

**`stage`** (pipeline position) — string enum:
`"beat" | "topline" | "lyrics" | "vocal_take" | "edit" | "mix" | "master" | "artwork" | "reference"`

**`origin`** (provenance) — string enum:
- `"human"` — recorded/produced/edited by a person
- `"ai_generated"` — raw model output, not yet edited
- `"ai_assisted"` — human-authored work where AI was a tool (e.g. Gemini-suggested lyric line the user accepted, AI scratch-melody re-sung by a human)

These supersede the legacy `isAIGenerated` / `aiGenerationType` fields, which stay readable for back-compat and are migrated by a one-time backfill.

---

## 2. Two-surface UI separation

**Surface A — Studio Pipeline (default project view).** `app/(root)/project/[projectId]/page.tsx` becomes a stage-grouped board (Beat → Topline → Lyrics → Vocal Take → Edit → Mix → Master → Artwork). Each column lists `projectFile` rows filtered by `stage` AND (`origin = "human"` OR `reviewState = "in_pipeline"`). Default filter hides raw AI drafts. Each card has a "Hand off to next stage" action.

**Surface B — AI Lab (auxiliary, badged).** New route `app/(root)/project/[projectId]/ai-lab/page.tsx` (and global `app/(root)/ai-lab/page.tsx` for project-less drafts). All existing ElevenLabs/Gemini UI relocates here. Distinct visual treatment + persistent banner: *"AI tools — outputs are drafts and must be reviewed before joining the project."* Outputs always saved with `origin: "ai_generated"`, `reviewState: "draft"`. A "Promote to pipeline" mutation lets a human pick a `stage`, optionally re-record/edit. If the user uploads new audio bytes during promotion → child file is `origin: "ai_assisted"` with `parentChain` populated.

**Badge enforcement** via shared `<OriginBadge origin />`:
- `components/WaveformTrack.tsx:132` (replaces ad-hoc badge)
- `components/MultiTrackPlayer.tsx`
- Project cards on `/projects` and `/my-projects`
- Marketplace listing card (eCollabs internal + ElevenLabs export confirmation)
- Embedded into exported audio metadata at distribution time

Filter pills on `/projects`, `/my-projects`, and `ai-lab`: **"Human only" (default)**, "Include AI-assisted", "Include AI-generated".

---

## 3. Schema diff (`convex/schema.ts`)

Added in Phase 8 commit (already applied):

```ts
projectFile: defineTable({
  // ...existing fields
  // Phase 8: Human-first pipeline
  stage: v.optional(v.string()),
  origin: v.optional(v.string()),
  reviewState: v.optional(v.string()),
  provenance: v.optional(v.object({
    model: v.string(),
    prompt: v.optional(v.string()),
    generatedAt: v.number(),
    humanEdited: v.boolean(),
    parentChain: v.array(v.id("projectFile")),
    c2paClaim: v.optional(v.string()),
  })),
})
  .index("by_project", ["projectId"])
  .index("by_project_and_version", ["projectId", "version"])
  .index("by_project_and_stage", ["projectId", "stage"])
  .index("by_project_and_origin", ["projectId", "origin"])

projects: defineTable({
  // ...existing fields
  elevenlabsMarketplace: v.optional(v.object({
    trackId: v.string(),
    tier: v.string(),
    publishedAt: v.number(),
    status: v.string(),
  })),
})

distributionTargets: { projectId, provider, status, externalId, submittedAt, payload, lastError, createdAt }
royaltyLedger: { projectId, userId, source, period, amountCents, currency, paidOut, createdAt }
creditOverrides: { projectId, tier, splits[], createdAt }
```

**Backfill mutation** `convex/migrations.ts → backfillOriginAndStage` — owner-gated; rows with `isAIGenerated=true` → `origin="ai_generated"` with `stage` derived from `aiGenerationType` (`beat`→`beat`, `lyrics_preview`→`lyrics`, `mood_reference`→`reference`, `arrangement`→`reference`); rows with non-empty `aiPrompt` → also `ai_generated`; everything else → `human`. Logs unmatched rows.

---

## 4. Deepened ElevenLabs roadmap

**Tier A — already shipped (Phase 9 relocates).** Existing music-gen, mood-reference, stem-gen, lyrics-preview actions stay byte-for-byte; saves are updated to set `origin="ai_generated"`, `reviewState="draft"`, populate `provenance`. UI moves into AI Lab.

**Tier B — new endpoints (Phase 11).**
- `convex/elevenlabsSfxActions.ts → generateSoundEffect({ projectId?, prompt, durationSeconds, promptInfluence? })` — calls `POST /v1/sound-generation` (`eleven_text_to_sound_v2`). Saves to `aiGenerations` with `type:"sfx"`. On promote, default `stage:"edit"`.
- `convex/elevenlabsActions.ts → generateCompositionPlan({ projectId, brief, targetDurationSeconds })` — composition-plan mode for >60s structured arrangements; persists plan JSON in `aiGenerations.metadata` and audio in storage.
- **Voice Design: deliberately skipped.** Conflicts with human-vocalist identity. Do not reintroduce without revisiting that decision.

**Tier C — Marketplace publishing (Phase 12).** New `convex/elevenlabsMarketplace.ts`:
- `checkPublishEligibility(projectId)` query — passes only if: `projects.status="complete"`, master file exists with `origin!="ai_generated"` OR explicit AI-music license accepted, all `credits` confirmed and sum to 100%, cover art set, `isListed=false`.
- `publishToElevenLabsMarketplace({ projectId, licenseTier, territories, explicit, splitMapping })` action — POSTs to ElevenLabs publish endpoint, persists `projects.elevenlabsMarketplace`, **forces `isListed=false` and disables `transferOwnership`** (mutual exclusivity).
- `syncMarketplaceRoyalties` cron action — pulls earnings, writes to `royaltyLedger` keyed by `credits.splitPercentage` (with `creditOverrides` if set).

UI: `app/(root)/project/[projectId]/publish/page.tsx` — eligibility checklist, license-tier picker (Social / Paid Marketing / Offline), splits preview from `credits`, mandatory disclosure block listing every AI-origin file in the master chain.

**Rate-limit retune** in `convex/elevenlabs.ts`: split buckets — `music: 8/day`, `sfx: 20/day`, `gemini: 50/day` — replacing the current single 10/day bucket.

---

## 5. AI provenance & disclosure (regulatory)

- `origin` required on all new writes (server default `"human"`).
- `provenance` populated on every AI save (model id, prompt hash, timestamp, `humanEdited:false`, parent chain, C2PA claim stub).
- Promote-to-pipeline flips `humanEdited=true` if new audio bytes are uploaded.
- `lib/aiDisclosureMap.ts` — DSP-specific export tags (Spotify "AI-influenced", YouTube `altered_or_synthetic_media=true`, Tidal `aiContent`). Used by distribution adapters.
- Phase 8 ships C2PA stub; Phase 13 (stretch) adds a real signing worker before EU AI Act enforcement (Aug 2 2026).

---

## 6. External distribution (Phase 12)

`convex/distribution/` package with shared `DistributionAdapter` interface (`validate`, `submit`, `pollStatus`). Two adapters this round:
- `distrokid.ts` — multi-DSP (Spotify, Apple, Tidal, Deezer, YouTube, Amazon) with native splits → `credits.splitPercentage` mapping.
- `audiomack.ts` — single-platform, indie/urban audience, simpler API.

Both reuse the `checkPublishEligibility` helper from Marketplace (with provider-specific extras). Eligibility includes the same mutual-exclusivity check against `elevenlabsMarketplace.status="live"` only when the DSP's terms conflict (configurable per adapter; DistroKid generally allows parallel since it's distribution-only).

---

## 7. Phased rollout

Each phase ships independently and updates `.ai-sync/PROGRESS.md` + `.ai-sync/HANDOFF.md`.

- **Phase 8 — Foundation.** Schema additions, indexes, backfill migration, `<OriginBadge>` component, default-hide AI on `/projects` + `/my-projects`, swap badge in `WaveformTrack.tsx`. No new APIs. Safe, reversible deploy.
- **Phase 9 — AI Lab.** New `/project/[id]/ai-lab` + global `/ai-lab` route. Move existing ElevenLabs + Gemini UI into it. Add `promoteAiFileToPipeline` mutation. Update existing save paths to set `origin="ai_generated"`, `reviewState="draft"`, populate `provenance`.
- **Phase 10 — Studio Pipeline board.** Refactor project page into stage-grouped columns. Add handoff actions. Stage filter pills.
- **Phase 11 — ElevenLabs Tier B.** SFX endpoint + AI Lab panel; Composition Plan endpoint for long-form generation; rate-limit bucket split.
- **Phase 12 — Publishing.** ElevenLabs Marketplace publishing flow + DistroKid + Audiomack adapters via generic `DistributionTarget`. Mutual-exclusivity enforcement against BlockRadar sale. Royalty sync cron.
- **Phase 13 (stretch).** Real C2PA signer worker.

---

## 8. Critical files to modify

- `convex/schema.ts` — Phase 8 ✅ already extended.
- `convex/file.ts` — write paths default `origin:"human"`; expose `promoteAiFileToPipeline`.
- `convex/elevenlabsActions.ts` (`generateTrack`, `generateStemAudio`, `previewLyricsAsSong`, `generateMoodReference`, `saveGenerationAsFile`) — populate `origin`, `reviewState`, `provenance`.
- `convex/elevenlabs.ts` — split rate-limit buckets, eligibility helper.
- `convex/ai.ts` — Gemini saves: text-injected-into-human-field → `ai_assisted`; raw → `ai_generated`.
- New: `convex/elevenlabsSfxActions.ts`, `convex/elevenlabsMarketplace.ts`, `convex/distribution/{index.ts,distrokid.ts,audiomack.ts}`, `convex/migrations.ts`.
- `components/WaveformTrack.tsx` (line 132) — replace ad-hoc badge with `<OriginBadge>`.
- `components/MultiTrackPlayer.tsx` — show OriginBadge in chrome; honor origin filter.
- `app/(root)/project/[projectId]/page.tsx` — stage-grouped pipeline view.
- New: `app/(root)/project/[projectId]/ai-lab/page.tsx`, `app/(root)/ai-lab/page.tsx`, `app/(root)/project/[projectId]/publish/page.tsx`.
- `app/(root)/projects/page.tsx`, `app/(root)/my-projects/page.tsx` — Human-only filter (default).
- New: `components/OriginBadge.tsx`, `components/SfxPanel.tsx`, `components/CompositionPlanPanel.tsx`, `components/PromoteToPipelineDialog.tsx`, `components/PublishChecklist.tsx`, `lib/aiDisclosureMap.ts`.
- `.ai-sync/PROGRESS.md`, `.ai-sync/HANDOFF.md`, `.ai-sync/PLAN.md` — phase-by-phase.

---

## 9. Risks & mitigations

- **Marketplace ToS vs internal sale.** Mutual exclusivity enforced server-side: `publishToElevenLabsMarketplace` forces `isListed=false`; `listProjectForSale` rejects if `elevenlabsMarketplace.status="live"`; `transferOwnership` likewise rejects. UI tooltip explains why each is disabled.
- **Royalty mapping ambiguity (Marketplace tiers ≠ flat splits).** Default `splitMapping` from `credits`; allow per-tier overrides in `creditOverrides`; mandatory user-facing confirmation screen showing each contributor's projected share before publish.
- **Rate-limit cost (SFX bursts + composition plan).** Split buckets `music:8 / sfx:20 / gemini:50` per day per user.
- **Legacy AI files.** Backfill migration handles `isAIGenerated=true` and rows with `aiPrompt` or matching `aiGenerations`. Unmatched rows logged for manual review; until reviewed they default `origin="human"` (acceptable false-negative since they predate AI introduction).
- **EU AI Act (Aug 2 2026).** C2PA stub in Phase 8 — cheap; real signer in Phase 13 with months of buffer.
- **Skipped Voice Design.** Documented as a deliberate non-goal so future agents don't reintroduce it without revisiting the human-vocalist identity decision.

---

## 10. Verification

End-to-end checks per phase:

- `npx tsc --noEmit` clean (CLAUDE.md requirement — `next.config.mjs` has `ignoreBuildErrors: true`, so type errors only show via `tsc`).
- `npm run build` clean.
- `npm run lint` clean.
- **Phase 8:** create a project, upload a human file → renders without AI badge; trigger backfill on a known AI-generated file → row gains `origin="ai_generated"` and correct `stage`; toggle "Include AI" filter on `/projects` and verify AI projects appear/disappear.
- **Phase 9:** open `/project/[id]/ai-lab`, generate a track → file appears with `reviewState:"draft"`, hidden from main project view; promote to pipeline → file gains chosen `stage`, `reviewState:"in_pipeline"`, appears in pipeline column.
- **Phase 10:** drag a card across stages, confirm `stage` updates; pipeline progress derived correctly from stage set.
- **Phase 11:** generate SFX (verify <30s clamp), generate composition-plan track (>60s); rate-limit buckets enforce independently.
- **Phase 12:** publish a complete project to ElevenLabs Marketplace → `isListed` forced false; attempt internal sale → blocked with tooltip; submit to DistroKid → `distributionTargets` row created with status; mock royalty webhook → `royaltyLedger` rows created per credit split.
- Run `pre-deploy-security-audit` skill before each production deploy.
- For UI phases (8–10, 12): start `npm run dev` + `npx convex dev`, exercise flows in Chrome.

---

## Cross-agent notes

- The legacy `lucky-zooming-canyon.md` plan covered Phases 1–12 of the original AI Tier rollout; **Phases 1–7 + the original Phase 12 (README) are complete** — keep that doc for historical context, but **all AI/publishing work from Phase 8 onward follows THIS document**.
- Update `.ai-sync/HANDOFF.md` between phases.
- Use `<OriginBadge>` everywhere AI files surface; never reintroduce ad-hoc AI badges.
- Voice Design is a deliberate non-goal. If a future product decision reverses this, update §4 Tier B.
