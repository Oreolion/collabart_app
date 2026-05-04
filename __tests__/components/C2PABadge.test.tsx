import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { C2PABadge, C2PAStatusIcon } from "@/components/C2PABadge";

describe("C2PABadge", () => {
  it("returns null when mode is null", () => {
    const { container } = render(<C2PABadge mode={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("returns null when mode is undefined", () => {
    const { container } = render(<C2PABadge mode={undefined} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders embedded badge with green styling", () => {
    render(<C2PABadge mode="embedded" />);
    const badge = screen.getByTitle("C2PA provenance embedded in file");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-emerald-300");
  });

  it("renders sidecar badge with amber styling", () => {
    render(<C2PABadge mode="sidecar" />);
    const badge = screen.getByTitle("C2PA provenance stored as sidecar manifest");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass("text-amber-300");
  });

  it("applies custom className", () => {
    render(<C2PABadge mode="embedded" className="my-class" />);
    expect(screen.getByTitle("C2PA provenance embedded in file")).toHaveClass("my-class");
  });
});

describe("C2PAStatusIcon", () => {
  it("renders plain Shield when mode is null", () => {
    const { container } = render(<C2PAStatusIcon mode={null} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders ShieldCheck for embedded mode", () => {
    const { container } = render(<C2PAStatusIcon mode="embedded" />);
    expect(container.querySelector("svg")).toHaveClass("text-emerald-400");
  });
});
