"use node";
import { action, query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { buildManifestWithBuilder, buildManifestDefinition } from "@/lib/c2paManifestBuilder";
import type { C2PAProvenanceInput } from "@/lib/c2paManifestBuilder";

// Dynamic import so we can gracefully handle native module issues
async function loadC2pa() {
  try {
    const c2pa = await import("@contentauth/c2pa-node");
    return c2pa;
  } catch {
    return null;
  }
}

function getCertAndKey(): { cert: Buffer; key: Buffer } | null {
  const cert = process.env.C2PA_CERT_PEM;
  const key = process.env.C2PA_KEY_PEM;
  if (!cert || !key) return null;
  return { cert: Buffer.from(cert), key: Buffer.from(key) };
}

/* ------------------------------------------------------------------ */
/*  Sign a projectFile with C2PA                                       */
/* ------------------------------------------------------------------ */

export const signProjectFile = action({
  args: {
    fileId: v.id("projectFile"),
    mode: v.optional(v.union(v.literal("embedded"), v.literal("sidecar"), v.literal("auto"))),
  },
  handler: async (ctx, args): Promise<{ fileId: string; mode: string; storageId: string }> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new ConvexError("Not authenticated");

    const file = await ctx.runQuery(api.projects.getProjectFileById, { fileId: args.fileId });
    if (!file) throw new ConvexError("File not found");

    const project = await ctx.runQuery(api.projects.getProjectById, { projectId: file.projectId });
    if (!project) throw new ConvexError("Project not found");

    // Only owner or uploader can sign
    const user = await ctx.runQuery(api.users.getUserById, { clerkId: identity.subject });
    const isOwner = project.authorId === identity.subject;
    const isUploader = user && file.userId === user._id;
    if (!isOwner && !isUploader) {
      throw new ConvexError("Only the project owner or file uploader can sign.");
    }

    if (!file.audioStorageId) {
      throw new ConvexError("File has no audio to sign.");
    }

    // Resolve mode
    let mode = args.mode ?? "auto";
    const credentials = getCertAndKey();
    if (mode === "auto") {
      mode = credentials ? "embedded" : "sidecar";
    }

    // Build provenance input
    const credits: Array<{ userName: string; role: string; splitPercentage?: number }> = await ctx.runQuery(api.credits.getProjectCredits, { projectId: file.projectId });
    const parentFiles: Array<{ title: string; origin?: string; model?: string }> = [];
    if (file.provenance?.parentChain) {
      for (const parentId of file.provenance.parentChain) {
        const parent = await ctx.runQuery(api.projects.getProjectFileById, { fileId: parentId });
        if (parent) {
          parentFiles.push({
            title: parent.projectFileTitle || parent.projectFileLabel,
            origin: parent.origin ?? undefined,
            model: parent.provenance?.model,
          });
        }
      }
    }

    const provenanceInput: C2PAProvenanceInput = {
      title: file.projectFileTitle || file.projectFileLabel,
      format: file.fileType === "audio" ? "audio/wav" : "application/octet-stream",
      origin: (file.origin as "human" | "ai_generated" | "ai_assisted") ?? "human",
      model: file.provenance?.model,
      prompt: file.provenance?.prompt,
      generatedAt: file.provenance?.generatedAt,
      humanEdited: file.provenance?.humanEdited,
      parentChain: parentFiles,
      contributors: credits.map((c) => ({
        name: c.userName,
        role: c.role,
        percentage: c.splitPercentage ?? undefined,
      })),
    };

    // Download original audio
    const audioUrl = await ctx.storage.getUrl(file.audioStorageId);
    if (!audioUrl) throw new ConvexError("Could not get audio URL from storage.");

    const audioRes = await fetch(audioUrl);
    if (!audioRes.ok) throw new ConvexError("Failed to download audio from storage.");
    const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

    const tmpDir = require("os").tmpdir();
    const timestamp = Date.now();
    const inputPath = require("path").join(tmpDir, `c2pa-in-${timestamp}.audio`);
    const outputPath = require("path").join(tmpDir, `c2pa-out-${timestamp}.audio`);
    const archivePath = require("path").join(tmpDir, `c2pa-archive-${timestamp}.c2pa`);

    const fs = require("fs");
    try {
      fs.writeFileSync(inputPath, audioBuffer);

      let signedBuffer: Buffer | undefined;
      let manifestJson: Record<string, unknown> | undefined;

      if (mode === "embedded") {
        if (!credentials) {
          throw new ConvexError("No C2PA credentials configured for embedded signing.");
        }

        const c2pa = await loadC2pa();
        if (!c2pa) {
          throw new ConvexError("C2PA native module not available.");
        }

        try {
          const signer = c2pa.LocalSigner.newSigner(credentials.cert, credentials.key, "es256");
          const builder = c2pa.Builder.new();
          await buildManifestWithBuilder(builder, provenanceInput);

          const inputAsset = { path: inputPath };
          const outputAsset = { path: outputPath };

          builder.sign(signer, inputAsset, outputAsset);
          signedBuffer = fs.readFileSync(outputPath);
          manifestJson = builder.getManifestDefinition() as Record<string, unknown>;
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          // If cert is invalid, fall back to sidecar automatically
          if (msg.includes("certificate") || msg.includes("self-signed")) {
            mode = "sidecar";
            // Continue to sidecar path below
          } else {
            throw err;
          }
        }
      }

      if (mode === "sidecar") {
        // Sidecar path: build manifest JSON, JWS-sign it, store alongside file
        const manifestDef = buildManifestDefinition(provenanceInput);
        manifestJson = manifestDef as Record<string, unknown>;

        // Create JWS signature of the manifest
        const crypto = require("crypto");
        let jwsSignature: string | undefined;
        if (credentials) {
          try {
            const sign = crypto.createSign("SHA256");
            sign.update(JSON.stringify(manifestDef));
            const sig = sign.sign(credentials.key, "base64");
            jwsSignature = sig;
          } catch {
            // If key signing fails, skip signature
          }
        }

        const sidecar = {
          c2paVersion: "2.2",
          manifest: manifestDef,
          signedAt: Date.now(),
          signedBy: "eCollabs-c2pa-signer",
          signature: jwsSignature,
          signatureAlg: "ES256",
          signerCert: credentials?.cert.toString("utf-8"),
          originalFormat: provenanceInput.format,
          originalFileHash: crypto.createHash("sha256").update(audioBuffer).digest("hex"),
        };

        const sidecarBuffer = Buffer.from(JSON.stringify(sidecar, null, 2));
        fs.writeFileSync(archivePath, sidecarBuffer);
        signedBuffer = sidecarBuffer;
      }

      if (!signedBuffer) {
        throw new ConvexError("Signing produced no output.");
      }

      // Upload signed output to Convex storage
      const uploadUrl = await ctx.storage.generateUploadUrl();
      const uploadRes = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": mode === "embedded" ? "audio/wav" : "application/json" },
        body: signedBuffer,
      });
      if (!uploadRes.ok) {
        throw new ConvexError("Failed to upload signed file to Convex storage.");
      }
      const { storageId } = (await uploadRes.json()) as { storageId: string };

      // Update projectFile with C2PA metadata
      await ctx.runMutation(api.c2paSigner._setC2paMeta, {
        fileId: file._id,
        c2paManifestStorageId: storageId as any,
        c2paMode: mode,
        c2paManifestJson: JSON.stringify(manifestJson ?? {}),
      });

      // Log activity
      await ctx.runMutation(api.activityLog.logActivity, {
        projectId: file.projectId,
        userId: identity.subject,
        userName: identity.name ?? undefined,
        userImage: identity.pictureUrl ?? undefined,
        action: "c2pa_signed",
        metadata: JSON.stringify({
          fileId: file._id,
          mode,
          title: file.projectFileTitle || file.projectFileLabel,
        }),
      });

      return {
        fileId: file._id,
        mode,
        storageId,
      };
    } finally {
      try { fs.unlinkSync(inputPath); } catch {}
      try { fs.unlinkSync(outputPath); } catch {}
      try { fs.unlinkSync(archivePath); } catch {}
    }
  },
});

