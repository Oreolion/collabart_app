"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
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
