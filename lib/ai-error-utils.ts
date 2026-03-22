export type AIErrorType = "rate_limit" | "unavailable" | "overloaded" | "generic";

export function mapAIError(raw: string): { message: string; type: AIErrorType } {
  if (raw.startsWith("RATE_LIMIT:")) {
    return { message: raw.replace("RATE_LIMIT:", ""), type: "rate_limit" };
  }
  if (raw.includes("not configured") || raw.includes("API_KEY")) {
    return { message: "AI features are temporarily unavailable.", type: "unavailable" };
  }
  if (raw.includes("429") || raw.toLowerCase().includes("rate limit")) {
    return { message: "AI service is busy. Please wait and try again.", type: "overloaded" };
  }
  if (raw.includes("500") || raw.includes("502") || raw.includes("503") || raw.includes("API error")) {
    return { message: "AI service encountered an error. Please try again.", type: "overloaded" };
  }
  if (raw.includes("Not authenticated")) {
    return { message: "Please sign in to use AI features.", type: "generic" };
  }
  return { message: "Something went wrong. Please try again.", type: "generic" };
}