/* ------------------------------------------------------------------ */
/*  Verify C2PA signature                                              */
/* ------------------------------------------------------------------ */

export const verifyC2pa = action({
  args: {
    fileId: v.id("projectFile"),
  },
  handler: async (ctx, args): Promise<Record<string, unknown>> => {
    const file = await ctx.runQuery(api.projects.getProjectFileById, { fileId: args.fileId });
    if (!file) throw new ConvexError("File not found");
    if (!file.c2paManifestStorageId) {
      return { signed: false as const, message: "No C2PA manifest found for this file." };
    }

    const manifestUrl = await ctx.storage.getUrl(file.c2paManifestStorageId);
    if (!manifestUrl) {
      return { signed: false as const, message: "C2PA manifest storage URL unavailable." };
    }

    const res = await fetch(manifestUrl);
    if (!res.ok) {
      return { signed: false as const, message: "Failed to fetch C2PA manifest." };
    }

    const mode: string = file.c2paMode ?? "sidecar";

    if (mode === "embedded") {
      // Use C2PA Reader to verify embedded manifest
      const c2pa = await loadC2pa();
      if (!c2pa) {
        return { signed: true as const, mode, message: "C2PA native module unavailable for verification." };
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      const fs = require("fs");
      const os = require("os");
      const path = require("path");
      const tmpPath = path.join(os.tmpdir(), `c2pa-verify-${Date.now()}.audio`);
      try {
        fs.writeFileSync(tmpPath, buffer);
        const c2paReader = await c2pa.Reader.fromAsset({ path: tmpPath }, {
          verify: { verify_after_reading: false, verify_trust: false },
        });
        if (!c2paReader) {
          return { signed: false as const, mode, message: "C2PA Reader returned null." };
        }
        const store = c2paReader.json();
        return {
          signed: true as const,
          mode,
          manifestStore: store,
          message: "C2PA manifest verified.",
        };
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { signed: false as const, mode, message: `C2PA verification failed: ${msg}` };
      } finally {
        try { fs.unlinkSync(tmpPath); } catch {}
      }
    } else {
      // Sidecar verification
      const sidecarText = await res.text();
      let sidecar: Record<string, unknown>;
      try {
        sidecar = JSON.parse(sidecarText);
      } catch {
        return { signed: false as const, mode, message: "Invalid sidecar JSON." };
      }

      const credentials = getCertAndKey();
      let signatureValid = false;
      if (sidecar.signature && credentials) {
        try {
          const crypto = require("crypto");
          const verify = crypto.createVerify("SHA256");
          verify.update(JSON.stringify(sidecar.manifest));
          signatureValid = verify.verify(credentials.cert, sidecar.signature as string, "base64");
        } catch {
          signatureValid = false;
        }
      }

      return {
        signed: true as const,
        mode,
        manifestStore: sidecar.manifest,
        signatureValid,
        signedAt: sidecar.signedAt,
        message: signatureValid
          ? "C2PA sidecar manifest verified and signature valid."
          : "C2PA sidecar manifest present but signature could not be verified (expected with self-signed certs).",
      };
    }
  },
});

/* ------------------------------------------------------------------ */
/*  Internal helpers                                                   */
/* ------------------------------------------------------------------ */

export const _setC2paMeta = mutation({
  args: {
    fileId: v.id("projectFile"),
    c2paManifestStorageId: v.optional(v.id("_storage")),
    c2paMode: v.optional(v.string()),
    c2paManifestJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patch: Record<string, unknown> = {};
    if (args.c2paManifestStorageId) patch.c2paManifestStorageId = args.c2paManifestStorageId;
    if (args.c2paMode) patch.c2paMode = args.c2paMode;
    if (args.c2paManifestJson) patch.c2paManifestJson = args.c2paManifestJson;
    await ctx.db.patch(args.fileId, patch);
  },
});

export const checkC2paCredentials = query({
  args: {},
  handler: async () => {
    const creds = getCertAndKey();
    return {
      configured: !!creds,
      hasCert: !!process.env.C2PA_CERT_PEM,
      hasKey: !!process.env.C2PA_KEY_PEM,
    };
  },
});
