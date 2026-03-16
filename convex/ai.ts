"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Set it in the Convex dashboard (Settings > Environment Variables)."
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

// --- 1. AI Creative Brief Builder ---
export const generateCreativeBrief = action({
  args: {
    description: v.string(),
  },
  handler: async (_ctx, args) => {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a music industry expert. A user described their project idea in natural language. Extract structured metadata from their description.

User description: "${args.description}"

Return ONLY valid JSON (no markdown, no code fences) with these fields:
{
  "suggestedGenres": ["genre1", "genre2"],
  "suggestedMoods": ["mood1", "mood2"],
  "talentsNeeded": ["talent1", "talent2"],
  "projectBrief": "A polished 2-3 sentence project brief",
  "projectDescription": "A concise 1-2 sentence description",
  "tempo": "estimated BPM range like '120-130'",
  "key": "suggested musical key like 'C minor'",
  "projectType": "Public"
}

Use genres from: Pop, Rock, Hip-Hop, R&B, Jazz, Electronic, Classical, Country, Folk, Reggae, Latin, Blues, Soul, Funk, Metal, Punk, Indie, Alternative, Gospel, World Music, Afrobeats, Dancehall, Lo-fi, Ambient, Trap, House, Techno, Drum & Bass.

Use moods from: Energetic, Melancholic, Uplifting, Dark, Romantic, Aggressive, Chill, Dreamy, Nostalgic, Epic, Playful, Mysterious, Peaceful, Intense, Groovy, Ethereal, Raw, Triumphant.

Use talents from: Vocalist, Rapper, Guitarist, Bassist, Drummer, Pianist, Producer, Mixing Engineer, Mastering Engineer, Sound Designer, DJ, Violinist, Cellist, Trumpeter, Saxophonist, Flutist, Beatmaker, Songwriter, Lyricist, Arranger, Graphic Design, Album Art, Photography, Video Editing, Motion Graphics, Typography, Illustration, 3D Art.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    try {
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: cleaned };
    }
  },
});

// --- 2. AI Lyric Workshop ---
export const assistLyricWriting = action({
  args: {
    mode: v.string(), // "complete" | "rhyme" | "rewrite" | "generate"
    input: v.string(),
    context: v.optional(v.string()), // genre, mood, theme context
  },
  handler: async (_ctx, args) => {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const contextLine = args.context
      ? `Context (genre/mood/theme): ${args.context}`
      : "";

    const prompts: Record<string, string> = {
      complete: `You are a professional songwriter. Complete the next 2-4 lines of these lyrics, matching the style, rhythm, and theme. ${contextLine}

Current lyrics:
${args.input}

Return ONLY the new lines (not the existing lyrics). No explanations.`,

      rhyme: `You are a rhyming expert. Suggest 8-10 words/phrases that rhyme with the last word or phrase in the line below. Group them by rhyme quality (perfect, near, slant). ${contextLine}

Line: "${args.input}"

Return a simple list, no explanations. Format:
Perfect: word1, word2, word3
Near: word4, word5, word6
Slant: word7, word8`,

      rewrite: `You are a professional songwriter. Rewrite the following lyrics with a different tone or style while keeping the core meaning. Provide 2 alternative versions. ${contextLine}

Original:
${args.input}

Return ONLY the rewritten versions, labeled "Version 1:" and "Version 2:". No explanations.`,

      generate: `You are a professional songwriter. Generate a verse (4-8 lines) based on the following theme/direction. ${contextLine}

Theme: ${args.input}

Return ONLY the lyrics. No explanations, no titles.`,
    };

    const prompt = prompts[args.mode];
    if (!prompt) {
      return { error: `Unknown mode: ${args.mode}` };
    }

    const result = await model.generateContent(prompt);
    return { text: result.response.text().trim() };
  },
});

