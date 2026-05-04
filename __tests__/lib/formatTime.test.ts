import { describe, it, expect } from "vitest";
import { formatTime, formatDate } from "@/lib/formatTime";

describe("formatTime()", () => {
  it("formats 0 seconds", () => {
    expect(formatTime(0)).toBe("0:00");
  });

  it("formats seconds under a minute", () => {
    expect(formatTime(45)).toBe("0:45");
  });

  it("formats exact minutes", () => {
    expect(formatTime(120)).toBe("2:00");
  });

  it("formats minutes and seconds", () => {
    expect(formatTime(185)).toBe("3:05");
  });

  it("formats hours worth of seconds", () => {
    expect(formatTime(3661)).toBe("61:01");
  });
});

describe("formatDate()", () => {
  it("formats a timestamp", () => {
    // Use noon UTC to avoid timezone boundary issues
    const timestamp = new Date("2024-03-15T12:00:00Z").getTime();
    expect(formatDate(timestamp)).toBe("March 15, 2024");
  });
});
