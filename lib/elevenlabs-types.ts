export type GenerationStatus = "idle" | "generating" | "preview" | "saving" | "saved" | "error";
export type GenerationType = "beat" | "arrangement" | "lyrics_preview" | "mood_reference" | "sfx" | "composition_plan";

export interface GenerationResult {
  generationId: string;
  audioUrl: string;
  storageId: string;
  durationMs: number;
}