// --- 3. AI Audio Tag Suggestions ---
export const suggestAudioTags = action({
  args: {
    fileName: v.string(),
    projectTitle: v.optional(v.string()),
    projectGenres: v.optional(v.array(v.string())),
    projectMoods: v.optional(v.array(v.string())),
    projectBrief: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a music production metadata expert. Based on the file name and project context, suggest likely audio metadata tags.

File name: "${args.fileName}"
Project title: "${args.projectTitle || "Unknown"}"
Project genres: ${args.projectGenres?.join(", ") || "Not set"}
Project moods: ${args.projectMoods?.join(", ") || "Not set"}
Project brief: "${args.projectBrief || "Not provided"}"

Return ONLY valid JSON (no markdown, no code fences):
{
  "suggestedBPM": "estimated BPM or range",
  "suggestedKey": "likely musical key",
  "suggestedInstruments": ["instrument1", "instrument2"],
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "fileType": "what this file likely contains (vocals, beat, mix, stem, etc.)"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    try {
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: cleaned };
    }
  },
});

// --- 4. Semantic Project Search ---
export const semanticProjectSearch = action({
  args: {
    query: v.string(),
  },
  handler: async (_ctx, args) => {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a music search query parser. Convert this natural language search query into structured filters.

Query: "${args.query}"

Return ONLY valid JSON (no markdown, no code fences):
{
  "searchText": "key search terms for text matching",
  "genres": ["matched genres or empty array"],
  "moods": ["matched moods or empty array"],
  "talents": ["matched talents or empty array"],
  "projectType": "Public|Member|Private or null",
  "sortBy": "recent|views|likes or null"
}

Use genres from: Pop, Rock, Hip-Hop, R&B, Jazz, Electronic, Classical, Country, Folk, Reggae, Latin, Blues, Soul, Funk, Metal, Punk, Indie, Alternative, Gospel, World Music, Afrobeats, Dancehall, Lo-fi, Ambient, Trap, House, Techno, Drum & Bass.

Use moods from: Energetic, Melancholic, Uplifting, Dark, Romantic, Aggressive, Chill, Dreamy, Nostalgic, Epic, Playful, Mysterious, Peaceful, Intense, Groovy, Ethereal, Raw, Triumphant.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    try {
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: cleaned };
    }
  },
});

// =============================================
// Phase 9: AI Tier 2 — Collaboration Intelligence
// =============================================

// --- 5. Collaborator Recommendations ---
export const generateCollaboratorRecommendations = action({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(api.projects.getProjectById, {
      projectId: args.projectId,
    });
    if (!project) return { error: "Project not found", recommendations: [] };

    const allUsers = await ctx.runQuery(api.users.getAllUsers, {});
    const candidates = allUsers.filter(
      (u: any) => u.clerkId !== project.authorId
    );

    if (candidates.length === 0) {
      return { recommendations: [], message: "No users available to recommend." };
    }

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const userProfiles = candidates.slice(0, 30).map((u: any) => ({
      id: u.clerkId,
      name: u.name,
      talents: u.talents ?? [],
      genres: u.genres ?? [],
    }));

    const prompt = `You are a music collaboration matchmaker. Score each candidate by how well their talents and genres match the project's needs.

Project:
- Title: "${project.projectTitle}"
- Genres: ${(project.genres ?? []).join(", ") || "Not set"}
- Moods: ${(project.moods ?? []).join(", ") || "Not set"}
- Talents needed: ${(project.talents ?? []).join(", ") || "Not set"}
- Brief: "${project.projectBrief}"

Candidates:
${JSON.stringify(userProfiles, null, 2)}

Return ONLY valid JSON (no markdown, no code fences). Top 5 matches:
[
  {
    "userId": "the user's id",
    "name": "user name",
    "matchScore": 85,
    "reason": "One sentence why they're a good match"
  }
]

If no candidates match well, return [].`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    try {
      const recommendations = JSON.parse(cleaned);
      const enriched = recommendations.map((rec: any) => {
        const user = candidates.find((u: any) => u.clerkId === rec.userId);
        return { ...rec, userImage: user?.imageUrl, talents: user?.talents ?? [] };
      });
      return { recommendations: enriched };
    } catch {
      return { error: "Failed to parse AI response", recommendations: [], raw: cleaned };
    }
  },
});

