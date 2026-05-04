import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AiVisibilityPills } from "@/components/AiVisibilityPills";

describe("AiVisibilityPills", () => {
  it("renders all three options", () => {
    render(<AiVisibilityPills value="human_only" onChange={vi.fn()} />);
    expect(screen.getByText("Human only")).toBeInTheDocument();
    expect(screen.getByText("+ AI-assisted")).toBeInTheDocument();
    expect(screen.getByText("+ AI-generated")).toBeInTheDocument();
  });

  it("marks the active option", () => {
    render(<AiVisibilityPills value="include_assisted" onChange={vi.fn()} />);
    const active = screen.getByRole("button", { name: /AI-assisted/i });
    expect(active).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onChange with the clicked value", () => {
    const onChange = vi.fn();
    render(<AiVisibilityPills value="human_only" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /AI-generated/i }));
    expect(onChange).toHaveBeenCalledWith("include_all");
  });

  it("does not call onChange when clicking the active option", () => {
    const onChange = vi.fn();
    render(<AiVisibilityPills value="human_only" onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /Human only/i }));
    expect(onChange).toHaveBeenCalledWith("human_only");
  });
});
