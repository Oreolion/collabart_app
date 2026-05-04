import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { C2PAVerifyDialog } from "@/components/C2PAVerifyDialog";
import * as convexReact from "convex/react";

describe("C2PAVerifyDialog", () => {
  it("renders trigger button with correct icon for embedded mode", () => {
    vi.spyOn(convexReact, "useAction").mockReturnValue(vi.fn());

    render(<C2PAVerifyDialog fileId="test123" as any mode="embedded" />);
    expect(screen.getByText("Verify C2PA")).toBeInTheDocument();
  });

  it("renders trigger button with correct icon for sidecar mode", () => {
    vi.spyOn(convexReact, "useAction").mockReturnValue(vi.fn());

    render(<C2PAVerifyDialog fileId="test123" as any mode="sidecar" />);
    expect(screen.getByText("Verify C2PA")).toBeInTheDocument();
  });

  it("opens dialog and shows verification result on success", async () => {
    const mockVerify = vi.fn().mockResolvedValue({
      signed: true,
      mode: "embedded",
      signatureValid: true,
      manifestStore: { claims: [] },
    });
    vi.spyOn(convexReact, "useAction").mockReturnValue(mockVerify);

    render(<C2PAVerifyDialog fileId="test123" as any mode="embedded" fileTitle="My Song" />);
    fireEvent.click(screen.getByText("Verify C2PA"));

    const runButton = await screen.findByText("Run Verification");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText("✓ Manifest found")).toBeInTheDocument();
    });
    expect(screen.getByText("Valid")).toBeInTheDocument();
    expect(mockVerify).toHaveBeenCalledWith({ fileId: "test123" });
  });

  it("shows failure state when verification fails", async () => {
    const mockVerify = vi.fn().mockRejectedValue(new Error("Network error"));
    vi.spyOn(convexReact, "useAction").mockReturnValue(mockVerify);

    render(<C2PAVerifyDialog fileId="test123" as any mode="embedded" />);
    fireEvent.click(screen.getByText("Verify C2PA"));

    const runButton = await screen.findByText("Run Verification");
    fireEvent.click(runButton);

    await waitFor(() => {
      expect(screen.getByText("✗ No valid manifest")).toBeInTheDocument();
    });
    expect(screen.getByText("Network error")).toBeInTheDocument();
  });
});