// --- 6. AI Mix Feedback ---
export const generateMixFeedback = action({
  args: {
    projectId: v.id("projects"),
    trackNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(api.projects.getProjectById, {
      projectId: args.projectId,
    });
    if (!project) return { error: "Project not found" };

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a professional mixing engineer. Provide actionable mixing feedback based on the project and track list.

Project:
- Title: "${project.projectTitle}"
- Genres: ${(project.genres ?? []).join(", ") || "Not specified"}
- Moods: ${(project.moods ?? []).join(", ") || "Not specified"}
- Bit Depth: ${project.projectBitDepth}
- Sample Rate: ${project.projectSampleRate}

Tracks: ${args.trackNames.join(", ")}

Return ONLY valid JSON (no markdown, no code fences):
{
  "overallAssessment": "1-2 sentence assessment of the track arrangement",
  "trackSuggestions": [
    { "track": "track name", "suggestions": ["suggestion 1", "suggestion 2"] }
  ],
  "mixTips": ["tip 1", "tip 2", "tip 3"],
  "missingElements": ["element that could enhance the mix"],
  "referenceTrackStyle": "A well-known song with a similar mix to aim for"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    try {
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: cleaned };
    }
  },
});

// --- 7. Feedback Translator ---
export const translateFeedback = action({
  args: {
    feedback: v.string(),
    context: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a music production communication expert. Translate vague feedback into clear, actionable technical notes.

Original feedback: "${args.feedback}"
${args.context ? `Project context: ${args.context}` : ""}

Return ONLY valid JSON (no markdown, no code fences):
{
  "technicalTranslation": "Clear, actionable technical interpretation",
  "suggestedActions": ["specific action 1", "specific action 2"],
  "clarifyingQuestions": ["question if feedback is ambiguous"]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    try {
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: cleaned };
    }
  },
});

// --- 8. AI Credit Split Suggestions ---
export const suggestCreditSplits = action({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.runQuery(api.activityLog.getProjectActivity, {
      projectId: args.projectId,
    });
    const existingCredits = await ctx.runQuery(api.credits.getProjectCredits, {
      projectId: args.projectId,
    });
    const files = await ctx.runQuery(api.projects.getProjectFile, {
      projectId: args.projectId,
    });

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a music rights expert. Suggest fair credit split percentages based on activity and contributions.

Activity log (recent):
${JSON.stringify(
  (activity ?? []).slice(0, 20).map((a: any) => ({
    user: a.userName, action: a.action, metadata: a.metadata,
  })), null, 2
)}

Files uploaded:
${JSON.stringify(
  (files ?? []).map((f: any) => ({
    title: f.projectFileTitle || f.projectFileLabel,
    uploader: f.username, type: f.fileType || "audio",
  })), null, 2
)}

Existing credits:
${JSON.stringify(
  (existingCredits ?? []).map((c: any) => ({
    name: c.userName, role: c.role, type: c.contributionType,
    currentSplit: c.splitPercentage,
  })), null, 2
)}

Return ONLY valid JSON (no markdown, no code fences):
{
  "suggestions": [
    {
      "userName": "name",
      "role": "suggested role",
      "contributionType": "composition|performance|production|visual|engineering|lyrics",
      "suggestedSplit": 25,
      "reasoning": "Why this split"
    }
  ],
  "notes": "Overall notes about the split"
}

Splits must total 100%.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    try {
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: cleaned };
    }
  },
});

// =============================================
// Phase 10: AI Tier 3 — Advanced Audio AI
// =============================================

// --- 9. Stem Separation (Replicate / Demucs) ---
export const separateStems = action({
  args: {
    audioUrl: v.string(),
    projectId: v.id("projects"),
    trackTitle: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return {
        error: "REPLICATE_API_TOKEN not configured. Set it in Convex dashboard.",
        status: "missing_key",
      };
    }

    // Call Replicate's Demucs model for stem separation
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "25a173108cff36ef9f80f854c162d01df9e6528be175794b81571db0cf700d1a",
        input: {
          audio: args.audioUrl,
          stems: 4, // vocals, drums, bass, other
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return { error: `Replicate API error: ${errText}`, status: "api_error" };
    }

    const prediction = await response.json();
    return {
      predictionId: prediction.id,
      status: prediction.status,
      trackTitle: args.trackTitle,
      projectId: args.projectId,
      message: "Stem separation started. This may take 1-3 minutes.",
    };
  },
});

