import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PublishChecklist } from "@/components/PublishChecklist";

describe("PublishChecklist", () => {
  it("renders passed items with green styling", () => {
    render(
      <PublishChecklist
        items={[{ label: "Has audio", passed: true }]}
        ready={true}
      />
    );
    const item = screen.getByText("Has audio").closest("div[class*='rounded-lg']");
    expect(item).toHaveClass("border-emerald-500/20");
  });

  it("renders failed items with amber styling", () => {
    render(
      <PublishChecklist
        items={[{ label: "Missing cover art", passed: false, message: "Upload cover art" }]}
        ready={false}
      />
    );
    const item = screen.getByText("Missing cover art").closest("div[class*='rounded-lg']");
    expect(item).toHaveClass("border-amber-500/20");
    expect(screen.getByText("Upload cover art")).toBeInTheDocument();
  });

  it("shows the not-ready banner when ready is false", () => {
    render(
      <PublishChecklist
        items={[{ label: "Has audio", passed: true }]}
        ready={false}
      />
    );
    expect(screen.getByText(/Complete all checklist items/)).toBeInTheDocument();
  });

  it("hides the not-ready banner when ready is true", () => {
    render(
      <PublishChecklist
        items={[{ label: "Has audio", passed: true }]}
        ready={true}
      />
    );
    expect(screen.queryByText(/Complete all checklist items/)).not.toBeInTheDocument();
  });
});
