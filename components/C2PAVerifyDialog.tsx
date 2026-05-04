"use client";

import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { Shield, ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface C2PAVerifyDialogProps {
  fileId: Id<"projectFile">;
  fileTitle?: string;
  mode?: string | null;
  children?: React.ReactNode;
}

export function C2PAVerifyDialog({ fileId, fileTitle, mode, children }: C2PAVerifyDialogProps) {
  const verify = useAction(api.c2paSigner.verifyC2pa);
  const [result, setResult] = useState<{ signed: boolean; message?: string; mode?: string; signatureValid?: boolean; manifestStore?: Record<string, unknown> } | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleVerify = async () => {
    setLoading(true);
    try {
      const res = await verify({ fileId });
      setResult(res as { signed: boolean; message?: string; mode?: string; signatureValid?: boolean; manifestStore?: Record<string, unknown> });
    } catch (err) {
      setResult({
        signed: false,
        message: err instanceof Error ? err.message : "Verification failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const isSigned = result?.signed === true;
  const manifestStore = result?.manifestStore as Record<string, unknown> | undefined;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
            {mode === "embedded" ? (
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-emerald-400" />
            ) : mode === "sidecar" ? (
              <ShieldAlert className="h-3.5 w-3.5 mr-1 text-amber-400" />
            ) : (
              <Shield className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
            )}
            Verify C2PA
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glassmorphism border-0 max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            C2PA Verification
            {fileTitle && <span className="text-muted-foreground font-normal">— {fileTitle}</span>}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Button
            size="sm"
            onClick={handleVerify}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              "Run Verification"
            )}
          </Button>

          {result && (
            <div
              className={`rounded-lg border px-4 py-3 ${
                isSigned
                  ? "border-emerald-500/20 bg-emerald-500/5"
                  : "border-red-500/20 bg-red-500/5"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  isSigned ? "text-emerald-100" : "text-red-100"
                }`}
              >
                {isSigned ? "✓ Manifest found" : "✗ No valid manifest"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {String(result.message ?? "")}
              </p>
              {result.mode && (
                <p className="text-xs text-muted-foreground mt-1">
                  Mode: <span className="font-medium">{String(result.mode)}</span>
                </p>
              )}
              {typeof result.signatureValid === "boolean" && (
                <p className="text-xs text-muted-foreground mt-1">
                  Signature:{" "}
                  <span
                    className={
                      result.signatureValid ? "text-emerald-400" : "text-amber-400"
                    }
                  >
                    {result.signatureValid ? "Valid" : "Unverifiable"}
                  </span>
                </p>
              )}
            </div>
          )}

          {manifestStore && (
            <ScrollArea className="h-64 rounded-md border border-border bg-muted/30 p-3">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                {JSON.stringify(manifestStore, null, 2)}
              </pre>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