// Check stem separation status
export const checkStemStatus = action({
  args: {
    predictionId: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return { error: "REPLICATE_API_TOKEN not configured", status: "missing_key" };
    }

    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${args.predictionId}`,
      {
        headers: { Authorization: `Bearer ${apiToken}` },
      }
    );

    if (!response.ok) {
      return { error: "Failed to check status", status: "api_error" };
    }

    const prediction = await response.json();
    return {
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
    };
  },
});

// --- 10. AI Complementary Stem Suggestions ---
export const suggestComplementaryStem = action({
  args: {
    projectId: v.id("projects"),
    existingTracks: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(api.projects.getProjectById, {
      projectId: args.projectId,
    });
    if (!project) return { error: "Project not found" };

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a music arranger and producer. Based on the project details and existing tracks, suggest what additional stems/parts would complement the mix.

Project:
- Title: "${project.projectTitle}"
- Genres: ${(project.genres ?? []).join(", ") || "Not specified"}
- Moods: ${(project.moods ?? []).join(", ") || "Not specified"}
- Brief: "${project.projectBrief}"

Existing tracks: ${args.existingTracks.join(", ")}

Return ONLY valid JSON (no markdown, no code fences):
{
  "suggestions": [
    {
      "instrument": "instrument/part name",
      "description": "What this part should sound like",
      "priority": "essential|recommended|optional",
      "reasoning": "Why this would enhance the mix"
    }
  ],
  "arrangementNotes": "Overall arrangement advice for this genre"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    try {
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: cleaned };
    }
  },
});

// --- 11. AI Mastering Chain Suggestions ---
export const suggestMasteringChain = action({
  args: {
    projectId: v.id("projects"),
    trackCount: v.number(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.runQuery(api.projects.getProjectById, {
      projectId: args.projectId,
    });
    if (!project) return { error: "Project not found" };

    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a professional mastering engineer. Suggest a mastering chain and settings for this project.

Project:
- Title: "${project.projectTitle}"
- Genres: ${(project.genres ?? []).join(", ") || "Not specified"}
- Moods: ${(project.moods ?? []).join(", ") || "Not specified"}
- Bit Depth: ${project.projectBitDepth}
- Sample Rate: ${project.projectSampleRate}
- Track count: ${args.trackCount}

Return ONLY valid JSON (no markdown, no code fences):
{
  "chain": [
    {
      "plugin": "plugin/processor name",
      "type": "EQ|Compression|Limiting|Saturation|Stereo|Reverb",
      "settings": "specific recommended settings",
      "purpose": "why this step is needed"
    }
  ],
  "targetLUFS": "recommended loudness target",
  "headroom": "recommended headroom before mastering",
  "tips": ["genre-specific mastering tip 1", "tip 2"],
  "referenceTrack": "A well-mastered track in this genre to A/B against"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    try {
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: cleaned };
    }
  },
});

// ─── Phase 11: Visual AI ────────────────────────────────────────────────

export const analyzeDesign = action({
  args: {
    imageUrl: v.string(),
    title: v.string(),
    category: v.string(),
    projectGenres: v.optional(v.array(v.string())),
    projectMoods: v.optional(v.array(v.string())),
  },
  handler: async (_ctx, args) => {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a professional graphic design critic and art director. Analyze this visual asset for a music project.

Asset info:
- Title: "${args.title}"
- Category: ${args.category}
- Project genres: ${(args.projectGenres ?? []).join(", ") || "Not specified"}
- Project moods: ${(args.projectMoods ?? []).join(", ") || "Not specified"}
- Image URL: ${args.imageUrl}

Based on the title, category, and the genres/moods of the music project this is for, provide a detailed design critique. Evaluate how well the visual would work as a ${args.category} for a ${(args.projectGenres ?? []).join("/")} project with ${(args.projectMoods ?? []).join("/")} mood.

Return ONLY valid JSON (no markdown, no code fences):
{
  "overallScore": 1-10,
  "composition": {
    "score": 1-10,
    "feedback": "composition analysis — balance, focal point, hierarchy, whitespace",
    "suggestions": ["specific improvement 1", "improvement 2"]
  },
  "colorTheory": {
    "score": 1-10,
    "feedback": "color palette analysis — harmony, contrast, emotional resonance with the music genre/mood",
    "suggestions": ["specific improvement 1", "improvement 2"]
  },
  "typography": {
    "score": 1-10,
    "feedback": "text/typography analysis — readability, font pairing, hierarchy (or 'N/A — no text detected')",
    "suggestions": ["specific improvement 1", "improvement 2"]
  },
  "genreFit": {
    "score": 1-10,
    "feedback": "how well the visual fits the music genre/mood aesthetic conventions",
    "suggestions": ["specific improvement 1", "improvement 2"]
  },
  "technicalNotes": ["resolution concern", "format suggestion", "print-readiness note"],
  "strengths": ["strength 1", "strength 2"],
  "summary": "2-3 sentence overall assessment and top priority improvement"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    try {
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: cleaned };
    }
  },
});

export const generateSocialMockups = action({
  args: {
    projectTitle: v.string(),
    artistName: v.string(),
    genres: v.optional(v.array(v.string())),
    moods: v.optional(v.array(v.string())),
    coverArtUrl: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are a social media marketing specialist for music releases. Generate social media post mockup specifications for a music project release.

Project info:
- Title: "${args.projectTitle}"
- Artist: "${args.artistName}"
- Genres: ${(args.genres ?? []).join(", ") || "Not specified"}
- Moods: ${(args.moods ?? []).join(", ") || "Not specified"}
- Has cover art: ${args.coverArtUrl ? "Yes" : "No"}

Generate mockup specs for 4 platforms. Each mockup should include text layout, caption copy, and hashtag suggestions optimized for that platform.

Return ONLY valid JSON (no markdown, no code fences):
{
  "mockups": [
    {
      "platform": "Instagram Post",
      "dimensions": "1080x1080",
      "layout": "description of how cover art, title, artist name, and any text should be arranged",
      "textOverlay": ["line 1 on the image", "line 2 on the image"],
      "caption": "suggested Instagram caption with emojis",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"],
      "tips": "platform-specific tip for maximum engagement"
    },
    {
      "platform": "Instagram Story",
      "dimensions": "1080x1920",
      "layout": "vertical layout description",
      "textOverlay": ["line 1", "line 2"],
      "caption": "story text/sticker suggestions",
      "hashtags": ["#tag1", "#tag2"],
      "tips": "story-specific engagement tip"
    },
    {
      "platform": "Twitter/X",
      "dimensions": "1200x675",
      "layout": "landscape layout description",
      "textOverlay": ["line 1", "line 2"],
      "caption": "tweet text (under 280 chars)",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "tips": "Twitter-specific tip"
    },
    {
      "platform": "Facebook",
      "dimensions": "1200x630",
      "layout": "landscape layout description",
      "textOverlay": ["line 1", "line 2"],
      "caption": "Facebook post text",
      "hashtags": ["#tag1", "#tag2"],
      "tips": "Facebook-specific tip"
    }
  ],
  "colorPalette": ["#hex1", "#hex2", "#hex3", "#hex4"],
  "fontSuggestions": {
    "title": "font name for title text",
    "body": "font name for body text"
  },
  "releaseCopyVariants": [
    "Short announcement (1 line)",
    "Medium description (2-3 lines)",
    "Full press-style blurb (4-5 lines)"
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");

    try {
      return JSON.parse(cleaned);
    } catch {
      return { error: "Failed to parse AI response", raw: cleaned };
    }
  },
});
