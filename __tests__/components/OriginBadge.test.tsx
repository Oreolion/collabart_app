import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { OriginBadge } from "@/components/OriginBadge";

describe("OriginBadge", () => {
  it("renders null for human origin when showHuman is false", () => {
    const { container } = render(<OriginBadge origin="human" />);
    expect(container.firstChild).toBeNull();
  });

  it("renders human badge when showHuman is true", () => {
    render(<OriginBadge origin="human" showHuman />);
    expect(screen.getByText("Human")).toBeInTheDocument();
  });

  it("renders AI badge for ai_generated", () => {
    render(<OriginBadge origin="ai_generated" />);
    expect(screen.getByText("AI")).toBeInTheDocument();
  });

  it("renders AI-assisted badge for ai_assisted", () => {
    render(<OriginBadge origin="ai_assisted" />);
    expect(screen.getByText("AI-assisted")).toBeInTheDocument();
  });

  it("defaults to human for unknown origins", () => {
    const { container } = render(<OriginBadge origin="unknown" />);
    expect(container.firstChild).toBeNull();
  });

  it("applies custom className", () => {
    render(<OriginBadge origin="ai_generated" className="custom-class" />);
    expect(screen.getByTitle("AI-generated content")).toHaveClass("custom-class");
  });
});
